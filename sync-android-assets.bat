@echo off
setlocal
set "ROOT=%~dp0"
set "ASSETS=%ROOT%android-app\app\src\main\assets"

if not exist "%ASSETS%" (
  echo No se encontro la carpeta de assets de Android.
  exit /b 1
)

copy /Y "%ROOT%index.html" "%ASSETS%\index.html" >nul
copy /Y "%ROOT%styles.css" "%ASSETS%\styles.css" >nul
copy /Y "%ROOT%app.js" "%ASSETS%\app.js" >nul
copy /Y "%ROOT%league-data.json" "%ASSETS%\league-data.json" >nul
copy /Y "%ROOT%league-data.js" "%ASSETS%\league-data.js" >nul

echo Assets Android actualizados correctamente.
endlocal
