// Test more symptom scenarios
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf-8'));

function normalizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();
}

function analyzeSymptomText(inputText) {
  const normalizedInput = normalizeText(inputText);
  const matchedSymptoms = new Set();
  
  const isWholeWordMatch = (text, keyword) => {
    if (keyword.length <= 2) {
      const words = text.split(/\s+/);
      return words.includes(keyword);
    }
    const regex = new RegExp(`(^|\\s)${keyword}(\\s|$)`, 'i');
    return regex.test(text) || text.includes(keyword);
  };
  
  data.symptoms.forEach(symptom => {
    const normalizedName = normalizeText(symptom.name);
    if (isWholeWordMatch(normalizedInput, normalizedName)) {
      matchedSymptoms.add(symptom.id);
      return;
    }
    
    if (symptom.keywords && symptom.keywords.length > 0) {
      for (const keyword of symptom.keywords) {
        const normalizedKeyword = normalizeText(keyword);
        if (normalizedKeyword.length <= 2 && !['ho', 'oi', 'o'].includes(normalizedKeyword)) {
          continue;
        }
        if (isWholeWordMatch(normalizedInput, normalizedKeyword)) {
          matchedSymptoms.add(symptom.id);
          break;
        }
      }
    }
  });
  
  if (matchedSymptoms.size === 0) return [];
  
  const specialtyScores = new Map();
  
  data.mappings.forEach(mapping => {
    let matchCount = 0;
    const matchedInThisSpecialty = [];
    
    mapping.symptomIds.forEach(symptomId => {
      if (matchedSymptoms.has(symptomId)) {
        matchCount++;
        const symptomName = data.symptoms.find(s => s.id === symptomId)?.name;
        if (symptomName) matchedInThisSpecialty.push(symptomName);
      }
    });
    
    if (matchCount > 0) {
      specialtyScores.set(mapping.specialtyId, {
        name: mapping.specialtyName,
        matchCount,
        matchedSymptoms: matchedInThisSpecialty
      });
    }
  });
  
  const recommendations = Array.from(specialtyScores.entries())
    .map(([id, data]) => {
      const confidence = Math.min(100, data.matchCount * 30);
      return {
        specialtyName: data.name,
        confidence,
        matchCount: data.matchCount,
        matchedSymptoms: data.matchedSymptoms
      };
    })
    .sort((a, b) => {
      const countDiff = b.matchCount - a.matchCount;
      if (countDiff !== 0) return countDiff;
      return b.confidence - a.confidence;
    });
  
  return recommendations;
}

// Test cases
const tests = [
  { input: 'tôi bị ho sốt sổ mũi', expected: 'Hô hấp' },
  { input: 'da bị ngứa nổi mẩn đỏ', expected: 'Da liễu' },
  { input: 'bị đau răng sâu răng', expected: 'Răng hàm mặt' },
  { input: 'đau bụng kinh trễ kinh', expected: 'Sản phụ khoa' },
  { input: 'trẻ sốt cao quấy khóc', expected: 'Nhi khoa' },
  { input: 'tiểu nhiều khát nước', expected: 'Nội tiết' },
  { input: 'đau họng viêm họng', expected: 'Tai mũi họng' },
  { input: 'mờ mắt nhìn không rõ', expected: 'Mắt' },
  { input: 'gì cũng được', expected: 'Không match' },
  { input: 'tôi khỏe mạnh', expected: 'Không match' },
];

console.log('='.repeat(80));
console.log('KIỂM TRA PHÂN TÍCH TRIỆU CHỨNG');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  console.log(`\n${index + 1}. Input: "${test.input}"`);
  const result = analyzeSymptomText(test.input);
  
  if (result.length === 0) {
    if (test.expected === 'Không match') {
      console.log(`✅ PASS: Không tìm thấy chuyên khoa (đúng)`);
      passed++;
    } else {
      console.log(`❌ FAIL: Không tìm thấy chuyên khoa (mong đợi: ${test.expected})`);
      failed++;
    }
  } else {
    const topSpecialty = result[0].specialtyName;
    if (topSpecialty === test.expected) {
      console.log(`✅ PASS: ${topSpecialty} (${result[0].matchCount} triệu chứng, ${result[0].confidence}%)`);
      console.log(`   Triệu chứng: ${result[0].matchedSymptoms.join(', ')}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${topSpecialty} (mong đợi: ${test.expected})`);
      console.log(`   Triệu chứng: ${result[0].matchedSymptoms.join(', ')}`);
      console.log(`   Tất cả kết quả:`);
      result.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.specialtyName} - ${r.confidence}% (${r.matchCount} triệu chứng)`);
      });
      failed++;
    }
  }
});

console.log('\n' + '='.repeat(80));
console.log(`KẾT QUẢ: ${passed} PASS, ${failed} FAIL (${tests.length} tests)`);
console.log('='.repeat(80));
