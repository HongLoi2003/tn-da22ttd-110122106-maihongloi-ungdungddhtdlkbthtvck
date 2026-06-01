const fs = require('fs');

const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🔍 Sửa keywords quá ngắn (< 3 ký tự)\n');

let fixedCount = 0;

data.symptoms.forEach(symptom => {
  if (symptom.keywords && symptom.keywords.length > 0) {
    const originalKeywords = [...symptom.keywords];
    
    // Remove keywords shorter than 3 characters
    symptom.keywords = symptom.keywords.filter(k => k.length >= 3);
    
    // If all keywords were removed, keep the symptom name as keyword
    if (symptom.keywords.length === 0) {
      const normalized = symptom.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();
      symptom.keywords = [normalized];
    }
    
    if (originalKeywords.length !== symptom.keywords.length) {
      console.log(`${symptom.name}:`);
      console.log(`  Trước: [${originalKeywords.join(', ')}]`);
      console.log(`  Sau:   [${symptom.keywords.join(', ')}]`);
      fixedCount++;
    }
  }
});

fs.writeFileSync('symptoms-mapping.json', JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✅ Đã sửa ${fixedCount} triệu chứng`);
console.log('✅ Đã cập nhật symptoms-mapping.json');
