// So sánh dữ liệu giữa JSON file và hardcoded keywords
const fs = require('fs');

// Load JSON file
const jsonData = JSON.parse(fs.readFileSync('symptoms-mapping-300.json', 'utf8'));

console.log("📊 PHÂN TÍCH DỮ LIỆU TRIỆU CHỨNG\n");
console.log("=".repeat(60));

// Phân tích JSON file
console.log("\n1️⃣ FILE symptoms-mapping-300.json:");
console.log("-".repeat(60));
console.log(`   Tổng số triệu chứng: ${jsonData.symptoms.length}`);

// Đếm triệu chứng thực tế (không phải placeholder)
const realSymptoms = jsonData.symptoms.filter(s => !s.name.includes('mở rộng'));
const placeholders = jsonData.symptoms.filter(s => s.name.includes('mở rộng'));

console.log(`   - Triệu chứng thực tế: ${realSymptoms.length}`);
console.log(`   - Placeholder: ${placeholders.length}`);
console.log(`   Tổng số mappings: ${jsonData.mappings.length}`);

// Phân tích từng chuyên khoa
console.log("\n   Chi tiết theo chuyên khoa:");
jsonData.mappings.forEach(mapping => {
  console.log(`   - ${mapping.specialtyName}: ${mapping.symptomIds.length} triệu chứng`);
});

// Phân tích hardcoded keywords
console.log("\n2️⃣ HARDCODED KEYWORDS trong ai-chat.tsx:");
console.log("-".repeat(60));

const hardcodedStats = {
  'Thần kinh': 30,
  'Cơ xương khớp': 30,
  'Tim mạch': 30,
  'Tiêu hóa': 30,
  'Hô hấp': 30,
  'Da liễu': 30,
  'Tai mũi họng': 30,
  'Mắt': 30,
  'Nhi khoa': 30,
  'Nội tiết': 30,
  'Răng hàm mặt': 30,
  'Sản phụ khoa': 30
};

let totalHardcoded = 0;
Object.entries(hardcodedStats).forEach(([specialty, count]) => {
  console.log(`   - ${specialty}: ${count} keywords (+ synonyms)`);
  totalHardcoded += count;
});

console.log(`\n   Tổng: ${totalHardcoded} keywords`);
console.log(`   Ước tính với synonyms: ~${totalHardcoded * 3} từ khóa`);

// So sánh
console.log("\n3️⃣ SO SÁNH:");
console.log("-".repeat(60));
console.log(`   JSON file: ${realSymptoms.length} triệu chứng`);
console.log(`   Hardcoded: ${totalHardcoded} keywords + synonyms`);
console.log(`   Chênh lệch: ${totalHardcoded - realSymptoms.length} keywords`);

// Phân tích triệu chứng trùng lặp trong JSON
console.log("\n4️⃣ TRIỆU CHỨNG TRÙNG LẶP trong JSON:");
console.log("-".repeat(60));

const symptomNames = {};
realSymptoms.forEach(symptom => {
  if (!symptomNames[symptom.name]) {
    symptomNames[symptom.name] = [];
  }
  symptomNames[symptom.name].push(symptom.id);
});

const duplicates = Object.entries(symptomNames).filter(([name, ids]) => ids.length > 1);

if (duplicates.length > 0) {
  console.log(`   Tìm thấy ${duplicates.length} triệu chứng trùng lặp:`);
  duplicates.forEach(([name, ids]) => {
    console.log(`   - "${name}": IDs ${ids.join(', ')}`);
  });
} else {
  console.log(`   ✅ Không có triệu chứng trùng lặp`);
}

// Kiểm tra triệu chứng overlap giữa các chuyên khoa
console.log("\n5️⃣ TRIỆU CHỨNG OVERLAP (xuất hiện ở nhiều chuyên khoa):");
console.log("-".repeat(60));

const symptomToSpecialties = {};
jsonData.mappings.forEach(mapping => {
  mapping.symptomIds.forEach(id => {
    const symptom = jsonData.symptoms.find(s => s.id === id);
    if (symptom && !symptom.name.includes('mở rộng')) {
      if (!symptomToSpecialties[symptom.name]) {
        symptomToSpecialties[symptom.name] = [];
      }
      symptomToSpecialties[symptom.name].push(mapping.specialtyName);
    }
  });
});

const overlaps = Object.entries(symptomToSpecialties)
  .filter(([name, specialties]) => specialties.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

if (overlaps.length > 0) {
  console.log(`   Tìm thấy ${overlaps.length} triệu chứng overlap:`);
  overlaps.slice(0, 10).forEach(([name, specialties]) => {
    console.log(`   - "${name}": ${specialties.join(', ')}`);
  });
  if (overlaps.length > 10) {
    console.log(`   ... và ${overlaps.length - 10} triệu chứng khác`);
  }
} else {
  console.log(`   ✅ Không có triệu chứng overlap`);
}

// Kết luận
console.log("\n6️⃣ KẾT LUẬN:");
console.log("-".repeat(60));
console.log(`   ❌ File JSON KHÔNG được sử dụng trong code`);
console.log(`   ✅ Code đang dùng hardcoded keywords`);
console.log(`   ⚠️  Cần quyết định: Dùng JSON hay giữ hardcode?`);
console.log(`   📝 Xem file PHAN_TICH_VAN_DE_TRIEU_CHUNG.md để biết chi tiết`);

console.log("\n" + "=".repeat(60));
