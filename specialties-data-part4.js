/**
 * Phần 4: Nội tiết, Răng hàm mặt, Sản phụ khoa
 */

module.exports = {
  'noi_tiet': {
    name: 'Nội tiết',
    icon: '🦋',
    keywords: [
      { word: 'tiểu nhiều', weight: 10, synonyms: ['đi tiểu nhiều', 'tiểu đường', 'tieu nhieu', 'đái nhiều', 'tiểu liên tục'] },
      { word: 'khát nước nhiều', weight: 10, synonyms: ['khát nước', 'uống nước nhiều', 'khát liên tục', 'luôn khát'] },
      { word: 'sụt cân bất thường', weight: 9, synonyms: ['giảm cân nhanh', 'sut can', 'gầy nhanh', 'giảm cân không rõ nguyên nhân'] },
      { word: 'tăng cân nhanh', weight: 9, synonyms: ['béo nhanh', 'tăng cân', 'béo phì', 'thừa cân', 'tăng cân không kiểm soát'] },
      { word: 'mệt mỏi kéo dài', weight: 9, synonyms: ['mệt mỏi', 'mệt', 'mỏi', 'met moi', 'uể oải', 'kiệt sức'] },
      { word: 'đường huyết cao', weight: 10, synonyms: ['tiểu đường', 'đái tháo đường', 'tieu duong', 'đường máu cao', 'glucose cao'] },
      { word: 'run tay', weight: 8, synonyms: ['run chân', 'run rẩy', 'rung', 'run liên tục', 'tay run'] },
      { word: 'đổ mồ hôi nhiều', weight: 8, synonyms: ['ra mồ hôi', 'toát mồ hôi', 'đổ mồ hôi', 'tiết mồ hôi nhiều'] },
      { word: 'tim đập nhanh', weight: 8, synonyms: ['hồi hộp', 'tim nhanh', 'đánh trống ngực', 'tim đập mạnh'] },
      { word: 'rụng tóc', weight: 8, synonyms: ['tóc rụng', 'rung toc', 'hói', 'tóc gãy rụng', 'rụng tóc nhiều'] },
      { word: 'da khô', weight: 7, synonyms: ['khô da', 'da khô ráp', 'da thiếu ẩm', 'da bị khô'] },
      { word: 'khó ngủ', weight: 7, synonyms: ['mất ngủ', 'không ngủ được', 'mat ngu', 'kho ngu', 'thức đêm'] },
      { word: 'mất ngủ', weight: 7, synonyms: ['khó ngủ', 'không ngủ được', 'mat ngu', 'thức đêm', 'mất giấc'] },
      { word: 'ăn nhiều', weight: 8, synonyms: ['ăn nhiều mà gầy', 'ăn không no', 'thèm ăn nhiều', 'ăn liên tục'] },
      { word: 'chán ăn', weight: 7, synonyms: ['biếng ăn', 'không ăn', 'kém ăn', 'không thèm ăn'] },
      { word: 'mờ mắt', weight: 8, synonyms: ['mắt mờ', 'mo mat', 'nhìn mờ', 'nhìn không rõ', 'thị lực mờ'] },
      { word: 'tê tay chân', weight: 8, synonyms: ['tê bì', 'tê tay', 'tê chân', 'tê liệt', 'tê mỏi'] },
      { word: 'yếu cơ', weight: 8, synonyms: ['yếu tay chân', 'cơ yếu', 'mất sức', 'không có sức', 'teo cơ'] },
      { word: 'hạ đường huyết', weight: 9, synonyms: ['đường huyết thấp', 'glucose thấp', 'đường máu thấp', 'hạ đường máu'] },
      { word: 'huyết áp cao', weight: 8, synonyms: ['huyết áp', 'cao huyết áp', 'huyet ap', 'huyệt áp cao', 'tăng huyết áp'] },
      { word: 'mệt sau ăn', weight: 7, synonyms: ['buồn ngủ sau ăn', 'mệt khi ăn xong', 'uể oải sau ăn'] },
      { word: 'vết thương lâu lành', weight: 9, synonyms: ['vết thương khó lành', 'vết thương không lành', 'lâu liền sẹo'] },
      { word: 'đi tiểu ban đêm nhiều', weight: 9, synonyms: ['tiểu đêm', 'đi tiểu đêm', 'tiểu ban đêm', 'thức đêm đi tiểu'] },
      { word: 'khô miệng', weight: 7, synonyms: ['miệng khô', 'khát nước', 'miệng bị khô', 'khô họng'] },
      { word: 'da sạm màu', weight: 7, synonyms: ['da đen', 'da sạm', 'da thâm', 'da đổi màu'] },
      { word: 'căng thẳng nội tiết', weight: 7, synonyms: ['căng thẳng', 'stress', 'lo âu', 'bồn chồn'] },
      { word: 'rối loạn kinh nguyệt', weight: 9, synonyms: ['kinh nguyệt', 'roi loan kinh', 'mất kinh', 'kinh không đều'] },
      { word: 'tăng tiết mồ hôi', weight: 7, synonyms: ['đổ mồ hôi nhiều', 'ra mồ hôi nhiều', 'tiết mồ hôi'] },
      { word: 'lạnh tay chân', weight: 7, synonyms: ['tay chân lạnh', 'tay lạnh', 'chân lạnh', 'tứ chi lạnh'] },
      { word: 'rối loạn hormone', weight: 9, synonyms: ['mất cân bằng hormone', 'hormone không ổn định', 'rối loạn nội tiết tố'] }
    ]
  },
  'rang_ham_mat': {
    name: 'Răng hàm mặt',
    icon: '🦷',
    keywords: [
      { word: 'đau răng', weight: 10, synonyms: ['nhức răng', 'dau rang', 'răng đau', 'răng nhức'] },
      { word: 'sâu răng', weight: 10, synonyms: ['răng sâu', 'sau rang', 'răng bị sâu', 'răng bị mục', 'răng thủng'] },
      { word: 'chảy máu chân răng', weight: 9, synonyms: ['chảy máu nướu', 'chay mau rang', 'nướu chảy máu', 'lợi chảy máu'] },
      { word: 'sưng nướu', weight: 9, synonyms: ['nướu sưng', 'lợi sưng', 'sưng lợi', 'nướu bị sưng'] },
      { word: 'hôi miệng', weight: 8, synonyms: ['hơi thở hôi', 'hoi mieng', 'miệng hôi', 'thở hôi'] },
      { word: 'ê buốt răng', weight: 9, synonyms: ['răng ê buốt', 'răng nhạy cảm', 'buốt răng', 'răng buốt'] },
      { word: 'viêm nướu', weight: 9, synonyms: ['nướu viêm', 'viem nuou', 'viêm lợi', 'lợi viêm'] },
      { word: 'viêm nha chu', weight: 9, synonyms: ['nha chu', 'viêm quanh răng', 'bệnh nha chu', 'viêm quanh nướu'] },
      { word: 'đau hàm', weight: 8, synonyms: ['hàm đau', 'nhức hàm', 'đau xương hàm', 'hàm bị đau'] },
      { word: 'mọc răng khôn', weight: 9, synonyms: ['răng khôn', 'rang khon', 'răng số 8', 'răng khôn mọc', 'răng khôn đau'] },
      { word: 'lệch khớp cắn', weight: 8, synonyms: ['khớp cắn lệch', 'cắn lệch', 'răng lệch', 'khớp cắn sai'] },
      { word: 'răng lung lay', weight: 9, synonyms: ['lung lay răng', 'răng lay', 'răng lung', 'răng yếu'] },
      { word: 'khó nhai', weight: 8, synonyms: ['nhai khó', 'không nhai được', 'đau khi nhai', 'nhai đau'] },
      { word: 'đau khi ăn uống', weight: 8, synonyms: ['ăn đau', 'uống đau', 'đau khi ăn', 'đau khi uống'] },
      { word: 'viêm tủy răng', weight: 10, synonyms: ['tủy răng viêm', 'viêm tủy', 'đau tủy răng', 'tủy bị viêm'] },
      { word: 'mẻ răng', weight: 8, synonyms: ['răng mẻ', 'răng gãy', 'răng bị mẻ', 'răng vỡ'] },
      { word: 'răng bị vàng', weight: 7, synonyms: ['răng vàng', 'răng ố vàng', 'răng xỉn màu', 'răng đổi màu'] },
      { word: 'áp xe răng', weight: 10, synonyms: ['áp xe', 'mủ răng', 'viêm mủ răng', 'răng có mủ'] },
      { word: 'sưng mặt do răng', weight: 9, synonyms: ['sưng má', 'mặt sưng', 'má sưng', 'sưng mặt'] },
      { word: 'nhiệt miệng', weight: 8, synonyms: ['nóng miệng', 'lở miệng', 'nhiệt trong miệng', 'miệng nóng'] },
      { word: 'loét miệng', weight: 8, synonyms: ['lở miệng', 'miệng loét', 'loét lưỡi', 'lở lưỡi'] },
      { word: 'khô miệng', weight: 7, synonyms: ['miệng khô', 'khát nước', 'miệng bị khô', 'thiếu nước bọt'] },
      { word: 'đau lợi', weight: 8, synonyms: ['lợi đau', 'đau nướu', 'nướu đau', 'nhức lợi'] },
      { word: 'khó há miệng', weight: 8, synonyms: ['há miệng khó', 'không há miệng được', 'miệng khó mở', 'cứng hàm'] },
      { word: 'đau khớp hàm', weight: 9, synonyms: ['khớp hàm đau', 'đau khớp thái dương hàm', 'TMJ', 'khớp hàm bị đau'] },
      { word: 'viêm miệng', weight: 8, synonyms: ['miệng viêm', 'viêm niêm mạc miệng', 'viêm lưỡi', 'viêm trong miệng'] },
      { word: 'mất răng', weight: 9, synonyms: ['rụng răng', 'răng rụng', 'răng bị mất', 'thiếu răng'] },
      { word: 'răng nhạy cảm', weight: 8, synonyms: ['răng ê buốt', 'răng nhạy', 'răng yếu', 'răng dễ buốt'] },
      { word: 'đau quai hàm', weight: 8, synonyms: ['quai hàm đau', 'đau vùng hàm', 'nhức quai hàm', 'đau má'] },
      { word: 'cắn đau', weight: 8, synonyms: ['đau khi cắn', 'cắn bị đau', 'đau khi nhai', 'cắn không được'] }
    ]
  }
};
