@echo off
cd /d "%~dp0.."

if "%1"=="" goto usage
if /I "%1"=="local" goto local
if /I "%1"=="vercel" goto vercel
if /I "%1"=="seed" goto seed
goto usage

:local
echo ^[FixFlow^] Starting backend on http://localhost:4000 ...
start "fixflow-backend" cmd /c "cd /d "%~dp0..\backend" && npm run dev"
timeout /t 3 /nobreak >nul
echo ^[FixFlow^] Starting frontend on http://localhost:3000 ...
start "fixflow-frontend" cmd /c "cd /d "%~dp0..\Frontend" && npm run dev"
echo.
echo ^[FixFlow^] Running! Press any key to stop both servers.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:4000
echo.
pause >nul
taskkill /fi "WindowTitle eq fixflow-backend*" /f >nul 2>&1
taskkill /fi "WindowTitle eq fixflow-frontend*" /f >nul 2>&1
echo ^[FixFlow^] Stopped.
goto :eof

:vercel
echo ^[FixFlow^] Deploying frontend to Vercel...
cd /d "%~dp0..\Frontend"
call vercel --prod
cd /d "%~dp0.."
goto :eof

:seed
echo ^[FixFlow^] Seeding database...
cd /d "%~dp0..\backend"
call npx tsx src/seed.ts
cd /d "%~dp0.."
goto :eof

:usage
echo Usage: start.bat [local^|vercel^|seed]
echo.
echo   local   - Run frontend + backend locally
echo   vercel  - Deploy frontend to Vercel production
echo   seed    - Seed the database with demo data
goto :eof
