// Mapping tên bác sĩ với URL ảnh
export const doctorImages: { [key: string]: any } = {
  'nguyenvanam.png': { uri: 'https://i.pravatar.cc/200?img=12' },
  'tranthilan.png': { uri: 'https://i.pravatar.cc/200?img=5' },
  'leminhtam.png': { uri: 'https://i.pravatar.cc/200?img=33' },
  'tranthimai.png': { uri: 'https://i.pravatar.cc/200?img=47' },
  'lehoangnam.png': { uri: 'https://i.pravatar.cc/200?img=13' },
  'phamthuha.png': { uri: 'https://i.pravatar.cc/200?img=48' },
  'dominhtuan.png': { uri: 'https://i.pravatar.cc/200?img=15' },
  'vuthilan.png': { uri: 'https://i.pravatar.cc/200?img=9' },
  'hoangvanduc.png': { uri: 'https://i.pravatar.cc/200?img=68' },
  'ngothihuong.png': { uri: 'https://i.pravatar.cc/200?img=23' },
  'nguyenthihoa.png': { uri: 'https://i.pravatar.cc/200?img=44' },
  'tranvankhoa.png': { uri: 'https://i.pravatar.cc/200?img=51' },
  'phamminhquan.png': { uri: 'https://i.pravatar.cc/200?img=59' },
  'lethihang.png': { uri: 'https://i.pravatar.cc/200?img=45' },
  'nguyenvanhai.png': { uri: 'https://i.pravatar.cc/200?img=60' },
  'dangthithao.jpg': { uri: 'https://i.pravatar.cc/200?img=32' },
  'logo.png': { uri: 'https://i.pravatar.cc/200?img=1' },
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
