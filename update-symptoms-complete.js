/**
 * Script cập nhật TOÀN BỘ triệu chứng vào symptoms-mapping.json
 * Chạy: node update-symptoms-complete.js
 */

const fs = require('fs');
const path = require('path');

// Import dữ liệu
const part1 = require('./specialties-data.js');
const part2 = require('./specialties-data-part2.js');
const part3 = require('./specialties-data-part3.js');
const part4 = require('./specialties-data-part4.js');
const part5 = require('./specialties-data-part5.js');

// Gộp tất cả dữ liệu
const allSpecialties = { ...part1, ...part2, ...part3, ...part4, ...part5 };

// Đọc file hiện tại
const filePath = path.join(__dirname, 'symptoms-mapping.json');
const currentData = { symptoms: [], mappings: [] };

console.log('🚀 BẮT ĐẦU CẬP NHẬT TRIỆU CHỨNG...\n');

// Tạo ID mới
let nextSymptomId = 1;
let nextSpecialtyId = 1;

const newSymptoms = [];
const newMappings = [];

// Xử lý từng chuyên khoa
Object.entries(allSpecialties).forEach(([key, specialty]) => {
  console.log(`🏥 ${specialty.name}`);
  
  const specialtyId = nextSpecialtyId++;
  const symptomIds = [];
  
  specialty.keywords.forEach(keyword => {
    const symptomId = nextSymptomId++;
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
  
  newMappings.push({
    specialtyId: specialtyId,
    specialtyName: specialty.name,
    symptomIds: symptomIds,
    confidence: 90
  });
  
  console.log(`   ✅ ${symptomIds.length} triệu chứng\n`);
});

// Tạo dữ liệu mới
const updatedData = {
  symptoms: newSymptoms,
  mappings: newMappings
};

// Ghi file
fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf8');

console.log('✅ HOÀN TẤT!');
console.log(`📊 Tổng: ${updatedData.symptoms.length} triệu chứng`);
console.log(`📊 Tổng: ${updatedData.mappings.length} chuyên khoa`);
console.log(`💾 Đã lưu: ${filePath}`);
