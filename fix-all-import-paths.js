const fs = require('fs');
const path = require('path');

// Files with wrong import paths and their fixes
const fixes = [
  {
    file: 'app/scripts/seedFirebase.ts',
    replacements: [
      { from: "from '@/services/firebaseService'", to: "from '../services/firebaseService'" },
      { from: "from '@/appointments.json'", to: "from '../../appointments.json'" },
      { from: "from '@/comments.json'", to: "from '../../comments.json'" },
      { from: "from '@/conversations.json'", to: "from '../../conversations.json'" },
      { from: "from '@/doctors.json'", to: "from '../../doctors.json'" },
      { from: "from '@/hospitals.json'", to: "from '../../hospitals.json'" },
      { from: "from '@/medical-records.json'", to: "from '../../medical-records.json'" },
      { from: "from '@/messages.json'", to: "from '../../messages.json'" },
      { from: "from '@/notifications.json'", to: "from '../../notifications.json'" },
      { from: "from '@/prescriptions.json'", to: "from '../../prescriptions.json'" },
      { from: "from '@/users.json'", to: "from '../../users.json'" }
    ]
  },
  {
    file: 'app/scripts/seedCorrectData.ts',
    replacements: [
      { from: "from '@/config/firebase'", to: "from '../config/firebase'" }
    ]
  }
];

console.log('🔧 Fixing import paths...\n');

let totalFixed = 0;

fixes.forEach(({ file, replacements }) => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanged = false;

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      console.log(`✅ Fixed: ${from} → ${to} in ${file}`);
      fileChanged = true;
      totalFixed++;
    }
  });

  if (fileChanged) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log(`\n✅ Total fixes applied: ${totalFixed}`);
console.log('🎉 All import paths fixed!');
