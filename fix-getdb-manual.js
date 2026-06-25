const fs = require('fs');

console.log('🔧 Fixing getDb -> getFirestoreDb manually...\n');

const filesToFix = [
  'app/scripts/seedCorrectData.ts',
  'app/scripts/validateAndFixFirebaseData.ts',
  'seed-doctors-correct.tsx',
  'fix-firebase-encoding.tsx',
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
  'app/fix-doctor-encoding.tsx',
  'app/rebuild-conversations-from-messages.tsx',
  'fix-all-typescript-errors.js',
  'fix-remaining-errors.js',
  'fix-more-errors.js',
  'fix-final-errors.js',
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`⏭️  Skip ${file} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('getDb')) {
    // Replace all occurrences
    content = content.replace(/\bgetDb\b/g, 'getFirestoreDb');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`⏭️  Skip ${file} (no getDb found)`);
  }
});

console.log('\n✅ Done!');
