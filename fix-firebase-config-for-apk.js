const fs = require('fs');
const path = require('path');

console.log('🔧 Đang fix Firebase config cho APK...\n');

// Firebase config từ .env.local
const firebaseConfig = {
  apiKey: "AIzaSyDehJOLX38acOCdq1CFbVqigBgxebaBD2k",
  authDomain: "hearthcare-847b3.firebaseapp.com",
  projectId: "hearthcare-847b3",
  storageBucket: "hearthcare-847b3.firebasestorage.app",
  messagingSenderId: "9119519990",
  appId: "1:9119519990:web:0f8f0508861c87e2be48d7",
};

// 1. Đọc file firebase.ts
const firebasePath = path.join(__dirname, 'app', 'config', 'firebase.ts');
let content = fs.readFileSync(firebasePath, 'utf8');

// 2. Replace phần config
const oldConfigPattern = /const firebaseConfig: FirebaseConfigType = \{[\s\S]*?\};/;

const newConfig = `const firebaseConfig: FirebaseConfigType = {
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  projectId: "${firebaseConfig.projectId}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
  appId: "${firebaseConfig.appId}",
};`;

if (oldConfigPattern.test(content)) {
  content = content.replace(oldConfigPattern, newConfig);
  fs.writeFileSync(firebasePath, content, 'utf8');
  console.log('✅ Đã hardcode Firebase config vào app/config/firebase.ts');
} else {
  console.log('⚠️  Không tìm thấy pattern config, cần sửa manual');
}

console.log('\n📋 Firebase Config:');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

console.log('\n✅ Hoàn thành!');
console.log('\n📝 Next steps:');
console.log('  1. Commit changes:');
console.log('     git add app/config/firebase.ts');
console.log('     git commit -m "fix: hardcode Firebase config for APK"');
console.log('');
console.log('  2. Build lại APK:');
console.log('     npx eas-cli build --platform android --profile preview --clear-cache');
console.log('');
console.log('  3. Test đăng ký tài khoản trong APK mới');
console.log('');
