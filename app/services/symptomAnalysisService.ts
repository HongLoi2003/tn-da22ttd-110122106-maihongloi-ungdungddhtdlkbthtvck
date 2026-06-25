import symptomsData from '../../symptoms-mapping.json';

export interface SymptomItem {
  id: number;
  name: string;
  icon: string;
  keywords?: string[];
  specialtyIds?: number[];
}

export interface SpecialtyRecommendation {
  specialtyId: number;
  specialtyName: string;
  confidence: number;
  matchedSymptoms: string[];
}

interface SymptomMatch {
  symptom: SymptomItem;
  score: number;
}

class SymptomAnalysisService {
  private symptoms: SymptomItem[] = symptomsData.symptoms;
  private mappings: any[] = symptomsData.mappings;

  /**
   * Chuẩn hóa text: loại bỏ dấu, chuyển thường, loại bỏ khoảng trắng thừa
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim();
  }

  /**
   * Tính độ tương đồng giữa 2 chuỗi (0-100%)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalizeText(str1);
    const normalized2 = this.normalizeText(str2);

    // Kiểm tra chứa hoàn toàn
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 100;
    }

    // Tách thành từng từ
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

  /**
   * Tính độ tương đồng với keywords (0-100%)
   * Ưu tiên exact match hơn partial match
   */
  private calculateSimilarityWithKeywords(input: string, symptom: SymptomItem): number {
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
    // Nếu input dài hơn và chứa keyword, giảm điểm
    if (maxScore === 100) {
      const inputWords = normalizedInput.split(/\s+/);
      const nameWords = normalizedName.split(/\s+/);
      
      // Nếu input có nhiều từ hơn tên triệu chứng, có thể là partial match
      if (inputWords.length > nameWords.length) {
        // Kiểm tra xem có phải tất cả từ của tên triệu chứng đều có trong input không
        const allWordsMatch = nameWords.every(word => 
          inputWords.some(iw => iw.includes(word) || word.includes(iw))
        );
        
        if (allWordsMatch && inputWords.length > nameWords.length) {
          // Đây là partial match, giảm điểm
          maxScore = 90;
        }
      }
    }
    
    return maxScore;
  }

  /**
   * Lấy danh sách triệu chứng phổ biến
   */
  getCommonSymptoms(): SymptomItem[] {
    return this.symptoms;
  }

  /**
   * Tìm kiếm triệu chứng theo từ khóa với fuzzy matching
   */
  searchSymptoms(keyword: string): SymptomItem[] {
    const normalizedKeyword = this.normalizeText(keyword);
    if (!normalizedKeyword) return [];
    
    return this.symptoms
      .map(symptom => ({
        symptom,
        similarity: this.calculateSimilarityWithKeywords(keyword, symptom)
      }))
      .filter(item => item.similarity >= 50) // Chỉ lấy độ tương đồng >= 50%
      .sort((a, b) => b.similarity - a.similarity) // Sắp xếp theo độ tương đồng
      .slice(0, 10) // Lấy top 10
      .map(item => item.symptom);
  }

  /**
   * Phân tích triệu chứng từ text tự do (không cần tách thành mảng)
   * Tự động tìm keywords trong text và match với database
   */
  analyzeSymptomText(inputText: string): SpecialtyRecommendation[] {
    console.log('🔍 [SYMPTOM_ANALYSIS] Analyzing text:', inputText);

    const normalizedInput = this.normalizeText(inputText);
    const matchedSymptoms: Set<number> = new Set();
    const matchedSymptomNames: string[] = [];

    // Helper function: Kiểm tra whole-word match (tránh partial match)
    const isWholeWordMatch = (text: string, keyword: string): boolean => {
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

    // Tìm tất cả triệu chứng có keyword xuất hiện trong text
    this.symptoms.forEach(symptom => {
      // Kiểm tra tên triệu chứng (yêu cầu whole-word match)
      const normalizedName = this.normalizeText(symptom.name);
      if (isWholeWordMatch(normalizedInput, normalizedName)) {
        matchedSymptoms.add(symptom.id);
        matchedSymptomNames.push(symptom.name);
        console.log(`✅ [SYMPTOM_ANALYSIS] Found: "${symptom.name}" (from name)`);
        return;
      }

      // Kiểm tra keywords (yêu cầu whole-word match)
      if (symptom.keywords && symptom.keywords.length > 0) {
        for (const keyword of symptom.keywords) {
          const normalizedKeyword = this.normalizeText(keyword);
          
          // Bỏ qua keyword quá ngắn hoặc chung chung (1-2 ký tự, trừ keyword cụ thể)
          if (normalizedKeyword.length <= 2 && !['ho', 'oi', 'o'].includes(normalizedKeyword)) {
            continue;
          }
          
          if (isWholeWordMatch(normalizedInput, normalizedKeyword)) {
            matchedSymptoms.add(symptom.id);
            matchedSymptomNames.push(symptom.name);
            console.log(`✅ [SYMPTOM_ANALYSIS] Found: "${symptom.name}" (keyword: "${keyword}")`);
            break;
          }
        }
      }
    });

    console.log('✅ [SYMPTOM_ANALYSIS] Matched symptoms:', matchedSymptomNames);

    if (matchedSymptoms.size === 0) {
      console.warn('⚠️ [SYMPTOM_ANALYSIS] No symptoms matched');
      return [];
    }

    // Tính điểm cho mỗi chuyên khoa
    const specialtyScores: Map<number, { name: string; matchCount: number; matchedSymptoms: string[] }> = new Map();

    this.mappings.forEach(mapping => {
      let matchCount = 0;
      const matchedInThisSpecialty: string[] = [];

      mapping.symptomIds.forEach((symptomId: number) => {
        if (matchedSymptoms.has(symptomId)) {
          matchCount++;
          const symptomName = this.symptoms.find(s => s.id === symptomId)?.name;
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

    // Chuyển đổi thành mảng và tính % confidence
    const recommendations: SpecialtyRecommendation[] = Array.from(specialtyScores.entries())
      .map(([id, data]) => {
        // Công thức đơn giản: mỗi triệu chứng = 30%, tối đa 100%
        const confidence = Math.min(100, data.matchCount * 30);
        
        return {
          specialtyId: id,
          specialtyName: data.name,
          confidence,
          matchedSymptoms: data.matchedSymptoms
        };
      })
      .sort((a, b) => {
        // Sắp xếp theo số triệu chứng khớp trước, sau đó theo confidence
        const countDiff = b.matchedSymptoms.length - a.matchedSymptoms.length;
        if (countDiff !== 0) return countDiff;
        return b.confidence - a.confidence;
      });

    console.log('📊 [SYMPTOM_ANALYSIS] Recommendations:', recommendations);
    return recommendations;
  }

  /**
   * Phân tích triệu chứng và gợi ý chuyên khoa với fuzzy matching nâng cao
   * (Giữ lại để backward compatibility)
   */
  analyzeSymptoms(symptomNames: string[]): SpecialtyRecommendation[] {
    // Nếu chỉ có 1 phần tử và nó là câu dài, dùng analyzeSymptomText
    if (symptomNames.length === 1 && symptomNames[0].split(' ').length > 3) {
      return this.analyzeSymptomText(symptomNames[0]);
    }

    console.log('🔍 [SYMPTOM_ANALYSIS] Analyzing symptoms:', symptomNames);

    // Chuẩn hóa tên triệu chứng
    const normalizedSymptoms = symptomNames.map(s => this.normalizeText(s));

    // Tìm ID của các triệu chứng với fuzzy matching
    const matchedSymptomIds: number[] = [];
    const matchedSymptomNames: string[] = [];
    const matchScores: { [key: number]: number } = {}; // Lưu điểm khớp

    normalizedSymptoms.forEach(symptomName => {
      let bestMatch: SymptomMatch | null = null;

      // Tìm triệu chứng khớp nhất
      this.symptoms.forEach(symptom => {
        const score = this.calculateSimilarityWithKeywords(symptomName, symptom);
        
        if (score >= 50) { // Ngưỡng tối thiểu 50%
          if (bestMatch === null || score > bestMatch.score) {
            bestMatch = { symptom, score } as SymptomMatch;
          }
        }
      });

      if (bestMatch !== null) {
        const match = bestMatch as SymptomMatch;
        if (!matchedSymptomIds.includes(match.symptom.id)) {
          matchedSymptomIds.push(match.symptom.id);
          matchedSymptomNames.push(match.symptom.name);
          matchScores[match.symptom.id] = match.score;
          console.log(`✅ [SYMPTOM_ANALYSIS] Match: "${symptomName}" → "${match.symptom.name}" (${match.score}%)`);
        }
      } else {
        console.log(`⚠️ [SYMPTOM_ANALYSIS] No match for: "${symptomName}"`);
      }
    });

    console.log('✅ [SYMPTOM_ANALYSIS] Matched symptom IDs:', matchedSymptomIds);
    console.log('✅ [SYMPTOM_ANALYSIS] Matched symptom names:', matchedSymptomNames);

    if (matchedSymptomIds.length === 0) {
      console.warn('⚠️ [SYMPTOM_ANALYSIS] No symptoms matched');
      return [];
    }

    // Tính điểm cho mỗi chuyên khoa
    const specialtyScores: Map<number, { name: string; score: number; matchedSymptoms: string[] }> = new Map();

    this.mappings.forEach(mapping => {
      const matchCount = mapping.symptomIds.filter((id: number) =>
        matchedSymptomIds.includes(id)
      ).length;

      if (matchCount > 0) {
        // Tính điểm dựa trên:
        // 1. Số lượng triệu chứng khớp
        // 2. Tỷ lệ khớp so với tổng triệu chứng của chuyên khoa
        // 3. Độ tin cậy của mapping
        const matchRatio = matchCount / mapping.symptomIds.length;
        const score = matchRatio * mapping.confidence;
        
        if (!specialtyScores.has(mapping.specialtyId)) {
          specialtyScores.set(mapping.specialtyId, {
            name: mapping.specialtyName,
            score: 0,
            matchedSymptoms: []
          });
        }

        const current = specialtyScores.get(mapping.specialtyId)!;
        current.score = Math.max(current.score, score);
        
        // Thêm triệu chứng khớp
        mapping.symptomIds.forEach((id: number) => {
          if (matchedSymptomIds.includes(id)) {
            const symptomName = this.symptoms.find(s => s.id === id)?.name;
            if (symptomName && !current.matchedSymptoms.includes(symptomName)) {
              current.matchedSymptoms.push(symptomName);
            }
          }
        });
      }
    });

    // Chuyển đổi thành mảng và sắp xếp theo điểm
    const recommendations: SpecialtyRecommendation[] = Array.from(specialtyScores.entries())
      .map(([id, data]) => ({
        specialtyId: id,
        specialtyName: data.name,
        confidence: Math.round(data.score),
        matchedSymptoms: data.matchedSymptoms
      }))
      .sort((a, b) => b.confidence - a.confidence);

    console.log('📊 [SYMPTOM_ANALYSIS] Recommendations:', recommendations);
    return recommendations;
  }

  /**
   * Lấy triệu chứng theo ID
   */
  getSymptomById(id: number): SymptomItem | undefined {
    return this.symptoms.find(s => s.id === id);
  }

  /**
   * Lấy tất cả triệu chứng
   */
  getAllSymptoms(): SymptomItem[] {
    return this.symptoms;
  }
}

export default new SymptomAnalysisService();
