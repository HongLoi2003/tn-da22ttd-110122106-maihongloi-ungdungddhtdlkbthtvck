// AI Diagnostic Service - Phân tích triệu chứng nâng cao

export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  frequency: string;
}

export interface DiagnosticResult {
  possibleConditions: Condition[];
  recommendedSpecialty: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedDoctors: string[];
  nextSteps: string[];
  confidence: number;
}

export interface Condition {
  name: string;
  probability: number;
  description: string;
  symptoms: string[];
  riskFactors: string[];
}

class AIDignosticService {
  // Database triệu chứng và bệnh
  private conditionsDatabase = {
    // Tim mạch
    'heart_attack': {
      name: 'Nhồi máu cơ tim',
      symptoms: ['đau ngực', 'khó thở', 'đổ mồ hôi lạnh', 'buồn nôn', 'chóng mặt'],
      specialty: 'Tim mạch',
      urgency: 'emergency' as const,
      riskFactors: ['tuổi cao', 'hút thuốc', 'béo phì', 'tiểu đường', 'huyết áp cao'],
    },
    'angina': {
      name: 'Đau thắt ngực',
      symptoms: ['đau ngực', 'khó thở', 'mệt mỏi'],
      specialty: 'Tim mạch',
      urgency: 'high' as const,
      riskFactors: ['tuổi cao', 'cholesterol cao', 'hút thuốc'],
    },
    'arrhythmia': {
      name: 'Rối loạn nhịp tim',
      symptoms: ['tim đập nhanh', 'chóng mặt', 'khó thở', 'đau ngực'],
      specialty: 'Tim mạch',
      urgency: 'medium' as const,
      riskFactors: ['stress', 'caffeine', 'rượu'],
    },

    // Hô hấp
    'pneumonia': {
      name: 'Viêm phổi',
      symptoms: ['ho', 'sốt', 'khó thở', 'đau ngực khi thở', 'mệt mỏi'],
      specialty: 'Hô hấp',
      urgency: 'high' as const,
      riskFactors: ['tuổi cao', 'hút thuốc', 'bệnh mạn tính'],
    },
    'asthma': {
      name: 'Hen suyễn',
      symptoms: ['khó thở', 'thở khò khè', 'ho', 'tức ngực'],
      specialty: 'Hô hấp',
      urgency: 'medium' as const,
      riskFactors: ['dị ứng', 'ô nhiễm không khí', 'di truyền'],
    },
    'bronchitis': {
      name: 'Viêm phế quản',
      symptoms: ['ho có đờm', 'khó thở', 'mệt mỏi', 'sốt nhẹ'],
      specialty: 'Hô hấp',
      urgency: 'low' as const,
      riskFactors: ['hút thuốc', 'ô nhiễm không khí'],
    },

    // Tiêu hóa
    'gastritis': {
      name: 'Viêm dạ dày',
      symptoms: ['đau bụng trên', 'buồn nôn', 'ợ hơi', 'đầy bụng'],
      specialty: 'Tiêu hóa',
      urgency: 'low' as const,
      riskFactors: ['stress', 'rượu', 'thuốc giảm đau'],
    },
    'appendicitis': {
      name: 'Viêm ruột thừa',
      symptoms: ['đau bụng dưới bên phải', 'buồn nôn', 'sốt', 'mất cảm giác ăn'],
      specialty: 'Tiêu hóa',
      urgency: 'emergency' as const,
      riskFactors: ['tuổi 10-30'],
    },
    'ibs': {
      name: 'Hội chứng ruột kích thích',
      symptoms: ['đau bụng', 'tiêu chảy', 'táo bón', 'đầy hơi'],
      specialty: 'Tiêu hóa',
      urgency: 'low' as const,
      riskFactors: ['stress', 'chế độ ăn'],
    },

    // Thần kinh
    'migraine': {
      name: 'Đau nửa đầu',
      symptoms: ['đau đầu dữ dội', 'buồn nôn', 'nhạy cảm ánh sáng', 'chóng mặt'],
      specialty: 'Thần kinh',
      urgency: 'medium' as const,
      riskFactors: ['stress', 'di truyền', 'thay đổi hormone'],
    },
    'stroke': {
      name: 'Đột quỵ',
      symptoms: ['yếu nửa người', 'méo miệng', 'nói khó', 'chóng mặt dữ dội'],
      specialty: 'Thần kinh',
      urgency: 'emergency' as const,
      riskFactors: ['tuổi cao', 'huyết áp cao', 'tiểu đường', 'hút thuốc'],
    },

    // Da liễu
    'eczema': {
      name: 'Viêm da cơ địa',
      symptoms: ['ngứa da', 'da khô', 'phát ban đỏ', 'bong tróc'],
      specialty: 'Da liễu',
      urgency: 'low' as const,
      riskFactors: ['di truyền', 'dị ứng', 'da khô'],
    },
    'psoriasis': {
      name: 'Vẩy nến',
      symptoms: ['mảng da đỏ', 'vảy trắng', 'ngứa', 'da khô nứt'],
      specialty: 'Da liễu',
      urgency: 'low' as const,
      riskFactors: ['di truyền', 'stress', 'nhiễm trùng'],
    },
  };

  // Phân tích triệu chứng
  async analyzeSymptoms(symptoms: Symptom[]): Promise<DiagnosticResult> {
    const symptomNames = symptoms.map(s => s.name.toLowerCase());
    const severities = symptoms.map(s => s.severity);
    
    // Tính điểm cho mỗi bệnh
    const conditionScores: { [key: string]: number } = {};
    
    for (const [conditionId, condition] of Object.entries(this.conditionsDatabase)) {
      let score = 0;
      let matchedSymptoms = 0;
      
      for (const symptom of condition.symptoms) {
        if (symptomNames.some(s => s.includes(symptom) || symptom.includes(s))) {
          matchedSymptoms++;
          score += 1;
        }
      }
      
      // Tính tỷ lệ khớp
      const matchRatio = matchedSymptoms / condition.symptoms.length;
      conditionScores[conditionId] = matchRatio * 100;
    }
    
    // Sắp xếp theo điểm
    const sortedConditions = Object.entries(conditionScores)
      .filter(([_, score]) => score > 20) // Chỉ lấy những bệnh có độ khớp > 20%
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3); // Lấy top 3
    
    // Tạo kết quả
    const possibleConditions: Condition[] = sortedConditions.map(([id, probability]) => {
      const condition = this.conditionsDatabase[id as keyof typeof this.conditionsDatabase];
      return {
        name: condition.name,
        probability: Math.round(probability),
        description: `Có thể là ${condition.name} dựa trên các triệu chứng bạn mô tả.`,
        symptoms: condition.symptoms,
        riskFactors: condition.riskFactors,
      };
    });
    
    // Xác định chuyên khoa
    const topCondition = sortedConditions[0];
    const recommendedSpecialty = topCondition 
      ? this.conditionsDatabase[topCondition[0] as keyof typeof this.conditionsDatabase].specialty
      : 'Nội tổng quát';
    
    // Xác định mức độ khẩn cấp
    const hasEmergencySymptoms = severities.includes('severe');
    const topUrgency = topCondition
      ? this.conditionsDatabase[topCondition[0] as keyof typeof this.conditionsDatabase].urgency
      : 'low';
    
    const urgencyLevel = hasEmergencySymptoms ? 'emergency' : topUrgency;
    
    // Gợi ý bác sĩ (mock data)
    const recommendedDoctors = this.getDoctorsBySpecialty(recommendedSpecialty);
    
    // Các bước tiếp theo
    const nextSteps = this.getNextSteps(urgencyLevel, recommendedSpecialty);
    
    // Độ tin cậy
    const confidence = sortedConditions.length > 0 ? sortedConditions[0][1] : 0;
    
    return {
      possibleConditions,
      recommendedSpecialty,
      urgencyLevel,
      recommendedDoctors,
      nextSteps,
      confidence: Math.round(confidence),
    };
  }
  
  private getDoctorsBySpecialty(specialty: string): string[] {
    const doctorMap: { [key: string]: string[] } = {
      'Tim mạch': ['BS. Nguyễn Văn An', 'BS. Trần Minh Đức', 'BS. Lê Thị Hương'],
      'Hô hấp': ['BS. Vũ Thanh Tùng', 'BS. Đặng Thị Mai', 'BS. Lý Văn Nam'],
      'Tiêu hóa': ['BS. Phạm Văn Hải', 'BS. Nguyễn Thị Lan', 'BS. Hoàng Minh Tuấn'],
      'Thần kinh': ['BS. Cao Văn Dũng', 'BS. Phan Thị Hoa', 'BS. Đinh Quang Minh'],
      'Da liễu': ['BS. Trần Thị Lan', 'BS. Ngô Văn Phúc', 'BS. Lê Thị Hạnh'],
      'Nội tổng quát': ['BS. Nguyễn Văn Bình', 'BS. Trương Thị Nga', 'BS. Lê Minh Tâm'],
    };
    
    return doctorMap[specialty] || doctorMap['Nội tổng quát'];
  }
  
  private getNextSteps(urgency: string, specialty: string): string[] {
    if (urgency === 'emergency') {
      return [
        '🚨 Đến cơ sở y tế gần nhất NGAY LẬP TỨC',
        '📞 Gọi cấp cứu 115',
        '⚠️ Không tự ý dùng thuốc',
      ];
    }
    
    if (urgency === 'high') {
      return [
        '🏥 Đặt lịch khám trong vòng 24 giờ',
        '📋 Chuẩn bị danh sách triệu chứng chi tiết',
        '💊 Không tự ý dùng thuốc mạnh',
      ];
    }
    
    if (urgency === 'medium') {
      return [
        '📅 Đặt lịch khám trong vòng 3-5 ngày',
        '📝 Theo dõi triệu chứng hàng ngày',
        '💧 Uống đủ nước, nghỉ ngơi hợp lý',
      ];
    }
    
    return [
      '📆 Đặt lịch khám trong vòng 1-2 tuần',
      '🏃 Duy trì lối sống lành mạnh',
      '📊 Theo dõi triệu chứng',
    ];
  }
  
  // Đánh giá mức độ nghiêm trọng
  assessSeverity(symptoms: Symptom[]): 'mild' | 'moderate' | 'severe' {
    const severeCount = symptoms.filter(s => s.severity === 'severe').length;
    const moderateCount = symptoms.filter(s => s.severity === 'moderate').length;
    
    if (severeCount > 0) return 'severe';
    if (moderateCount >= 2) return 'moderate';
    return 'mild';
  }
  
  // Gợi ý câu hỏi thêm
  getSuggestedQuestions(symptoms: Symptom[]): string[] {
    const questions = [
      'Triệu chứng xuất hiện từ bao lâu?',
      'Có yếu tố nào làm triệu chứng tăng/giảm không?',
      'Bạn có tiền sử bệnh lý gì không?',
      'Có ai trong gia đình bị bệnh tương tự không?',
      'Bạn đang dùng thuốc gì không?',
    ];
    
    return questions;
  }
}

export default new AIDignosticService();
