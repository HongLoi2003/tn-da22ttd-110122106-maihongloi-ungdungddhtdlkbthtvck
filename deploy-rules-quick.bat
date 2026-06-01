@echo off
echo ========================================
echo DEPLOY FIRESTORE RULES
echo ========================================
echo.

echo Dang deploy Firestore Rules...
firebase deploy --only firestore:rules

echo.
echo ========================================
echo HOAN THANH!
echo ========================================
echo.
echo Rules da duoc deploy len Firebase.
echo Vui long doi 1-2 phut de rules co hieu luc.
echo.
pause
