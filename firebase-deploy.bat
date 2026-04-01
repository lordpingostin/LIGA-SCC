@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

if not exist "%APPDATA%\npm\firebase.cmd" (
  echo No se encontro firebase-tools. Instala la CLI primero.
  exit /b 1
)

if not exist "%~dp0.firebaserc" (
  echo No se encontro .firebaserc
  echo Primero ejecuta: firebase use --add
  pause
  exit /b 1
)

call "%APPDATA%\npm\firebase.cmd" deploy --only hosting
endlocal
