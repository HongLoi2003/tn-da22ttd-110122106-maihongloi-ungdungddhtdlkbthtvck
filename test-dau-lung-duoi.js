const symptomsData = require('./symptoms-mapping.json');

// Simulate the symptom analysis service
class TestSymptomAnalysis {
  constructor() {
    this.symptoms = symptomsData.symptoms;
    this.mappings = symptomsData.mappings;
  }

  normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim();
  }

  calculateSimilarity(str1, str2) {
    const normalized1 = this.normalizeText(str1);
    const normalized2 = this.normalizeText(str2);

    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 100;
    }

    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);

    let matchCount = 0;
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1.includes(word2) || word2.includes(word1)) {
          matchCount++;
        }
      });
    });

    const maxWords = Math.max(words1.length, words2.length);
    return maxWords > 0 ? Math.round((matchCount / maxWords) * 100) : 0;
  }

  calculateSimilarityWithKeywords(input, symptom) {
    const normalizedInput = this.normalizeText(input);
    
    // Kiểm tra exact match với tên triệu chứng
    const normalizedName = this.normalizeText(symptom.name);
    if (normalizedInput === normalizedName) {
      return 100;
    }
    
    // Kiểm tra exact match với keywords
    if (symptom.keywords && symptom.keywords.length > 0) {
      for (const keyword of symptom.keywords) {
        const normalizedKeyword = this.normalizeText(keyword);
        if (normalizedInput === normalizedKeyword) {
          return 100;
        }
      }
    }
    
    // Nếu không có exact match, tính similarity thông thường
    let maxScore = this.calculateSimilarity(input, symptom.name);
    
    if (symptom.keywords && symptom.keywords.length > 0) {
      symptom.keywords.forEach(keyword => {
        const keywordScore = this.calculateSimilarity(normalizedInput, keyword);
        maxScore = Math.max(maxScore, keywordScore);
      });
    }
    
    // Giảm điểm nếu chỉ là partial match
    if (maxScore === 100) {
      const inputWords = normalizedInput.split(/\s+/);
      const nameWords = normalizedName.split(/\s+/);
      
      if (inputWords.length > nameWords.length) {
        const allWordsMatch = nameWords.every(word => 
          inputWords.some(iw => iw.includes(word) || word.includes(iw))
        );
        
        if (allWordsMatch && inputWords.length > nameWords.length) {
          maxScore = 90;
        }
      }
    }
    
    return maxScore;
  }

  analyzeSymptoms(symptomNames) {
    console.log('🔍 Analyzing symptoms:', symptomNames);
    console.log('');

    const normalizedSymptoms = symptomNames.map(s => this.normalizeText(s));
    const matchedSymptomIds = [];
    const matchedSymptomNames = [];

    normalizedSymptoms.forEach(symptomName => {
      let bestMatch = null;

      this.symptoms.forEach(symptom => {
        const score = this.calculateSimilarityWithKeywords(symptomName, symptom);
        
        if (score >= 50) {
          if (bestMatch === null || score > bestMatch.score) {
            bestMatch = { symptom, score };
          }
        }
      });

      if (bestMatch !== null) {
        if (!matchedSymptomIds.includes(bestMatch.symptom.id)) {
          matchedSymptomIds.push(bestMatch.symptom.id);
          matchedSymptomNames.push(bestMatch.symptom.name);
          console.log(`✅ Match: "${symptomName}" → "${bestMatch.symptom.name}" (${bestMatch.score}%)`);
          console.log(`   SpecialtyIds: [${bestMatch.symptom.specialtyIds.join(', ')}]`);
          bestMatch.symptom.specialtyIds.forEach(id => {
            const mapping = this.mappings.find(m => m.specialtyId === id);
            console.log(`     - ${mapping.specialtyName}`);
          });
        }
      } else {
        console.log(`⚠️ No match for: "${symptomName}"`);
      }
    });

    console.log('');
    console.log('📊 Matched symptom IDs:', matchedSymptomIds);
    console.log('📊 Matched symptom names:', matchedSymptomNames);

    if (matchedSymptomIds.length === 0) {
      console.warn('⚠️ No symptoms matched');
      return [];
    }

    // Calculate specialty scores
    const specialtyScores = new Map();

    this.mappings.forEach(mapping => {
      const matchCount = mapping.symptomIds.filter(id =>
        matchedSymptomIds.includes(id)
      ).length;

      if (matchCount > 0) {
        const matchRatio = matchCount / mapping.symptomIds.length;
        const score = matchRatio * mapping.confidence;
        
        if (!specialtyScores.has(mapping.specialtyId)) {
          specialtyScores.set(mapping.specialtyId, {
            name: mapping.specialtyName,
            score: 0,
            matchedSymptoms: []
          });
        }

        const current = specialtyScores.get(mapping.specialtyId);
        current.score = Math.max(current.score, score);
        
        mapping.symptomIds.forEach(id => {
          if (matchedSymptomIds.includes(id)) {
            const symptomName = this.symptoms.find(s => s.id === id)?.name;
            if (symptomName && !current.matchedSymptoms.includes(symptomName)) {
              current.matchedSymptoms.push(symptomName);
            }
          }
        });
      }
    });

    const recommendations = Array.from(specialtyScores.entries())
      .map(([id, data]) => ({
        specialtyId: id,
        specialtyName: data.name,
        confidence: Math.round(data.score),
        matchedSymptoms: data.matchedSymptoms
      }))
      .sort((a, b) => b.confidence - a.confidence);

    console.log('');
    console.log('🏥 Specialty Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.specialtyName} (${rec.confidence}% confidence)`);
      console.log(`   Matched symptoms: ${rec.matchedSymptoms.join(', ')}`);
    });

    return recommendations;
  }
}

// Test cases
const service = new TestSymptomAnalysis();

console.log('='.repeat(70));
console.log('TEST 1: "đau lưng dưới"');
console.log('='.repeat(70));
service.analyzeSymptoms(['đau lưng dưới']);

console.log('\n');
console.log('='.repeat(70));
console.log('TEST 2: "dau lung duoi" (không dấu)');
console.log('='.repeat(70));
service.analyzeSymptoms(['dau lung duoi']);

console.log('\n');
console.log('='.repeat(70));
console.log('TEST 3: "đau lưng" (chung chung)');
console.log('='.repeat(70));
service.analyzeSymptoms(['đau lưng']);

console.log('\n');
console.log('='.repeat(70));
console.log('TEST 4: "đau lưng dưới" + "đau bụng dưới"');
console.log('='.repeat(70));
service.analyzeSymptoms(['đau lưng dưới', 'đau bụng dưới']);
