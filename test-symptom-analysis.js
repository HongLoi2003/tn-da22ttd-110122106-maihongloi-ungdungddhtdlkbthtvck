// Test symptom analysis logic
const fs = require('fs');

// Load data
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf-8'));

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

function analyzeSymptomText(inputText) {
  console.log('🔍 Analyzing:', inputText);
  
  const normalizedInput = normalizeText(inputText);
  const matchedSymptoms = new Set();
  const matchedSymptomNames = [];
  
  // Helper function: Kiểm tra whole-word match (tránh partial match)
  const isWholeWordMatch = (text, keyword) => {
    // Nếu keyword quá ngắn (1-2 ký tự), yêu cầu exact match
    if (keyword.length <= 2) {
      // Tách thành từng từ và kiểm tra exact match
      const words = text.split(/\s+/);
      return words.includes(keyword);
    }
    
    // Với keyword dài hơn, kiểm tra có xuất hiện không (có thể là substring)
    // Nhưng phải có ranh giới từ (word boundary)
    const regex = new RegExp(`(^|\\s)${keyword}(\\s|$)`, 'i');
    return regex.test(text) || text.includes(keyword);
  };
  
  // Find symptoms
  data.symptoms.forEach(symptom => {
    const normalizedName = normalizeText(symptom.name);
    if (isWholeWordMatch(normalizedInput, normalizedName)) {
      matchedSymptoms.add(symptom.id);
      matchedSymptomNames.push(symptom.name);
      console.log(`✅ Found: "${symptom.name}" (from name)`);
      return;
    }
    
    if (symptom.keywords && symptom.keywords.length > 0) {
      for (const keyword of symptom.keywords) {
        const normalizedKeyword = normalizeText(keyword);
        
        // Bỏ qua keyword quá ngắn (1-2 ký tự)
        if (normalizedKeyword.length <= 2 && !['ho', 'oi', 'o'].includes(normalizedKeyword)) {
          continue;
        }
        
        if (isWholeWordMatch(normalizedInput, normalizedKeyword)) {
          matchedSymptoms.add(symptom.id);
          matchedSymptomNames.push(symptom.name);
          console.log(`✅ Found: "${symptom.name}" (keyword: "${keyword}")`);
          break;
        }
      }
    }
  });
  
  console.log('\n📋 Matched symptoms:', matchedSymptomNames);
  console.log('📊 Total:', matchedSymptoms.size);
  
  if (matchedSymptoms.size === 0) {
    console.log('⚠️ No symptoms matched');
    return [];
  }
  
  // Calculate scores for each specialty
  const specialtyScores = new Map();
  
  data.mappings.forEach(mapping => {
    let matchCount = 0;
    const matchedInThisSpecialty = [];
    
    mapping.symptomIds.forEach(symptomId => {
      if (matchedSymptoms.has(symptomId)) {
        matchCount++;
        const symptomName = data.symptoms.find(s => s.id === symptomId)?.name;
        if (symptomName) {
          matchedInThisSpecialty.push(symptomName);
        }
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
  
  // Convert to array and calculate confidence
  const recommendations = Array.from(specialtyScores.entries())
    .map(([id, data]) => {
      // Simple formula: each symptom = 30%, max 100%
      const confidence = Math.min(100, data.matchCount * 30);
      
      return {
        specialtyId: id,
        specialtyName: data.name,
        confidence,
        matchCount: data.matchCount,
        matchedSymptoms: data.matchedSymptoms
      };
    })
    .sort((a, b) => {
      // Sort by match count first, then confidence
      const countDiff = b.matchCount - a.matchCount;
      if (countDiff !== 0) return countDiff;
      return b.confidence - a.confidence;
    });
  
  console.log('\n📊 Recommendations:');
  recommendations.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec.specialtyName} - ${rec.confidence}% (${rec.matchCount} triệu chứng)`);
    console.log(`   Triệu chứng: ${rec.matchedSymptoms.join(', ')}`);
  });
  
  return recommendations;
}

// Test cases
console.log('='.repeat(80));
console.log('TEST 1: Đau đầu chóng mặt');
console.log('='.repeat(80));
analyzeSymptomText('đau đầu chóng mặt mất ngủ');

console.log('\n' + '='.repeat(80));
console.log('TEST 2: Đau bụng');
console.log('='.repeat(80));
analyzeSymptomText('đau bụng tiêu chảy buồn nôn');

console.log('\n' + '='.repeat(80));
console.log('TEST 3: Triệu chứng tim mạch');
console.log('='.repeat(80));
analyzeSymptomText('đau ngực tức ngực tim đập nhanh');

console.log('\n' + '='.repeat(80));
console.log('TEST 4: Triệu chứng cơ xương khớp');
console.log('='.repeat(80));
analyzeSymptomText('đau lưng đau khớp gối');
