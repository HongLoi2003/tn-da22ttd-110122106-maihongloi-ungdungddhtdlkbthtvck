@echo off
echo 🔐 Lấy SHA-1 Fingerprint cho Google Sign-In
echo ============================================
echo.

REM Debug keystore
echo 📱 DEBUG KEYSTORE (Development):
echo --------------------------------
if exist "%USERPROFILE%\.android\debug.keystore" (
    keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android 2>nul | findstr SHA1
    echo.
) else (
    echo ❌ Debug keystore không tìm thấy
    echo.
)

REM Release keystore
echo 🚀 RELEASE KEYSTORE (Production):
echo --------------------------------
if exist "android\app\release.keystore" (
    echo Nhập password của release keystore:
    keytool -list -v -keystore android\app\release.keystore -alias your-key-alias 2>nul | findstr SHA1
    echo.
) else if exist "android\app\debug.keystore" (
    keytool -list -v -keystore android\app\debug.keystore -alias androiddebugkey -storepass android -keypass android 2>nul | findstr SHA1
    echo.
) else (
    echo ❌ Release keystore không tìm thấy
    echo 💡 Tạo release keystore bằng:
    echo    keytool -genkey -v -keystore android\app\release.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000
    echo.
)

echo 📋 Hướng dẫn:
echo 1. Copy SHA-1 fingerprint ở trên
echo 2. Vào Firebase Console → Project Settings
echo 3. Your apps → Android app → Add fingerprint
echo 4. Paste SHA-1 và Save
echo 5. Download google-services.json mới
echo 6. Copy vào android\app\google-services.json
echo.

pause
