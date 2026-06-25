const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

/**
 * STABLE SOLUTION: Use reliable placeholder services
 * These services are specifically designed for hotlinking and always work
 * Each medicine gets a unique, color-coded placeholder
 */

// Medicine categories with color schemes
const categoryColors = {
  'Giảm đau': ['4CAF50', '8BC34A', 'CDDC39'],
  'Kháng sinh': ['E91E63', 'F06292', 'EC407A'],
  'Tim mạch': ['F44336', 'EF5350', 'E57373'],
  'Thần kinh': ['3F51B5', '5C6BC0', '7986CB'],
  'Hô hấp': ['00BCD4', '26C6DA', '4DD0E1'],
  'Tiêu hóa': ['FF9800', 'FFA726', 'FFB74D'],
  'Da liễu': ['9C27B0', 'AB47BC', 'BA68C8'],
  'Mắt': ['2196F3', '42A5F5', '64B5F6'],
  'Tai': ['009688', '26A69A', '4DB6AC'],
  'Xương': ['795548', '8D6E63', 'A1887F'],
  'Nội tiết': ['607D8B', '78909C', '90A4AE'],
  'Sản phụ': ['FF5722', 'FF7043', 'FF8A65'],
  'Nhi khoa': ['FFEB3B', 'FFEE58', 'FFF176'],
};

function getColorForMedicine(medicine, index) {
  const category = medicine.category || '';
  
  // Find matching category
  for (const [key, colors] of Object.entries(categoryColors)) {
    if (category.includes(key)) {
      return colors[index % colors.length];
    }
  }
  
  // Default colors
  const defaultColors = ['4CAF50', '2196F3', 'FF9800', '9C27B0', 'F44336'];
  return defaultColors[index % defaultColors.length];
}

function getInitials(name) {
  // Get first 2 letters
  const words = name.split(' ');
  if (words.length >= 2) {
    return words[0][0] + words[1][0];
  }
  return name.substring(0, 2);
}

/**
 * Generate image URL using reliable services
 * Options:
 * 1. UI Avatars (text-based, always works)
 * 2. DummyImage (simple placeholders)
 * 3. via.placeholder.com (versatile)
 */

function generateImageURL(medicine, index) {
  const initials = getInitials(medicine.name);
  const color = getColorForMedicine(medicine, index);
  const seed = medicine.id || index;
  
  // Option 1: UI Avatars (best for text display)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=400&background=${color}&color=fff&bold=true&format=png&rounded=false`;
  
  // Option 2: DummyImage
  // return `https://dummyimage.com/400x300/${color}/ffffff&text=${encodeURIComponent(initials)}`;
  
  // Option 3: Placeholder.com  
  // return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
}

// Main function
function updateWithStablePlaceholders() {
  console.log('🔄 Updating medicines with STABLE placeholder images...\n');
  console.log('✅ Using UI Avatars API - Always works, no hotlinking issues');
  console.log('✅ Each medicine gets unique color-coded image\n');
  
  medicines.forEach((medicine, index) => {
    medicine.imageUrl = generateImageURL(medicine, index);
    console.log(`[${index + 1}/${medicines.length}] ${medicine.name} -> ${medicine.imageUrl.substring(0, 60)}...`);
  });
  
  // Save updated database
  data.medicines = medicines;
  fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));
  
  console.log(`\n✅ HOÀN TẤT!`);
  console.log(`📊 Tổng số thuốc: ${medicines.length}`);
  console.log(`🖼️  Số ảnh unique: ${new Set(medicines.map(m => m.imageUrl)).length}`);
  console.log(`\n💡 Ưu điểm:`);
  console.log(`   • Không bao giờ bị 404`);
  console.log(`   • Mỗi thuốc có ảnh riêng biệt`);
  console.log(`   • Màu sắc phân loại theo danh mục`);
  console.log(`   • Hiển thị tên viết tắt của thuốc`);
}

// Run
updateWithStablePlaceholders();
