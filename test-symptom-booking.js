const fs = require('fs');

// Load data
const symptomsData = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf-8'));

// Normalize text function
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

// Analyze symptom text
function analyzeSymptomText(inputText) {
  console.log('🔍 Analyzing:', inputText);
  
  const normalizedInput = normalizeText(inputText);
  const matchedSymptoms = new Set();
  const matchedSymptomNames = [];
  
  // Helper function
  const isWholeWordMatch = (text, keyword) => {
    if (keyword.length <= 2) {
      const words = text.split(/\s+/);
      return words.includes(keyword);
    }
    const regex = new RegExp(`(^|\\s)${keyword}(\\s|$)`, 'i');
    return regex.test(text) || text.includes(keyword);
  };
  
  // Find matching symptoms
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
  
  console.log('✅ Matched symptoms:', matchedSymptomNames);
  
  if (matchedSymptoms.size === 0) {
    console.warn('⚠️ No symptoms matched');
    return [];
  }
  
  // Calculate scores for each specialty
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
      specialtyScores.set(mapping.specialtyId, {
        name: mapping.specialtyName,
        matchCount,
        matchedSymptoms: matchedInThisSpecialty,
        baseConfidence: mapping.confidence
      });
    }
  });
  
  // Convert to array and calculate confidence
  const recommendations = Array.from(specialtyScores.entries())
    .map(([id, data]) => {
      // Formula: matchCount * 30%, but capped by base confidence
      const calculatedConfidence = Math.min(100, data.matchCount * 30);
      const confidence = Math.min(calculatedConfidence, data.baseConfidence);
      
      return {
        specialtyId: id,
        specialtyName: data.name,
        confidence,
        matchedSymptoms: data.matchedSymptoms
      };
    })
    .sort((a, b) => {
      const countDiff = b.matchedSymptoms.length - a.matchedSymptoms.length;
      if (countDiff !== 0) return countDiff;
      return b.confidence - a.confidence;
    });
  
  console.log('📊 Recommendations:', recommendations);
  return recommendations;
}

// Test cases
console.log('\n========== TEST 1: "đau đầu" ==========');
analyzeSymptomText('đau đầu');

console.log('\n========== TEST 2: "choáng" ==========');
analyzeSymptomText('choáng');

console.log('\n========== TEST 3: "đau đầu và chóng mặt" ==========');
analyzeSymptomText('đau đầu và chóng mặt');

console.log('\n========== TEST 4: "tôi bị đau đầu dữ dội, chóng mặt và buồn nôn" ==========');
analyzeSymptomText('tôi bị đau đầu dữ dội, chóng mặt và buồn nôn');
