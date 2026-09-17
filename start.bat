@echo off
title Roued Al Khair - Website
cd /d "%~dp0"

echo Starting Roued Al Khair website...
start "" cmd /c "timeout /t 2 /nobreak >nul & start "" http://127.0.0.1:5500/index.html"

python -m http.server 5500

pause
