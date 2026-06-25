const fs = require('fs');
const path = require('path');

// Danh sách các file cần sửa lỗi db undefined
const filesToFix = [
  'app/services/firebaseService.ts',
  'app/services/dataService.ts',
  'app/scripts/seedCorrectData.ts',
  'app/scripts/validateAndFixFirebaseData.ts',
  'app/rebuild-all-conversations.tsx',
  'app/remove-duplicate-specialties.tsx',
  'app/quick-deploy-rules.tsx',
  'fix-firebase-encoding.tsx',
  'seed-doctors-correct.tsx',
];

// Thay thế import db thành getDb
filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Thay thế import statement
  if (content.includes('import { db }') || content.includes('import {db}')) {
    content = content.replace(
      /import \{([^}]*?)db([^}]*?)\} from ['"]\.\/config\/firebase['"];?/g,
      (match, before, after) => {
        modified = true;
        return `import {${before.trim() ? before.trim() + ',' : ''} getDb${after ? ',' + after.trim() : ''}} from './config/firebase';`;
      }
    );
    content = content.replace(
      /import \{([^}]*?)db([^}]*?)\} from ['"]@\/app\/config\/firebase['"];?/g,
      (match, before, after) => {
        modified = true;
        return `import {${before.trim() ? before.trim() + ',' : ''} getDb${after ? ',' + after.trim() : ''}} from '@/app/config/firebase';`;
      }
    );
  }

  // Thay thế usage của db thành getDb()
  // Pattern 1: collection(db, '...')
  content = content.replace(/collection\(db,\s*/g, () => {
    modified = true;
    return 'collection(getDb(), ';
  });

  // Pattern 2: doc(db, '...')
  content = content.replace(/doc\(db,\s*/g, () => {
    modified = true;
    return 'doc(getDb(), ';
  });

  // Pattern 3: writeBatch(db)
  content = content.replace(/writeBatch\(db\)/g, () => {
    modified = true;
    return 'writeBatch(getDb())';
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
  }
});

console.log('\n✅ Done fixing Firebase db errors!');
