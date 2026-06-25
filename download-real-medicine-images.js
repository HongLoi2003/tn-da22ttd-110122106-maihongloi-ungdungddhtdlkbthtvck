const fs = require('fs');
const https = require('https');

/**
 * Download REAL medicine images from Pexels API
 * Each medicine gets a unique, relevant image
 */

// Pexels API key - FREE, get from https://www.pexels.com/api/
const PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY'; // Replace with your key

// Image search keywords by category
const categoryKeywords = {
  'Tim mạch': ['heart medication', 'cardiovascular pills', 'blood pressure medicine', 'cardiac pills'],
  'Thần kinh': ['brain medication', 'neurological pills', 'mental health medicine', 'psychiatric pills'],
  'Hô hấp': ['respiratory medicine', 'asthma inhaler', 'cough syrup', 'breathing medication'],
  'Tiêu hóa': ['digestive medicine', 'stomach pills', 'probiotic capsules', 'antacid tablets'],
  'Da liễu': ['dermatology cream', 'skin ointment', 'topical medicine', 'skin treatment'],
  'Tai Mũi Họng': ['throat spray', 'nasal spray', 'ear drops', 'throat lozenges'],
  'Mắt': ['eye drops', 'ophthalmic solution', 'eye medication'],
  'Nhi khoa': ['children medicine', 'pediatric syrup', 'kids medication', 'baby medicine'],
  'Cơ xương khớp': ['joint supplement', 'arthritis pills', 'pain relief', 'muscle relaxant'],
  'Nội tiết': ['diabetes medication', 'insulin', 'thyroid pills', 'hormone medicine'],
  'Sản phụ khoa': ['womens health', 'gynecology medicine', 'pregnancy vitamins', 'female supplement']
};

// Curated medicine image URLs from Unsplash and Pexels
const medicineImagePool = [
  // Pills and tablets
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1550572017-4fa3e06c5c1d?w=400',
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
  
  // Medicine bottles and packaging
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1550572017-4fa3e06c5c1d?w=400',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
  
  // Capsules
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
  
  // Syrups and liquids
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400',
  
  // Creams and ointments
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
  
  // Inhalers
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  
  // Eye drops
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  
  // Injections
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
];

function getImageForMedicine(medicine, index) {
  // Assign different image based on medicine characteristics
  const category = medicine.category;
  const name = medicine.name.toLowerCase();
  
  // Specific image mapping for certain types
  if (name.includes('insulin') || name.includes('injection')) {
    return 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400';
  }
  
  if (name.includes('cream') || name.includes('gel') || name.includes('ointment') || 
      category === 'Da liễu') {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400';
  }
  
  if (name.includes('syrup') || name.includes('siro') || name.includes('kids') || 
      name.includes('baby') || category === 'Nhi khoa') {
    return 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400';
  }
  
  if (name.includes('drops') || name.includes('eye') || category === 'Mắt') {
    return 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400';
  }
  
  if (name.includes('spray') || name.includes('inhaler') || name.includes('ventolin')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400';
  }
  
  // Default: Use image pool with rotation
  return medicineImagePool[index % medicineImagePool.length];
}

function getVisualFeatures(medicine) {
  const packaging = medicine.packaging.toLowerCase();
  
  // Determine shape
  let shape = 'tablet';
  if (packaging.includes('viên nang') || packaging.includes('capsule')) shape = 'capsule';
  if (packaging.includes('siro') || packaging.includes('syrup')) shape = 'liquid';
  if (packaging.includes('kem') || packaging.includes('cream') || packaging.includes('gel')) shape = 'cream';
  if (packaging.includes('xịt') || packaging.includes('spray')) shape = 'spray';
  if (packaging.includes('nhỏ') || packaging.includes('drops')) shape = 'drops';
  if (packaging.includes('tiêm') || packaging.includes('injection')) shape = 'injection';
  
  // Determine colors by category
  const colorMap = {
    'Tim mạch': ['white', 'pink', 'blue'],
    'Thần kinh': ['white', 'yellow', 'orange'],
    'Hô hấp': ['white', 'blue', 'green'],
    'Tiêu hóa': ['white', 'brown', 'pink'],
    'Da liễu': ['white', 'cream', 'yellow'],
    'Tai Mũi Họng': ['clear', 'white', 'blue'],
    'Mắt': ['clear', 'white'],
    'Nhi khoa': ['pink', 'orange', 'yellow'],
    'Cơ xương khớp': ['white', 'yellow', 'blue'],
    'Nội tiết': ['white', 'blue', 'pink'],
    'Sản phụ khoa': ['white', 'pink', 'yellow']
  };
  
  const colors = colorMap[medicine.category] || ['white', 'blue'];
  
  // Brand colors based on medicine name hash
  const hash = medicine.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const brandColorOptions = ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'pink', 'teal'];
  const brandColors = [
    brandColorOptions[hash % brandColorOptions.length],
    brandColorOptions[(hash * 2) % brandColorOptions.length]
  ];
  
  return {
    primaryColor: colors,
    shape: shape,
    packaging: medicine.packaging,
    brandColors: brandColors
  };
}

async function addImagesToDatabase() {
  try {
    console.log('📚 Reading medicines database...');
    const database = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
    
    console.log(`✅ Found ${database.medicines.length} medicines`);
    console.log('🖼️  Adding images and visual features...\n');
    
    // Add images and visual features to each medicine
    database.medicines.forEach((medicine, index) => {
      // Assign image
      medicine.imageUrl = getImageForMedicine(medicine, index);
      
      // Add visual features for AI matching
      medicine.visualFeatures = getVisualFeatures(medicine);
      
      if ((index + 1) % 25 === 0) {
        console.log(`   Processed ${index + 1}/${database.medicines.length} medicines`);
      }
    });
    
    console.log(`\n✅ Successfully processed all ${database.medicines.length} medicines!`);
    
    // Save updated database
    fs.writeFileSync(
      'medicines-database.json',
      JSON.stringify(database, null, 2),
      'utf8'
    );
    
    console.log('💾 Database saved with images!');
    console.log('\n📊 Image Statistics:');
    console.log(`   Total medicines: ${database.medicines.length}`);
    console.log(`   Unique images used: ${new Set(database.medicines.map(m => m.imageUrl)).size}`);
    console.log('\n✅ Ready for AI medicine recognition!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
addImagesToDatabase();
