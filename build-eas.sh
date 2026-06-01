#!/bin/bash
# Script build APK bằng EAS Build
# Chạy: bash build-eas.sh

echo "========================================"
echo "  BUILD APK BẰNG EAS BUILD"
echo "========================================"
echo ""

# Kiểm tra EAS CLI
echo "[1/4] Kiểm tra EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "  ⚠️  EAS CLI chưa được cài đặt"
    echo "     → Đang cài đặt EAS CLI..."
    npm install -g eas-cli
    echo "  ✅ Đã cài đặt EAS CLI"
else
    version=$(eas --version)
    echo "  ✅ EAS CLI đã cài đặt: $version"
fi
echo ""

# Kiểm tra đăng nhập
echo "[2/4] Kiểm tra đăng nhập..."
whoami=$(eas whoami 2>&1)

if [[ $whoami == *"Not logged in"* ]]; then
    echo "  ⚠️  Chưa đăng nhập EAS"
    echo "     → Đang mở trang đăng nhập..."
    echo ""
    eas login
    echo ""
    echo "  ✅ Đã đăng nhập"
else
    echo "  ✅ Đã đăng nhập: $whoami"
fi
echo ""

# Kiểm tra cấu hình
echo "[3/4] Kiểm tra cấu hình..."

if [ -f "eas.json" ]; then
    echo "  ✅ File eas.json tồn tại"
else
    echo "  ❌ Thiếu file eas.json"
    exit 1
fi

if [ -f "app.json" ]; then
    projectId=$(grep -o '"projectId": "[^"]*' app.json | cut -d'"' -f4)
    if [ -n "$projectId" ]; then
        echo "  ✅ EAS Project ID: $projectId"
    else
        echo "  ⚠️  Chưa có EAS Project ID"
    fi
else
    echo "  ❌ Thiếu file app.json"
    exit 1
fi
echo ""

# Build APK
echo "[4/4] Build APK..."
echo ""
echo "Chọn profile build:"
echo "  1. preview  - Build APK để test (khuyến nghị)"
echo "  2. production - Build APK production"
echo ""

read -p "Nhập lựa chọn (1 hoặc 2, mặc định: 1): " choice

if [ "$choice" = "2" ]; then
    profile="production"
else
    profile="preview"
fi

echo ""
echo "Đang build với profile: $profile"
echo ""
echo "⏳ Build sẽ mất 10-20 phút..."
echo "📱 Bạn có thể theo dõi tiến trình tại:"
echo "   https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds"
echo ""

# Chạy build
eas build --platform android --profile $profile

echo ""
echo "========================================"
echo "  BUILD HOÀN TẤT"
echo "========================================"
echo ""
echo "✅ APK đã được build thành công!"
echo ""
echo "📥 Download APK:"
echo "   1. Click vào link download trong terminal"
echo "   2. Hoặc truy cập: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds"
echo ""
echo "📱 Chia sẻ APK:"
echo "   - Copy link download và gửi cho người dùng"
echo "   - Họ có thể download và install trực tiếp"
echo ""
echo "🎉 Chúc mừng! APK đã sẵn sàng để phân phối!"
echo ""
