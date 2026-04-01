@echo off
setlocal
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

if not exist "%APPDATA%\npm\firebase.cmd" (
  echo No se encontro firebase-tools. Instala la CLI primero.
  exit /b 1
)

call "%APPDATA%\npm\firebase.cmd" login
endlocal
