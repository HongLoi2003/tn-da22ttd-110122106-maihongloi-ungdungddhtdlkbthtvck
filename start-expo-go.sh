#!/bin/bash

# Script khởi động app với Expo Go

echo "🚀 Đang khởi động Expo với Expo Go..."
echo ""

# Xóa cache
echo "🧹 Xóa cache..."
npx expo start --clear --go

echo ""
echo "✅ Server đã khởi động!"
echo ""
echo "📱 HƯỚNG DẪN:"
echo "   1. Tải app 'Expo Go' từ Play Store (Android) hoặc App Store (iOS)"
echo "   2. Mở app Expo Go"
echo "   3. Quét mã QR hiển thị ở trên"
echo ""
echo "🔗 Link tải Expo Go:"
echo "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo "   iOS: https://apps.apple.com/app/expo-go/id982107779"
