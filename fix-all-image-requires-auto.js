const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== AUTO FIX ALL IMAGE REQUIRE ERRORS ===\n');

// Find all files with require('@/assets/images/...)
try {
  const output = execSync('grep -r "require.*@/assets/images" app --include="*.tsx" --include="*.ts"', { 
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore']
  });
  
  const lines = output.split('\n').filter(l => l.trim());
  const filesWithImages = new Set();
  
  lines.forEach(line => {
    const match = line.match(/^([^:]+):/);
    if (match) {
      filesWithImages.add(match[1]);
    }
  });
  
  console.log(`Found ${filesWithImages.size} files with image requires\n`);
  
  filesWithImages.forEach(file => {
    console.log(`📝 Fixing ${file}...`);
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace all require('@/assets/images/...')  with placeholder URL
    content = content.replace(
      /require\(['"]@\/assets\/images\/[^'"]+['"]\)/g,
      '{ uri: "https://via.placeholder.com/150" }'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  });
  
  console.log(`\n✅ All ${filesWithImages.size} files fixed!`);
  console.log('Reload Expo: Press "r" in terminal');
  
} catch (error) {
  // Fallback: Fix specific known files
  console.log('Using fallback method...\n');
  
  const filesToFix = [
    'app/all-products.tsx',
    'app/register.tsx',
    'app/login.tsx',
    'app/profile.tsx',
    'app/pharmacy.tsx',
    'app/forgot-password.tsx',
    'app/hospital-map.tsx',
    'app/find-hospital.tsx',
  ];
  
  filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} - not found`);
      return;
    }
    
    console.log(`📝 Fixing ${file}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all require('@/assets/images/...')
    content = content.replace(
      /require\(['"]@\/assets\/images\/[^'"]+['"]\)/g,
      '{ uri: "https://via.placeholder.com/150" }'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  });
  
  console.log('\n✅ Files fixed!');
  console.log('Reload Expo: Press "r" in terminal');
}
