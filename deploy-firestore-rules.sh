#!/bin/bash

echo "🚀 Deploying Firestore Rules..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI chưa được cài đặt!"
    echo "📦 Cài đặt bằng lệnh: npm install -g firebase-tools"
    exit 1
fi

# Deploy Firestore rules
echo "📤 Đang deploy Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy Firestore rules thành công!"
    echo "🎉 Bây giờ bạn có thể đọc collection 'popular-specialties'"
else
    echo ""
    echo "❌ Deploy thất bại!"
    echo "💡 Hãy chắc chắn bạn đã đăng nhập Firebase: firebase login"
fi
