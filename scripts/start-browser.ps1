$ErrorActionPreference = 'Stop'
try {
  Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/version' -TimeoutSec 2 | Select-Object Browser
  exit 0
} catch {}
$browserPath = Join-Path $env:LOCALAPPDATA 'BraveSoftware\Brave-Browser\Application\brave.exe'
$profilePath = Join-Path $env:LOCALAPPDATA 'BraveSoftware\Brave-Browser\CodexPlaywrightProfile'
if (-not (Test-Path -LiteralPath $browserPath)) { throw 'Brave is not installed.' }
$browserArguments = @('--remote-debugging-address=127.0.0.1', '--remote-debugging-port=9222', ('--user-data-dir="{0}"' -f $profilePath), '--no-first-run', '--no-default-browser-check', 'http://127.0.0.1:5173')
Start-Process -FilePath $browserPath -ArgumentList $browserArguments -WindowStyle Hidden
