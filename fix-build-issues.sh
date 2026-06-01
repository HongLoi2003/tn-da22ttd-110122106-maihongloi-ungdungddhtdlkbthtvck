#!/bin/bash
# Script tự động khắc phục các vấn đề trước khi build APK
# Chạy: bash fix-build-issues.sh

echo "========================================"
echo "  KHẮC PHỤC VẤN ĐỀ TRƯỚC KHI BUILD APK"
echo "========================================"
echo ""

hasErrors=false

# Kiểm tra 1: google-services.json
echo "[1/5] Kiểm tra google-services.json..."
if [ -f "android/app/google-services.json" ]; then
    echo "  ✅ File google-services.json đã tồn tại"
else
    echo "  ❌ THIẾU file google-services.json"
    echo "     → Cần download từ Firebase Console"
    echo "     → URL: https://console.firebase.google.com/project/hearthcare-847b3/settings/general"
    hasErrors=true
fi
echo ""

# Kiểm tra 2: Google Services Plugin trong build.gradle
echo "[2/5] Kiểm tra Google Services Plugin..."
if grep -q "google-services" android/build.gradle; then
    echo "  ✅ Google Services plugin đã được cấu hình"
else
    echo "  ⚠️  Chưa có Google Services plugin trong build.gradle"
    echo "     → Đang thêm vào android/build.gradle..."
    
    # Backup file gốc
    cp android/build.gradle android/build.gradle.backup
    
    # Thêm classpath vào dependencies
    sed -i "/classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')/a\    classpath('com.google.gms:google-services:4.4.0')" android/build.gradle
    
    echo "  ✅ Đã thêm Google Services plugin"
fi

# Kiểm tra apply plugin trong app/build.gradle
if grep -q "apply plugin: 'com.google.gms.google-services'" android/app/build.gradle; then
    echo "  ✅ Google Services plugin đã được apply"
else
    echo "  ⚠️  Chưa apply Google Services plugin"
    echo "     → Đang thêm vào android/app/build.gradle..."
    
    # Backup file gốc
    cp android/app/build.gradle android/app/build.gradle.backup
    
    # Thêm apply plugin vào cuối file
    echo "" >> android/app/build.gradle
    echo "// Google Services Plugin" >> android/app/build.gradle
    echo "apply plugin: 'com.google.gms.google-services'" >> android/app/build.gradle
    
    echo "  ✅ Đã apply Google Services plugin"
fi
echo ""

# Kiểm tra 3: Keystore file
echo "[3/5] Kiểm tra keystore file..."
if [ -f "android/app/release.keystore" ]; then
    echo "  ✅ File release.keystore đã tồn tại"
else
    echo "  ❌ THIẾU file release.keystore"
    echo "     → Cần tạo keystore mới hoặc copy từ backup"
    hasErrors=true
fi
echo ""

# Kiểm tra 4: Tối ưu hình ảnh
echo "[4/5] Kiểm tra kích thước hình ảnh..."
largeImages=$(find assets/images -type f -size +500k 2>/dev/null | wc -l)
if [ "$largeImages" -gt 0 ]; then
    echo "  ⚠️  Tìm thấy $largeImages file ảnh lớn hơn 500KB:"
    find assets/images -type f -size +500k -exec ls -lh {} \; | head -5 | awk '{print "     - " $9 ": " $5}'
    echo "     → Khuyến nghị chạy: npm run optimize-images"
else
    echo "  ✅ Tất cả hình ảnh đã được tối ưu"
fi
echo ""

# Kiểm tra 5: Dependencies
echo "[5/5] Kiểm tra dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules đã tồn tại"
else
    echo "  ⚠️  Chưa cài đặt dependencies"
    echo "     → Đang chạy npm install..."
    npm install
    echo "  ✅ Đã cài đặt dependencies"
fi
echo ""

# Tổng kết
echo "========================================"
echo "  KẾT QUẢ KIỂM TRA"
echo "========================================"
echo ""

if [ "$hasErrors" = true ]; then
    echo "❌ CÓ LỖI CẦN KHẮC PHỤC!"
    echo ""
    echo "Vui lòng khắc phục các lỗi trên trước khi build APK."
    echo "Xem chi tiết trong file: KHAC_PHUC_LOI_TRUOC_KHI_BUILD.md"
    echo ""
    exit 1
else
    echo "✅ TẤT CẢ KIỂM TRA ĐÃ PASS!"
    echo ""
    echo "Bạn có thể build APK bằng lệnh:"
    echo "  cd android"
    echo "  ./gradlew clean"
    echo "  ./gradlew assembleRelease"
    echo "  cd .."
    echo ""
    echo "APK sẽ được tạo tại:"
    echo "  android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    
    # Hỏi có muốn build ngay không
    read -p "Bạn có muốn build APK ngay bây giờ? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Đang build APK..."
        cd android
        ./gradlew clean
        ./gradlew assembleRelease
        cd ..
        echo ""
        echo "✅ BUILD HOÀN TẤT!"
        echo "APK: android/app/build/outputs/apk/release/app-release.apk"
    fi
fi
