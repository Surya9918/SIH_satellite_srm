@echo off
echo Setting up Anaconda Environment for Satellite-SRM...

echo Creating conda environment 'satellite-srm' with Python 3.11...
call C:\Users\vemul\anaconda3\condabin\conda.bat create -n satellite-srm python=3.11 -y

echo Activating environment...
call C:\Users\vemul\anaconda3\condabin\conda.bat activate satellite-srm

echo Installing Geospatial libraries and complex C++ libraries (OpenCV, Streamlit) via conda-forge (this resolves Windows ARM64 build issues)...
call C:\Users\vemul\anaconda3\condabin\conda.bat install -c conda-forge gdal geopandas rasterio pyproj shapely opencv streamlit -y

echo Installing remaining backend requirements via pip...
cd backend-main\Satellite_SRM_DL
call C:\Users\vemul\anaconda3\condabin\conda.bat run -n satellite-srm pip install -r requirements.txt
cd ..\..

echo.
echo ========================================================
echo Setup complete! 
echo Next time, you can just run start_conda.bat to boot the server.
echo ========================================================
