#!/bin/bash

# Script chuyển sang Expo Go để test nhanh

echo "🔄 Đang chuyển sang Expo Go..."
echo ""

# Bước 1: Xóa expo-dev-client
echo "📦 Bước 1: Xóa expo-dev-client..."
npm uninstall expo-dev-client

if [ $? -eq 0 ]; then
    echo "✅ Đã xóa expo-dev-client"
else
    echo "❌ Lỗi khi xóa expo-dev-client"
    exit 1
fi

echo ""

# Bước 2: Clear cache và chạy
echo "🧹 Bước 2: Xóa cache và khởi động..."
npx expo start --clear --go

echo ""
echo "✅ HOÀN TẤT!"
echo ""
echo "📱 Bây giờ bạn có thể:"
echo "   1. Tải Expo Go từ Play Store/App Store"
echo "   2. Mở Expo Go và quét mã QR"
echo ""
echo "🚀 Server đang chạy, hãy quét mã QR bằng Expo Go!"
