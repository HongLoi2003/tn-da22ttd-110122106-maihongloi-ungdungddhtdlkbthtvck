#!/bin/bash
# Script để start backend server cho forgot password

echo "🚀 Starting Backend Server for Password Reset..."

# Check if node_modules exists in email-api
if [ ! -d "email-api/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd email-api
    npm install
    cd ..
fi

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "❌ Error: serviceAccountKey.json not found!"
    echo "Please download it from Firebase Console and place it in the root directory"
    exit 1
fi

# Start server
echo "✅ Starting server on port 3001..."
cd email-api
node server.js
