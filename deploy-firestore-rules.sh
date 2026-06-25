#!/bin/bash

# Deploy Firestore Rules to Firebase
echo "🚀 Deploying Firestore Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed!"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
echo "📝 Checking Firebase login status..."
firebase login:list

# Deploy rules
echo ""
echo "🔥 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Firestore rules deployed successfully!"
    echo ""
    echo "📋 Rules now allow:"
    echo "  ✓ Users can create AI conversations"
    echo "  ✓ Users can read their own conversations"
    echo "  ✓ Users can update their own conversations"
    echo "  ✓ Users can delete their own conversations"
    echo "  ✓ Users can create/delete AI messages"
else
    echo ""
    echo "❌ Failed to deploy Firestore rules!"
    echo "Please check the error message above."
fi
