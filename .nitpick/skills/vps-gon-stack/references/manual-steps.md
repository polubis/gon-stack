# VPS Debian 13 - manual + step by step

Reference for [SKILL.md](../SKILL.md). Basic path is `main.sh`. Use this file to run one phase alone, debug, or do it by hand. Phase scripts live in [../scripts](../scripts).

## Phase A - ssh key + password off

Goal: key-only root login. Do in order. Never skip fingerprint check.

1. Check/make ssh key on local machine (not VPS). Set passphrase.
2. Paste pub key into VPS provider panel.
3. First login with key. Confirm fingerprint "yes" only if IP/domain valid. Else STOP.
4. Turn password auth off. Verify password login now fails.

Fast path: [scripts/setup-vps.ps1](../scripts/setup-vps.ps1) (local) runs [scripts/harden-ssh.sh](../scripts/harden-ssh.sh) (VPS).

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-vps.ps1 -Ip 1.1.1.1 -Email somemail@gmail.com
# Last step prints "Permission denied (publickey)" = success
# Test key login in new terminal before closing old one
```

Bash only (already on VPS): `bash harden-ssh.sh`

## Manual commands

1. Keys (local):

```powershell
# ---------Maintenance--------
# Read public keys
Get-ChildItem $env:USERPROFILE\.ssh -Filter *.pub | ForEach-Object { ssh-keygen -lf $_.FullName }
# Remove legacy pair + known_hosts entry
Remove-Item "$env:USERPROFILE\.ssh\id_ed25519_new", "$env:USERPROFILE\.ssh\id_ed25519_new.pub" -ErrorAction SilentlyContinue
ssh-keygen -R 12.23.123.23
# List known hosts
Get-Content $env:USERPROFILE\.ssh\known_hosts

# --------Creation--------
# New Hostinger friendly key (SET PASSPHRASE)
ssh-keygen -t ed25519 -C "somemail@gmail.com" -f "$env:USERPROFILE\.ssh\id_ed25519_new"
# Pub key to clipboard
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_new.pub" | Set-Clipboard
```

2. Paste pub key to VPS provider.

3. First login (check fingerprint, IP valid, else DON'T):

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" root@1.1.1.1
```

```bash
# Prints .bashrc, .profile, .ssh = you're root
ls -all
```

4. Password auth off (VPS):

```bash
# Pass auth possible? (yes if asked for password)
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@1.1.1.1
# Turn off
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?KbdInteractiveAuthentication.*/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config
# No such file = fine
sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config.d/*.conf
# No output = config valid
sshd -t
systemctl restart ssh
# Expect: passwordauthentication no, kbdinteractiveauthentication no
sshd -T | grep -Ei 'passwordauthentication|kbdinteractiveauthentication'
# Retry: must fail (Permission denied publickey)
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no root@1.1.1.1
```

## Phase B - root setup

Goal: system packages, Docker, GitHub CLI, firewall on root. Needs phase A done (key login). No `factory` user here (next part). Re-run safe.

1. Packages (build tools, git, libvips, rootless Docker deps, ripgrep).
2. Docker Engine from official repo.
3. GitHub CLI from official repo.
4. Playwright system libs via Playwright's own `install-deps` (temporary apt Node, removed after). Version in `PLAYWRIGHT_VERSION` at top of the script, keep equal to catalog `@playwright/test`.
5. ufw (ssh port only) + fail2ban + unattended-upgrades. Aborts if no key in `authorized_keys`.
6. Verify: `docker run hello-world`, tools present.

Fast path: [scripts/setup-root.sh](../scripts/setup-root.sh) pushed from local over ssh.

```powershell
# Local machine, after phase A
# Go to this skill dir (change path to yours), paths below are relative
cd C:\Users\john\gon-stack\.nitpick\skills\vps-gon-stack
# tr strips CR on the VPS (PowerShell adds CRLF when piping)
Get-Content .\scripts\setup-root.sh -Raw |
  ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" root@1.1.1.1 "tr -d '\r' | bash -s"
```

On VPS directly: `bash setup-root.sh`

### Manual commands

1. Packages (VPS, root):

```bash
# Refresh package index
apt-get update
# -y = no prompt. Groups:
#   base: certs, download tools, git (+lfs), json, archives, ssh client, openssl
#   build: compilers/make for native npm modules
#   python3 + pip + venv: node-gyp and tooling
#   libvips-dev: fallback for sharp when prebuilt binary missing
#   uidmap..iptables: rootless Docker deps (user namespaces, networking, storage)
#   ripgrep, fd-find: fast search tools
#   ufw, fail2ban, unattended-upgrades: security (used in step 4)
apt-get install -y \
  ca-certificates curl wget git git-lfs gnupg jq unzip zip tar xz-utils lsb-release \
  openssh-client openssl make gcc g++ build-essential pkg-config \
  python3 python3-pip python3-venv libvips-dev \
  uidmap dbus-user-session slirp4netns fuse-overlayfs iptables \
  ripgrep fd-find ufw fail2ban unattended-upgrades
```

2. Docker Engine:

```bash
# Load distro vars (VERSION_CODENAME = trixie on Debian 13)
. /etc/os-release
# Create keyring dir (mode 755) if missing
install -m 0755 -d /etc/apt/keyrings
# Download Docker's signing key (verifies packages)
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
# Make key readable for apt
chmod a+r /etc/apt/keyrings/docker.asc
# Register official Docker apt repo, pinned to the key above
cat >/etc/apt/sources.list.d/docker.sources <<DOCKER
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: ${VERSION_CODENAME}
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
DOCKER
# Read the new repo
apt-get update
# Engine, CLI, container runtime, buildx, compose, rootless extras (for factory later)
apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
# Run test container, then remove it. Prints "Hello from Docker!" = works
docker run --rm hello-world
```

3. GitHub CLI:

```bash
# Keyring dir (same as in Docker step)
install -m 0755 -d /etc/apt/keyrings
# Download GitHub's signing key
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /etc/apt/keyrings/githubcli-archive-keyring.gpg
# Make key readable for apt
chmod a+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
# Register official GitHub CLI apt repo for this CPU arch, pinned to the key
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list
# Read the new repo
apt-get update
# Install gh
apt-get install -y gh
# Prints version = installed
gh --version
```

4. Playwright system libs (no hand-written list, Playwright decides):

```bash
# Temporary Node + npm from Debian (only to run install-deps)
apt-get install -y nodejs npm
# Install Chromium system libs for this Playwright version (match catalog @playwright/test)
npx --yes playwright@1.64.0 install-deps chromium
# Remove temporary Node. Libs stay (they are installed as manual packages)
apt-get purge -y nodejs npm
apt-get autoremove -y
# Prints nothing/"gone" = removed
command -v node || echo gone
```

5. Firewall + protection (ONLY after key login works, else lockout):

```bash
# Print real ssh port from effective sshd config (usually 22). Use it in next command
sshd -T | awk '$1 == "port" { print $2 }'
# Allow incoming ssh BEFORE enabling firewall (else instant lockout). All else stays blocked
ufw allow 22/tcp
# Turn firewall on now and at every boot. --force skips the "may disrupt ssh" prompt
ufw --force enable
# Check: "Status: active" and 22/tcp ALLOW
ufw status
# Start fail2ban now + at boot: bans IPs that keep failing ssh login
systemctl enable --now fail2ban
# Start auto security updates now + at boot
systemctl enable --now unattended-upgrades
```

## Phase C - factory user

Goal: non-root `factory` account (key login only, no sudo, no password) with its own rootless Docker. Needs phase A (root key) and phase B (Docker, `uidmap`). Tooling (nvm, Node, pnpm, repo, agents) is next part. Re-run safe.

1. Create user, dirs (`workspaces`, `logs`, `config`), copy root's `authorized_keys`.
2. Shell env `~/.factory-env` (PATH, `DOCKER_HOST` to rootless socket), sourced from `.bashrc` and `.profile`.
3. Rootless Docker: subuid/subgid, system daemon off, linger on, user daemon installed.
4. Verify: `docker run hello-world` as factory.

Note: system (root) Docker is disabled after this. From now Docker belongs to `factory`.

Fast path: [scripts/setup-factory.sh](../scripts/setup-factory.sh) pushed from local over ssh.

```powershell
# Local machine, after phase B
# Go to this skill dir (change path to yours), paths below are relative
cd C:\Users\john\gon-stack\.nitpick\skills\vps-gon-stack
# tr strips CR on the VPS (PowerShell adds CRLF when piping)
Get-Content .\scripts\setup-factory.sh -Raw |
  ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" root@1.1.1.1 "tr -d '\r' | bash -s"
# Then log in as factory (new terminal)
ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" factory@1.1.1.1
```

On VPS directly: `bash setup-factory.sh` (custom name: `FACTORY_USER=bot bash setup-factory.sh`)

### Manual commands

1. User (VPS, root):

```bash
# Account with home + own group. No password set = password login impossible
useradd --create-home --shell /bin/bash --user-group factory
# Ssh dir: only factory may enter (700)
install -d -m 0700 -o factory -g factory /home/factory/.ssh
# Work dirs
install -d -m 0750 -o factory -g factory /home/factory/workspaces /home/factory/logs /home/factory/config
# Same admin key can log in as factory
install -m 0600 -o factory -g factory /root/.ssh/authorized_keys /home/factory/.ssh/authorized_keys
```

2. Rootless Docker (VPS, root):

```bash
# Range of uids/gids factory's containers may use
usermod --add-subuids 100000-165535 factory
usermod --add-subgids 100000-165535 factory
# Stop + disable rootful daemon (rootless replaces it)
systemctl disable --now docker.service docker.socket
# Keep factory's user systemd running without login (daemon survives logout)
loginctl enable-linger factory
# Wait until /run/user/<uid>/bus exists, then install daemon as factory
runuser -u factory -- env HOME=/home/factory XDG_RUNTIME_DIR=/run/user/$(id -u factory) \
  DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u factory)/bus \
  dockerd-rootless-setuptool.sh install
```

3. Docker env for factory (put in `/home/factory/.bashrc`, as factory):

```bash
# Where user runtime dir lives
export XDG_RUNTIME_DIR=/run/user/$(id -u)
# Point docker CLI to the rootless socket
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
```

4. Verify (log in as factory):

```bash
# Prints "Hello from Docker!" = rootless Docker works
docker run --rm hello-world
# Shows "rootless" in security options
docker info | grep -i rootless
```

## Phase D - factory tooling

Goal: working dev environment for `factory`: git, Node, pnpm, repo, dependencies, Playwright browser. Runs **as factory** (no root, no sudo). Needs phase B (system libs) and phase C (user, `~/.factory-env`). Re-run safe (pulls repo, skips installed tools). No secrets here.

1. Git defaults (name, email, `pull.ff only`, `init.defaultBranch main`).
2. Clone repo to `~/workspaces/gon-stack` (public, HTTPS). Re-run = `git pull --ff-only`.
3. nvm v0.40.3 + Node (version from repo `.nvmrc`).
4. pnpm (version from repo `packageManager`).
5. `pnpm install --frozen-lockfile` + `playwright install chromium` (browser only, libs came from phase B).
6. Install herdr (`~/.local/bin`). Installed only, never started by the script.
7. Install Claude Code (`~/.local/bin`) and opencode (`~/.opencode/bin`, PATH added to `~/.factory-env`). Installed only, no sign-in.
8. Verify: tools respond (herdr checked with `command -v`, Claude Code and opencode with `--version`), Playwright browser cached.

Fast path: [scripts/setup-tools.sh](../scripts/setup-tools.sh) pushed from local over ssh **as factory**.

```powershell
# Local machine, after phase C
# Go to this skill dir (change path to yours), paths below are relative
cd C:\Users\john\gon-stack\.nitpick\skills\vps-gon-stack
# tr strips CR on the VPS (PowerShell adds CRLF when piping)
Get-Content .\scripts\setup-tools.sh -Raw |
  ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" factory@1.1.1.1 "tr -d '\r' | bash -s"
```

Custom values: `REPO_URL`, `GIT_NAME`, `GIT_EMAIL` env vars (set them in the remote command before `bash -s`).

### Manual commands

Log in first: `ssh -i "$env:USERPROFILE\.ssh\id_ed25519_new" factory@1.1.1.1`

1. Git:

```bash
# Commit identity (change to yours)
git config --global user.name "Software Factory"
git config --global user.email "factory@vps"
# New repos start on main
git config --global init.defaultBranch main
# Pull never creates merge commits by accident
git config --global pull.ff only
# Enable git-lfs hooks
git lfs install
```

2. Repo:

```bash
mkdir -p ~/workspaces
git clone https://github.com/polubis/gon-stack.git ~/workspaces/gon-stack
cd ~/workspaces/gon-stack
```

3. Node via nvm (version from the repo):

```bash
# Install nvm (pinned tag), without editing .bashrc
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | PROFILE=/dev/null bash
# Load nvm for new shells (phase C env file is sourced by .bashrc/.profile)
cat >> ~/.factory-env <<'ENV'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
ENV
. ~/.nvm/nvm.sh
# Install and default to the Node from .nvmrc (24.22.1)
nvm install "$(cat .nvmrc)"
nvm alias default "$(cat .nvmrc)"
node --version
```

4. pnpm (version from `packageManager`):

```bash
# Prints e.g. pnpm@11.28.5
node -p "require('./package.json').packageManager"
npm install -g pnpm@11.28.5
pnpm --version
```

5. Dependencies + Playwright browser:

```bash
# Exact lockfile install, fails if lockfile is out of date
pnpm install --frozen-lockfile
# Download Chromium only (system libs already installed in phase B)
pnpm exec playwright install chromium
```

6. herdr (install only, do NOT run it):

```bash
# Official installer, puts binary in ~/.local/bin (already on PATH via ~/.factory-env)
curl -fsSL https://herdr.dev/install.sh | sh
# Check it is installed, without starting it
command -v herdr
```

7. Claude Code and opencode (install only, NO sign-in):

```bash
# Claude Code: native installer, binary in ~/.local/bin (no Node needed)
curl -fsSL https://claude.ai/install.sh | bash
# opencode: installer puts binary in ~/.opencode/bin, so add it to PATH for new shells
echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.factory-env
export PATH="$HOME/.opencode/bin:$PATH"
curl -fsSL https://opencode.ai/install | bash
# Versions only, no login. Sign in later by hand: claude / opencode auth login
claude --version
opencode --version
```

8. Verify:

```bash
# Quick unit tests for one app = environment works
pnpm --filter parka test
```

## Phase E - .env files for every app with a database

Goal: every app that talks to a backend and a database (`parka`, `romantic-app`, `talent-orbit`: the apps with `supabase/config.toml`) has its `.env` ready, so you can start working in any app later without setup. No real secrets. Runs **as factory**. Needs phase D. Re-run safe: an existing `.env` is only checked for existence, never opened (delete it to regenerate), and that app is skipped. Names are logged, values never.

For each app, one at a time (all apps use the same Supabase ports, so never two at once):

1. Start its local Supabase only to read the keys, then stop it again (nothing keeps running; data volumes stay, so the next `pnpm db:start` is quick). A Supabase that already runs is left running. `SKIP_SUPABASE=1` skips this and uses template values.
2. Copy `.env.example` to `.env`. Template values stay as they are, except `*SUPABASE_PUBLISHABLE_KEY` and `*SUPABASE_ANON_KEY`: they are read from the local Supabase, so a wrong or old key in the template cannot break auth.
3. Empty VAPID keys: generated throwaway pair. Empty `*_API_KEY`: random value ending with `-mock` (receipt analysis then fails with 401 on purpose, real key goes in by hand).
4. File mode 0600.

An app with a Supabase project but no `.env.example` is skipped with a warning (add a template to the app first).

Fast path: [scripts/setup-env.sh](../scripts/setup-env.sh) (as factory). `main.sh` runs it as step E.

### Manual commands

Log in as factory first. Example for one app (`parka`), repeat per app.

1. Supabase, for the keys now and for dev/e2e later (about 2 min the first time, pulls ~12 images):

```bash
cd ~/workspaces/gon-stack/apps/parka
# Starts all containers on rootless Docker. Fixed ports: API 54321, DB 54322, Studio 54323
pnpm db:start
# Running? (prints URLs and keys)
pnpm exec supabase status
```

2. Read the public local keys from the running Supabase:

```bash
# PUBLISHABLE_KEY and ANON_KEY lines
pnpm exec supabase status -o env | grep -E '^(PUBLISHABLE_KEY|ANON_KEY)='
```

3. Generate a throwaway VAPID pair (only `parka`; 2 lines: public, private):

```bash
node -e '
  const { generateKeyPairSync } = require("crypto");
  const k = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const p = k.publicKey.export({ format: "jwk" });
  const raw = Buffer.concat([Buffer.from([4]), Buffer.from(p.x, "base64url"), Buffer.from(p.y, "base64url")]);
  console.log(raw.toString("base64url"));
  console.log(k.privateKey.export({ format: "jwk" }).d);
'
```

4. Dummy AI key and the file:

```bash
# Random value ending with -mock
echo "$(openssl rand -hex 24)-mock"
# Create .env owner-only, then paste the values into the variables of .env.example
cp -n .env.example .env && chmod 600 .env
# Stop Supabase again so nothing keeps running
pnpm db:stop
```

5. Verify (names only, no values):

```bash
# Every variable filled?
awk -F= '/^[A-Z]/ { printf "%s filled=%d\n", $1, length($2) > 0 }' .env
# Run e2e from the repo ROOT (turbo builds vibe-test first). Running playwright inside the app fails.
# Needs that app's Supabase running: cd apps/parka && pnpm db:start
cd ~/workspaces/gon-stack && pnpm exec turbo run test:e2e --filter=parka --concurrency=1
```
