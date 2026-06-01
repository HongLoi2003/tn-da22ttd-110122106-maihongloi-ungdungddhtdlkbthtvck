/**
 * Script để thêm TẤT CẢ triệu chứng mới vào symptoms-mapping.json
 * Chạy: node add-all-symptoms.js
 */

const fs = require('fs');
const path = require('path');

// Import dữ liệu chuyên khoa từ file riêng
const specialtiesData = require('./specialties-data.js');

// Đọc file hiện tại
const filePath = path.join(__dirname, 'symptoms-mapping.json');
let currentData = { symptoms: [], mappings: [] };

try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  currentData = JSON.parse(fileContent);
  console.log('✅ Đã đọc file hiện tại:', filePath);
  console.log(`📊 Hiện có: ${currentData.symptoms.length} triệu chứng, ${currentData.mappings.length} mappings`);
} catch (error) {
  console.log('⚠️ Không tìm thấy file hoặc file rỗng, sẽ tạo mới');
}

// Tạo ID mới cho triệu chứng
let nextSymptomId = currentData.symptoms.length > 0 
  ? Math.max(...currentData.symptoms.map(s => s.id)) + 1 
  : 1;

// Tạo ID mới cho specialty
let nextSpecialtyId = currentData.mappings.length > 0
  ? Math.max(...currentData.mappings.map(m => m.specialtyId)) + 1
  : 1;

const newSymptoms = [];
const newMappings = [];

// Xử lý từng chuyên khoa
Object.entries(specialtiesData).forEach(([key, specialty]) => {
  console.log(`\n🏥 Xử lý chuyên khoa: ${specialty.name}`);
  
  const specialtyId = nextSpecialtyId++;
  const symptomIds = [];
  
  // Thêm từng triệu chứng
  specialty.keywords.forEach(keyword => {
    const symptomId = nextSymptomId++;
    
    // Tạo mảng keywords từ synonyms
    const allKeywords = [keyword.word, ...keyword.synonyms];
    
    newSymptoms.push({
      id: symptomId,
      name: keyword.word,
      icon: specialty.icon,
      keywords: allKeywords,
      weight: keyword.weight
    });
    
    symptomIds.push(symptomId);
  });
  
  console.log(`  ✅ Đã thêm ${symptomIds.length} triệu chứng`);
  
  // Tạo mapping cho chuyên khoa
  newMappings.push({
    specialtyId: specialtyId,
    specialtyName: specialty.name,
    symptomIds: symptomIds,
    confidence: 90 // Confidence mặc định
  });
});

// Gộp dữ liệu mới với dữ liệu cũ
const updatedData = {
  symptoms: [...currentData.symptoms, ...newSymptoms],
  mappings: [...currentData.mappings, ...newMappings]
};

// Ghi file
fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');

console.log('\n✅ ĐÃ CẬP NHẬT THÀNH CÔNG!');
console.log(`📊 Tổng số triệu chứng: ${updatedData.symptoms.length} (thêm ${newSymptoms.length})`);
console.log(`📊 Tổng số mappings: ${updatedData.mappings.length} (thêm ${newMappings.length})`);
console.log(`💾 File đã được lưu: ${filePath}`);
