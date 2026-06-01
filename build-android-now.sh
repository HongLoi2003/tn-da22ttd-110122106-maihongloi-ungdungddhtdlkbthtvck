#!/bin/bash

echo "=== Build Android APK ==="
echo ""

# Check EAS CLI
echo "Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "ERROR: EAS CLI not found!"
    echo "Install with: npm install -g eas-cli"
    exit 1
fi
eas_version=$(eas --version)
echo "OK: EAS CLI version $eas_version"

# Check google-services.json
echo ""
echo "Checking google-services.json..."
if [ ! -f "android/app/google-services.json" ]; then
    echo "WARNING: google-services.json not found!"
    if [ -f "android/app/google-services (1).json" ]; then
        echo "Copying from backup..."
        cp "android/app/google-services (1).json" "android/app/google-services.json"
        echo "OK: Copied successfully"
    else
        echo "ERROR: No google-services.json found!"
        echo "Please download from Firebase Console"
        exit 1
    fi
else
    echo "OK: google-services.json exists"
fi

# Ask for build profile
echo ""
echo "=== Select Build Profile ==="
echo "1. Production (Release build, optimized)"
echo "2. Preview (Test build, faster)"
echo ""
read -p "Enter choice (1 or 2, default: 1): " choice

if [ "$choice" = "2" ]; then
    profile="preview"
    echo ""
    echo "Building with PREVIEW profile..."
else
    profile="production"
    echo ""
    echo "Building with PRODUCTION profile..."
fi

echo ""
echo "Starting build..."
echo "This will take about 10-15 minutes."
echo "You can close this window and check progress at:"
echo "https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/"
echo ""

# Run build
eas build --platform android --profile $profile

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Build Started Successfully ==="
    echo "Check progress at: https://expo.dev/accounts/maihongloi23/projects/heatlecare/builds/"
else
    echo ""
    echo "=== Build Failed ==="
    echo "Check the error message above"
    echo "See BUILD_ANDROID_NGAY.md for troubleshooting"
fi
