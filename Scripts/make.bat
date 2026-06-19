@echo off
cd /d "%~dp0"

if "%1"=="" goto usage
if /I "%1"=="local" goto local
if /I "%1"=="vercel" goto vercel
if /I "%1"=="seed" goto seed
if /I "%1"=="stop" goto stop
goto usage

:local
call start.bat local
goto :eof

:vercel
call start.bat vercel
goto :eof

:seed
call start.bat seed
goto :eof

:stop
call stop.bat
goto :eof

:usage
echo Usage: make [local^|vercel^|seed^|stop]
echo.
echo   local   - Run frontend + backend locally
echo   vercel  - Deploy frontend to Vercel production
echo   seed    - Seed the database with demo data
echo   stop    - Stop running frontend and backend
goto :eof
