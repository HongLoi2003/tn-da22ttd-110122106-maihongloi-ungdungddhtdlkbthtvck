const https = require('https');
const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

// Test if URL returns valid image
function testImageUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode === 200) {
        resolve({ valid: true, status: res.statusCode });
      } else {
        resolve({ valid: false, status: res.statusCode });
      }
      res.resume(); // Consume response data to free up memory
    }).on('error', (err) => {
      resolve({ valid: false, error: err.message });
    }).on('timeout', () => {
      resolve({ valid: false, error: 'timeout' });
    });
  });
}

async function testAllImages() {
  console.log('Testing image URLs...\n');
  
  const brokenImages = [];
  
  for (let i = 0; i < Math.min(20, medicines.length); i++) {
    const medicine = medicines[i];
    const result = await testImageUrl(medicine.imageUrl);
    
    if (result.valid) {
      console.log(`✓ [${i + 1}] ${medicine.name}`);
    } else {
      console.log(`✗ [${i + 1}] ${medicine.name} - ${result.error || 'Status: ' + result.status}`);
      brokenImages.push({ id: medicine.id, name: medicine.name, url: medicine.imageUrl, error: result });
    }
  }
  
  console.log(`\n=== SUMMARY (First 20) ===`);
  console.log(`Tested: 20 medicines`);
  console.log(`Broken images: ${brokenImages.length}`);
  
  if (brokenImages.length > 0) {
    console.log('\nBroken image URLs:');
    brokenImages.forEach(item => {
      console.log(`  - ${item.name}: ${item.url}`);
    });
  }
}

testAllImages().catch(console.error);
