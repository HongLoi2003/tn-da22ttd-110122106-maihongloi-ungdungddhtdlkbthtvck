// Mapping tên bác sĩ với file ảnh
export const doctorImages: { [key: string]: any } = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'tranthimai.png': require('@/assets/images/tranthimai.png'),
  'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
  'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
  'vuthilan.png': require('@/assets/images/vuthilan.png'),
  'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
  'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.png'),
  'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
  'phamminhquan.png': require('@/assets/images/phamminhquan.png'),
  'lethihang.png': require('@/assets/images/lethihang.png'),
  'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png'),
  'dangthithao.jpg': require('@/assets/images/dangthithao.jpg'),
  'logo.png': require('@/assets/images/logo.png'),
};

// Mapping tên bác sĩ (fullName) với file ảnh
export const doctorNameToImage: { [key: string]: string } = {
  'Nguyễn Văn An': 'nguyenvanam.png',
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
  'BS. Nguyễn Văn An': 'nguyenvanam.png',
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
const defaultAvatar = require('@/assets/images/logo.png');

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
