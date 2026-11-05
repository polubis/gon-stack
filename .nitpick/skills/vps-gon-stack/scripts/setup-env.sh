#!/usr/bin/env bash
# Debian 13 factory: create missing apps/*/.env from the committed .env.example, one app at a time.
# Run as factory. Re-run safe.
# - template values are copied as they are
# - for every app with a local Supabase project: Supabase is started ONLY to read its public keys
#   (publishable + anon), then stopped again. Nothing keeps running. A wrong or stale key in the
#   template cannot break auth, and the first start also pulls images and applies migrations,
#   so a later `pnpm db:start` is quick
# - empty VAPID keys get a generated throwaway pair, empty *_API_KEY gets a random "<hex>-mock" value
# - an existing .env is never opened or changed (the app is skipped, Supabase is not started).
#   Names are logged, values never
# Env: REPO_DIR (default ~/workspaces/gon-stack), SKIP_SUPABASE=1 (do not touch Supabase, template values only)
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-$HOME/workspaces/gon-stack}"
LIVE_KEY=""
LIVE_ANON=""
PROBLEMS=()

log() { printf '\n==> %s\n' "$*"; }
warn() { printf 'WARNING: %s\n' "$*" >&2; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

# VAPID P-256 pair as 2 lines: public (uncompressed, base64url), private
vapid_pair() {
  node -e '
    const { generateKeyPairSync } = require("crypto");
    const k = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    const p = k.publicKey.export({ format: "jwk" });
    const d = k.privateKey.export({ format: "jwk" }).d;
    const raw = Buffer.concat([Buffer.from([4]), Buffer.from(p.x, "base64url"), Buffer.from(p.y, "base64url")]);
    console.log(raw.toString("base64url"));
    console.log(d);
  '
}

# Sets LIVE_KEY / LIVE_ANON from the status of a running local Supabase (public local keys only)
read_live_keys() {
  local status
  status="$(cd "$1" && pnpm exec supabase status -o env 2>/dev/null)" || return 0
  LIVE_KEY="$(sed -n 's/^PUBLISHABLE_KEY="\(.*\)"$/\1/p' <<<"$status")"
  LIVE_ANON="$(sed -n 's/^ANON_KEY="\(.*\)"$/\1/p' <<<"$status")"
}

# A Supabase that was not running is started only for reading and stopped again right after.
# One that already runs is left running. Another project on the same ports blocks the start:
# the keys stay empty then and the template values are used.
read_supabase_keys() {
  local dir="$1" app started=0
  app="$(basename "$dir")"
  LIVE_KEY=""
  LIVE_ANON=""
  if ! (cd "$dir" && pnpm exec supabase status >/dev/null 2>&1); then
    if docker ps --format '{{.Names}}' | grep -q '^supabase_db_'; then
      warn "another Supabase project is running (same ports), using template values for $app"
      PROBLEMS+=("$app: another Supabase project holds the ports")
      return 0
    fi
    log "Starting local Supabase ($app) only to read its keys"
    (cd "$dir" && CI=true pnpm db:start </dev/null) && started=1 || { warn "Supabase for $app did not start, using template values"; PROBLEMS+=("$app: Supabase did not start (see output above), keys are from the template"); }
  fi
  read_live_keys "$dir"
  if [ "$started" = 1 ]; then
    log "Stopping local Supabase ($app), start it later with: cd apps/$app && pnpm db:start"
    (cd "$dir" && pnpm db:stop </dev/null) || warn "could not stop Supabase, run: cd apps/$app && pnpm db:stop"
  fi
}

create_env() {
  local dir="$1" app pub="" priv="" line name value
  local -a generated=() from_supabase=() empty=()
  app="$(basename "$dir")"

  # Existing .env: only checked for existence, never opened
  if [ -e "$dir/.env" ]; then
    echo "env: apps/$app/.env exists, skipped"
    return 0
  fi

  LIVE_KEY=""
  LIVE_ANON=""
  if [ -z "${SKIP_SUPABASE:-}" ] && [ -f "$dir/supabase/config.toml" ]; then
    read_supabase_keys "$dir"
  fi

  local out=""
  while IFS= read -r line || [ -n "$line" ]; do
    if [[ $line =~ ^([A-Z][A-Z0-9_]*)=(.*)$ ]]; then
      name="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      if [[ $name == *SUPABASE_PUBLISHABLE_KEY && -n $LIVE_KEY ]]; then
        value="$LIVE_KEY"
        from_supabase+=("$name")
      elif [[ $name == *SUPABASE_ANON_KEY && -n $LIVE_ANON ]]; then
        value="$LIVE_ANON"
        from_supabase+=("$name")
      elif [ -z "$value" ]; then
        case "$name" in
          *VAPID_PUBLIC_KEY | *VAPID_PRIVATE_KEY)
            if [ -z "$pub" ]; then
              { read -r pub; read -r priv; } < <(vapid_pair)
            fi
            [[ $name == *PUBLIC_KEY ]] && value="$pub" || value="$priv"
            generated+=("$name")
            ;;
          *API_KEY)
            value="$(openssl rand -hex 24)-mock"
            generated+=("$name")
            ;;
          *) empty+=("$name") ;;
        esac
      fi
      line="$name=$value"
    fi
    out+="$line"$'\n'
  done <"$dir/.env.example"

  # noclobber: never overwrite. umask: owner-only file
  (umask 077 && set -o noclobber && printf '%s' "$out" >"$dir/.env")
  echo "env: created apps/$app/.env (generated: ${generated[*]:-none}; from Supabase: ${from_supabase[*]:-none}; left empty: ${empty[*]:-none})"
}

main() {
  [ "$(id -u)" -ne 0 ] || die "Run as factory, not root"
  [ -f "$HOME/.factory-env" ] || die "No ~/.factory-env. Run phase C first."
  # env file may source nvm.sh, which is not safe under set -eu
  set +eu
  # shellcheck source=/dev/null
  . "$HOME/.factory-env"
  set -eu
  [ -d "$REPO_DIR/apps" ] || die "No repo at $REPO_DIR. Run phase D first."

  # Apps one by one (same Supabase ports, so never two at once)
  local dir app done_any=0
  for dir in "$REPO_DIR"/apps/*/; do
    dir="${dir%/}"
    app="$(basename "$dir")"
    if [ -f "$dir/.env.example" ]; then
      create_env "$dir"
      done_any=1
    elif [ -f "$dir/supabase/config.toml" ]; then
      warn "apps/$app has a Supabase project but no .env.example, skipped"
    fi
  done
  [ "$done_any" = 1 ] || echo "env: no .env.example found, nothing to do"
  # Every app was handled first, then the failures are reported (non-zero exit)
  if [ "${#PROBLEMS[@]}" -gt 0 ]; then
    printf 'ERROR: %s\n' "${PROBLEMS[@]}" >&2
    exit 1
  fi
}

main "$@"
