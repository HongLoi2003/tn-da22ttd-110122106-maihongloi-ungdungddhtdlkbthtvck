const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

console.log(`Total medicines: ${medicines.length}`);

// Check for missing images
const missingImages = medicines.filter(m => !m.imageUrl || m.imageUrl === '');
console.log(`\nMedicines without images: ${missingImages.length}`);
if (missingImages.length > 0) {
  console.log('Missing images for:');
  missingImages.slice(0, 10).forEach(m => {
    console.log(`  - ID ${m.id}: ${m.name}`);
  });
  if (missingImages.length > 10) {
    console.log(`  ... and ${missingImages.length - 10} more`);
  }
}

// Check for duplicate images
const imageMap = {};
medicines.forEach(m => {
  if (m.imageUrl) {
    if (!imageMap[m.imageUrl]) {
      imageMap[m.imageUrl] = [];
    }
    imageMap[m.imageUrl].push({ id: m.id, name: m.name });
  }
});

const duplicateImages = Object.entries(imageMap).filter(([url, meds]) => meds.length > 1);
console.log(`\nDuplicate images: ${duplicateImages.length} URLs used by multiple medicines`);

if (duplicateImages.length > 0) {
  console.log('\nTop 10 duplicate image URLs:');
  duplicateImages.slice(0, 10).forEach(([url, meds]) => {
    console.log(`\n${url}`);
    console.log(`  Used by ${meds.length} medicines:`);
    meds.slice(0, 5).forEach(m => {
      console.log(`    - ID ${m.id}: ${m.name}`);
    });
    if (meds.length > 5) {
      console.log(`    ... and ${meds.length - 5} more`);
    }
  });
}

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Total medicines: ${medicines.length}`);
console.log(`Missing images: ${missingImages.length}`);
console.log(`Duplicate image URLs: ${duplicateImages.length}`);
console.log(`Total medicines affected by duplicates: ${duplicateImages.reduce((sum, [_, meds]) => sum + meds.length, 0)}`);
