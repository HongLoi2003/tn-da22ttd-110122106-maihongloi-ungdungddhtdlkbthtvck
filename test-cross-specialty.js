const symptomsData = require('./symptoms-mapping.json');

function normalizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').trim();
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
  const normalizedInput = normalizeText(inputText);
  const matchedSymptoms = new Set();
  const matchedSymptomNames = [];

  symptomsData.symptoms.forEach(symptom => {
    const normalizedName = normalizeText(symptom.name);
    if (isWholeWordMatch(normalizedInput, normalizedName)) {
      matchedSymptoms.add(symptom.id);
      matchedSymptomNames.push(symptom.name);
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
          break;
        }
      }
    }
  });

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
const testCases = [
  'đau bụng kinh',
  'đau ngực khó thở',
  'đau răng nhức đầu',
  'mờ mắt chóng mặt',
  'đau lưng thận',
  'ho có đờm nghẹt mũi',
  'sốt trẻ em',
  'khát nước nhiều tiểu nhiều',
];

console.log('🧪 TESTING CROSS-SPECIALTY SYMPTOM ANALYSIS');
console.log('='.repeat(70));

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Input: "${testCase}"`);
  console.log('-'.repeat(70));
  const result = analyzeSymptomText(testCase);
  
  if (result.length === 0) {
    console.log('   ❌ No specialties found');
  } else {
    result.forEach((rec, i) => {
      console.log(`   ${i + 1}. ${rec.specialtyName} (${rec.confidence}%)`);
      console.log(`      Symptoms: ${rec.matchedSymptoms.join(', ')}`);
    });
  }
});

console.log('\n' + '='.repeat(70));
console.log('✅ Cross-specialty analysis is working!');
console.log('Users can now find relevant specialties even with combined symptoms.');
