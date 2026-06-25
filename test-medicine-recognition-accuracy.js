const fs = require('fs');

/**
 * Test script để kiểm tra độ chính xác nhận diện thuốc
 */

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

console.log('🧪 KIỂM TRA ĐỘ CHÍNH XÁC NHẬN DIỆN THUỐC\n');
console.log(`📊 Database: ${medicines.length} thuốc\n`);

// Test cases - các tên thuốc người dùng có thể chụp
const testCases = [
  { input: 'HAPACOL 500', expected: 'Hapacol 500' },
  { input: 'Paracetamol 500mg', expected: 'Paracetamol 500mg' },
  { input: 'SMECTA', expected: 'Smecta' },
  { input: 'Bảo Thanh', expected: 'Bảo Thanh' },
  { input: 'VENTOLIN', expected: 'Ventolin' },
  { input: 'Omeprazole', expected: 'Omeprazole' },
  { input: 'VITAMIN D3', expected: 'Vitamin D3' },
  { input: 'ASPIRIN 100MG', expected: 'Aspirin 100mg' },
  { input: 'Ibuprofen 400', expected: 'Ibuprofen 400mg' },
  { input: 'Eugica', expected: 'Eugica' },
];

// Simulate recognition function
function simulateRecognition(inputText) {
  const lowerInput = inputText.toLowerCase().trim();
  
  // Exact match
  let found = medicines.find(m => 
    m.name.toLowerCase() === lowerInput
  );
  
  if (found) return { success: true, found: found.name, method: 'exact' };
  
  // Partial match
  found = medicines.find(m => 
    m.name.toLowerCase().includes(lowerInput) ||
    lowerInput.includes(m.name.toLowerCase())
  );
  
  if (found) return { success: true, found: found.name, method: 'partial' };
  
  // Dosage normalized match (remove spaces in dosage)
  const normalizedInput = lowerInput.replace(/(\d+)\s*(mg|g|ml)/gi, '$1$2');
  found = medicines.find(m => {
    const normalizedName = m.name.toLowerCase().replace(/(\d+)\s*(mg|g|ml)/gi, '$1$2');
    return normalizedName === normalizedInput || 
           normalizedName.includes(normalizedInput) ||
           normalizedInput.includes(normalizedName);
  });
  
  if (found) return { success: true, found: found.name, method: 'dosage-normalized' };
  
  return { success: false, found: null, method: 'none' };
}

// Run tests
console.log('🔬 TEST RESULTS:\n');
let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = simulateRecognition(test.input);
  
  if (result.success && result.found === test.expected) {
    console.log(`✅ Test ${index + 1}: PASS`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Found: "${result.found}"`);
    console.log(`   Method: ${result.method}\n`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: FAIL`);
    console.log(`   Input: "${test.input}"`);
    console.log(`   Expected: "${test.expected}"`);
    console.log(`   Got: "${result.found || 'Not found'}"`);
    console.log(`   Method: ${result.method}\n`);
    failed++;
  }
});

console.log('\n📊 SUMMARY:');
console.log(`   ✅ Passed: ${passed}/${testCases.length}`);
console.log(`   ❌ Failed: ${failed}/${testCases.length}`);
console.log(`   🎯 Accuracy: ${Math.round(passed / testCases.length * 100)}%`);

// Show improvement suggestions
if (failed > 0) {
  console.log('\n💡 SUGGESTIONS TO IMPROVE:');
  console.log('   1. Chuẩn hóa tên thuốc trong database (viết hoa/thường nhất quán)');
  console.log('   2. Thêm aliases cho các tên thuốc viết khác nhau');
  console.log('   3. Cải thiện prompt AI để nhận diện chính xác hơn');
  console.log('   4. Thêm keywords cho mỗi thuốc');
}

// Check for medicines without keywords
const withoutKeywords = medicines.filter(m => !m.keywords || m.keywords.length === 0);
console.log(`\n⚠️  ${withoutKeywords.length} thuốc chưa có keywords`);

if (withoutKeywords.length > 0) {
  console.log('\nMẫu thuốc chưa có keywords:');
  withoutKeywords.slice(0, 5).forEach(m => {
    console.log(`   - ${m.name}`);
  });
}
