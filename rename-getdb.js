const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔄 Renaming getDb() to getFirestoreDb()...\n');

// Get all TypeScript and TSX files that might use getDb
const result = execSync('git ls-files "*.ts" "*.tsx"', { encoding: 'utf8' });
const files = result.split('\n').filter(f => f.trim() && !f.includes('node_modules'));

let totalFixed = 0;

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Replace import statement
  if (content.includes('getDb')) {
    content = content.replace(/\bgetDb\b/g, () => {
      modified = true;
      return 'getFirestoreDb';
    });
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
    totalFixed++;
  }
});

console.log(`\n✅ Renamed getDb to getFirestoreDb in ${totalFixed} files`);
