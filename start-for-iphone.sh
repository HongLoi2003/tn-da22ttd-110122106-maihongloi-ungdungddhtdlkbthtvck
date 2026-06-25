#!/bin/bash

# ============================================
# START APP FOR IPHONE - MIỄN PHÍ VỚI EXPO GO
# ============================================

echo "=== CHẠY APP TRÊN IPHONE (MIỄN PHÍ) ==="
echo ""

# Kiểm tra Expo Go trên iPhone
echo "📱 BƯỚC 1: Cài Expo Go trên iPhone"
echo "   1. Mở App Store trên iPhone"
echo "   2. Tìm 'Expo Go'"
echo "   3. Tải về (miễn phí)"
echo ""

read -p "Đã cài Expo Go xong chưa? (y/n): " ready
if [ "$ready" != "y" ]; then
    echo "Vui lòng cài Expo Go trước, sau đó chạy lại script này"
    exit 1
fi

echo ""
echo "✅ Tuyệt! Bắt đầu start server..."
echo ""

# Clear cache
echo "🧹 Xóa cache cũ..."
rm -rf .expo

# Check network
echo ""
echo "🌐 Kiểm tra mạng..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    localIP=$(ipconfig getifaddr en0)
else
    # Linux
    localIP=$(hostname -I | awk '{print $1}')
fi
echo "   IP máy bạn: $localIP"
echo "   ⚠️  iPhone và máy phải cùng WiFi!"
echo ""

# Start options
echo "CHỌN CÁCH KẾT NỐI:"
echo "1. LAN - Nhanh nhất (cùng WiFi)"
echo "2. TUNNEL - Qua internet (nếu LAN không được)"
echo ""

read -p "Chọn (1/2): " choice

echo ""
echo "🚀 ĐANG START SERVER..."
echo ""

if [ "$choice" == "2" ]; then
    echo "⚠️  Tunnel mode có thể chậm hơn 1-2 giây"
    echo "Đang start với tunnel mode..."
    echo ""
    
    npx expo start --tunnel
else
    echo "Đang start với LAN mode..."
    echo ""
    
    npx expo start
fi

echo ""
echo "========================================"
echo "📱 CÁCH KẾT NỐI IPHONE:"
echo ""
echo "CÁCH 1 (Dễ nhất):"
echo "  1. Mở Camera app trên iPhone"
echo "  2. Scan QR code ở trên"
echo "  3. Tap 'Open in Expo Go'"
echo ""
echo "CÁCH 2:"
echo "  1. Mở app Expo Go trên iPhone"
echo "  2. Tap 'Enter URL manually'"
echo "  3. Nhập URL hiện ở trên"
echo ""
echo "✅ App sẽ load và chạy trên iPhone!"
echo "🔄 Edit code → App tự động reload"
echo ""
echo "Press Ctrl+C để stop server"
echo "========================================"
