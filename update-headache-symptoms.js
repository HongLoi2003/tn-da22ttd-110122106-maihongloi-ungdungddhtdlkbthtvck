const fs = require('fs');

// Đọc file symptoms-mapping.json
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🔧 Updating symptoms with headache-related keywords...\n');

// 1. Cập nhật ID 67 (chóng mặt - Tim mạch) - thêm keywords liên quan đau đầu
const symptom67 = data.symptoms.find(s => s.id === 67);
if (symptom67) {
  console.log('✅ Found ID 67:', symptom67.name);
  if (!symptom67.keywords.includes('chóng mặt đau đầu')) {
    symptom67.keywords.push('chóng mặt đau đầu', 'đau đầu chóng mặt', 'hoa mắt đau đầu');
    console.log('   Added keywords:', ['chóng mặt đau đầu', 'đau đầu chóng mặt', 'hoa mắt đau đầu']);
  }
}

// 2. Cập nhật ID 204 (đau đầu do xoang - Tai mũi họng)
const symptom204 = data.symptoms.find(s => s.id === 204);
if (symptom204) {
  console.log('\n✅ Found ID 204:', symptom204.name);
  console.log('   Current keywords:', symptom204.keywords);
  // Đã có keywords đủ tốt rồi
}

// 3. Cập nhật ID 221 (mỏi mắt - Mắt) - thêm keywords liên quan đau đầu
const symptom221 = data.symptoms.find(s => s.id === 221);
if (symptom221) {
  console.log('\n✅ Found ID 221:', symptom221.name);
  if (!symptom221.keywords.includes('đau đầu mỏi mắt')) {
    symptom221.keywords.push(
      'đau đầu mỏi mắt',
      'mỏi mắt đau đầu',
      'đau đầu do mỏi mắt',
      'nhức đầu mỏi mắt',
      'đau đầu khi nhìn màn hình'
    );
    console.log('   Added keywords:', [
      'đau đầu mỏi mắt',
      'mỏi mắt đau đầu',
      'đau đầu do mỏi mắt',
      'nhức đầu mỏi mắt',
      'đau đầu khi nhìn màn hình'
    ]);
  }
}

// 4. Cập nhật ID 224 (đau khi nhìn - Mắt) - thêm keywords liên quan đau đầu
const symptom224 = data.symptoms.find(s => s.id === 224);
if (symptom224) {
  console.log('\n✅ Found ID 224:', symptom224.name);
  if (!symptom224.keywords.includes('đau đầu khi nhìn')) {
    symptom224.keywords.push(
      'đau đầu khi nhìn',
      'nhức đầu khi nhìn',
      'đau mắt đau đầu'
    );
    console.log('   Added keywords:', [
      'đau đầu khi nhìn',
      'nhức đầu khi nhìn',
      'đau mắt đau đầu'
    ]);
  }
}

// Ghi lại file
fs.writeFileSync('symptoms-mapping.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Successfully updated symptoms-mapping.json');
console.log('\n📊 Summary:');
console.log('   - ID 67 (Tim mạch - chóng mặt): Added headache-related keywords');
console.log('   - ID 204 (Tai mũi họng - đau đầu do xoang): Already has good keywords');
console.log('   - ID 221 (Mắt - mỏi mắt): Added headache-related keywords');
console.log('   - ID 224 (Mắt - đau khi nhìn): Added headache-related keywords');
console.log('\n🎯 Now when users type "đau đầu", they will see:');
console.log('   1. Thần kinh (90%) - Primary match');
console.log('   2. Tai mũi họng (60-70%) - Via "đau đầu do xoang"');
console.log('   3. Mắt (50-60%) - Via "mỏi mắt đau đầu"');
console.log('   4. Tim mạch (40-50%) - Via "chóng mặt đau đầu"');
