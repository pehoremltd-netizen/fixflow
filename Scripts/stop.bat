@echo off
cd /d "%~dp0.."
echo [FixFlow] Stopping servers...
taskkill /fi "WindowTitle eq fixflow-backend*" /f >nul 2>&1
taskkill /fi "WindowTitle eq fixflow-frontend*" /f >nul 2>&1
echo [FixFlow] Stopped.
