const fs = require('fs');

console.log('🔧 Fixing image require paths...\n');

// File cần sửa
const file = 'app/(tabs)/index.tsx';

if (!fs.existsSync(file)) {
  console.log('❌ File not found:', file);
  process.exit(1);
}

let content = fs.readFileSync(file, 'utf8');

// Replace all require('@/assets/images/...') with require('../../assets/images/...')
// Từ app/(tabs)/index.tsx lên 2 cấp để đến root, rồi vào assets/images
content = content.replace(
  /require\('@\/assets\/images\//g,
  "require('../../assets/images/"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Fixed image require paths in', file);
console.log('\n📝 All require(@/assets/images/...) changed to require(../../assets/images/...)');
