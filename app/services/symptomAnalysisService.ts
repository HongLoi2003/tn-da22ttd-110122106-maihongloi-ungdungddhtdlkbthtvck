import symptomsData from '@/symptoms-mapping.json';

export interface SymptomItem {
  id: number;
  name: string;
  icon: string;
}

export interface SpecialtyRecommendation {
  specialtyId: number;
  specialtyName: string;
  confidence: number;
  matchedSymptoms: string[];
}

class SymptomAnalysisService {
  private symptoms: SymptomItem[] = symptomsData.symptoms;
  private mappings: any[] = symptomsData.mappings;

  /**
   * Lấy danh sách triệu chứng phổ biến
   */
  getCommonSymptoms(): SymptomItem[] {
    return this.symptoms;
  }

  /**
   * Tìm kiếm triệu chứng theo từ khóa
   */
  searchSymptoms(keyword: string): SymptomItem[] {
    const lowerKeyword = keyword.toLowerCase().trim();
    if (!lowerKeyword) return [];
    
    return this.symptoms.filter(symptom =>
      symptom.name.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Phân tích triệu chứng và gợi ý chuyên khoa
   */
  analyzeSymptoms(symptomNames: string[]): SpecialtyRecommendation[] {
    console.log('🔍 [SYMPTOM_ANALYSIS] Analyzing symptoms:', symptomNames);

    // Chuẩn hóa tên triệu chứng
    const normalizedSymptoms = symptomNames.map(s => s.toLowerCase().trim());

    // Tìm ID của các triệu chứng
    const matchedSymptomIds: number[] = [];
    const matchedSymptomNames: string[] = [];

    normalizedSymptoms.forEach(symptomName => {
      const found = this.symptoms.find(s => s.name.toLowerCase() === symptomName);
      if (found) {
        matchedSymptomIds.push(found.id);
        matchedSymptomNames.push(found.name);
      }
    });

    console.log('✅ [SYMPTOM_ANALYSIS] Matched symptom IDs:', matchedSymptomIds);

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
        const score = (matchCount / mapping.symptomIds.length) * mapping.confidence;
        
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
