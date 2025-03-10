@echo off
echo Starting Financial Dashboard...
echo.
echo Starting Backend (JSON Server)...
start cmd /k "npm run dev:back"
echo.
echo Starting Frontend (Vite Dev Server)...
start cmd /k "npm run dev"
echo.
echo Both services started successfully!
echo - Backend running on http://localhost:4000
echo - Frontend running on http://localhost:5173
echo.
echo Waiting for services to initialize...
timeout /t 5 /nobreak > nul
echo Opening application in your default browser...
start http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul
