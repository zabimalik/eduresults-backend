@echo off
echo ========================================
echo Oxford City School - Localhost Database Setup
echo ========================================
echo.

echo Checking MongoDB installation...
mongosh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not installed or not in PATH
    echo Please install MongoDB Community Server from:
    echo https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

echo [OK] MongoDB is installed
echo.

echo Checking if MongoDB service is running...
sc query MongoDB | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB service is not running
    echo Attempting to start MongoDB service...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start MongoDB service
        echo Please start MongoDB manually from Services
        pause
        exit /b 1
    )
    echo [OK] MongoDB service started
) else (
    echo [OK] MongoDB service is running
)
echo.

echo Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Setting up local database with sample data...
call npm run setup-db
if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup database
    pause
    exit /b 1
)
echo.

echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo You can now start the backend server with:
echo   npm run dev
echo.
echo The backend will be available at:
echo   http://localhost:5000
echo.
echo Database: mongodb://localhost:27017/oxford-city-school
echo.
pause