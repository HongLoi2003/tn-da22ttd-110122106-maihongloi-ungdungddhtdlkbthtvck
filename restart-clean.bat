@echo off
echo ========================================
echo Dang xoa cache va khoi dong lai ung dung
echo ========================================
echo.

echo [1/3] Dung server hien tai...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Xoa cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache da duoc xoa!

echo [3/3] Khoi dong lai voi cache moi...
echo.
npx expo start -c

pause
