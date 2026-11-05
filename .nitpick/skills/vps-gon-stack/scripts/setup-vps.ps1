# Local machine. Usage: .\setup-vps.ps1 -Ip 1.1.1.1 -Email somemail@gmail.com
param(
  [Parameter(Mandatory)] [string] $Ip,
  [Parameter(Mandatory)] [string] $Email,
  [string] $KeyName = "id_ed25519_new",
  [string] $Script = "$PSScriptRoot\harden-ssh.sh"
)
$ErrorActionPreference = "Stop"
$key = "$env:USERPROFILE\.ssh\$KeyName"

# 1. Key: create only if missing (asks passphrase - SET ONE)
if (-not (Test-Path $key)) { ssh-keygen -t ed25519 -C $Email -f $key }
ssh-keygen -lf "$key.pub"

# 2. Pub key to clipboard -> paste into VPS provider panel
Get-Content "$key.pub" | Set-Clipboard
Write-Host "Pub key copied. Paste into provider panel, then press Enter."
Read-Host | Out-Null

# 3. Run bash script on VPS (tr strips CR). Confirm fingerprint ONLY if IP valid.
Get-Content $Script -Raw |
  ssh -i $key "root@$Ip" "tr -d '\r' | bash -s"

# 4. Proof: password login must fail (Permission denied publickey)
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no "root@$Ip"
