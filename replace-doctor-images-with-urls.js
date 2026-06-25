const fs = require('fs');
const path = require('path');

// Mapping bác sĩ với URL ảnh từ avatar API
const doctorImageUrls = {
  'nguyenvanam.png': 'https://i.pravatar.cc/200?img=12',
  'tranthilan.png': 'https://i.pravatar.cc/200?img=5',
  'leminhtam.png': 'https://i.pravatar.cc/200?img=33',
  'tranthimai.png': 'https://i.pravatar.cc/200?img=47',
  'lehoangnam.png': 'https://i.pravatar.cc/200?img=13',
  'phamthuha.png': 'https://i.pravatar.cc/200?img=48',
  'dominhtuan.png': 'https://i.pravatar.cc/200?img=15',
  'vuthilan.png': 'https://i.pravatar.cc/200?img=9',
  'hoangvanduc.png': 'https://i.pravatar.cc/200?img=68',
  'ngothihuong.png': 'https://i.pravatar.cc/200?img=23',
  'nguyenthihoa.png': 'https://i.pravatar.cc/200?img=44',
  'tranvankhoa.png': 'https://i.pravatar.cc/200?img=51',
  'phamminhquan.png': 'https://i.pravatar.cc/200?img=59',
  'lethihang.png': 'https://i.pravatar.cc/200?img=45',
  'nguyenvanhai.png': 'https://i.pravatar.cc/200?img=60',
  'dangthithao.jpg': 'https://i.pravatar.cc/200?img=32',
  'phamthuha.png': 'https://i.pravatar.cc/200?img=48',
  'logo.png': 'https://i.pravatar.cc/200?img=1',
};

console.log('🔄 Bắt đầu thay thế ảnh bác sĩ bằng URL...\n');

// 1. Cập nhật app/utils/doctorAvatars.ts
console.log('📝 Đang cập nhật app/utils/doctorAvatars.ts...');
const doctorAvatarsPath = path.join(__dirname, 'app', 'utils', 'doctorAvatars.ts');
const doctorAvatarsContent = `// Mapping tên bác sĩ với URL ảnh
export const doctorImages: { [key: string]: any } = {
${Object.entries(doctorImageUrls).map(([key, url]) => `  '${key}': { uri: '${url}' },`).join('\n')}
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

// Default avatar
const defaultAvatar = { uri: 'https://i.pravatar.cc/200?img=1' };

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
console.log('✅ Đã cập nhật app/utils/doctorAvatars.ts\n');

// 2. Cập nhật app/utils/imageHelper.ts
console.log('📝 Đang cập nhật app/utils/imageHelper.ts...');
const imageHelperPath = path.join(__dirname, 'app', 'utils', 'imageHelper.ts');
let imageHelperContent = fs.readFileSync(imageHelperPath, 'utf8');

// Thay thế phần doctorImages
const doctorImagesSection = `const doctorImages: { [key: string]: any } = {
${Object.entries(doctorImageUrls).map(([key, url]) => `  '${key}': { uri: '${url}' },`).join('\n')}
};`;

imageHelperContent = imageHelperContent.replace(
  /const doctorImages: \{ \[key: string\]: any \} = \{[\s\S]*?\n\};/,
  doctorImagesSection
);

fs.writeFileSync(imageHelperPath, imageHelperContent, 'utf8');
console.log('✅ Đã cập nhật app/utils/imageHelper.ts\n');

// 3. Cập nhật app/debug-doctor-images.tsx
console.log('📝 Đang cập nhật app/debug-doctor-images.tsx...');
const debugDoctorImagesPath = path.join(__dirname, 'app', 'debug-doctor-images.tsx');
let debugDoctorImagesContent = fs.readFileSync(debugDoctorImagesPath, 'utf8');

const imagesSection = `  const images: { [key: string]: any } = {
${Object.entries(doctorImageUrls).map(([key, url]) => `    '${key}': { uri: '${url}' },`).join('\n')}
  };`;

debugDoctorImagesContent = debugDoctorImagesContent.replace(
  /const images: \{ \[key: string\]: any \} = \{[\s\S]*?\n  \};/,
  imagesSection
);

fs.writeFileSync(debugDoctorImagesPath, debugDoctorImagesContent, 'utf8');
console.log('✅ Đã cập nhật app/debug-doctor-images.tsx\n');

// 4. Tìm và cập nhật các file khác có sử dụng require('@/assets/images/...)
console.log('📝 Tìm kiếm các file còn lại...');
const filesToCheck = [
  'app/write-review.tsx',
  'app/recommended-doctors.tsx',
  'app/specialty-detail.tsx',
  'app/hospital-detail.tsx',
];

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Thay thế tất cả các require('@/assets/images/...') bằng URL
    Object.entries(doctorImageUrls).forEach(([fileName, url]) => {
      const requirePattern = new RegExp(`require\\(['"]@\\/assets\\/images\\/${fileName}['"]\\)`, 'g');
      if (requirePattern.test(content)) {
        content = content.replace(requirePattern, `{ uri: '${url}' }`);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Đã cập nhật ${filePath}`);
    }
  }
});

console.log('\n✅ Hoàn thành! Tất cả ảnh bác sĩ đã được thay thế bằng URL.');
console.log('\n📋 Danh sách URL đã sử dụng:');
Object.entries(doctorImageUrls).forEach(([key, url]) => {
  console.log(`  ${key} -> ${url}`);
});
