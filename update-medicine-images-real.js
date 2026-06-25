const fs = require('fs');

// Pool ảnh thuốc thật từ Unsplash (miễn phí, chất lượng cao)
const medicineImagePool = [
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400',
  'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
  'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400',
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
  'https://images.unsplash.com/photo-1550572017-4725f8c1b3e5?w=400',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
  'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
  'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=400',
  'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400',
  'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=400',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400'
];

// Đọc file medicines-database.json
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));

// Shuffle array để random
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const shuffledImages = shuffleArray(medicineImagePool);

// Update imageUrl cho mỗi thuốc
data.medicines.forEach((medicine, index) => {
  // Lấy ảnh theo thứ tự, nếu hết thì lặp lại
  const imageIndex = index % shuffledImages.length;
  medicine.imageUrl = shuffledImages[imageIndex];
  
  console.log(`✓ Updated ${medicine.name}: ${medicine.imageUrl}`);
});

// Ghi lại file
fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ HOÀN TẤT! Đã update ảnh cho tất cả thuốc.');
console.log(`📊 Tổng số thuốc: ${data.medicines.length}`);
console.log(`🖼️  Số ảnh khác nhau: ${medicineImagePool.length}`);
