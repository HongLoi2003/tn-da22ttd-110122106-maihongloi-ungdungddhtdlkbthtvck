#!/bin/bash

# Health Care App - APK Build Script
# This script automates the APK build process

set -e  # Exit on error

echo "🚀 Health Care App - APK Build Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm: $(npm --version)${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is not installed${NC}"
    echo "Please install Java JDK 17 or higher"
    exit 1
fi
echo -e "${GREEN}✅ Java: $(java --version | head -n 1)${NC}"

echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
echo ""
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Optimize images (optional)
echo "🖼️  Step 3: Optimizing images (optional)..."
read -p "Do you want to optimize images? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run optimize-images
    echo -e "${GREEN}✅ Images optimized${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped image optimization${NC}"
fi
echo ""

# Step 4: Prebuild
echo "🔨 Step 4: Running Expo prebuild..."
echo ""
npx expo prebuild --platform android --clean
echo -e "${GREEN}✅ Prebuild completed${NC}"
echo ""

# Step 5: Build APK
echo "📱 Step 5: Building APK..."
echo ""
echo "Choose build type:"
echo "1) Debug APK (for testing)"
echo "2) Release APK (for production)"
read -p "Enter choice (1 or 2): " choice

cd android

if [ "$choice" = "1" ]; then
    echo ""
    echo "Building Debug APK..."
    ./gradlew assembleDebug
    echo ""
    echo -e "${GREEN}✅ Debug APK built successfully!${NC}"
    echo ""
    echo "📍 APK Location:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    APK_SIZE=$(du -h app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo "📊 APK Size: $APK_SIZE"
elif [ "$choice" = "2" ]; then
    # Check if keystore exists
    if [ ! -f "app/release.keystore" ]; then
        echo -e "${RED}❌ Release keystore not found!${NC}"
        echo ""
        echo "Please create a release keystore first:"
        echo "See CREATE_RELEASE_KEYSTORE.md for instructions"
        exit 1
    fi
    
    echo ""
    echo "Building Release APK..."
    ./gradlew assembleRelease
    echo ""
    echo -e "${GREEN}✅ Release APK built successfully!${NC}"
    echo ""
    echo "📍 APK Location:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
    echo "📊 APK Size: $APK_SIZE"
else
    echo -e "${RED}❌ Invalid choice${NC}"
    exit 1
fi

cd ..

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. Install APK on your Android device"
echo "2. Test all features"
echo "3. Check for any issues"
echo ""
echo "To install APK:"
echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo "  or"
echo "  adb install android/app/build/outputs/apk/release/app-release.apk"
echo ""
