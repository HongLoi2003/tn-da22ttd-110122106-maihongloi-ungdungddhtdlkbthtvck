#!/bin/bash

echo "=== Pre-Build Check ==="
echo ""

all_checks=true

# Check 1: google-services.json
echo "1. Checking google-services.json..."
if [ -f "android/app/google-services.json" ]; then
    echo "   ✓ google-services.json exists"
else
    echo "   ✗ google-services.json NOT found"
    if [ -f "android/app/google-services (1).json" ]; then
        echo "   → Copying from backup..."
        cp "android/app/google-services (1).json" "android/app/google-services.json"
        echo "   ✓ Copied successfully"
    else
        echo "   ✗ No backup found. Please add google-services.json"
        all_checks=false
    fi
fi
echo ""

# Check 2: New Architecture disabled
echo "2. Checking New Architecture..."
if grep -q "newArchEnabled=false" android/gradle.properties; then
    echo "   ✓ New Architecture is disabled"
else
    echo "   ✗ New Architecture should be disabled"
    all_checks=false
fi
echo ""

# Check 3: NDK version
echo "3. Checking NDK version..."
if grep -q "^#.*android\.ndkVersion" android/gradle.properties || ! grep -q "android\.ndkVersion" android/gradle.properties; then
    echo "   ✓ NDK version is commented out or not specified"
else
    echo "   ⚠ NDK version is specified (may cause issues)"
fi
echo ""

# Check 4: Google Services plugin
echo "4. Checking Google Services plugin..."
if grep -q "com\.google\.gms\.google-services" android/app/build.gradle; then
    echo "   ✓ Google Services plugin is applied"
else
    echo "   ✗ Google Services plugin NOT found"
    all_checks=false
fi
echo ""

# Check 5: node_modules
echo "5. Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules exists"
else
    echo "   ✗ node_modules NOT found. Running npm install..."
    npm install
    if [ $? -eq 0 ]; then
        echo "   ✓ npm install completed"
    else
        echo "   ✗ npm install failed"
        all_checks=false
    fi
fi
echo ""

# Check 6: EAS CLI
echo "6. Checking EAS CLI..."
if command -v eas &> /dev/null; then
    eas_version=$(eas --version)
    echo "   ✓ EAS CLI installed: $eas_version"
else
    echo "   ✗ EAS CLI NOT found"
    echo "   → Install with: npm install -g eas-cli"
    all_checks=false
fi
echo ""

# Check 7: app.json
echo "7. Checking app.json..."
if grep -q '"newArchEnabled": false' app.json; then
    echo "   ✓ newArchEnabled is false in app.json"
else
    echo "   ✗ newArchEnabled should be false in app.json"
    all_checks=false
fi
echo ""

# Check 8: eas.json
echo "8. Checking eas.json..."
if [ -f "eas.json" ]; then
    echo "   ✓ eas.json exists"
else
    echo "   ✗ eas.json NOT found"
    all_checks=false
fi
echo ""

# Summary
echo "=== Summary ==="
if [ "$all_checks" = true ]; then
    echo "✓ All checks passed! Ready to build."
    echo ""
    echo "Run one of these commands:"
    echo "  eas build --platform android --profile preview"
    echo "  eas build --platform android --profile production"
else
    echo "✗ Some checks failed. Please fix the issues above."
    echo ""
    echo "See HUONG_DAN_SUA_LOI_BUILD.md for more details."
fi
echo ""
