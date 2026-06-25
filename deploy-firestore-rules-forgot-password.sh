#!/bin/bash
# Deploy Firestore Rules with Forgot Password Support
# Cho phép user update password khi forgot password (chưa đăng nhập)

echo "🔥 Deploying Firestore Rules for Forgot Password..."
echo ""

# Kiểm tra Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI chưa được cài đặt!"
    echo ""
    echo "Cài đặt Firebase CLI:"
    echo "  npm install -g firebase-tools"
    echo ""
    exit 1
fi

echo "✅ Firebase CLI đã cài đặt"
echo ""

# Kiểm tra đã login chưa
echo "🔍 Kiểm tra Firebase login status..."
if ! firebase login:list &> /dev/null; then
    echo "❌ Chưa đăng nhập Firebase!"
    echo ""
    echo "Đăng nhập Firebase:"
    echo "  firebase login"
    echo ""
    exit 1
fi

echo "✅ Đã đăng nhập Firebase"
echo ""

# Deploy Firestore rules
echo "📤 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore rules deployed thành công!"
    echo ""
    echo "📋 Các thay đổi đã deploy:"
    echo "  ✓ Cho phép user update password khi forgot password (chưa đăng nhập)"
    echo "  ✓ Bảo mật: Chỉ cho update password và updatedAt fields"
    echo "  ✓ Kiểm tra email khớp trước khi update"
    echo ""
    echo "🧪 Test ngay:"
    echo "  1. Mở app → Quên mật khẩu"
    echo "  2. Nhập email → Nhận OTP"
    echo "  3. Nhập OTP → Đổi mật khẩu"
    echo "  4. Đăng nhập với password mới"
    echo ""
else
    echo ""
    echo "❌ Deploy thất bại!"
    echo ""
    echo "Kiểm tra lỗi ở trên và thử lại"
    echo ""
    exit 1
fi
