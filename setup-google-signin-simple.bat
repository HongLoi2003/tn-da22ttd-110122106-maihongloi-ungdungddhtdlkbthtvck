@echo off
chcp 65001 >nul
echo.
echo ========================================
echo Setup Google Sign-In cho Mobile
echo ========================================
echo.

REM Kiem tra google-services.json
echo [1/4] Kiem tra google-services.json...
if exist "android\app\google-services.json" (
    echo [OK] File google-services.json da ton tai
) else (
    echo [ERROR] File google-services.json chua ton tai
    echo.
    echo Huong dan:
    echo 1. Vao Firebase Console
    echo 2. Download google-services.json
    echo 3. Copy vao: android\app\google-services.json
    echo.
    
    REM Kiem tra trong Downloads
    if exist "%USERPROFILE%\Downloads\google-services.json" (
        echo [OK] Tim thay file trong Downloads!
        echo Dang copy file...
        if not exist "android\app" mkdir "android\app"
        copy "%USERPROFILE%\Downloads\google-services.json" "android\app\google-services.json" >nul
        echo [OK] Da copy file thanh cong!
        echo.
        echo Chay lai script nay de tiep tuc
    )
    pause
    exit /b
)

REM Kiem tra .env.local
echo.
echo [2/4] Kiem tra .env.local...
if exist ".env.local" (
    echo [OK] File .env.local da ton tai
    echo.
    echo Luu y: Ban can them dong nay vao .env.local:
    echo EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your_web_client_id_here
    echo.
    echo Lay Web Client ID tu google-services.json hoac Firebase Console
) else (
    echo [ERROR] File .env.local khong ton tai
)

REM Lay SHA-1
echo.
echo [3/4] Lay SHA-1 Fingerprint...
if exist "%USERPROFILE%\.android\debug.keystore" (
    echo.
    echo Debug Keystore SHA-1:
    keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android 2>nul | findstr SHA1
    echo.
    echo Copy SHA-1 o tren va:
    echo 1. Vao Firebase Console - Project Settings
    echo 2. Your apps - Android - Add fingerprint
    echo 3. Paste SHA-1 - Save
) else (
    echo [ERROR] Debug keystore khong tim thay
)

REM Kiem tra package
echo.
echo [4/4] Kiem tra package...
findstr "@react-native-google-signin/google-signin" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] Package da duoc cai dat
) else (
    echo [WARNING] Package chua duoc cai dat
    echo Dang cai dat...
    call npm install @react-native-google-signin/google-signin
    echo [OK] Da cai dat package
)

echo.
echo ========================================
echo Setup hoan tat!
echo ========================================
echo.
echo Buoc tiep theo:
echo 1. Them SHA-1 vao Firebase Console
echo 2. Them Web Client ID vao .env.local
echo 3. Chay: npx expo start --clear
echo 4. Test Google Sign-In
echo.
echo Xem huong dan: CAI_DAT_GOOGLE_SIGNIN_NHANH.md
echo.
pause
