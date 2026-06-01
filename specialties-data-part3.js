/**
 * Phần 3: Các chuyên khoa còn lại (Mắt, Nhi khoa, Nội tiết, Răng hàm mặt, Sản phụ khoa)
 */

module.exports = {
  'mat': {
    name: 'Mắt',
    icon: '👁️',
    keywords: [
      { word: 'đau mắt', weight: 10, synonyms: ['mắt đau', 'dau mat', 'nhức mắt', 'mắt nhức'] },
      { word: 'mắt đỏ', weight: 9, synonyms: ['đỏ mắt', 'do mat', 'mắt đỏ ngầu', 'mắt bị đỏ'] },
      { word: 'mờ mắt', weight: 10, synonyms: ['mắt mờ', 'mo mat', 'nhìn mờ', 'nhìn không rõ', 'thị lực mờ'] },
      { word: 'khô mắt', weight: 9, synonyms: ['mắt khô', 'kho mat', 'mắt khô khan', 'mắt bị khô'] },
      { word: 'ngứa mắt', weight: 8, synonyms: ['mắt ngứa', 'ngua mat', 'mắt bị ngứa', 'ngứa vùng mắt'] },
      { word: 'chảy nước mắt', weight: 8, synonyms: ['mắt chảy nước', 'chay nuoc mat', 'nước mắt chảy', 'mắt ra nước'] },
      { word: 'nhìn đôi', weight: 9, synonyms: ['nhìn hai', 'thấy đôi', 'nhìn bóng đôi', 'song thị'] },
      { word: 'sưng mắt', weight: 8, synonyms: ['mắt sưng', 'phù mắt', 'mắt bị sưng', 'sưng quanh mắt'] },
      { word: 'cộm mắt', weight: 8, synonyms: ['lẹo mắt', 'mắt cộm', 'mắt bị lẹo', 'viêm bờ mi'] },
      { word: 'nhạy cảm ánh sáng', weight: 8, synonyms: ['sợ ánh sáng', 'chói mắt', 'mắt nhạy sáng', 'quang sợ'] },
      { word: 'mỏi mắt', weight: 8, synonyms: ['mắt mỏi', 'mệt mắt', 'mắt mệt mỏi', 'mắt bị mỏi'] },
      { word: 'giảm thị lực', weight: 10, synonyms: ['thị lực giảm', 'mắt kém', 'nhìn kém', 'thị lực yếu'] },
      { word: 'nhìn không rõ', weight: 9, synonyms: ['nhìn mờ', 'thấy không rõ', 'mờ mắt', 'nhìn không sắc'] },
      { word: 'đau khi nhìn', weight: 8, synonyms: ['nhìn đau', 'mắt đau khi nhìn', 'đau khi mở mắt'] },
      { word: 'mắt có ghèn', weight: 8, synonyms: ['ghèn mắt', 'mắt ghèn', 'mắt ra ghèn', 'chảy ghèn'] },
      { word: 'viêm kết mạc', weight: 9, synonyms: ['đau mắt đỏ', 'viêm màng kết', 'kết mạc viêm', 'mắt hột'] },
      { word: 'viêm bờ mi', weight: 8, synonyms: ['bờ mi viêm', 'mi mắt viêm', 'viêm mi', 'cộm mắt'] },
      { word: 'mắt bị kích ứng', weight: 8, synonyms: ['kích ứng mắt', 'mắt kích ứng', 'mắt nhạy cảm', 'dị ứng mắt'] },
      { word: 'chớp mắt nhiều', weight: 7, synonyms: ['nháy mắt nhiều', 'chớp mắt liên tục', 'mắt chớp', 'giật mí'] },
      { word: 'nhìn thấy đốm đen', weight: 9, synonyms: ['đốm đen', 'ruồi bay', 'thấy bóng đen', 'thấy đốm'] },
      { word: 'mắt bị khô rát', weight: 8, synonyms: ['khô rát mắt', 'mắt khô và rát', 'rát mắt', 'cay rát mắt'] },
      { word: 'chảy ghèn mắt', weight: 8, synonyms: ['ghèn chảy', 'mắt chảy ghèn', 'ra ghèn', 'mủ mắt'] },
      { word: 'mắt bị sưng đỏ', weight: 9, synonyms: ['sưng đỏ mắt', 'mắt sưng và đỏ', 'viêm sưng mắt'] },
      { word: 'mắt mệt mỏi', weight: 8, synonyms: ['mỏi mắt', 'mắt mỏi', 'mệt mắt', 'mắt bị mệt'] },
      { word: 'nhìn xa không rõ', weight: 9, synonyms: ['cận thị', 'cận', 'can thi', 'nhìn gần', 'mắt cận'] },
      { word: 'nhìn gần không rõ', weight: 9, synonyms: ['viễn thị', 'viễn', 'vien thi', 'nhìn xa', 'mắt viễn'] },
      { word: 'đau hốc mắt', weight: 8, synonyms: ['hốc mắt đau', 'đau quanh mắt', 'nhức hốc mắt'] },
      { word: 'cay mắt', weight: 7, synonyms: ['mắt cay', 'mắt bị cay', 'rát mắt', 'cay rát'] },
      { word: 'mắt bị lóa', weight: 7, synonyms: ['lóa mắt', 'chói mắt', 'mắt chói', 'bị chói'] },
      { word: 'co giật mí mắt', weight: 8, synonyms: ['giật mí', 'mí mắt giật', 'co giật mi', 'nháy mắt không tự chủ'] }
    ]
  },
  'nhi_khoa': {
    name: 'Nhi khoa',
    icon: '👶',
    keywords: [
      { word: 'sốt', weight: 10, synonyms: ['sốt cao', 'nóng', 'sot', 'trẻ sốt', 'bé sốt', 'con sốt'] },
      { word: 'ho', weight: 9, synonyms: ['ho khan', 'ho có đờm', 'ho đờm', 'trẻ ho', 'bé ho', 'ho nhiều'] },
      { word: 'sổ mũi', weight: 8, synonyms: ['chảy nước mũi', 'so mui', 'mũi chảy', 'trẻ sổ mũi'] },
      { word: 'nghẹt mũi', weight: 8, synonyms: ['ngạt mũi', 'tắc mũi', 'nghet mui', 'mũi tắc', 'mũi bị nghẹt'] },
      { word: 'đau họng', weight: 8, synonyms: ['họng đau', 'dau hong', 'viêm họng', 'trẻ đau họng'] },
      { word: 'khó thở', weight: 9, synonyms: ['thở khó', 'kho tho', 'thở gấp', 'hụt hơi', 'thở nhanh'] },
      { word: 'biếng ăn', weight: 9, synonyms: ['không ăn', 'bieng an', 'kém ăn', 'chán ăn', 'không chịu ăn'] },
      { word: 'quấy khóc', weight: 8, synonyms: ['khóc nhiều', 'quay khoc', 'bé khóc', 'trẻ khóc', 'khóc quấy'] },
      { word: 'tiêu chảy', weight: 10, synonyms: ['ỉa chảy', 'đi ngoài nhiều', 'tieu chay', 'tiêu lỏng', 'bé tiêu chảy'] },
      { word: 'nôn ói', weight: 9, synonyms: ['nôn', 'ói', 'nôn mửa', 'trẻ nôn', 'bé nôn'] },
      { word: 'đau bụng', weight: 9, synonyms: ['nhức bụng', 'bụng đau', 'dau bung', 'trẻ đau bụng'] },
      { word: 'phát ban', weight: 8, synonyms: ['nổi ban', 'ban đỏ', 'da nổi ban', 'nổi mẩn'] },
      { word: 'dị ứng', weight: 8, synonyms: ['di ung', 'dị ứng da', 'dị ứng thức ăn', 'phản ứng dị ứng'] },
      { word: 'mệt mỏi', weight: 7, synonyms: ['mệt', 'mỏi', 'met moi', 'uể oải', 'trẻ mệt'] },
      { word: 'khò khè', weight: 9, synonyms: ['thở khò khè', 'thở rít', 'thở có tiếng', 'khò khè khi thở'] },
      { word: 'táo bón', weight: 8, synonyms: ['táo', 'tao bon', 'khó đi ngoài', 'trẻ táo bón', 'bí đại tiện'] },
      { word: 'sụt cân', weight: 8, synonyms: ['giảm cân', 'sut can', 'gầy', 'trẻ gầy', 'nhẹ cân'] },
      { word: 'chậm tăng cân', weight: 8, synonyms: ['không tăng cân', 'cân không tăng', 'chậm lớn', 'suy dinh dưỡng'] },
      { word: 'mất ngủ', weight: 7, synonyms: ['khó ngủ', 'không ngủ được', 'mat ngu', 'trẻ mất ngủ', 'ngủ không ngon'] },
      { word: 'co giật', weight: 10, synonyms: ['giật mình', 'co cứng', 'co thắt', 'giật cơ', 'co giật toàn thân'] },
      { word: 'da nổi mẩn', weight: 8, synonyms: ['nổi mẩn', 'mẩn đỏ', 'da đỏ', 'phát ban'] },
      { word: 'viêm họng', weight: 8, synonyms: ['họng viêm', 'viem hong', 'họng sưng', 'họng đỏ'] },
      { word: 'viêm tai', weight: 9, synonyms: ['đau tai', 'tai viêm', 'viem tai', 'tai đau', 'viêm tai giữa'] },
      { word: 'sốt cao', weight: 10, synonyms: ['sốt', 'nóng cao', 'sot cao', 'sốt trên 38 độ', 'sốt trên 39 độ'] },
      { word: 'chảy nước mũi', weight: 8, synonyms: ['sổ mũi', 'mũi chảy nước', 'chảy mũi', 'nước mũi chảy'] },
      { word: 'đổ mồ hôi nhiều', weight: 7, synonyms: ['ra mồ hôi', 'toát mồ hôi', 'đổ mồ hôi', 'trẻ đổ mồ hôi'] },
      { word: 'bé bỏ bú', weight: 9, synonyms: ['không bú', 'bỏ bú', 'không chịu bú', 'từ chối bú', 'ngừng bú'] },
      { word: 'khóc đêm', weight: 8, synonyms: ['khóc ban đêm', 'khóc về đêm', 'trẻ khóc đêm', 'bé khóc đêm'] },
      { word: 'mọc răng sốt', weight: 8, synonyms: ['sốt mọc răng', 'mọc răng', 'trẻ mọc răng', 'sốt khi mọc răng'] },
      { word: 'viêm phế quản', weight: 9, synonyms: ['phế quản viêm', 'viêm phế quản cấp', 'viêm phế quản trẻ em'] }
    ]
  }
};
