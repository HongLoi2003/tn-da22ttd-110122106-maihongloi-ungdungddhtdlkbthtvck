const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL image require paths...\n');

// Danh sách files cần sửa và số cấp cần lên để đến root
const filesToFix = [
  { file: 'app/(tabs)/profile.tsx', levels: 2 }, // app/(tabs)/ -> ../../
  { file: 'app/hospital-detail.tsx', levels: 1 }, // app/ -> ../
  { file: 'app/write-review.tsx', levels: 1 },
  { file: 'app/test-doctor-avatar.tsx', levels: 1 },
  { file: 'app/specialties.tsx', levels: 1 },
  { file: 'app/reviews.tsx', levels: 1 },
];

filesToFix.forEach(({ file, levels }) => {
  if (!fs.existsSync(file)) {
    console.log(`⏭️  Skip ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  
  // Tạo đường dẫn tương đối dựa trên số cấp
  const relativePath = '../'.repeat(levels);
  
  // Replace require('@/assets/images/...') với đường dẫn tương đối
  const before = content;
  content = content.replace(
    /require\('@\/assets\/images\//g,
    `require('${relativePath}assets/images/`
  );
  
  if (content !== before) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${file} (${relativePath}assets/images/)`);
  } else {
    console.log(`⏭️  No changes needed in ${file}`);
  }
});

console.log('\n✅ All image require paths fixed!');
console.log('\n💡 Tip: React Native does NOT support @ alias in require()');
console.log('   Always use relative paths with require()');
