const fs = require('fs');

console.log('🔧 FINAL FIX - Replacing getDb with getFirestoreDb everywhere...\n');

// Find all files with getDb import
const { execSync } = require('child_process');
try {
  const grepResult = execSync('grep -rl "getDb" app/ fix-firebase-encoding.tsx seed-doctors-correct.tsx 2>/dev/null || echo ""', { encoding: 'utf8' });
  const files = grepResult.split('\n').filter(f => f.trim() && f.endsWith('.ts') || f.endsWith('.tsx'));
  
  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Replace getDb with getFirestoreDb
    if (content.includes('getDb')) {
      content = content.replace(/\bgetDb\b/g, 'getFirestoreDb');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
    }
  });
} catch (e) {
  console.log('grep not available, using manual list...');
}

// Manual list as fallback
const manualFiles = [
  'app/scripts/seedCorrectData.ts',
  'app/scripts/validateAndFixFirebaseData.ts',
  'app/services/firebaseService.ts',
  'app/services/dataService.ts',
  'app/quick-deploy-rules.tsx',
  'app/rebuild-all-conversations.tsx',
  'app/remove-duplicate-specialties.tsx',
  'app/check-bs004-conversations.tsx',
  'app/check-firestore-rules.tsx',
  'app/clear-all-appointments.tsx',
  'app/compare-bs004-vs-broken-doctors.tsx',
  'app/force-update-all-conversations.tsx',
  'fix-firebase-encoding.tsx',
  'seed-doctors-correct.tsx',
];

manualFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('getDb')) {
    content = content.replace(/\bgetDb\b/g, 'getFirestoreDb');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  }
});

// Fix firebaseService.ts - also need to import db
const firebaseServiceFile = 'app/services/firebaseService.ts';
if (fs.existsSync(firebaseServiceFile)) {
  let content = fs.readFileSync(firebaseServiceFile, 'utf8');
  
  // Add db import if checking for !db
  if (content.includes('!db') && !content.match(/import.*\bdb\b.*from.*firebase/)) {
    content = content.replace(
      /import { getFirestoreDb,} from '@\/app\/config\/firebase';/,
      `import { db, getFirestoreDb } from '@/app/config/firebase';`
    );
    
    fs.writeFileSync(firebaseServiceFile, content, 'utf8');
    console.log(`✅ Added db import to ${firebaseServiceFile}`);
  }
}

// Fix rebuild-conversations-from-messages - add missing imports
const rebuildFile = 'app/rebuild-conversations-from-messages.tsx';
if (fs.existsSync(rebuildFile)) {
  let content = fs.readFileSync(rebuildFile, 'utf8');
  
  if (content.includes('setDoc') && !content.match(/import.*setDoc.*from.*firestore/)) {
    content = content.replace(
      /from 'firebase\/firestore';/,
      (match) => {
        const importLine = content.match(/import {([^}]+)} from 'firebase\/firestore';/);
        if (importLine && !importLine[1].includes('setDoc')) {
          return match.replace('}', ', setDoc, doc }');
        }
        return match;
      }
    );
  }
  
  if (content.includes('getFirestoreDb') && !content.match(/import.*getFirestoreDb/)) {
    content = `import { getFirestoreDb } from './config/firebase';\n` + content;
  }
  
  fs.writeFileSync(rebuildFile, content, 'utf8');
  console.log(`✅ Fixed imports in ${rebuildFile}`);
}

// Fix notifications.tsx - add Animated import
const notifFile = 'app/notifications.tsx';
if (fs.existsSync(notifFile)) {
  let content = fs.readFileSync(notifFile, 'utf8');
  
  if (content.includes('Animated.') && content.includes('react-native-reanimated')) {
    content = content.replace(
      /import Animated.*from 'react-native-reanimated';/,
      `import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';`
    );
    
    fs.writeFileSync(notifFile, content, 'utf8');
    console.log(`✅ Fixed Animated import in ${notifFile}`);
  }
}

// Fix symptomAnalysisTest - comment out undefined variables
const symptomTestFile = 'app/utils/symptomAnalysisTest.ts';
if (fs.existsSync(symptomTestFile)) {
  let content = fs.readFileSync(symptomTestFile, 'utf8');
  
  content = content.replace(/console\.log\('Kết quả:', (test6|test7|doctors)\);/g, 
    '// console.log(\'Kết quả:\', $1); // Commented out - variable not defined'
  );
  
  fs.writeFileSync(symptomTestFile, content, 'utf8');
  console.log(`✅ Fixed ${symptomTestFile}`);
}

// Fix fix-doctor-encoding.tsx - remove stray 'utf8' at beginning
const fixEncodingFile = 'app/fix-doctor-encoding.tsx';
if (fs.existsSync(fixEncodingFile)) {
  let content = fs.readFileSync(fixEncodingFile, 'utf8');
  
  if (content.startsWith('utf8')) {
    content = content.replace(/^utf8\s*\n/, '');
    fs.writeFileSync(fixEncodingFile, content, 'utf8');
    console.log(`✅ Removed stray 'utf8' from ${fixEncodingFile}`);
  }
}

console.log('\n✅ All fixes applied! Run "npx tsc --noEmit" to verify.');
