const https = require('https');
const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

// Test specific medicines that were broken before
const testIndices = [3, 12, 13, 14, 15, 16, 17, 18, 19]; // Indices of previously broken images

// Test if URL returns valid image
function testImageUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode === 200) {
        resolve({ valid: true, status: res.statusCode });
      } else {
        resolve({ valid: false, status: res.statusCode });
      }
      res.resume();
    }).on('error', (err) => {
      resolve({ valid: false, error: err.message });
    }).on('timeout', () => {
      resolve({ valid: false, error: 'timeout' });
    });
  });
}

async function testFixedImages() {
  console.log('Testing previously broken image URLs...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const index of testIndices) {
    const medicine = medicines[index];
    const result = await testImageUrl(medicine.imageUrl);
    
    if (result.valid) {
      console.log(`✓ [${index + 1}] ${medicine.name}`);
      successCount++;
    } else {
      console.log(`✗ [${index + 1}] ${medicine.name} - ${result.error || 'Status: ' + result.status}`);
      failCount++;
    }
  }
  
  console.log(`\n=== RESULTS ===`);
  console.log(`✓ Working: ${successCount}/${testIndices.length}`);
  console.log(`✗ Broken: ${failCount}/${testIndices.length}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All previously broken images are now working!');
  }
}

testFixedImages().catch(console.error);
