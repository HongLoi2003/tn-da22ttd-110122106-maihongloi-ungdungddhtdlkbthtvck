// Test đơn giản để kiểm tra symptom matching
const symptomsData = require('./symptoms-mapping.json');

console.log('📊 Tổng số triệu chứng:', symptomsData.symptoms.length);
console.log('📊 Tổng số chuyên khoa:', symptomsData.mappings.length);
console.log('');

// Test 1: Tìm triệu chứng "đau đầu"
console.log('🔍 TEST 1: Tìm "đau đầu"');
const symptom1 = symptomsData.symptoms.find(s => s.name === 'đau đầu');
if (symptom1) {
  console.log('✅ Tìm thấy:', symptom1.name);
  console.log('   Keywords:', symptom1.keywords);
  console.log('   Icon:', symptom1.icon);
} else {
  console.log('❌ Không tìm thấy');
}
console.log('');

// Test 2: Tìm triệu chứng "đau lưng"
console.log('🔍 TEST 2: Tìm "đau lưng"');
const symptom2 = symptomsData.symptoms.find(s => s.name === 'đau lưng');
if (symptom2) {
  console.log('✅ Tìm thấy:', symptom2.name);
  console.log('   Keywords:', symptom2.keywords);
  console.log('   Icon:', symptom2.icon);
} else {
  console.log('❌ Không tìm thấy');
}
console.log('');

// Test 3: Tìm triệu chứng có keyword "dau lung"
console.log('🔍 TEST 3: Tìm keyword "dau lung"');
const matches = symptomsData.symptoms.filter(s => 
  s.keywords.some(k => k.includes('dau lung') || k.includes('đau lưng'))
);
console.log('✅ Tìm thấy', matches.length, 'triệu chứng:');
matches.forEach(m => {
  console.log('   -', m.name, '(icon:', m.icon + ')');
});
console.log('');

// Test 4: Kiểm tra mapping của chuyên khoa "Cơ xương khớp"
console.log('🔍 TEST 4: Chuyên khoa "Cơ xương khớp"');
const mapping = symptomsData.mappings.find(m => m.specialtyName === 'Cơ xương khớp');
if (mapping) {
  console.log('✅ Tìm thấy chuyên khoa');
  console.log('   Specialty ID:', mapping.specialtyId);
  console.log('   Số triệu chứng:', mapping.symptomIds.length);
  console.log('   Confidence:', mapping.confidence);
  
  // Lấy 5 triệu chứng đầu tiên
  console.log('   5 triệu chứng đầu:');
  mapping.symptomIds.slice(0, 5).forEach(id => {
    const symptom = symptomsData.symptoms.find(s => s.id === id);
    if (symptom) {
      console.log('     -', symptom.name);
    }
  });
} else {
  console.log('❌ Không tìm thấy');
}
