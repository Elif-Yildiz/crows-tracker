# Firebase CLI komutunu çalıştırır ve çıktısını fb-out.log dosyasına yazar.
# Kullanım: .\scripts\fb.ps1 projects:list --json
$npx = 'C:\Program Files\nodejs\npx.cmd'
$log = Join-Path $PSScriptRoot '..\fb-out.log'
& $npx firebase @args *> $log
"== EXIT $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
