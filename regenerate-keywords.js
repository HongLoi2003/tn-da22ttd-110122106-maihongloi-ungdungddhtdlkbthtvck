const fs = require('fs');

const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🔄 Tạo lại keywords cho tất cả triệu chứng\n');

// Function to normalize text
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

// Generate keywords for each symptom
data.symptoms.forEach(symptom => {
  const normalized = normalize(symptom.name);
  const words = normalized.split(/\s+/);
  
  const keywords = [normalized]; // Always include full normalized name
  
  // Add variations based on symptom name
  // Only add if it's meaningful (>= 3 characters)
  if (words.length > 1) {
    // Add reversed word order for 2-word symptoms
    if (words.length === 2) {
      keywords.push(words[1] + ' ' + words[0]);
    }
  }
  
  // Remove duplicates and short keywords
  symptom.keywords = [...new Set(keywords)].filter(k => k.length >= 3);
  
  // If no keywords left, use normalized name
  if (symptom.keywords.length === 0) {
    symptom.keywords = [normalized];
  }
});

fs.writeFileSync('symptoms-mapping.json', JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Đã tạo lại keywords cho', data.symptoms.length, 'triệu chứng');
console.log('\n📋 Mẫu keywords:');
data.symptoms.slice(0, 10).forEach(s => {
  console.log(`  ${s.name}: [${s.keywords.join(', ')}]`);
});
