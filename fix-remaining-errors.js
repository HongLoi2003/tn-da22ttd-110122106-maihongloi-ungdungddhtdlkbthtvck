const fs = require('fs');

// 1. Fix ActivityIndicator imports
const filesNeedActivityIndicator = [
  'app/all-claims.tsx',
  'app/all-prescriptions.tsx',
  'app/all-test-results.tsx',
  'app/all-transactions.tsx',
];

filesNeedActivityIndicator.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if ActivityIndicator is already imported
  if (!content.includes('ActivityIndicator')) {
    // Find the react-native import line and add ActivityIndicator
    content = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]react-native['"]/,
      (match, imports) => {
        if (!imports.includes('ActivityIndicator')) {
          return `import { ${imports.trim()}, ActivityIndicator } from 'react-native'`;
        }
        return match;
      }
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ActivityIndicator in ${filePath}`);
  }
});

// 2. Fix placeholder style in recommended-doctors.tsx
const recDocsFile = 'app/recommended-doctors.tsx';
if (fs.existsSync(recDocsFile)) {
  let content = fs.readFileSync(recDocsFile, 'utf8');
  
  // Add placeholder style before the closing });
  if (!content.includes('placeholder:')) {
    content = content.replace(
      /seedButtonText:\s*{\s*color:\s*['"]#fff['"],\s*fontSize:\s*14,\s*fontWeight:\s*['"]600['"],\s*},\s*}\);/,
      `seedButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
});`
    );
    
    fs.writeFileSync(recDocsFile, content, 'utf8');
    console.log(`✅ Added placeholder style to ${recDocsFile}`);
  }
}

// 3. Fix more db issues in remaining files
const moreFilesToFix = [
  'app/check-bs004-conversations.tsx',
  'app/check-firestore-rules.tsx',
  'app/clear-all-appointments.tsx',
  'app/compare-bs004-vs-broken-doctors.tsx',
  'app/check-all-doctors-chat-status.tsx',
  'app/compare-working-vs-broken-doctors.tsx',
  'app/force-update-all-conversations.tsx',
];

moreFilesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Thay thế import
  if (content.includes('from \'./config/firebase\'') || content.includes('from "./config/firebase"')) {
    content = content.replace(
      /import\s*{\s*([^}]*?)db([^}]*?)\}\s*from\s*['"]\.\/config\/firebase['"];?/g,
      (match, before, after) => {
        modified = true;
        const beforeClean = before.trim();
        const afterClean = after.trim();
        return `import { ${beforeClean ? beforeClean + ', ' : ''}getDb${afterClean ? ', ' + afterClean : ''} } from './config/firebase';`;
      }
    );
  }

  // Thay thế usage
  content = content.replace(/collection\(db,\s*/g, () => { modified = true; return 'collection(getDb(), '; });
  content = content.replace(/doc\(db,\s*/g, () => { modified = true; return 'doc(getDb(), '; });
  content = content.replace(/writeBatch\(db\)/g, () => { modified = true; return 'writeBatch(getDb())'; });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  }
});

console.log('\n✅ Done fixing remaining errors!');
