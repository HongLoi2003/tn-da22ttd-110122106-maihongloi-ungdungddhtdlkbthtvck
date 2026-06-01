@echo off
REM Health Care App - APK Build Script for Windows
REM This script automates the APK build process

echo.
echo ========================================
echo Health Care App - APK Build Script
echo ========================================
echo.

REM Step 1: Check prerequisites
echo [Step 1] Checking prerequisites...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)
echo [OK] Node.js found

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)
echo [OK] npm found

where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is not installed
    echo Please install Java JDK 17 or higher
    exit /b 1
)
echo [OK] Java found

echo.

REM Step 2: Install dependencies
echo [Step 2] Installing dependencies...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Optimize images (optional)
echo [Step 3] Optimize images?
set /p optimize="Do you want to optimize images? (y/n): "
if /i "%optimize%"=="y" (
    call npm run optimize-images
    echo [OK] Images optimized
) else (
    echo [SKIP] Image optimization skipped
)
echo.

REM Step 4: Prebuild
echo [Step 4] Running Expo prebuild...
echo.
call npx expo prebuild --platform android --clean
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Prebuild failed
    exit /b 1
)
echo [OK] Prebuild completed
echo.

REM Step 5: Build APK
echo [Step 5] Building APK...
echo.
echo Choose build type:
echo 1) Debug APK (for testing)
echo 2) Release APK (for production)
set /p choice="Enter choice (1 or 2): "

cd android

if "%choice%"=="1" (
    echo.
    echo Building Debug APK...
    call gradlew.bat assembleDebug
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Debug build failed
        cd ..
        exit /b 1
    )
    echo.
    echo [SUCCESS] Debug APK built successfully!
    echo.
    echo APK Location:
    echo   android\app\build\outputs\apk\debug\app-debug.apk
    echo.
) else if "%choice%"=="2" (
    REM Check if keystore exists
    if not exist "app\release.keystore" (
        echo [ERROR] Release keystore not found!
        echo.
        echo Please create a release keystore first:
        echo See CREATE_RELEASE_KEYSTORE.md for instructions
        cd ..
        exit /b 1
    )
    
    echo.
    echo Building Release APK...
    call gradlew.bat assembleRelease
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Release build failed
        cd ..
        exit /b 1
    )
    echo.
    echo [SUCCESS] Release APK built successfully!
    echo.
    echo APK Location:
    echo   android\app\build\outputs\apk\release\app-release.apk
    echo.
) else (
    echo [ERROR] Invalid choice
    cd ..
    exit /b 1
)

cd ..

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Install APK on your Android device
echo 2. Test all features
echo 3. Check for any issues
echo.
echo To install APK:
echo   adb install android\app\build\outputs\apk\debug\app-debug.apk
echo   or
echo   adb install android\app\build\outputs\apk\release\app-release.apk
echo.
pause
