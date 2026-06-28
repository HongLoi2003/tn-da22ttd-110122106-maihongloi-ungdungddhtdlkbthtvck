// Logic xử lý follow-up questions

import { FollowUpQuestion, getFollowUpQuestions, specialtyNameToKey } from './followUpQuestions';

export interface FollowUpState {
  currentSpecialty: string;
  askedQuestions: string[];
  symptomScore: { [key: string]: number };
  followUpMode: boolean;
  questionCount: number;
}

export interface FollowUpResponse {
  shouldAskFollowUp: boolean;
  question?: FollowUpQuestion;
  finalResult?: {
    specialty: string;
    confidence: number;
    relatedSpecialties: { name: string; confidence: number }[];
  };
}

// Xử lý câu trả lời của user cho follow-up question
export const processFollowUpAnswer = (
  answer: string,
  currentQuestion: FollowUpQuestion,
  state: FollowUpState
): { updatedScore: { [key: string]: number }; points: number } => {
  const lowerAnswer = answer.toLowerCase().trim();
  const updatedScore = { ...state.symptomScore };
  let points = 0;

  // Tính điểm dựa trên câu trả lời
  if (lowerAnswer === 'có' || lowerAnswer === 'yes' || lowerAnswer === 'có ạ') {
    points = currentQuestion.weight * 1.0; // 100% điểm
  } else if (lowerAnswer === 'không' || lowerAnswer === 'no' || lowerAnswer === 'không có') {
    points = 0; // 0 điểm
  } else {
    // Nếu user tự nhập text, phân tích keyword
    const hasPositiveKeywords = currentQuestion.relatedSymptoms.some(symptom => 
      lowerAnswer.includes(symptom.toLowerCase())
    );
    if (hasPositiveKeywords) {
      points = currentQuestion.weight * 0.8; // 80% điểm nếu có keyword liên quan
    }
  }

  // Cập nhật điểm cho chuyên khoa
  const specialty = currentQuestion.specialty;
  updatedScore[specialty] = (updatedScore[specialty] || 0) + points;

  return { updatedScore, points };
};

// Quyết định có nên hỏi thêm câu hỏi follow-up không
export const shouldContinueFollowUp = (
  state: FollowUpState,
  maxQuestions: number = 3
): FollowUpResponse => {
  // Nếu đã hỏi đủ số câu hỏi, kết thúc
  if (state.questionCount >= maxQuestions) {
    return {
      shouldAskFollowUp: false,
      finalResult: calculateFinalResult(state.symptomScore)
    };
  }

  // Lấy câu hỏi tiếp theo
  const specialtyKey = state.currentSpecialty;
  const nextQuestions = getFollowUpQuestions(specialtyKey, state.askedQuestions, 1);

  if (nextQuestions.length === 0) {
    // Không còn câu hỏi nào, kết thúc
    return {
      shouldAskFollowUp: false,
      finalResult: calculateFinalResult(state.symptomScore)
    };
  }

  return {
    shouldAskFollowUp: true,
    question: nextQuestions[0]
  };
};

// Tính kết quả cuối cùng
export const calculateFinalResult = (
  symptomScore: { [key: string]: number }
): {
  specialty: string;
  confidence: number;
  relatedSpecialties: { name: string; confidence: number }[];
} => {
  // Chuyển đổi scores thành array và sắp xếp
  const sortedScores = Object.entries(symptomScore)
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => b.score - a.score);

  if (sortedScores.length === 0) {
    return {
      specialty: '',
      confidence: 0,
      relatedSpecialties: []
    };
  }

  const maxScore = sortedScores[0].score;
  const totalScore = sortedScores.reduce((sum, item) => sum + item.score, 0);

  // Map key to name
  const keyToName: { [key: string]: string } = {
    'than_kinh': 'Thần kinh',
    'ho_hap': 'Hô hấp',
    'tieu_hoa': 'Tiêu hóa',
    'tim_mach': 'Tim mạch',
    'xuong_khop': 'Cơ xương khớp',
    'da_lieu': 'Da liễu',
    'tai_mui_hong': 'Tai mũi họng',
    'mat': 'Mắt',
    'nhi_khoa': 'Nhi khoa',
    'noi_tiet': 'Nội tiết',
    'rang_ham_mat': 'Răng hàm mặt',
    'san_phu_khoa': 'Sản phụ khoa'
  };

  // Tính confidence
  const mainSpecialty = sortedScores[0];
  const confidence = Math.min(Math.round((mainSpecialty.score / (maxScore + 10)) * 100), 98);

  // Lấy các chuyên khoa liên quan (top 2-3)
  const relatedSpecialties = sortedScores
    .slice(1, 3)
    .filter(item => item.score > 0)
    .map(item => ({
      name: keyToName[item.key] || item.key,
      confidence: Math.min(Math.round((item.score / maxScore) * 100), 95)
    }));

  return {
    specialty: keyToName[mainSpecialty.key] || mainSpecialty.key,
    confidence,
    relatedSpecialties
  };
};

// Khởi tạo follow-up mode với chuyên khoa được chọn
export const initializeFollowUp = (
  specialtyName: string,
  initialScore: number
): { specialtyKey: string; initialSymptomScore: { [key: string]: number } } => {
  const specialtyKey = specialtyNameToKey[specialtyName] || '';
  const initialSymptomScore: { [key: string]: number } = {};
  
  if (specialtyKey) {
    initialSymptomScore[specialtyKey] = initialScore;
  }

  return { specialtyKey, initialSymptomScore };
};
