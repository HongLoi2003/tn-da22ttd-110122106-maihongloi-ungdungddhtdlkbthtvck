#!/bin/bash

echo "🔐 Lấy SHA-1 Fingerprint cho Google Sign-In"
echo "============================================"
echo ""

# Debug keystore
echo "📱 DEBUG KEYSTORE (Development):"
echo "--------------------------------"
if [ -f "$HOME/.android/debug.keystore" ]; then
    keytool -list -v -keystore "$HOME/.android/debug.keystore" -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep SHA1
    echo ""
else
    echo "❌ Debug keystore không tìm thấy tại: $HOME/.android/debug.keystore"
    echo ""
fi

# Release keystore
echo "🚀 RELEASE KEYSTORE (Production):"
echo "--------------------------------"
if [ -f "android/app/release.keystore" ]; then
    echo "Nhập password của release keystore:"
    keytool -list -v -keystore android/app/release.keystore -alias your-key-alias 2>/dev/null | grep SHA1
    echo ""
elif [ -f "android/app/debug.keystore" ]; then
    keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep SHA1
    echo ""
else
    echo "❌ Release keystore không tìm thấy"
    echo "💡 Tạo release keystore bằng:"
    echo "   keytool -genkey -v -keystore android/app/release.keystore -alias your-key-alias -keyalg RSA -keysize 2048 -validity 10000"
    echo ""
fi

echo "📋 Hướng dẫn:"
echo "1. Copy SHA-1 fingerprint ở trên"
echo "2. Vào Firebase Console → Project Settings"
echo "3. Your apps → Android app → Add fingerprint"
echo "4. Paste SHA-1 và Save"
echo "5. Download google-services.json mới"
echo "6. Copy vào android/app/google-services.json"
echo ""
