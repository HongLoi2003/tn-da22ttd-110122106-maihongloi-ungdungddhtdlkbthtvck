@echo off
echo ========================================
echo   BUILD APP VOI GOOGLE SIGN-IN
echo ========================================
echo.

echo [1/3] Dang login EAS...
echo.
call npx eas login
if errorlevel 1 (
    echo.
    echo ❌ Login that bai!
    echo Vui long thu lai hoac tao account tai: https://expo.dev/signup
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Login thanh cong!
echo ========================================
echo.

echo [2/3] Dang configure EAS (neu can)...
echo.
call npx eas build:configure
if errorlevel 1 (
    echo.
    echo ⚠️ Configure co van de, nhung co the khong sao
    echo.
)

echo.
echo ========================================
echo [3/3] Bat dau build Development APK...
echo ========================================
echo.
echo ⏳ Qua trinh nay se mat 10-15 phut
echo 💡 Ban co the dong terminal, build van chay tren cloud
echo 🔗 Kiem tra tien do tai: https://expo.dev
echo.

call npx eas build -p android --profile development

echo.
echo ========================================
echo ✅ HOAN THANH!
echo ========================================
echo.
echo 📱 Buoc tiep theo:
echo 1. Download APK tu link tren
echo 2. Cai APK len dien thoai
echo 3. Mo app va test Google Sign-In
echo.
pause
