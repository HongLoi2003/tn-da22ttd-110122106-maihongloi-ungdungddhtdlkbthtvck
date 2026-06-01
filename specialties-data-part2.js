/**
 * Phần 2: Các chuyên khoa còn lại
 */

module.exports = {
  'da_lieu': {
    name: 'Da liễu',
    icon: '🧴',
    keywords: [
      { word: 'nổi mẩn đỏ', weight: 10, synonyms: ['mẩn đỏ', 'nổi mẩn', 'man do', 'phát ban', 'nổi đỏ', 'da đỏ'] },
      { word: 'ngứa da', weight: 10, synonyms: ['ngứa', 'ngứa ngáy', 'ngua', 'da ngứa', 'ngứa khắp người'] },
      { word: 'mụn trứng cá', weight: 9, synonyms: ['mụn', 'nổi mụn', 'noi mun', 'mụn cá', 'mụn bọc', 'mụn đầu đen'] },
      { word: 'dị ứng da', weight: 10, synonyms: ['dị ứng', 'di ung', 'da dị ứng', 'kích ứng da', 'phản ứng da'] },
      { word: 'phát ban', weight: 9, synonyms: ['nổi ban', 'ban đỏ', 'da nổi ban', 'xuất hiện ban'] },
      { word: 'da khô', weight: 8, synonyms: ['khô da', 'da khô ráp', 'da thiếu ẩm', 'da bị khô'] },
      { word: 'da bong tróc', weight: 8, synonyms: ['bong tróc', 'da bong', 'da tróc', 'da lột', 'da bị lột'] },
      { word: 'nổi mề đay', weight: 9, synonyms: ['mề đay', 'me day', 'nổi mề', 'phát mề đay'] },
      { word: 'viêm da', weight: 9, synonyms: ['viem da', 'da viêm', 'sưng da', 'da bị viêm'] },
      { word: 'nấm da', weight: 9, synonyms: ['nấm', 'nam da', 'nhiễm nấm', 'nấm ngoài da', 'nấm da đầu'] },
      { word: 'lang ben', weight: 9, synonyms: ['lang beng', 'ghẻ lở', 'ghẻ ngứa', 'bệnh ghẻ'] },
      { word: 'chàm da', weight: 9, synonyms: ['chàm', 'cham', 'eczema', 'viêm da chàm'] },
      { word: 'da nổi đốm', weight: 8, synonyms: ['nổi đốm', 'đốm da', 'da có đốm', 'đốm trắng', 'đốm đỏ'] },
      { word: 'da bị kích ứng', weight: 8, synonyms: ['kích ứng da', 'da kích ứng', 'da nhạy cảm', 'da bị tổn thương'] },
      { word: 'mụn nước', weight: 8, synonyms: ['nổi mụn nước', 'bọng nước', 'mụn bóng nước', 'phỏng nước'] },
      { word: 'da sưng đỏ', weight: 9, synonyms: ['sưng đỏ', 'da sưng', 'da đỏ sưng', 'viêm sưng da'] },
      { word: 'ngứa da đầu', weight: 8, synonyms: ['da đầu ngứa', 'ngứa đầu', 'ngứa vùng đầu', 'đầu ngứa'] },
      { word: 'rụng tóc', weight: 8, synonyms: ['tóc rụng', 'rung toc', 'hói', 'tóc gãy rụng', 'rụng tóc nhiều'] },
      { word: 'gàu nhiều', weight: 7, synonyms: ['gàu', 'gàu đầu', 'da đầu bị gàu', 'nhiều gàu'] },
      { word: 'da nhờn', weight: 7, synonyms: ['da dầu', 'da tiết dầu', 'da bóng nhờn', 'da nhiều dầu'] },
      { word: 'da bị thâm', weight: 7, synonyms: ['da thâm', 'thâm da', 'vết thâm', 'da sạm', 'da đen'] },
      { word: 'viêm nang lông', weight: 8, synonyms: ['nang lông viêm', 'viêm lỗ chân lông', 'mụn viêm nang lông'] },
      { word: 'nứt da', weight: 8, synonyms: ['da nứt', 'da bị nứt', 'nứt nẻ', 'da nứt nẻ', 'da rạn nứt'] },
      { word: 'da bị cháy nắng', weight: 8, synonyms: ['cháy nắng', 'da cháy', 'bỏng nắng', 'da bị bỏng nắng'] },
      { word: 'mụn viêm', weight: 9, synonyms: ['mụn sưng', 'mụn đỏ', 'mụn bọc viêm', 'mụn có mủ'] },
      { word: 'da nổi hạt', weight: 8, synonyms: ['nổi hạt', 'hạt da', 'da sần sùi', 'da nhám'] },
      { word: 'da đổi màu', weight: 8, synonyms: ['đổi màu da', 'da thay đổi màu', 'da sạm màu', 'da bạc màu'] },
      { word: 'ngứa toàn thân', weight: 9, synonyms: ['ngứa khắp người', 'ngứa cả người', 'toàn thân ngứa', 'ngứa nhiều chỗ'] },
      { word: 'viêm da cơ địa', weight: 9, synonyms: ['viêm da dị ứng', 'da cơ địa', 'atopic dermatitis', 'viêm da mãn tính'] },
      { word: 'da bị sẹo', weight: 7, synonyms: ['sẹo da', 'vết sẹo', 'da có sẹo', 'sẹo lồi', 'sẹo lõm'] }
    ]
  },
  'tai_mui_hong': {
    name: 'Tai mũi họng',
    icon: '👂',
    keywords: [
      { word: 'đau họng', weight: 10, synonyms: ['họng đau', 'dau hong', 'viêm họng', 'sưng họng', 'nhức họng'] },
      { word: 'viêm họng', weight: 10, synonyms: ['họng viêm', 'viem hong', 'họng sưng', 'họng đỏ', 'họng bị viêm'] },
      { word: 'ho', weight: 9, synonyms: ['ho khan', 'ho có đờm', 'ho đờm', 'ho lâu ngày', 'ho nhiều'] },
      { word: 'khàn tiếng', weight: 9, synonyms: ['tiếng khàn', 'khàn giọng', 'giọng khàn', 'nói khàn', 'giọng bị khàn'] },
      { word: 'mất tiếng', weight: 9, synonyms: ['mất giọng', 'không nói được', 'câm tiếng', 'tiếng bị mất', 'không ra tiếng'] },
      { word: 'nghẹt mũi', weight: 9, synonyms: ['ngạt mũi', 'tắc mũi', 'nghet mui', 'mũi tắc', 'mũi bị nghẹt'] },
      { word: 'sổ mũi', weight: 9, synonyms: ['chảy nước mũi', 'so mui', 'mũi chảy', 'chảy mũi', 'mũi sổ'] },
      { word: 'chảy nước mũi', weight: 8, synonyms: ['sổ mũi', 'mũi chảy nước', 'chảy mũi', 'nước mũi chảy'] },
      { word: 'hắt hơi', weight: 7, synonyms: ['hắt xì', 'hắt hơi liên tục', 'hắt hơi nhiều', 'hắt xì hơi'] },
      { word: 'đau tai', weight: 10, synonyms: ['tai đau', 'dau tai', 'nhức tai', 'tai nhức', 'tai bị đau'] },
      { word: 'ù tai', weight: 9, synonyms: ['u tai', 'tai ù', 'nghe kém', 'tai bị ù', 'ù ù tai'] },
      { word: 'nghe kém', weight: 9, synonyms: ['điếc', 'nghe không rõ', 'giảm thính lực', 'tai kém', 'nghe yếu'] },
      { word: 'viêm tai giữa', weight: 10, synonyms: ['viêm tai', 'tai viêm', 'viem tai', 'viêm tai trong', 'tai giữa viêm'] },
      { word: 'chảy mủ tai', weight: 9, synonyms: ['tai chảy mủ', 'mủ tai', 'tai ra mủ', 'chảy dịch tai'] },
      { word: 'viêm xoang', weight: 10, synonyms: ['viem xoang', 'xoang viêm', 'đau xoang', 'viêm xoang mũi', 'viêm xoang mạn'] },
      { word: 'đau vùng xoang', weight: 9, synonyms: ['đau xoang', 'xoang đau', 'nhức xoang', 'đau vùng mũi'] },
      { word: 'khó nuốt', weight: 9, synonyms: ['nuốt khó', 'khó nuốt nước', 'đau khi nuốt', 'nuốt vướng'] },
      { word: 'đau khi nuốt', weight: 9, synonyms: ['nuốt đau', 'đau nuốt', 'đau họng khi nuốt', 'nuốt bị đau'] },
      { word: 'hôi miệng', weight: 7, synonyms: ['hơi thở hôi', 'hoi mieng', 'miệng hôi', 'thở hôi'] },
      { word: 'viêm amidan', weight: 10, synonyms: ['viem amidan', 'amidan sưng', 'sưng amidan', 'amidan viêm', 'viêm amiđan'] },
      { word: 'sưng amidan', weight: 9, synonyms: ['amidan sưng', 'amidan to', 'amidan bị sưng', 'sưng họng'] },
      { word: 'khó thở bằng mũi', weight: 8, synonyms: ['thở mũi khó', 'không thở được mũi', 'nghẹt mũi', 'tắc mũi'] },
      { word: 'ngứa họng', weight: 7, synonyms: ['họng ngứa', 'ngứa cổ họng', 'ngứa trong họng', 'họng bị ngứa'] },
      { word: 'đau đầu do xoang', weight: 9, synonyms: ['đau đầu xoang', 'nhức đầu do xoang', 'đau đầu viêm xoang'] },
      { word: 'chảy máu cam', weight: 9, synonyms: ['máu cam', 'chay mau mui', 'mũi chảy máu', 'chảy máu mũi'] },
      { word: 'khạc đờm', weight: 8, synonyms: ['ho đờm', 'đờm', 'khạc ra đờm', 'có đờm'] },
      { word: 'dị ứng mũi', weight: 8, synonyms: ['viêm mũi dị ứng', 'dị ứng', 'mũi dị ứng', 'viêm mũi'] },
      { word: 'thở khò khè', weight: 8, synonyms: ['khò khè', 'thở rít', 'thở có tiếng', 'thở khó'] },
      { word: 'cảm lạnh', weight: 8, synonyms: ['cảm', 'cúm', 'cam cum', 'cảm cúm', 'bị cảm'] },
      { word: 'sốt kèm đau họng', weight: 9, synonyms: ['sốt và đau họng', 'đau họng có sốt', 'sốt họng', 'sốt viêm họng'] }
    ]
  }
};
