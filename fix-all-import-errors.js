const fs = require('fs');
const path = require('path');

console.log('=== FIXING ALL IMPORT ERRORS ===\n');

// Files that need fixing
const filesToFix = [
  'app/(tabs)/explore.tsx',
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - not found`);
    return;
  }
  
  console.log(`📝 Fixing ${file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove problematic imports
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]@\/components\/ui\/collapsible['"];?\s*/g, '');
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]@\/components\/external-link['"];?\s*/g, '');
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]@\/components\/parallax-scroll-view['"];?\s*/g, '');
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]@\/components\/themed-text['"];?\s*/g, '');
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]@\/components\/themed-view['"];?\s*/g, '');
  content = content.replace(/import\s+{[^}]*}\s+from\s+['"]@\/components\/hello-wave['"];?\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed ${file}`);
});

console.log('\n✅ All imports fixed!');
console.log('Restart Expo: Press "r" in terminal or Ctrl+C and run "npx expo start" again');
