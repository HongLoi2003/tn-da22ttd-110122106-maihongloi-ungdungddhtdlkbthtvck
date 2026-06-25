const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

// Medicine category image mapping - using Unsplash pharmaceutical images
const categoryImageMap = {
  'Giảm đau - Hạ sốt': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', // Pills in hand
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400', // Medicine bottles
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', // White pills
  ],
  'Kháng sinh': [
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400', // Antibiotics
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400', // Pills bottles
    'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400', // Capsules
  ],
  'Tim mạch': [
    'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400', // Heart pills
    'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400', // Red pills
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400', // Cardio medicine
  ],
  'Thần kinh': [
    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400', // Brain medicine
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', // Neuro pills
    'https://images.unsplash.com/photo-1603560988818-eb3620a0d367?w=400', // Mental health
  ],
  'Hô hấp': [
    'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400', // Respiratory
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde89?w=400', // Inhalers
    'https://images.unsplash.com/photo-1603560988818-eb3620a0d368?w=400', // Lung medicine
  ],
  'Tiêu hóa': [
    'https://images.unsplash.com/photo-1511654645-52681c7d7f2a?w=400', // Digestive
    'https://images.unsplash.com/photo-1603560988870-50d0ef5fa063?w=400', // Stomach pills
    'https://images.unsplash.com/photo-1603561596161-cbc1e5f8f710?w=400', // GI medicine
  ],
  'Da liễu': [
    'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=400', // Skin cream
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', // Derma products
    'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', // Skin care
  ],
  'Tai - Mũi - Họng': [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2af?w=400', // ENT medicine
    'https://images.unsplash.com/photo-1584308666745-24d5c474f2b0?w=400', // Throat spray
    'https://images.unsplash.com/photo-1584308666746-24d5c474f2b1?w=400', // Ear drops
  ],
  'Mắt': [
    'https://images.unsplash.com/photo-1574871786991-8c4e0b0d8f07?w=400', // Eye drops
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400', // Vision care
    'https://images.unsplash.com/photo-1512273965161-1ba3825ba598?w=400', // Eye medicine
  ],
  'Sản phụ khoa': [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', // Women health
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400', // Pregnancy
    'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400', // Maternal care
  ],
  'Nội tiết': [
    'https://images.unsplash.com/photo-1471864190281-a93a3070b6df?w=400', // Hormones
    'https://images.unsplash.com/photo-1550572017-4725f8c1b3f5?w=400', // Diabetes
    'https://images.unsplash.com/photo-1559561853-08451507cbe8?w=400', // Thyroid
  ],
  'Xương khớp': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', // Joint pills
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400', // Bone health
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c529?w=400', // Arthritis
  ],
  'Trẻ em': [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde90?w=400', // Kids medicine
    'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b3?w=400', // Children pills
    'https://images.unsplash.com/photo-1628771065518-0d82f1938463?w=400', // Pediatric
  ],
  'Vitamin & Khoáng chất': [
    'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', // Vitamins
    'https://images.unsplash.com/photo-1599629954294-1b2e3e2b5a2f?w=400', // Supplements
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400', // Minerals
  ],
};

// Default fallback images
const defaultImages = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
];

// Function to get appropriate image for medicine
function getImageForMedicine(medicine, index) {
  const category = medicine.category;
  
  // Try to find matching category
  for (const [categoryKey, images] of Object.entries(categoryImageMap)) {
    if (category && category.includes(categoryKey)) {
      return images[index % images.length];
    }
  }
  
  // Fallback to default images
  return defaultImages[index % defaultImages.length];
}

// Update all medicines with appropriate images
console.log('🔄 Updating medicine images based on categories...\n');

medicines.forEach((medicine, index) => {
  medicine.imageUrl = getImageForMedicine(medicine, index);
  console.log(`[${index + 1}/${medicines.length}] ${medicine.name} (${medicine.category}) -> ✓ Updated`);
});

// Save updated database
data.medicines = medicines;
fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));

console.log(`\n✅ Complete! All ${medicines.length} medicines have been updated with category-appropriate images`);
console.log('📊 Images are now matched to medicine categories for better user experience');
