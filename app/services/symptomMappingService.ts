import symptomsData from '../../symptoms-mapping-300.json';

export interface SymptomItem {
  id: number;
  name: string;
}

export interface SpecialtyMapping {
  symptomIds: number[];
  specialtyId: number;
  specialtyName: string;
  confidence: number;
}

export interface SpecialtyMatch {
  specialtyId: number;
  specialtyName: string;
  matchedSymptoms: SymptomItem[];
  confidence: number;
  matchPercentage: number;
}

class SymptomMappingService {
  private symptoms: SymptomItem[] = symptomsData.symptoms;
  private mappings: SpecialtyMapping[] = symptomsData.mappings;

  // Tìm triệu chứng theo từ khóa
  searchSymptoms(query: string): SymptomItem[] {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    
    return this.symptoms.filter(symptom =>
      symptom.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Giới hạn 10 kết quả
  }

  // Lấy tất cả triệu chứng
  getAllSymptoms(): SymptomItem[] {
    return this.symptoms;
  }

  // Lấy triệu chứng phổ biến (20 triệu chứng đầu tiên)
  getCommonSymptoms(): SymptomItem[] {
    return this.symptoms.slice(0, 20);
  }

  // Phân tích chuyên khoa dựa trên danh sách triệu chứng
  analyzeSymptoms(selectedSymptomIds: number[]): SpecialtyMatch[] {
    if (selectedSymptomIds.length === 0) return [];

    const matches: SpecialtyMatch[] = [];

    this.mappings.forEach(mapping => {
      // Tìm các triệu chứng khớp
      const matchedSymptomIds = selectedSymptomIds.filter(id =>
        mapping.symptomIds.includes(id)
      );

      if (matchedSymptomIds.length > 0) {
        // Tính tỷ lệ khớp
        const matchPercentage = Math.round(
          (matchedSymptomIds.length / selectedSymptomIds.length) * 100
        );

        // Lấy thông tin triệu chứng
        const matchedSymptoms = matchedSymptomIds.map(id =>
          this.symptoms.find(s => s.id === id)!
        );

        matches.push({
          specialtyId: mapping.specialtyId,
          specialtyName: mapping.specialtyName,
          matchedSymptoms,
          confidence: mapping.confidence,
          matchPercentage,
        });
      }
    });

    // Sắp xếp theo tỷ lệ khớp giảm dần
    return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  // Lấy chuyên khoa phù hợp nhất
  getBestMatch(selectedSymptomIds: number[]): SpecialtyMatch | null {
    const matches = this.analyzeSymptoms(selectedSymptomIds);
    return matches.length > 0 ? matches[0] : null;
  }

  // Lấy triệu chứng theo chuyên khoa
  getSymptomsBySpecialty(specialtyName: string): SymptomItem[] {
    const mapping = this.mappings.find(
      m => m.specialtyName.toLowerCase() === specialtyName.toLowerCase()
    );

    if (!mapping) return [];

    return mapping.symptomIds
      .map(id => this.symptoms.find(s => s.id === id))
      .filter((s): s is SymptomItem => s !== undefined);
  }
}

export default new SymptomMappingService();
