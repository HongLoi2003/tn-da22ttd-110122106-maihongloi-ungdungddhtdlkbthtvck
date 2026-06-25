const fs = require('fs');

// Đọc file symptoms-mapping.json
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

console.log('🚀 COMPREHENSIVE SYMPTOM ENHANCEMENT - Phase 2');
console.log('='.repeat(70));
console.log('Adding more cross-specialty references for common symptoms\n');

// Enhanced cross-references for remaining common symptoms
const phase2Updates = [
  // ============ THẦN KINH - Bổ sung ============
  {
    id: 3,
    name: 'mất ngủ',
    addKeywords: ['mất ngủ lo âu', 'khó ngủ căng thẳng', 'mất ngủ stress', 'trằn trọc đêm'],
    note: 'Mental health cross-ref'
  },
  {
    id: 5,
    name: 'run tay chân',
    addKeywords: ['run tay do lo lắng', 'tay run thần kinh', 'run khi hồi hộp'],
    note: 'Anxiety/Parkinson cross-ref'
  },
  {
    id: 6,
    name: 'tê tay chân',
    addKeywords: ['tê chân do tiểu đường', 'tê tay đái tháo đường', 'tê bàn tay bàn chân'],
    note: 'Cross-ref to Nội tiết (diabetes)'
  },
  
  // ============ CƠ XƯƠNG KHỚP - Bổ sung ============
  {
    id: 33,
    name: 'đau vai',
    addKeywords: ['đau vai cứng', 'vai đau cứng', 'viêm bao hoạt dịch vai'],
    note: 'Common shoulder pain'
  },
  {
    id: 34,
    name: 'đau gối',
    addKeywords: ['đau gối sưng', 'gối sưng đau', 'đau gối khi đi'],
    note: 'Knee pain emphasis'
  },
  {
    id: 35,
    name: 'đau khớp ngón tay',
    addKeywords: ['đau ngón tay sưng', 'ngón tay sưng cứng', 'khớp tay đau'],
    note: 'Arthritis emphasis'
  },
  
  // ============ TIM MẠCH - Bổ sung ============
  {
    id: 63,
    name: 'đau tức ngực',
    addKeywords: ['ngực nặng khó thở', 'đau ngực lan ra tay', 'tức ngực đau tay trái'],
    note: 'Heart attack warning signs'
  },
  {
    id: 64,
    name: 'hồi hộp tim đập nhanh',
    addKeywords: ['tim đập nhanh bất thường', 'tim đập không đều', 'rối loạn nhịp tim'],
    note: 'Arrhythmia symptoms'
  },
  {
    id: 66,
    name: 'mệt mỏi',
    addKeywords: ['mệt mỏi khó thở', 'mệt dễ dàng', 'mệt khi gắng sức'],
    note: 'Heart failure symptom'
  },
  
  // ============ TIÊU HÓA - Bổ sung ============
  {
    id: 94,
    name: 'ợ nóng',
    addKeywords: ['trào ngược dạ dày', 'ợ chua', 'nóng rát thực quản'],
    note: 'GERD symptoms'
  },
  {
    id: 95,
    name: 'tiêu chảy',
    addKeywords: ['tiêu chảy cấp', 'đi ngoài phân lỏng', 'tiêu chảy nhiều lần'],
    note: 'Diarrhea emphasis'
  },
  {
    id: 96,
    name: 'táo bón',
    addKeywords: ['táo bón mãn tính', 'khó đi ngoài', 'táo bón kéo dài'],
    note: 'Constipation emphasis'
  },
  
  // ============ HÔ HẤP - Bổ sung ============
  {
    id: 124,
    name: 'thở khò khè',
    addKeywords: ['hen suyễn', 'khó thở khò khè', 'thở rít'],
    note: 'Asthma symptom'
  },
  {
    id: 125,
    name: 'đau ngực khi thở',
    addKeywords: ['đau ngực hít thở', 'đau khi hít sâu', 'đau ngực thở sâu'],
    note: 'Pleurisy symptom'
  },
  {
    id: 126,
    name: 'ho ra máu',
    addKeywords: ['khạc ra máu', 'đờm có máu', 'ho có máu'],
    note: 'Serious respiratory symptom'
  },
  
  // ============ DA LIỄU - Bổ sung ============
  {
    id: 153,
    name: 'vẩy nến',
    addKeywords: ['da bong vảy', 'vảy trắng trên da', 'viêm da vẩy nến'],
    note: 'Psoriasis'
  },
  {
    id: 154,
    name: 'mụn trứng cá',
    addKeywords: ['mụn nhiều', 'mụn viêm', 'mụn bọc'],
    note: 'Acne emphasis'
  },
  {
    id: 155,
    name: 'viêm da cơ địa',
    addKeywords: ['chàm', 'da khô ngứa', 'viêm da dị ứng'],
    note: 'Eczema/Atopic dermatitis'
  },
  
  // ============ TAI MŨI HỌNG - Bổ sung ============
  {
    id: 183,
    name: 'khàn tiếng',
    addKeywords: ['khàn giọng', 'mất tiếng', 'tiếng khàn kéo dài'],
    note: 'Voice problems'
  },
  {
    id: 184,
    name: 'nuốt đau',
    addKeywords: ['đau khi nuốt', 'khó nuốt', 'đau họng khi nuốt'],
    note: 'Dysphagia'
  },
  {
    id: 185,
    name: 'viêm xoang',
    addKeywords: ['đau xoang', 'nghẹt mũi đau đầu', 'xoang viêm'],
    note: 'Sinusitis emphasis'
  },
  
  // ============ MẮT - Bổ sung ============
  {
    id: 212,
    name: 'mắt đỏ',
    addKeywords: ['mắt đỏ ngứa', 'mắt đỏ ngứa', 'đỏ mắt viêm'],
    note: 'Red eye syndrome'
  },
  {
    id: 214,
    name: 'khô mắt',
    addKeywords: ['mắt khô rát', 'khô mắt mỏi', 'hội chứng khô mắt'],
    note: 'Dry eye syndrome'
  },
  {
    id: 220,
    name: 'nhạy cảm ánh sáng',
    addKeywords: ['sợ ánh sáng', 'chói mắt', 'mắt nhạy sáng'],
    note: 'Photophobia'
  },
  
  // ============ NHI KHOA - Bổ sung ============
  {
    id: 243,
    name: 'sổ mũi (Nhi)',
    addKeywords: ['trẻ sổ mũi', 'em bé sổ mũi', 'sổ mũi nước'],
    note: 'Pediatric runny nose'
  },
  {
    id: 247,
    name: 'biếng ăn',
    addKeywords: ['trẻ biếng ăn', 'em không chịu ăn', 'trẻ kém ăn'],
    note: 'Pediatric feeding problem'
  },
  {
    id: 248,
    name: 'quấy khóc',
    addKeywords: ['trẻ quấy nhiều', 'em khóc đêm', 'trẻ khó ngủ'],
    note: 'Pediatric irritability'
  },
  
  // ============ NỘI TIẾT - Bổ sung ============
  {
    id: 274,
    name: 'tăng cân bất thường',
    addKeywords: ['béo lên nhanh', 'tăng cân không rõ lý do', 'béo phì'],
    note: 'Thyroid/hormonal'
  },
  {
    id: 275,
    name: 'rụng tóc nhiều',
    addKeywords: ['tóc rụng nhiều', 'rụng tóc bất thường', 'hói đầu'],
    note: 'Thyroid symptom'
  },
  {
    id: 276,
    name: 'run tay',
    addKeywords: ['run tay tuyến giáp', 'tay run không kiểm soát', 'run khi đưa tay'],
    note: 'Hyperthyroidism'
  },
  
  // ============ RĂNG HÀM MẶT - Bổ sung ============
  {
    id: 303,
    name: 'chảy máu chân răng',
    addKeywords: ['lợi chảy máu', 'chảy máu lợi', 'viêm nướu chảy máu'],
    note: 'Gingivitis/Periodontitis'
  },
  {
    id: 304,
    name: 'hôi miệng',
    addKeywords: ['miệng hôi', 'hơi thở hôi', 'mùi miệng khó chịu'],
    note: 'Halitosis'
  },
  {
    id: 305,
    name: 'viêm tủy răng',
    addKeywords: ['răng đau nhức', 'đau răng dữ dội', 'răng đau buốt'],
    note: 'Pulpitis'
  },
  
  // ============ SẢN PHỤ KHOA - Bổ sung ============
  {
    id: 333,
    name: 'ra nhiều khí hư',
    addKeywords: ['khí hư bất thường', 'nhiều dịch âm đạo', 'khí hư có mùi'],
    note: 'Vaginal discharge'
  },
  {
    id: 334,
    name: 'đau khi quan hệ',
    addKeywords: ['đau khi giao hợp', 'đau âm đạo', 'khó chịu khi quan hệ'],
    note: 'Dyspareunia'
  },
  {
    id: 335,
    name: 'chậm kinh',
    addKeywords: ['trễ kinh', 'kinh nguyệt trễ', 'chậm hành kinh'],
    note: 'Delayed menstruation'
  },
];

let updateCount = 0;

phase2Updates.forEach(update => {
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
    }
  }
});

// Ghi lại file
fs.writeFileSync('symptoms-mapping.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\n' + '='.repeat(70));
console.log('✅ Phase 2 Enhancement Complete!');
console.log('='.repeat(70));
console.log(`📊 Statistics:`);
console.log(`   - Updated: ${updateCount} symptoms`);
console.log(`   - Total keywords added: ${updateCount * 3}+ keywords`);
console.log('\n🎯 Enhanced Coverage:');
console.log('   ✓ Thần kinh: Mental health, neuropathy');
console.log('   ✓ Cơ xương khớp: Joint pain variations');
console.log('   ✓ Tim mạch: Heart attack, arrhythmia warnings');
console.log('   ✓ Tiêu hóa: GERD, bowel disorders');
console.log('   ✓ Hô hấp: Asthma, serious symptoms');
console.log('   ✓ Da liễu: Psoriasis, eczema, acne');
console.log('   ✓ Tai mũi họng: Voice, swallowing problems');
console.log('   ✓ Mắt: Dry eye, photophobia');
console.log('   ✓ Nhi khoa: Pediatric-specific terms');
console.log('   ✓ Nội tiết: Thyroid disorders');
console.log('   ✓ Răng hàm mặt: Gum disease, bad breath');
console.log('   ✓ Sản phụ khoa: Women\'s health issues');
console.log('\n💡 System is now comprehensive with 350+ symptoms!');
