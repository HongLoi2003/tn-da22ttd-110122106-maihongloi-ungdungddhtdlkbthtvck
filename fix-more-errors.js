const fs = require('fs');

// Fix các file còn lại
const filesToFix = [
  'app/compare-working-vs-broken-doctors.tsx',
  'app/create-doctor-account.tsx',
  'app/debug-specific-doctors.tsx',
  'app/doctor-chat.tsx',
  'app/doctor/chat-detail.tsx',
  'app/doctor/edit-profile.tsx',
  'app/doctor/patient-detail.tsx',
  'app/doctor/patients.tsx',
  'app/doctor/reviews.tsx',
  'app/fix-doctor-auth-uid.tsx',
  'app/fix-doctor-encoding.tsx',
  'app/hospital-detail.tsx',
  'app/notification-detail.tsx',
  'app/rebuild-conversations-from-messages.tsx',
  'app/services/doctorService.ts',
  'app/setup-all-doctors.tsx',
  'app/components/MobileFrameAndroid.tsx',
  'app/all-claims.tsx',
  'app/all-prescriptions.tsx',
  'app/all-test-results.tsx',
  'app/all-transactions.tsx',
];

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix import db
  if (content.includes('from \'./config/firebase\'') || content.includes('from "./config/firebase"') || content.includes('from \'../config/firebase\'') || content.includes('from "../config/firebase"')) {
    content = content.replace(
      /import\s*{\s*([^}]*?)db([^}]*?)\}\s*from\s*['"]\.\.?\/config\/firebase['"];?/g,
      (match, before, after) => {
        modified = true;
        const beforeClean = before.trim().replace(/,\s*$/, '');
        const afterClean = after.trim().replace(/^\s*,/, '');
        const beforePart = beforeClean ? beforeClean + ', ' : '';
        const afterPart = afterClean ? ', ' + afterClean : '';
        const path = match.includes('../config') ? '../config/firebase' : './config/firebase';
        return `import { ${beforePart}getDb${afterPart} } from '${path}';`;
      }
    );
  }

  // Fix usage
  content = content.replace(/collection\(db,\s*/g, () => { modified = true; return 'collection(getDb(), '; });
  content = content.replace(/doc\(db,\s*/g, () => { modified = true; return 'doc(getDb(), '; });
  content = content.replace(/writeBatch\(db\)/g, () => { modified = true; return 'writeBatch(getDb())'; });
  content = content.replace(/deleteDoc\(doc\(db,/g, () => { modified = true; return 'deleteDoc(doc(getDb(),'; });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⏭️  No db changes in ${filePath}`);
  }
});

console.log('\n✅ Done!');
