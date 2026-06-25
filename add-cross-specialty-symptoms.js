const fs = require('fs');

// Đọc file symptoms-mapping.json
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🔧 Adding cross-specialty symptom references...\n');

// Define cross-specialty symptom updates
const updates = [
  // ============ THẦN KINH ============
  {
    id: 1,
    name: 'đau đầu',
    addKeywords: [], // Đã có đủ
    note: 'Primary in Thần kinh, cross-refs already added to other specialties'
  },
  {
    id: 2,
    name: 'chóng mặt',
    addKeywords: [], // Đã có đủ
    note: 'Already has cross-refs to Tim mạch'
  },
  
  // ============ CƠ XƯƠNG KHỚP ============
  {
    id: 31,
    name: 'đau lưng',
    addKeywords: ['đau lưng thận', 'đau lưng do thận', 'lưng đau thận'],
    note: 'Cross-ref to Tiết niệu'
  },
  {
    id: 32,
    name: 'đau khớp',
    addKeywords: ['đau khớp sưng', 'sưng khớp đau', 'đau khớp nóng'],
    note: 'Cross-ref to Da liễu (viêm khớp vẩy nến)'
  },
  
  // ============ TIM MẠCH ============
  {
    id: 61,
    name: 'đau ngực',
    addKeywords: ['đau ngực khó thở', 'thở khó đau ngực', 'đau ngực tức ngực'],
    note: 'Cross-ref to Hô hấp'
  },
  {
    id: 62,
    name: 'hồi hộp',
    addKeywords: ['hồi hộp lo âu', 'tim đập nhanh lo lắng', 'hồi hộp căng thẳng'],
    note: 'Cross-ref to Thần kinh (lo âu)'
  },
  {
    id: 67,
    name: 'chóng mặt (Tim mạch)',
    addKeywords: [], // Đã update trước đó
    note: 'Already updated with headache keywords'
  },
  
  // ============ TIÊU HÓA ============
  {
    id: 91,
    name: 'đau bụng',
    addKeywords: ['đau bụng kinh', 'đau bụng hành kinh', 'đau bụng chu kỳ'],
    note: 'Cross-ref to Sản phụ khoa'
  },
  {
    id: 92,
    name: 'buồn nôn',
    addKeywords: ['buồn nôn chóng mặt', 'nôn chóng mặt', 'buồn nôn đau đầu'],
    note: 'Cross-ref to Thần kinh'
  },
  {
    id: 93,
    name: 'nôn',
    addKeywords: ['nôn có máu', 'nôn ra máu', 'xuất huyết tiêu hóa'],
    note: 'Emphasis for severe cases'
  },
  
  // ============ HÔ HẤP ============
  {
    id: 121,
    name: 'ho',
    addKeywords: ['ho có đờm máu', 'ho ra máu', 'ho khan kéo dài'],
    note: 'Cross-ref to Tim mạch (ho có máu)'
  },
  {
    id: 122,
    name: 'khó thở',
    addKeywords: ['khó thở đau ngực', 'thở khó đau tim', 'khó thở hồi hộp'],
    note: 'Cross-ref to Tim mạch'
  },
  {
    id: 123,
    name: 'sổ mũi',
    addKeywords: ['sổ mũi nghẹt mũi', 'nghẹt sổ mũi'],
    note: 'Cross-ref to Tai mũi họng'
  },
  
  // ============ DA LIỄU ============
  {
    id: 151,
    name: 'ngứa da',
    addKeywords: ['ngứa da khô', 'da khô ngứa', 'ngứa da toàn thân'],
    note: 'Emphasis variations'
  },
  {
    id: 152,
    name: 'nổi mẩn',
    addKeywords: ['nổi mẩn ngứa', 'phát ban ngứa', 'dị ứng nổi mẩn'],
    note: 'Allergy cross-ref'
  },
  
  // ============ TAI MŨI HỌNG ============
  {
    id: 181,
    name: 'đau tai',
    addKeywords: ['đau tai chảy mủ', 'tai đau sưng', 'đau tai nghe kém'],
    note: 'Emphasis severity'
  },
  {
    id: 182,
    name: 'nghẹt mũi',
    addKeywords: ['nghẹt mũi đau đầu', 'nghẹt mũi khó thở'],
    note: 'Cross-ref to Hô hấp và Thần kinh'
  },
  {
    id: 204,
    name: 'đau đầu do xoang',
    addKeywords: [], // Đã có đủ
    note: 'Already has good headache keywords'
  },
  
  // ============ MẮT ============
  {
    id: 211,
    name: 'đau mắt',
    addKeywords: ['đau mắt đỏ', 'đau mắt nhức đầu', 'đau mắt mỏi'],
    note: 'Cross-ref variations'
  },
  {
    id: 213,
    name: 'mờ mắt',
    addKeywords: ['mờ mắt chóng mặt', 'chóng mặt mờ mắt', 'hoa mắt chóng mặt'],
    note: 'Cross-ref to Thần kinh và Tim mạch'
  },
  {
    id: 221,
    name: 'mỏi mắt',
    addKeywords: [], // Đã update trước đó
    note: 'Already updated with headache keywords'
  },
  {
    id: 224,
    name: 'đau khi nhìn',
    addKeywords: [], // Đã update trước đó
    note: 'Already updated with headache keywords'
  },
  
  // ============ NHI KHOA ============
  {
    id: 241,
    name: 'sốt (Nhi khoa)',
    addKeywords: ['sốt cao trẻ em', 'trẻ sốt', 'em bé sốt'],
    note: 'Pediatric-specific'
  },
  {
    id: 242,
    name: 'ho (Nhi khoa)',
    addKeywords: ['trẻ ho', 'em bé ho', 'ho trẻ nhỏ'],
    note: 'Pediatric-specific'
  },
  
  // ============ NỘI TIẾT ============
  {
    id: 271,
    name: 'khát nước nhiều',
    addKeywords: ['uống nước nhiều', 'khát liên tục', 'khát nước thường xuyên'],
    note: 'Diabetes symptom'
  },
  {
    id: 272,
    name: 'đi tiểu nhiều',
    addKeywords: ['tiểu đêm nhiều', 'đi tiểu đêm', 'tiểu nhiều lần'],
    note: 'Cross-ref to Tiết niệu'
  },
  {
    id: 273,
    name: 'mệt mỏi kéo dài',
    addKeywords: ['mệt mỏi mãn tính', 'luôn mệt', 'mệt không lý do'],
    note: 'Thyroid/diabetes symptom'
  },
  
  // ============ RĂNG HÀM MẶT ============
  {
    id: 301,
    name: 'đau răng',
    addKeywords: ['đau răng nhức đầu', 'răng đau lan lên đầu', 'đau răng đau tai'],
    note: 'Cross-ref to Thần kinh và Tai mũi họng'
  },
  {
    id: 302,
    name: 'sưng lợi',
    addKeywords: ['sưng lợi chảy máu', 'lợi sưng đỏ'],
    note: 'Emphasis'
  },
  
  // ============ SẢN PHỤ KHOA ============
  {
    id: 331,
    name: 'đau bụng kinh',
    addKeywords: ['đau bụng hành kinh', 'đau bụng chu kỳ', 'đau bụng kinh dữ dội'],
    note: 'Primary menstrual symptom'
  },
  {
    id: 332,
    name: 'rong kinh',
    addKeywords: ['rong huyết', 'chảy máu bất thường', 'kinh nguyệt bất thường'],
    note: 'Emphasis'
  },
];

let updateCount = 0;
let alreadyHasCount = 0;

updates.forEach(update => {
  const symptom = data.symptoms.find(s => s.id === update.id);
  if (symptom) {
    let hasNewKeywords = false;
    
    update.addKeywords.forEach(keyword => {
      if (!symptom.keywords.includes(keyword)) {
        symptom.keywords.push(keyword);
        hasNewKeywords = true;
      }
    });
    
    if (hasNewKeywords) {
      console.log(`✅ ID ${update.id} (${symptom.name}): Added ${update.addKeywords.length} keywords`);
      console.log(`   ${update.note}`);
      updateCount++;
    } else if (update.addKeywords.length > 0) {
      console.log(`ℹ️  ID ${update.id} (${symptom.name}): Already has keywords`);
      alreadyHasCount++;
    } else {
      console.log(`⏭️  ID ${update.id} (${symptom.name}): ${update.note}`);
    }
  } else {
    console.log(`❌ ID ${update.id}: Not found`);
  }
});

// Ghi lại file
fs.writeFileSync('symptoms-mapping.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\n' + '='.repeat(70));
console.log('✅ Successfully updated symptoms-mapping.json');
console.log('='.repeat(70));
console.log(`📊 Statistics:`);
console.log(`   - Updated: ${updateCount} symptoms`);
console.log(`   - Already had keywords: ${alreadyHasCount} symptoms`);
console.log(`   - Total processed: ${updates.length} symptoms`);
console.log('\n🎯 Benefits:');
console.log('   - Better cross-specialty symptom matching');
console.log('   - More accurate specialty recommendations');
console.log('   - Users can find the right specialty even with vague descriptions');
console.log('\n💡 Examples:');
console.log('   - "đau bụng kinh" → Tiêu hóa OR Sản phụ khoa');
console.log('   - "đau ngực khó thở" → Tim mạch OR Hô hấp');
console.log('   - "đau răng nhức đầu" → Răng hàm mặt OR Thần kinh');
console.log('   - "mờ mắt chóng mặt" → Mắt OR Thần kinh OR Tim mạch');
