#!/bin/bash

echo "Cleaning Android build..."

# Clean Gradle cache
cd android
./gradlew clean
cd ..

# Remove build folders
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start --clear

echo "Clean completed!"
