import { SymptomItem } from './symptomMappingService';

export interface FollowUpQuestion {
  question: string;
  options?: string[];
  type: 'text' | 'choice';
}

// Câu hỏi theo dõi cho từng chuyên khoa
const specialtyQuestions: Record<string, FollowUpQuestion[]> = {
  'Thần kinh': [
    { question: 'Đau đầu ở vị trí nào?', options: ['Trán', 'Thái dương', 'Đỉnh đầu', 'Gáy', 'Toàn bộ'], type: 'choice' },
    { question: 'Mức độ đau đầu của bạn?', options: ['Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'], type: 'choice' },
    { question: 'Bạn có bị chóng mặt hoặc hoa mắt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có buồn nôn hoặc nôn không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng kéo dài bao lâu?', options: ['Vài giờ', 'Vài ngày', 'Hơn 1 tuần', 'Hơn 1 tháng'], type: 'choice' },
    { question: 'Có mất ngủ hoặc khó ngủ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tê tay chân hoặc yếu cơ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có run tay chân không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có co giật hoặc giật mình không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có hay quên hoặc mất trí nhớ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khó tập trung không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có căng thẳng hoặc lo âu kéo dài không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Đau đầu có kèm theo nhạy sáng hoặc nhạy tiếng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử tai biến hoặc đột quỵ trong gia đình không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng có xuất hiện đột ngột không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Tim mạch': [
    { question: 'Đau ngực xuất hiện khi nào?', options: ['Khi nghỉ ngơi', 'Khi hoạt động', 'Cả hai'], type: 'choice' },
    { question: 'Mức độ đau ngực?', options: ['Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'], type: 'choice' },
    { question: 'Có khó thở hoặc thở gấp không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tim đánh nhanh hoặc hồi hộp không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sưng phù ở chân không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử cao huyết áp không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử bệnh tim không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Đau ngực có lan ra vai trái, tay trái không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đổ mồ hôi lạnh không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có mệt mỏi bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khó thở khi nằm không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử tiểu đường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có hút thuốc lá không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ngất xỉu hoặc choáng váng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đau ngực khi căng thẳng hoặc xúc động không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Tiêu hóa': [
    { question: 'Đau bụng ở vị trí nào?', options: ['Vùng thượng vị (trên)', 'Vùng rốn (giữa)', 'Vùng hạ vị (dưới)', 'Toàn bụng'], type: 'choice' },
    { question: 'Đau trước hay sau khi ăn?', options: ['Trước ăn', 'Sau ăn', 'Không liên quan'], type: 'choice' },
    { question: 'Mức độ đau bụng?', options: ['Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'], type: 'choice' },
    { question: 'Có buồn nôn hoặc nôn không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiêu chảy hoặc táo bón không?', options: ['Tiêu chảy', 'Táo bón', 'Bình thường'], type: 'choice' },
    { question: 'Có ợ hơi hoặc đầy bụng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ợ chua hoặc trào ngược không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đi ngoài ra máu không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có phân đen không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sụt cân không rõ nguyên nhân không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có chán ăn hoặc biếng ăn không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có vàng da hoặc vàng mắt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử viêm loét dạ dày không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có dùng thuốc giảm đau thường xuyên không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng có liên quan đến căng thẳng không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Hô hấp': [
    { question: 'Ho có đờm không?', options: ['Có đờm', 'Ho khan', 'Không ho'], type: 'choice' },
    { question: 'Màu đờm như thế nào?', options: ['Trong', 'Vàng', 'Xanh', 'Có máu'], type: 'choice' },
    { question: 'Có khó thở khi vận động không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khó thở khi nghỉ ngơi không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sốt hoặc ớn lạnh không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có thở khò khè hoặc thở rít không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đau ngực khi thở không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ho ra máu không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng kéo dài bao lâu?', options: ['Vài ngày', 'Hơn 1 tuần', 'Hơn 2 tuần', 'Hơn 1 tháng'], type: 'choice' },
    { question: 'Có tiền sử hen suyễn không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử bệnh phổi mãn tính không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có hút thuốc lá không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ho về đêm không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiếp xúc với người bị cúm/cảm không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nghẹt mũi hoặc sổ mũi không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Da liễu': [
    { question: 'Phát ban ở vị trí nào trên cơ thể?', options: ['Mặt', 'Cổ', 'Ngực/lưng', 'Tay/chân', 'Toàn thân'], type: 'choice' },
    { question: 'Có ngứa nhiều không?', options: ['Rất ngứa', 'Ngứa vừa', 'Ngứa nhẹ', 'Không ngứa'], type: 'choice' },
    { question: 'Da có đỏ hoặc sưng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nổi mụn nước hoặc mụn mủ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có da khô hoặc bong tróc không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nổi mề đay không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng xuất hiện sau khi tiếp xúc với gì?', options: ['Thức ăn', 'Thuốc', 'Hóa chất', 'Không rõ'], type: 'choice' },
    { question: 'Có tiền sử dị ứng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có mụn trứng cá không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Da có thay đổi màu sắc không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có rụng tóc nhiều không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có móng tay/chân bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng có tái phát không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có dùng mỹ phẩm mới gần đây không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử eczema hoặc vẩy nến không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Mắt': [
    { question: 'Mắt đau ở vị trí nào?', options: ['Trong mắt', 'Ngoài mắt', 'Quanh mắt', 'Toàn bộ'], type: 'choice' },
    { question: 'Có nhìn mờ hoặc giảm thị lực không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có chảy nước mắt nhiều không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đỏ mắt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nhìn thấy vệt sáng hoặc đốm đen không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khô mắt hoặc cộm mắt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sưng mí mắt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có mỏi mắt khi dùng máy tính/điện thoại không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nhạy cảm với ánh sáng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nhìn đôi không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ghèn hoặc chảy mủ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử cận thị/viễn thị không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử tiểu đường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ngứa mắt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng xuất hiện đột ngột không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Tai mũi họng': [
    { question: 'Đau họng khi nuốt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Mức độ đau họng?', options: ['Nhẹ', 'Vừa', 'Nặng'], type: 'choice' },
    { question: 'Có sổ mũi hoặc nghẹt mũi không?', options: ['Sổ mũi', 'Nghẹt mũi', 'Cả hai', 'Không'], type: 'choice' },
    { question: 'Có chảy máu cam không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có nghe kém hoặc ù tai không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sốt hoặc ho không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đau tai không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có chảy mủ tai không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khàn tiếng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có hắt hơi nhiều không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đau vùng xoang không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sưng amidan không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử viêm xoang mạn tính không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có hôi miệng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng có tái phát thường xuyên không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Nội tiết': [
    { question: 'Có uống nhiều nước và đi tiểu nhiều không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có thay đổi cân nặng gần đây không?', options: ['Tăng cân', 'Giảm cân', 'Không thay đổi'], type: 'choice' },
    { question: 'Mức độ thay đổi cân nặng?', options: ['Nhẹ (1-3kg)', 'Vừa (3-5kg)', 'Nặng (>5kg)'], type: 'choice' },
    { question: 'Có mệt mỏi thường xuyên không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có run tay hoặc đánh trống ngực không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử tiểu đường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử bệnh tuyến giáp không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đổ mồ hôi nhiều bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có rối loạn kinh nguyệt không? (nếu là nữ)', options: ['Có', 'Không', 'Không áp dụng'], type: 'choice' },
    { question: 'Có rụng tóc nhiều không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khô da hoặc da dầu bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khát nước liên tục không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có vết thương lâu lành không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử tiểu đường trong gia đình không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tê tay chân không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Nhi khoa': [
    { question: 'Trẻ bao nhiêu tuổi?', options: ['Dưới 1 tuổi', '1-3 tuổi', '3-6 tuổi', '6-12 tuổi', 'Trên 12 tuổi'], type: 'choice' },
    { question: 'Trẻ có sốt không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Nếu có sốt, nhiệt độ bao nhiêu?', options: ['Dưới 38°C', '38-39°C', '39-40°C', 'Trên 40°C'], type: 'choice' },
    { question: 'Trẻ có ăn uống bình thường không?', options: ['Bình thường', 'Giảm ăn', 'Không ăn'], type: 'choice' },
    { question: 'Trẻ có quấy khóc nhiều không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có nôn hoặc tiêu chảy không?', options: ['Có nôn', 'Có tiêu chảy', 'Cả hai', 'Không'], type: 'choice' },
    { question: 'Trẻ có phát ban không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có ho hoặc khó thở không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có biếng ăn kéo dài không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có ngủ không ngon không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có co giật không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có tiêm chủng đầy đủ không?', options: ['Có', 'Không', 'Không rõ'], type: 'choice' },
    { question: 'Có trẻ khác trong nhà bị bệnh không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Trẻ có đi học/nhà trẻ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng xuất hiện bao lâu rồi?', options: ['Vài giờ', '1-2 ngày', '3-5 ngày', 'Hơn 1 tuần'], type: 'choice' }
  ],
  'Sản phụ khoa': [
    { question: 'Đau bụng dưới xuất hiện khi nào?', options: ['Trước kinh', 'Trong kinh', 'Sau kinh', 'Không liên quan'], type: 'choice' },
    { question: 'Mức độ đau bụng?', options: ['Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'], type: 'choice' },
    { question: 'Có ra máu âm đạo bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đau khi quan hệ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Kỳ kinh có đều đặn không?', options: ['Đều', 'Không đều'], type: 'choice' },
    { question: 'Chu kỳ kinh bao nhiêu ngày?', options: ['Dưới 21 ngày', '21-35 ngày', 'Trên 35 ngày'], type: 'choice' },
    { question: 'Có khả năng mang thai không?', options: ['Có thể', 'Không', 'Đang mang thai'], type: 'choice' },
    { question: 'Có khí hư bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ngứa vùng kín không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có ra khí hư có mùi không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có kinh nguyệt kéo dài không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có kinh nguyệt nhiều bất thường không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đau lưng kèm theo không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có dùng biện pháp tránh thai không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử u xơ tử cung hoặc u nang buồng trứng không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Răng hàm mặt': [
    { question: 'Đau răng nào?', options: ['Hàm trên', 'Hàm dưới', 'Cả hai'], type: 'choice' },
    { question: 'Đau bên nào?', options: ['Bên trái', 'Bên phải', 'Cả hai'], type: 'choice' },
    { question: 'Mức độ đau răng?', options: ['Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'], type: 'choice' },
    { question: 'Đau khi cắn nhai không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Đau khi uống lạnh hoặc nóng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sưng lợi không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có chảy máu chân răng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có thấy lỗ sâu răng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có hôi miệng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có sưng má không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có răng lung lay không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có mọc răng khôn không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng kéo dài bao lâu?', options: ['Vài giờ', 'Vài ngày', 'Hơn 1 tuần'], type: 'choice' },
    { question: 'Có khó há miệng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có đi khám răng định kỳ không?', options: ['Có', 'Không'], type: 'choice' }
  ],
  'Cơ xương khớp': [
    { question: 'Đau ở khớp nào?', options: ['Cổ', 'Vai', 'Lưng', 'Gối', 'Cổ tay', 'Khác'], type: 'choice' },
    { question: 'Đau khi vận động hay nghỉ ngơi?', options: ['Vận động', 'Nghỉ ngơi', 'Cả hai'], type: 'choice' },
    { question: 'Mức độ đau?', options: ['Nhẹ', 'Vừa', 'Nặng', 'Rất nặng'], type: 'choice' },
    { question: 'Có sưng hoặc đỏ ở khớp không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có cứng khớp vào buổi sáng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Cứng khớp kéo dài bao lâu?', options: ['Dưới 30 phút', '30-60 phút', 'Hơn 1 giờ'], type: 'choice' },
    { question: 'Có chấn thương trước đó không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có khó di chuyển không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có yếu cơ không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tê tay chân không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Đau có lan xuống chân không? (nếu đau lưng)', options: ['Có', 'Không', 'Không áp dụng'], type: 'choice' },
    { question: 'Có khó cúi người không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Có tiền sử thoái hóa khớp không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Công việc có vận động nặng không?', options: ['Có', 'Không'], type: 'choice' },
    { question: 'Triệu chứng kéo dài bao lâu?', options: ['Vài ngày', '1-2 tuần', 'Hơn 1 tháng'], type: 'choice' }
  ]
};

// Câu hỏi chung khi không xác định được chuyên khoa
const generalQuestions: FollowUpQuestion[] = [
  { question: 'Bạn có sốt không?', options: ['Có', 'Không'], type: 'choice' },
  { question: 'Triệu chứng bắt đầu từ khi nào?', options: ['Vài giờ', 'Vài ngày', 'Hơn 1 tuần'], type: 'choice' },
  { question: 'Triệu chứng có tăng dần không?', options: ['Có', 'Không'], type: 'choice' },
  { question: 'Có mệt mỏi hoặc yếu người không?', options: ['Có', 'Không'], type: 'choice' },
  { question: 'Có tiền sử bệnh nền không? (tim mạch, đái tháo đường, cao huyết áp)', type: 'text' }
];

class FollowUpQuestionsService {
  // Lấy 2-5 câu hỏi theo dõi dựa trên triệu chứng và chuyên khoa
  getQuestions(matchedSymptoms: SymptomItem[], specialty: string, count: number = 3): FollowUpQuestion[] {
    const questions = specialtyQuestions[specialty] || generalQuestions;
    
    // Lấy ngẫu nhiên count câu hỏi (2-5)
    const selectedQuestions: FollowUpQuestion[] = [];
    const availableQuestions = [...questions];
    
    const actualCount = Math.min(count, availableQuestions.length);
    
    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      selectedQuestions.push(availableQuestions[randomIndex]);
      availableQuestions.splice(randomIndex, 1);
    }
    
    return selectedQuestions;
  }

  // Phân tích câu trả lời và điều chỉnh xác suất chuyên khoa
  analyzeAnswers(
    initialSpecialty: string,
    answers: string[],
    questions: FollowUpQuestion[]
  ): { specialty: string; percentage: number }[] {
    // Logic phân tích đơn giản - có thể mở rộng
    const specialties: { specialty: string; percentage: number }[] = [];
    
    // Chuyên khoa chính (cao nhất)
    specialties.push({ specialty: initialSpecialty, percentage: 70 });
    
    // Phân tích câu trả lời để thêm hoặc điều chỉnh xác suất
    let hasHighRiskSymptoms = false;
    let hasMultiplePositiveAnswers = 0;
    
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (answer === 'Có' || answer.toLowerCase().includes('có')) {
        hasMultiplePositiveAnswers++;
      }
      
      // Kiểm tra triệu chứng nguy hiểm
      if (answer.toLowerCase().includes('nặng') || 
          answer.toLowerCase().includes('nhiều') ||
          answer.toLowerCase().includes('hơn 1 tuần')) {
        hasHighRiskSymptoms = true;
      }
    });
    
    // Điều chỉnh xác suất dựa trên câu trả lời
    if (hasMultiplePositiveAnswers >= 3) {
      specialties[0].percentage = 85; // Tăng độ tin cậy
    } else if (hasMultiplePositiveAnswers >= 2) {
      specialties[0].percentage = 75;
    }
    
    // Thêm chuyên khoa phụ dựa trên chuyên khoa chính
    const relatedSpecialties = this.getRelatedSpecialties(initialSpecialty);
    relatedSpecialties.forEach((related, index) => {
      const percentage = index === 0 ? 10 : 5;
      specialties.push({ specialty: related, percentage });
    });
    
    return specialties;
  }

  // Lấy chuyên khoa liên quan
  private getRelatedSpecialties(specialty: string): string[] {
    const relations: Record<string, string[]> = {
      'Thần kinh': ['Tai mũi họng', 'Mắt'],
      'Tim mạch': ['Hô hấp', 'Nội tiết'],
      'Tiêu hóa': ['Nội tiết', 'Cơ xương khớp'],
      'Hô hấp': ['Tim mạch', 'Tai mũi họng'],
      'Da liễu': ['Nội tiết', 'Nhi khoa'],
      'Mắt': ['Thần kinh', 'Nội tiết'],
      'Tai mũi họng': ['Hô hấp', 'Thần kinh'],
      'Nội tiết': ['Tim mạch', 'Thần kinh'],
      'Nhi khoa': ['Hô hấp', 'Tiêu hóa'],
      'Sản phụ khoa': ['Nội tiết', 'Tiêu hóa'],
      'Răng hàm mặt': ['Tai mũi họng', 'Thần kinh'],
      'Cơ xương khớp': ['Thần kinh', 'Tim mạch']
    };
    
    return relations[specialty] || ['Tim mạch', 'Tiêu hóa'];
  }
}

export default new FollowUpQuestionsService();
