const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

// Generic medicine/pharmaceutical icons and images that represent medicines
// These are icon/illustration style images that work well for any medicine
const medicineIcons = [
  'https://cdn-icons-png.flaticon.com/512/2913/2913133.png', // Pills bottle
  'https://cdn-icons-png.flaticon.com/512/3209/3209265.png', // Medicine capsule
  'https://cdn-icons-png.flaticon.com/512/1176/1176407.png', // Pill
  'https://cdn-icons-png.flaticon.com/512/2913/2913143.png', // Tablets
  'https://cdn-icons-png.flaticon.com/512/3209/3209310.png', // Medicine bottle
  'https://cdn-icons-png.flaticon.com/512/2913/2913156.png', // Capsules
  'https://cdn-icons-png.flaticon.com/512/3774/3774299.png', // Syrup bottle
  'https://cdn-icons-png.flaticon.com/512/2913/2913173.png', // Medication
  'https://cdn-icons-png.flaticon.com/512/3209/3209334.png', // Pills pack
  'https://cdn-icons-png.flaticon.com/512/2913/2913189.png', // Pill bottle
];

console.log('Assigning medicine icon based on category...\n');

for (let i = 0; i < medicines.length; i++) {
  const medicine = medicines[i];
  
  // Assign icon based on packaging type or cycle through icons
  let iconIndex;
  
  if (medicine.packaging && medicine.packaging.includes('Viên')) {
    iconIndex = 0; // Pills bottle
  } else if (medicine.packaging && medicine.packaging.includes('Chai')) {
    iconIndex = 4; // Medicine bottle
  } else if (medicine.packaging && medicine.packaging.includes('Ống')) {
    iconIndex = 6; // Syrup bottle
  } else if (medicine.packaging && medicine.packaging.includes('Vỉ')) {
    iconIndex = 8; // Pills pack
  } else {
    // Cycle through based on ID for variety
    iconIndex = medicine.id % medicineIcons.length;
  }
  
  medicine.imageUrl = medicineIcons[iconIndex];
  console.log(`[${i + 1}/${medicines.length}] ${medicine.name} -> ${medicine.packaging || 'Generic'}`);
}

// Save
data.medicines = medicines;
fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));

console.log(`\n✓ Complete! All ${medicines.length} medicines have appropriate icons`);
console.log('Icons represent medicine packaging types.');
