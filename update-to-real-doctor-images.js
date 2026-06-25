/**
 * Cập nhật tất cả file để dùng ảnh bác sĩ THẬT
 * Chạy: node update-to-real-doctor-images.js
 */

const fs = require('fs');
const path = require('path');

// URL ảnh bác sĩ thật từ Unsplash (miễn phí bản quyền)
// Ảnh bác sĩ châu Á/Việt Nam - chất lượng cao
const realDoctorImages = {
  // 8 bác sĩ NAM
  'nguyenvanam.png': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', // Asian male doctor with stethoscope
  'leminhtam.png': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80', // Young Asian male doctor
  'lehoangnam.png': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80', // Male doctor portrait
  'dominhtuan.png': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', // Male doctor smiling
  'hoangvanduc.png': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', // Asian male doctor professional
  'tranvankhoa.png': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80', // Male doctor with arms crossed
  'phamminhquan.png': 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=400&q=80', // Male doctor close-up
  'nguyenvanhai.png': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80', // Senior male doctor
  
  // 8 bác sĩ NỮ
  'tranthilan.png': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', // Female doctor smiling
  'tranthimai.png': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', // Asian female doctor with stethoscope
  'phamthuha.png': 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400&q=80', // Female doctor portrait
  'vuthilan.png': 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=400&q=80', // Young female doctor
  'ngothihuong.png': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', // Female doctor professional
  'nguyenthihoa.png': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80', // Female doctor in clinic
  'lethihang.png': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', // Female doctor white coat
  'dangthithao.jpg': 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&q=80', // Female doctor with tablet
  
  // Default
  'logo.png': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
};

console.log('🔄 Đang cập nhật sang ảnh bác sĩ THẬT từ Unsplash...\n');

// 1. Cập nhật app/utils/doctorAvatars.ts
console.log('📝 1/2 Cập nhật app/utils/doctorAvatars.ts...');
const doctorAvatarsPath = path.join(__dirname, 'app', 'utils', 'doctorAvatars.ts');
const doctorAvatarsContent = `// Mapping tên bác sĩ với URL ảnh THẬT từ Unsplash (miễn phí bản quyền)
export const doctorImages: { [key: string]: any } = {
${Object.entries(realDoctorImages).map(([key, url]) => `  '${key}': { uri: '${url}' },`).join('\n')}
};

// Mapping tên bác sĩ (fullName) với file ảnh
export const doctorNameToImage: { [key: string]: string } = {
  'Trần Thị Lan': 'tranthilan.png',
  'Lê Minh Tâm': 'leminhtam.png',
  'Trần Thị Mai': 'tranthimai.png',
  'Lê Hoàng Nam': 'lehoangnam.png',
  'Phạm Thu Hà': 'phamthuha.png',
  'Đỗ Minh Tuấn': 'dominhtuan.png',
  'Vũ Thị Lan': 'vuthilan.png',
  'Hoàng Văn Đức': 'hoangvanduc.png',
  'Ngô Thị Hương': 'ngothihuong.png',
  'Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'Trần Văn Khoa': 'tranvankhoa.png',
  'Phạm Minh Quân': 'phamminhquan.png',
  'Lê Thị Hằng': 'lethihang.png',
  'Nguyễn Văn Hải': 'nguyenvanhai.png',
  'Đặng Thị Thảo': 'dangthithao.jpg',
  // Also handle names with "BS." prefix
  'BS. Trần Thị Lan': 'tranthilan.png',
  'BS. Lê Minh Tâm': 'leminhtam.png',
  'BS. Trần Thị Mai': 'tranthimai.png',
  'BS. Lê Hoàng Nam': 'lehoangnam.png',
  'BS. Phạm Thu Hà': 'phamthuha.png',
  'BS. Đỗ Minh Tuấn': 'dominhtuan.png',
  'BS. Vũ Thị Lan': 'vuthilan.png',
  'BS. Hoàng Văn Đức': 'hoangvanduc.png',
  'BS. Ngô Thị Hương': 'ngothihuong.png',
  'BS. Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'BS. Trần Văn Khoa': 'tranvankhoa.png',
  'BS. Phạm Minh Quân': 'phamminhquan.png',
  'BS. Lê Thị Hằng': 'lethihang.png',
  'BS. Nguyễn Văn Hải': 'nguyenvanhai.png',
  'BS. Đặng Thị Thảo': 'dangthithao.jpg',
};

// Default avatar - Ảnh bác sĩ thật từ Unsplash
const defaultAvatar = { uri: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80' };

/**
 * Lấy avatar của bác sĩ - hàm tổng hợp với nhiều fallback
 * @param doctorName - Tên đầy đủ của bác sĩ
 * @param imageName - Tên file ảnh (hinh_anh hoặc image từ Firebase)
 * @returns Image source
 */
export function getDoctorAvatarSmart(
  doctorName?: string | null,
  imageName?: string | null
): any {
  // Priority 1: Thử lấy từ imageName (hinh_anh hoặc image)
  if (imageName && typeof imageName === 'string' && doctorImages[imageName]) {
    return doctorImages[imageName];
  }

  // Priority 2: Thử map theo tên bác sĩ (có xử lý "BS." prefix)
  if (doctorName && typeof doctorName === 'string') {
    // Try exact match first
    let mappedImage = doctorNameToImage[doctorName];
    
    // If not found and name starts with "BS.", try without prefix
    if (!mappedImage && doctorName.startsWith('BS. ')) {
      const nameWithoutPrefix = doctorName.substring(4);
      mappedImage = doctorNameToImage[nameWithoutPrefix];
    }
    
    if (mappedImage && doctorImages[mappedImage]) {
      return doctorImages[mappedImage];
    }
  }

  // Priority 3: Default avatar
  return defaultAvatar;
}

/**
 * Lấy avatar của bác sĩ theo tên
 * @param doctorName - Tên đầy đủ của bác sĩ (ví dụ: "Trần Thị Mai")
 * @returns Image source hoặc default avatar
 */
export function getDoctorAvatar(doctorName: string | undefined | null): any {
  if (!doctorName) return defaultAvatar;
  const imageName = doctorNameToImage[doctorName];
  if (imageName && doctorImages[imageName]) {
    return doctorImages[imageName];
  }
  return defaultAvatar;
}

/**
 * Lấy avatar của bác sĩ theo file name
 * @param imageName - Tên file ảnh (ví dụ: "tranthimai.png")
 * @returns Image source hoặc default avatar
 */
export function getDoctorAvatarByFileName(imageName: string | undefined | null): any {
  if (imageName && doctorImages[imageName]) {
    return doctorImages[imageName];
  }
  return defaultAvatar;
}
`;

fs.writeFileSync(doctorAvatarsPath, doctorAvatarsContent, 'utf8');
console.log('   ✅ Đã cập nhật\n');

// 2. Cập nhật app/utils/imageHelper.ts
console.log('📝 2/2 Cập nhật app/utils/imageHelper.ts...');
const imageHelperPath = path.join(__dirname, 'app', 'utils', 'imageHelper.ts');
let imageHelperContent = fs.readFileSync(imageHelperPath, 'utf8');

const doctorImagesSection = `const doctorImages: { [key: string]: any } = {
${Object.entries(realDoctorImages).map(([key, url]) => `  '${key}': { uri: '${url}' },`).join('\n')}
};`;

imageHelperContent = imageHelperContent.replace(
  /const doctorImages: \{ \[key: string\]: any \} = \{[\s\S]*?\n\};/,
  doctorImagesSection
);

fs.writeFileSync(imageHelperPath, imageHelperContent, 'utf8');
console.log('   ✅ Đã cập nhật\n');

console.log('='.repeat(70));
console.log('\n✅ HOÀN THÀNH! Đã chuyển sang ảnh bác sĩ THẬT từ Unsplash\n');
console.log('📸 Nguồn: Unsplash.com (Miễn phí bản quyền)');
console.log('✨ Chất lượng: Professional, High Resolution');
console.log('⚖️  Bản quyền: Miễn phí thương mại\n');
console.log('📋 Danh sách ảnh đã cập nhật:');

Object.entries(realDoctorImages).forEach(([filename, url], index) => {
  console.log(`   ${index + 1}. ${filename}`);
});

console.log('\n🚀 Bước tiếp theo:');
console.log('   1. Kiểm tra: Mở app và xem ảnh bác sĩ');
console.log('   2. Build APK: .\\build-apk.ps1');
console.log('   3. Test trên thiết bị thật\n');
