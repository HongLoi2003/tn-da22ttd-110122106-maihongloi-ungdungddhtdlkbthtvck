const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

/**
 * Generate unique placeholder images for each medicine using DiceBear API
 * This creates consistent, unique avatars for each medicine
 */

// Different medicine icon styles
const iconStyles = ['shapes', 'identicon', 'bottts', 'avataaars', 'notionists'];

// Color schemes for different categories
const categoryColors = {
  'Giảm đau': ['4CAF50', '2196F3', 'FF9800'],
  'Kháng sinh': ['E91E63', '9C27B0', '673AB7'],
  'Tim mạch': ['F44336', 'FF5722', 'FF9800'],
  'Thần kinh': ['3F51B5', '2196F3', '00BCD4'],
  'Hô hấp': ['00BCD4', '009688', '4CAF50'],
  'Tiêu hóa': ['8BC34A', 'CDDC39', 'FFEB3B'],
  'Da liễu': ['FFC107', 'FF9800', 'FF5722'],
  'Mắt': ['03A9F4', '2196F3', '3F51B5'],
  'default': ['607D8B', '9E9E9E', 'BDBDBD']
};

function getColorForCategory(category) {
  for (const [key, colors] of Object.entries(categoryColors)) {
    if (category && category.includes(key)) {
      return colors[Math.floor(Math.random() * colors.length)];
    }
  }
  return categoryColors.default[0];
}

function getStyleForCategory(category) {
  if (category && category.includes('Kháng sinh')) return 'shapes';
  if (category && category.includes('Tim mạch')) return 'identicon';
  if (category && category.includes('Thần kinh')) return 'bottts';
  if (category && category.includes('Trẻ em')) return 'avataaars';
  return 'shapes';
}

/**
 * Alternative: Use UI Avatars for text-based medicine images
 */
function generateTextBasedImage(medicine) {
  // Extract first letters of medicine name
  const name = medicine.name;
  const words = name.split(' ');
  const initials = words.slice(0, 2).map(w => w[0]).join('');
  
  const color = getColorForCategory(medicine.category).replace('#', '');
  const bgColor = 'FFFFFF';
  
  // UI Avatars API
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=400&background=${color}&color=${bgColor}&bold=true&format=png`;
}

/**
 * Alternative: Use DiceBear for consistent medicine icons
 */
function generateDiceBearImage(medicine, index) {
  const style = getStyleForCategory(medicine.category);
  const seed = medicine.name.toLowerCase().replace(/\s+/g, '-');
  
  return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=400`;
}

/**
 * Best option: Use real pharmaceutical stock photos from Unsplash
 * with fallback to generated images
 */
const realMedicineImages = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', // Pills in hand
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&q=80', // Medicine bottles
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80', // White pills
  'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400&q=80', // Colorful pills
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80', // Pills lineup
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80', // Medicine pack
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400&q=80', // Capsules
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80', // Pills bottle
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80', // Medicine shelf
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80', // Pharmacy
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400&q=80', // Red capsules
  'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&q=80', // Blue pills
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde89?w=400&q=80', // Green pills
  'https://images.unsplash.com/photo-1603560988818-eb3620a0d367?w=400&q=80', // Yellow pills
  'https://images.unsplash.com/photo-1511654645-52681c7d7f2a?w=400&q=80', // Orange pills
];

// Main function
function updateMedicineImages() {
  console.log('🔄 Updating medicine images with better visuals...\n');
  
  const imageMode = process.argv[2] || 'real'; // Options: real, text, icon, mixed
  
  medicines.forEach((medicine, index) => {
    let imageUrl;
    
    switch(imageMode) {
      case 'text':
        imageUrl = generateTextBasedImage(medicine);
        break;
      case 'icon':
        imageUrl = generateDiceBearImage(medicine, index);
        break;
      case 'mixed':
        // Use real images for first 15, then generated for others
        imageUrl = index < 15 
          ? realMedicineImages[index % realMedicineImages.length]
          : generateTextBasedImage(medicine);
        break;
      case 'real':
      default:
        imageUrl = realMedicineImages[index % realMedicineImages.length];
        break;
    }
    
    medicine.imageUrl = imageUrl;
    console.log(`[${index + 1}/${medicines.length}] ${medicine.name} -> ✓ Updated (${imageMode})`);
  });
  
  // Save
  data.medicines = medicines;
  fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Complete! Mode: ${imageMode}`);
  console.log(`📊 Total medicines: ${medicines.length}`);
  console.log(`🖼️  Unique images: ${new Set(medicines.map(m => m.imageUrl)).length}`);
  
  console.log('\n💡 Tip: Run with different modes:');
  console.log('   node use-medicine-placeholder-service.js real   (default - real photos)');
  console.log('   node use-medicine-placeholder-service.js text   (text-based avatars)');
  console.log('   node use-medicine-placeholder-service.js icon   (icon-based)');
  console.log('   node use-medicine-placeholder-service.js mixed  (combination)');
}

// Run
updateMedicineImages();
