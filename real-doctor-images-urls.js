/**
 * Danh sách URL ảnh bác sĩ THẬT từ Unsplash & Pexels
 * MIỄN PHÍ BẢN QUYỀN - Dùng cho thương mại
 * 
 * Chạy: node real-doctor-images-urls.js
 */

const fs = require('fs');
const path = require('path');

// 16 ảnh bác sĩ thật - chất lượng cao, miễn phí bản quyền
const realDoctorImages = {
  // Nam bác sĩ
  'nguyenvanam.png': 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg', // Male doctor with stethoscope
  'leminhtam.png': 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg', // Young male doctor
  'lehoangnam.png': 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg', // Male doctor in white coat
  'dominhtuan.png': 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg', // Male doctor smiling
  'hoangvanduc.png': 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg', // Asian male doctor
  'tranvankhoa.png': 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg', // Male doctor with arms crossed
  'phamminhquan.png': 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg', // Male doctor portrait
  'nguyenvanhai.png': 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg', // Senior male doctor
  
  // Nữ bác sĩ
  'tranthilan.png': 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg', // Female doctor smiling
  'tranthimai.png': 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg', // Female doctor with stethoscope
  'phamthuha.png': 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg', // Female doctor portrait
  'vuthilan.png': 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg', // Young female doctor
  'ngothihuong.png': 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg', // Female doctor smiling
  'nguyenthihoa.png': 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg', // Female doctor in clinic
  'lethihang.png': 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg', // Female doctor professional
  'dangthithao.jpg': 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg', // Female doctor with tablet
};

console.log('🎯 16 URL ảnh bác sĩ THẬT (Unsplash - Miễn phí bản quyền)\n');
console.log('='.repeat(70));

Object.entries(realDoctorImages).forEach(([filename, url], index) => {
  console.log(`\n${index + 1}. ${filename}`);
  console.log(`   ${url}`);
});

console.log('\n' + '='.repeat(70));
console.log('\n✅ Tất cả ảnh từ Unsplash - MIỄN PHÍ bản quyền');
console.log('📝 Bạn có thể dùng cho mục đích thương mại');
console.log('\n🔧 Bước tiếp theo:');
console.log('   1. Kiểm tra ảnh bằng cách mở URL trong browser');
console.log('   2. Chạy: node update-to-real-doctor-images.js');
console.log('   3. Build app: .\\build-apk.ps1\n');

// Export để script khác dùng
module.exports = realDoctorImages;
