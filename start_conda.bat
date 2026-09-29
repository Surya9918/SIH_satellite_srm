@echo off
echo Starting Satellite SRM Integration via Conda...

REM Copy dist to backend
echo Copying frontend build to backend...
xcopy /E /I /Y satellite-srm-frontend\dist backend-main\Satellite_SRM_DL\dist

echo Starting Backend Server...
cd backend-main\Satellite_SRM_DL
start cmd /k "C:\Users\vemul\anaconda3\condabin\conda.bat run -n satellite-srm uvicorn server:app --host 0.0.0.0 --port 8000"

echo.
echo ========================================================
echo Server started! Open http://localhost:8000 in your browser
echo ========================================================
