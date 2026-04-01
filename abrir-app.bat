@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -Command "$json = Get-Content -Raw '%~dp0league-data.json' | ConvertFrom-Json; $content = 'window.LEAGUE_DATA = ' + ($json | ConvertTo-Json -Depth 10) + ';'; Set-Content -Path '%~dp0league-data.js' -Value $content -Encoding UTF8"
start "" "%~dp0index.html"
endlocal
