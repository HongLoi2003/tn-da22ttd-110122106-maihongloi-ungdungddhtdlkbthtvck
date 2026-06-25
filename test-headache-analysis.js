const symptomsData = require('./symptoms-mapping.json');

// Simulate the analyzeSymptomText function
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

function isWholeWordMatch(text, keyword) {
  if (keyword.length <= 2) {
    const words = text.split(/\s+/);
    return words.includes(keyword);
  }
  const regex = new RegExp(`(^|\\s)${keyword}(\\s|$)`, 'i');
  return regex.test(text) || text.includes(keyword);
}

function analyzeSymptomText(inputText) {
  console.log('🔍 Analyzing:', inputText);
  
  const normalizedInput = normalizeText(inputText);
  const matchedSymptoms = new Set();
  const matchedSymptomNames = [];

  symptomsData.symptoms.forEach(symptom => {
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

  // Calculate specialty scores
  const specialtyScores = new Map();

  symptomsData.mappings.forEach(mapping => {
    let matchCount = 0;
    const matchedInThisSpecialty = [];

    mapping.symptomIds.forEach(symptomId => {
      if (matchedSymptoms.has(symptomId)) {
        matchCount++;
        const symptomName = symptomsData.symptoms.find(s => s.id === symptomId)?.name;
        if (symptomName) {
          matchedInThisSpecialty.push(symptomName);
        }
      }
    });

    if (matchCount > 0) {
      const confidence = Math.min(100, matchCount * 30);
      specialtyScores.set(mapping.specialtyId, {
        name: mapping.specialtyName,
        confidence,
        matchedSymptoms: matchedInThisSpecialty
      });
    }
  });

  const recommendations = Array.from(specialtyScores.entries())
    .map(([id, data]) => ({
      specialtyId: id,
      specialtyName: data.name,
      confidence: data.confidence,
      matchedSymptoms: data.matchedSymptoms
    }))
    .sort((a, b) => {
      const countDiff = b.matchedSymptoms.length - a.matchedSymptoms.length;
      if (countDiff !== 0) return countDiff;
      return b.confidence - a.confidence;
    });

  return recommendations;
}

// Test cases
console.log('='.repeat(70));
console.log('TEST 1: "đau đầu"');
console.log('='.repeat(70));
const result1 = analyzeSymptomText('đau đầu');
console.log('\n📊 Recommendations:');
result1.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.specialtyName} (${rec.confidence}%) - ${rec.matchedSymptoms.join(', ')}`);
});

console.log('\n\n' + '='.repeat(70));
console.log('TEST 2: "đau đầu chóng mặt"');
console.log('='.repeat(70));
const result2 = analyzeSymptomText('đau đầu chóng mặt');
console.log('\n📊 Recommendations:');
result2.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.specialtyName} (${rec.confidence}%) - ${rec.matchedSymptoms.join(', ')}`);
});

console.log('\n\n' + '='.repeat(70));
console.log('TEST 3: "đau đầu mỏi mắt"');
console.log('='.repeat(70));
const result3 = analyzeSymptomText('đau đầu mỏi mắt');
console.log('\n📊 Recommendations:');
result3.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.specialtyName} (${rec.confidence}%) - ${rec.matchedSymptoms.join(', ')}`);
});

console.log('\n\n' + '='.repeat(70));
console.log('TEST 4: "đau đầu do xoang"');
console.log('='.repeat(70));
const result4 = analyzeSymptomText('đau đầu do xoang');
console.log('\n📊 Recommendations:');
result4.forEach((rec, i) => {
  console.log(`${i + 1}. ${rec.specialtyName} (${rec.confidence}%) - ${rec.matchedSymptoms.join(', ')}`);
});
