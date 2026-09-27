@echo off
echo Starting Satellite SRM Integration...

REM Move to frontend, build if dist does not exist (or force build if you want)
cd satellite-srm-frontend
if not exist dist (
    echo Building frontend...
    call npm install
    call npm run build
)
cd ..

REM Copy dist to backend
echo Copying frontend build to backend...
xcopy /E /I /Y satellite-srm-frontend\dist backend-main\Satellite_SRM_DL\dist

echo Starting Backend Server...
cd backend-main\Satellite_SRM_DL
start cmd /k "uvicorn server:app --host 0.0.0.0 --port 8000"

echo.
echo ========================================================
echo Server started! Open http://localhost:8000 in your browser
echo ========================================================
pause
