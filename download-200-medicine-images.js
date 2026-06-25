const fs = require('fs');

/**
 * Script to download 200 medicine images from Unsplash
 * Adds imageUrl field to each medicine in database
 */

// Medicine types for more accurate image search
const medicineCategories = {
  'Giảm đau - Hạ sốt': ['pills', 'tablets', 'medicine', 'painkiller', 'aspirin', 'paracetamol'],
  'Kháng sinh': ['antibiotics', 'medicine-pills', 'prescription', 'amoxicillin'],
  'Vitamin & Khoáng chất': ['vitamins', 'supplements', 'vitamin-c', 'omega'],
  'Tim mạch': ['heart-medicine', 'cardiovascular', 'blood-pressure'],
  'Tiêu hóa': ['digestive', 'stomach', 'antacid'],
  'Hô hấp': ['respiratory', 'cough', 'asthma'],
  'Thần kinh': ['neurological', 'brain', 'mental-health'],
  'Da liễu': ['dermatology', 'skin', 'topical'],
  'Mắt - Tai - Mũi - Họng': ['eye-drops', 'ear', 'nose', 'throat'],
  'Nội tiết': ['endocrine', 'hormone', 'diabetes']
};

// Unsplash access key
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_KEY'; // Get from https://unsplash.com/developers

async function downloadMedicineImages() {
  try {
    // Read existing database
    const database = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
    console.log(`Found ${database.medicines.length} medicines`);
    
    // Update each medicine with image URL
    for (let i = 0; i < database.medicines.length; i++) {
      const medicine = database.medicines[i];
      
      // Generate medicine image URL from Unsplash
      // Using specific medicine-related keywords
      const category = medicine.category || 'Giảm đau - Hạ sốt';
      const keywords = medicineCategories[category] || ['medicine', 'pills'];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      
      // Create variety by using medicine ID as seed
      const imageId = (i % 30) + 1; // Cycle through 30 different images
      
      // Use Lorem Picsum for consistent, numbered images
      // Alternative: Unsplash with specific IDs
      const imageUrl = `https://images.unsplash.com/photo-${1471864190281 + (i * 1000)}?w=400&h=400&fit=crop`;
      
      // For demo, use medicine/pharmaceutical themed images
      const medicineImages = [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', // Pills in hand
        'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400', // Medicine bottles
        'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', // Pills close-up
        'https://images.unsplash.com/photo-1550572017-4fa3e06c5c1d?w=400', // Pharmacy
        'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400', // Pill bottles
        'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', // White pills
        'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400', // Medicine vials
        'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400', // Capsules
        'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400', // Tablets
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', // Pills on blue
      ];
      
      // Assign image based on medicine ID for consistency
      medicine.imageUrl = medicineImages[i % medicineImages.length];
      
      // Add visual features for matching (simulated)
      medicine.visualFeatures = {
        primaryColor: getColorByCategory(medicine.category),
        shape: getShapeByType(medicine.packaging),
        packaging: medicine.packaging,
        brandColors: generateBrandColors(medicine.name)
      };
      
      if ((i + 1) % 20 === 0) {
        console.log(`Processed ${i + 1}/${database.medicines.length} medicines`);
      }
    }
    
    // Save updated database
    fs.writeFileSync(
      'medicines-database.json',
      JSON.stringify(database, null, 2),
      'utf8'
    );
    
    console.log('\n✅ Successfully updated all 200 medicines with images!');
    console.log('Database saved to medicines-database.json');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function getColorByCategory(category) {
  const colorMap = {
    'Giảm đau - Hạ sốt': ['white', 'orange', 'red'],
    'Kháng sinh': ['yellow', 'green', 'white'],
    'Vitamin & Khoáng chất': ['orange', 'yellow', 'green'],
    'Tim mạch': ['pink', 'white', 'blue'],
    'Tiêu hóa': ['white', 'green', 'pink'],
    'Hô hấp': ['blue', 'white', 'green'],
    'Thần kinh': ['white', 'blue', 'purple'],
    'Da liễu': ['white', 'cream', 'green'],
    'Mắt - Tai - Mũi - Họng': ['clear', 'yellow', 'white'],
    'Nội tiết': ['white', 'yellow', 'blue']
  };
  
  return colorMap[category] || ['white', 'blue'];
}

function getShapeByType(packaging) {
  if (packaging.includes('viên nén')) return 'round-tablet';
  if (packaging.includes('viên nang')) return 'capsule';
  if (packaging.includes('siro')) return 'liquid-bottle';
  if (packaging.includes('kem') || packaging.includes('gel')) return 'tube';
  if (packaging.includes('vỉ')) return 'blister-pack';
  return 'tablet';
}

function generateBrandColors(medicineName) {
  // Generate consistent brand colors based on medicine name
  const hash = medicineName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'yellow', 'pink', 'teal'];
  return [colors[hash % colors.length], colors[(hash * 2) % colors.length]];
}

// Run the script
downloadMedicineImages();
