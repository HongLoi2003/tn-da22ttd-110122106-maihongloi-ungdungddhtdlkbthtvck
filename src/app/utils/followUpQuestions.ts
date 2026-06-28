// Hệ thống câu hỏi follow-up cho từng chuyên khoa

export interface FollowUpQuestion {
  id: string;
  question: string;
  specialty: string;
  weight: number;
  relatedSymptoms: string[];
}

export const followUpQuestions: { [key: string]: FollowUpQuestion[] } = {
  'than_kinh': [
    {
      id: 'tk_1',
      question: 'Bạn có bị chóng mặt không?',
      specialty: 'than_kinh',
      weight: 9,
      relatedSymptoms: ['chóng mặt', 'hoa mắt', 'choáng']
    },
    {
      id: 'tk_2',
      question: 'Bạn có bị mất ngủ không?',
      specialty: 'than_kinh',
      weight: 8,
      relatedSymptoms: ['mất ngủ', 'khó ngủ', 'thức đêm']
    },
    {
      id: 'tk_3',
      question: 'Bạn có buồn nôn không?',
      specialty: 'than_kinh',
      weight: 7,
      relatedSymptoms: ['buồn nôn', 'nôn', 'ói']
    },
    {
      id: 'tk_4',
      question: 'Bạn có cảm thấy căng thẳng hoặc lo âu không?',
      specialty: 'than_kinh',
      weight: 7,
      relatedSymptoms: ['căng thẳng', 'lo âu', 'stress']
    },
    {
      id: 'tk_5',
      question: 'Bạn có bị tê bì tay chân không?',
      specialty: 'than_kinh',
      weight: 8,
      relatedSymptoms: ['tê bì', 'tê tay', 'tê chân']
    }
  ],
  'ho_hap': [
    {
      id: 'hh_1',
      question: 'Bạn có sốt không?',
      specialty: 'ho_hap',
      weight: 8,
      relatedSymptoms: ['sốt', 'sốt cao', 'nóng']
    },
    {
      id: 'hh_2',
      question: 'Bạn có khó thở không?',
      specialty: 'ho_hap',
      weight: 9,
      relatedSymptoms: ['khó thở', 'thở gấp', 'hụt hơi']
    },
    {
      id: 'hh_3',
      question: 'Bạn có đau họng không?',
      specialty: 'ho_hap',
      weight: 8,
      relatedSymptoms: ['đau họng', 'họng đau', 'viêm họng']
    },
    {
      id: 'hh_4',
      question: 'Bạn có sổ mũi hoặc nghẹt mũi không?',
      specialty: 'ho_hap',
      weight: 7,
      relatedSymptoms: ['sổ mũi', 'nghẹt mũi', 'tắc mũi']
    },
    {
      id: 'hh_5',
      question: 'Ho có đờm không?',
      specialty: 'ho_hap',
      weight: 7,
      relatedSymptoms: ['ho có đờm', 'ho đờm', 'đờm']
    }
  ],
  'tieu_hoa': [
    {
      id: 'th_1',
      question: 'Bạn có tiêu chảy không?',
      specialty: 'tieu_hoa',
      weight: 9,
      relatedSymptoms: ['tiêu chảy', 'ỉa chảy', 'đi ngoài']
    },
    {
      id: 'th_2',
      question: 'Bạn có buồn nôn không?',
      specialty: 'tieu_hoa',
      weight: 8,
      relatedSymptoms: ['buồn nôn', 'nôn', 'ói']
    },
    {
      id: 'th_3',
      question: 'Bạn có cảm thấy đầy hơi hoặc chướng bụng không?',
      specialty: 'tieu_hoa',
      weight: 7,
      relatedSymptoms: ['đầy hơi', 'chướng bụng', 'đầy bụng']
    },
    {
      id: 'th_4',
      question: 'Bạn có táo bón không?',
      specialty: 'tieu_hoa',
      weight: 8,
      relatedSymptoms: ['táo bón', 'táo', 'khó đi ngoài']
    },
    {
      id: 'th_5',
      question: 'Bạn có ợ nóng hoặc ợ chua không?',
      specialty: 'tieu_hoa',
      weight: 7,
      relatedSymptoms: ['ợ nóng', 'ợ chua', 'trào ngược']
    }
  ],
  'tim_mach': [
    {
      id: 'tm_1',
      question: 'Bạn có đau ngực không?',
      specialty: 'tim_mach',
      weight: 10,
      relatedSymptoms: ['đau ngực', 'tức ngực', 'ngực đau']
    },
    {
      id: 'tm_2',
      question: 'Bạn có cảm thấy tim đập nhanh hoặc hồi hộp không?',
      specialty: 'tim_mach',
      weight: 8,
      relatedSymptoms: ['tim đập nhanh', 'hồi hộp', 'tim nhanh']
    },
    {
      id: 'tm_3',
      question: 'Bạn có khó thở không?',
      specialty: 'tim_mach',
      weight: 9,
      relatedSymptoms: ['khó thở', 'thở gấp', 'hụt hơi']
    },
    {
      id: 'tm_4',
      question: 'Bạn có tiền sử huyết áp cao không?',
      specialty: 'tim_mach',
      weight: 8,
      relatedSymptoms: ['huyết áp cao', 'cao huyết áp']
    },
    {
      id: 'tm_5',
      question: 'Bạn có cảm thấy mệt mỏi bất thường không?',
      specialty: 'tim_mach',
      weight: 6,
      relatedSymptoms: ['mệt mỏi', 'mệt', 'yếu']
    }
  ],
  'xuong_khop': [
    {
      id: 'xk_1',
      question: 'Bạn có đau lưng không?',
      specialty: 'xuong_khop',
      weight: 9,
      relatedSymptoms: ['đau lưng', 'nhức lưng', 'lưng đau']
    },
    {
      id: 'xk_2',
      question: 'Khớp có sưng hoặc đỏ không?',
      specialty: 'xuong_khop',
      weight: 8,
      relatedSymptoms: ['sưng khớp', 'khớp sưng', 'đỏ khớp']
    },
    {
      id: 'xk_3',
      question: 'Bạn có khó cử động không?',
      specialty: 'xuong_khop',
      weight: 7,
      relatedSymptoms: ['khó cử động', 'cứng khớp', 'khó di chuyển']
    },
    {
      id: 'xk_4',
      question: 'Bạn có đau vai hoặc đau gối không?',
      specialty: 'xuong_khop',
      weight: 8,
      relatedSymptoms: ['đau vai', 'đau gối', 'nhức vai']
    },
    {
      id: 'xk_5',
      question: 'Cơ có bị nhức mỏi không?',
      specialty: 'xuong_khop',
      weight: 7,
      relatedSymptoms: ['nhức mỏi', 'đau cơ', 'mỏi cơ']
    }
  ],
  'da_lieu': [
    {
      id: 'dl_1',
      question: 'Da có ngứa không?',
      specialty: 'da_lieu',
      weight: 10,
      relatedSymptoms: ['ngứa', 'ngứa ngáy', 'ngứa da']
    },
    {
      id: 'dl_2',
      question: 'Da có nổi mẩn đỏ không?',
      specialty: 'da_lieu',
      weight: 9,
      relatedSymptoms: ['mẩn đỏ', 'nổi mẩn', 'phát ban']
    },
    {
      id: 'dl_3',
      question: 'Da có sưng hoặc đỏ không?',
      specialty: 'da_lieu',
      weight: 8,
      relatedSymptoms: ['sưng da', 'đỏ da', 'viêm da']
    },
    {
      id: 'dl_4',
      question: 'Bạn có tiếp xúc với chất gì lạ không?',
      specialty: 'da_lieu',
      weight: 7,
      relatedSymptoms: ['dị ứng', 'tiếp xúc']
    },
    {
      id: 'dl_5',
      question: 'Da có khô hoặc bong tróc không?',
      specialty: 'da_lieu',
      weight: 7,
      relatedSymptoms: ['da khô', 'bong tróc', 'khô da']
    }
  ],
  'tai_mui_hong': [
    {
      id: 'tmh_1',
      question: 'Bạn có đau tai không?',
      specialty: 'tai_mui_hong',
      weight: 10,
      relatedSymptoms: ['đau tai', 'tai đau', 'nhức tai']
    },
    {
      id: 'tmh_2',
      question: 'Bạn có ù tai không?',
      specialty: 'tai_mui_hong',
      weight: 8,
      relatedSymptoms: ['ù tai', 'tai ù', 'nghe kém']
    },
    {
      id: 'tmh_3',
      question: 'Bạn có nghẹt mũi không?',
      specialty: 'tai_mui_hong',
      weight: 8,
      relatedSymptoms: ['nghẹt mũi', 'tắc mũi', 'ngạt mũi']
    },
    {
      id: 'tmh_4',
      question: 'Bạn có đau họng không?',
      specialty: 'tai_mui_hong',
      weight: 8,
      relatedSymptoms: ['đau họng', 'họng đau', 'viêm họng']
    },
    {
      id: 'tmh_5',
      question: 'Bạn có đau vùng xoang không?',
      specialty: 'tai_mui_hong',
      weight: 9,
      relatedSymptoms: ['đau xoang', 'viêm xoang', 'xoang']
    }
  ],
  'mat': [
    {
      id: 'mt_1',
      question: 'Bạn có nhìn mờ không?',
      specialty: 'mat',
      weight: 10,
      relatedSymptoms: ['mờ mắt', 'nhìn mờ', 'mắt mờ']
    },
    {
      id: 'mt_2',
      question: 'Mắt có đỏ không?',
      specialty: 'mat',
      weight: 8,
      relatedSymptoms: ['đỏ mắt', 'mắt đỏ', 'mắt đỏ ngầu']
    },
    {
      id: 'mt_3',
      question: 'Mắt có ngứa hoặc khô không?',
      specialty: 'mat',
      weight: 7,
      relatedSymptoms: ['ngứa mắt', 'khô mắt', 'mắt khô']
    },
    {
      id: 'mt_4',
      question: 'Bạn có chảy nước mắt nhiều không?',
      specialty: 'mat',
      weight: 7,
      relatedSymptoms: ['chảy nước mắt', 'mắt chảy nước']
    },
    {
      id: 'mt_5',
      question: 'Bạn có cảm thấy đau mắt không?',
      specialty: 'mat',
      weight: 9,
      relatedSymptoms: ['đau mắt', 'mắt đau', 'nhức mắt']
    }
  ],
  'nhi_khoa': [
    {
      id: 'nk_1',
      question: 'Trẻ có sốt cao không?',
      specialty: 'nhi_khoa',
      weight: 9,
      relatedSymptoms: ['sốt cao', 'sốt', 'nóng']
    },
    {
      id: 'nk_2',
      question: 'Trẻ có tiêu chảy không?',
      specialty: 'nhi_khoa',
      weight: 9,
      relatedSymptoms: ['tiêu chảy', 'ỉa chảy', 'đi ngoài']
    },
    {
      id: 'nk_3',
      question: 'Trẻ có biếng ăn không?',
      specialty: 'nhi_khoa',
      weight: 8,
      relatedSymptoms: ['biếng ăn', 'không ăn', 'kém ăn']
    },
    {
      id: 'nk_4',
      question: 'Trẻ có ho hoặc sổ mũi không?',
      specialty: 'nhi_khoa',
      weight: 8,
      relatedSymptoms: ['ho', 'sổ mũi', 'cảm lạnh']
    },
    {
      id: 'nk_5',
      question: 'Trẻ có quấy khóc nhiều không?',
      specialty: 'nhi_khoa',
      weight: 7,
      relatedSymptoms: ['quấy khóc', 'khóc nhiều', 'bé khóc']
    }
  ],
  'noi_tiet': [
    {
      id: 'nt_1',
      question: 'Bạn có tiểu nhiều hoặc khát nước nhiều không?',
      specialty: 'noi_tiet',
      weight: 10,
      relatedSymptoms: ['tiểu đường', 'đái tháo đường', 'khát nước']
    },
    {
      id: 'nt_2',
      question: 'Bạn có tăng cân hoặc giảm cân bất thường không?',
      specialty: 'noi_tiet',
      weight: 8,
      relatedSymptoms: ['béo phì', 'tăng cân', 'giảm cân']
    },
    {
      id: 'nt_3',
      question: 'Bạn có rối loạn kinh nguyệt không?',
      specialty: 'noi_tiet',
      weight: 9,
      relatedSymptoms: ['rối loạn kinh', 'kinh nguyệt', 'mất kinh']
    },
    {
      id: 'nt_4',
      question: 'Bạn có rụng tóc nhiều không?',
      specialty: 'noi_tiet',
      weight: 7,
      relatedSymptoms: ['rụng tóc', 'tóc rụng', 'hói']
    },
    {
      id: 'nt_5',
      question: 'Bạn có cảm thấy mệt mỏi kéo dài không?',
      specialty: 'noi_tiet',
      weight: 6,
      relatedSymptoms: ['mệt mỏi', 'uể oải', 'không có sức']
    }
  ],
  'rang_ham_mat': [
    {
      id: 'rhm_1',
      question: 'Bạn có đau răng không?',
      specialty: 'rang_ham_mat',
      weight: 10,
      relatedSymptoms: ['đau răng', 'nhức răng', 'răng đau']
    },
    {
      id: 'rhm_2',
      question: 'Răng có bị sâu không?',
      specialty: 'rang_ham_mat',
      weight: 9,
      relatedSymptoms: ['sâu răng', 'răng sâu', 'răng bị sâu']
    },
    {
      id: 'rhm_3',
      question: 'Nướu có sưng hoặc chảy máu không?',
      specialty: 'rang_ham_mat',
      weight: 9,
      relatedSymptoms: ['viêm nướu', 'chảy máu nướu', 'nướu sưng']
    },
    {
      id: 'rhm_4',
      question: 'Bạn có hôi miệng không?',
      specialty: 'rang_ham_mat',
      weight: 7,
      relatedSymptoms: ['hôi miệng', 'hơi thở hôi', 'miệng hôi']
    },
    {
      id: 'rhm_5',
      question: 'Bạn có đang mọc răng khôn không?',
      specialty: 'rang_ham_mat',
      weight: 8,
      relatedSymptoms: ['răng khôn', 'mọc răng khôn', 'răng số 8']
    }
  ],
  'san_phu_khoa': [
    {
      id: 'spk_1',
      question: 'Bạn có đang mang thai không?',
      specialty: 'san_phu_khoa',
      weight: 10,
      relatedSymptoms: ['mang thai', 'có thai', 'mang bầu']
    },
    {
      id: 'spk_2',
      question: 'Bạn có đau bụng dưới không?',
      specialty: 'san_phu_khoa',
      weight: 9,
      relatedSymptoms: ['đau bụng dưới', 'đau vùng chậu', 'đau bụng kinh']
    },
    {
      id: 'spk_3',
      question: 'Bạn có rối loạn kinh nguyệt không?',
      specialty: 'san_phu_khoa',
      weight: 8,
      relatedSymptoms: ['kinh nguyệt', 'đến tháng', 'hành kinh']
    },
    {
      id: 'spk_4',
      question: 'Bạn có ngứa hoặc khó chịu vùng kín không?',
      specialty: 'san_phu_khoa',
      weight: 9,
      relatedSymptoms: ['viêm phụ khoa', 'viêm âm đạo', 'ngứa vùng kín']
    },
    {
      id: 'spk_5',
      question: 'Bạn có khó khăn trong việc có con không?',
      specialty: 'san_phu_khoa',
      weight: 9,
      relatedSymptoms: ['vô sinh', 'hiếm muộn', 'khó có con']
    }
  ]
};

// Hàm lấy câu hỏi follow-up dựa trên chuyên khoa
export const getFollowUpQuestions = (
  specialtyKey: string,
  alreadyAsked: string[] = [],
  maxQuestions: number = 3
): FollowUpQuestion[] => {
  const questions = followUpQuestions[specialtyKey] || [];
  
  // Lọc bỏ câu hỏi đã hỏi
  const availableQuestions = questions.filter(q => !alreadyAsked.includes(q.id));
  
  // Sắp xếp theo weight và lấy top N
  return availableQuestions
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxQuestions);
};

// Map specialty name to key
export const specialtyNameToKey: { [key: string]: string } = {
  'Thần kinh': 'than_kinh',
  'Hô hấp': 'ho_hap',
  'Tiêu hóa': 'tieu_hoa',
  'Tim mạch': 'tim_mach',
  'Cơ xương khớp': 'xuong_khop',
  'Da liễu': 'da_lieu',
  'Tai mũi họng': 'tai_mui_hong',
  'Mắt': 'mat',
  'Nhi khoa': 'nhi_khoa',
  'Nội tiết': 'noi_tiet',
  'Răng hàm mặt': 'rang_ham_mat',
  'Sản phụ khoa': 'san_phu_khoa'
};
