#!/usr/bin/env bash
# Debian 13: key-only ssh. Run as root on VPS.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run as root"; exit 1; }

# Lockout guard: need at least one key before password off
if ! grep -qsE '^(ssh|ecdsa)-' /root/.ssh/authorized_keys; then
  echo "No key in /root/.ssh/authorized_keys. Abort (would lock you out)."
  exit 1
fi

# Drop-in 00-* wins (sshd: first value wins) over 50-cloud-init.conf etc.
CONF=/etc/ssh/sshd_config.d/00-hardening.conf
cp -a "$CONF" "$CONF.bak" 2>/dev/null || true
cat > "$CONF" <<'CFG'
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
CFG

# Silent = valid. Error = old config keeps running
sshd -t
systemctl restart ssh

echo "--- effective config ---"
sshd -T | grep -Ei 'passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication|permitrootlogin'
echo "OK. Keep this session open, test new login in second terminal."
