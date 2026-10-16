# Mevcut Firebase projesine web uygulaması ve Firestore veritabanı ekler, kuralları yükler.
# Çıktı fb-setup.log dosyasına yazılır.
param([string]$ProjectId = 'crows-tracker')
$ErrorActionPreference = 'Continue'
$npx = 'C:\Program Files\nodejs\npx.cmd'
$log = Join-Path $PSScriptRoot '..\fb-setup.log'
"== apps:list" | Out-File $log -Encoding utf8
& $npx firebase apps:list WEB --project $ProjectId --json *>> $log
"== apps:create" | Out-File $log -Append -Encoding utf8
& $npx firebase apps:create WEB 'Crows Tracker Web' --project $ProjectId --non-interactive *>> $log
"== sdkconfig" | Out-File $log -Append -Encoding utf8
& $npx firebase apps:sdkconfig WEB --project $ProjectId --non-interactive --json *>> $log
"== firestore:create" | Out-File $log -Append -Encoding utf8
& $npx firebase firestore:databases:create '(default)' --location eur3 --project $ProjectId --non-interactive *>> $log
"== rules:deploy" | Out-File $log -Append -Encoding utf8
& $npx firebase deploy --only firestore:rules --project $ProjectId --non-interactive *>> $log
"== DONE" | Out-File $log -Append -Encoding utf8
