#!/bin/bash

# Script tự động build APK release cho HeatLeCare
# Sử dụng: ./build-apk-release.sh

set -e  # Dừng nếu có lỗi

echo "🏥 HeatLeCare - Build APK Release"
echo "=================================="
echo ""

# Màu sắc cho output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kiểm tra node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Cài đặt dependencies...${NC}"
    npm install
fi

# Kiểm tra android folder
if [ ! -d "android" ]; then
    echo -e "${BLUE}🔧 Prebuild Android...${NC}"
    npx expo prebuild --platform android
fi

# Kiểm tra keystore
if [ ! -f "android/app/release.keystore" ]; then
    echo -e "${RED}❌ Không tìm thấy release.keystore!${NC}"
    echo "Vui lòng đảm bảo file android/app/release.keystore tồn tại"
    exit 1
fi

echo -e "${BLUE}🧹 Cleaning build...${NC}"
cd android
./gradlew clean

echo ""
echo -e "${BLUE}🔨 Building release APK...${NC}"
echo "Quá trình này có thể mất vài phút..."
./gradlew assembleRelease

# Kiểm tra build thành công
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo ""
    echo -e "${GREEN}✅ Build thành công!${NC}"
    
    # Lấy thông tin file
    APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
    
    # Copy ra ngoài với tên có version
    VERSION=$(grep "versionName" app/build.gradle | awk '{print $2}' | tr -d '"')
    OUTPUT_NAME="heatlecare-v${VERSION}.apk"
    
    cd ..
    cp android/app/build/outputs/apk/release/app-release.apk "$OUTPUT_NAME"
    
    echo ""
    echo -e "${GREEN}📦 File APK:${NC}"
    echo "   Tên: $OUTPUT_NAME"
    echo "   Kích thước: $APK_SIZE"
    echo "   Đường dẫn: $(pwd)/$OUTPUT_NAME"
    echo ""
    echo -e "${GREEN}🎉 Hoàn tất! Bạn có thể chia sẻ file APK này.${NC}"
    echo ""
    echo "📱 Để cài đặt trên thiết bị:"
    echo "   adb install $OUTPUT_NAME"
    echo ""
    echo "☁️  Để upload lên Google Drive/Dropbox và chia sẻ link"
    
else
    echo ""
    echo -e "${RED}❌ Build thất bại!${NC}"
    echo "Kiểm tra log ở trên để xem lỗi"
    exit 1
fi
