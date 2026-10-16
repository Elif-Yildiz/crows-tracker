# Projeyi git deposu yapar, ilk commit'i atar ve GitHub'da public depo olarak yayınlar.
# Commit'ler GitHub hesabının gizli noreply e-postasıyla imzalanır. Çıktı gh-publish.log'a yazılır.
param([string]$RepoName = 'crows-tracker')
$ErrorActionPreference = 'Continue'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
$root = Split-Path $PSScriptRoot -Parent
$log = Join-Path $root 'gh-publish.log'
Set-Location $root

"== auth" | Out-File $log -Encoding utf8
& $gh auth status *>> $log
$login = (& $gh api user --jq '.login').Trim()
$id = (& $gh api user --jq '.id').Trim()
"login=$login id=$id" | Out-File $log -Append -Encoding utf8
if (-not $login) { "== FAIL no login" | Out-File $log -Append -Encoding utf8; exit 1 }

"== git" | Out-File $log -Append -Encoding utf8
if (-not (Test-Path '.git')) { git init -b main *>> $log }
git config user.name $login
git config user.email "$id+$login@users.noreply.github.com"
git config core.autocrlf true
& $gh auth setup-git *>> $log
git add -A *>> $log
git commit -q -F (Join-Path $PSScriptRoot 'commit-message.txt') *>> $log
git log --oneline -n 3 *>> $log

"== repo" | Out-File $log -Append -Encoding utf8
& $gh repo create $RepoName --public --source . --remote origin --push --description 'Crows (MCDM) TTRPG icin oyun, karakter, Stamina/yara ve envanter takip uygulamasi' *>> $log
& $gh repo view --json url --jq '.url' *>> $log
"== DONE" | Out-File $log -Append -Encoding utf8
