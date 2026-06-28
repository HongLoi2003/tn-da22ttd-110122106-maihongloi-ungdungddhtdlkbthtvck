// Mapping tên bác sĩ với URL ảnh THẬT từ Pexels (miễn phí bản quyền)
export const doctorImages: { [key: string]: any } = {
  // 8 bác sĩ NAM
  'nguyenvanan.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
  'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
  'lehoangnam.png': { uri: 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg' },
  'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
  'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
  'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
  'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
  'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
  
  // 8 bác sĩ NỮ
  'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
  'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
  'phamthuha.png': { uri: 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg' },
  'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
  'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
  'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
  'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
  'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
  
  // Legacy names (backward compatibility)
  'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
  
  // Default
  'logo.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
};

// Mapping tên bác sĩ (fullName) với file ảnh
export const doctorNameToImage: { [key: string]: string } = {
  'Nguyễn Văn An': 'nguyenvanan.png',
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
  'BS. Nguyễn Văn An': 'nguyenvanan.png',
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

// Mapping doctorId với image name (cho trường hợp cần lookup nhanh theo ID)
export const doctorIdToImage: { [key: string]: string } = {
  'bs001': 'nguyenvanan.png',
  'bs002': 'tranthilan.png',
  'bs003': 'leminhtam.png',
  'bs004': 'tranthimai.png',
  'bs005': 'lehoangnam.png',
  'bs006': 'phamthuha.png',
  'bs007': 'dominhtuan.png',
  'bs008': 'vuthilan.png',
  'bs009': 'hoangvanduc.png',
  'bs010': 'ngothihuong.png',
  'bs011': 'nguyenthihoa.png',
  'bs012': 'tranvankhoa.png',
  'bs013': 'phamminhquan.png',
  'bs014': 'lethihang.png',
  'bs015': 'nguyenvanhai.png',
  'bs016': 'dangthithao.jpg',
};

// Default avatar - Ảnh bác sĩ thật từ Pexels
const defaultAvatar = { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' };

/**
 * Lấy avatar của bác sĩ - hàm tổng hợp với nhiều fallback
 * @param doctorName - Tên đầy đủ của bác sĩ
 * @param imageName - Tên file ảnh (hinh_anh hoặc image từ Firebase)
 * @param doctorId - ID của bác sĩ (bs001, bs002, ...)
 * @returns Image source
 */
export function getDoctorAvatarSmart(
  doctorName?: string | null,
  imageName?: string | null,
  doctorId?: string | null
): any {
  // Priority 1: Thử lấy từ imageName (hinh_anh hoặc image)
  if (imageName && typeof imageName === 'string' && doctorImages[imageName]) {
    return doctorImages[imageName];
  }

  // Priority 2: Thử map theo doctorId
  if (doctorId && typeof doctorId === 'string') {
    const mappedImage = doctorIdToImage[doctorId];
    if (mappedImage && doctorImages[mappedImage]) {
      return doctorImages[mappedImage];
    }
  }

  // Priority 3: Thử map theo tên bác sĩ (có xử lý "BS." prefix)
  if (doctorName && typeof doctorName === 'string') {
    // Try exact match first
    let mappedImage = doctorNameToImage[doctorName];
    
    // If not found and name starts with "BS.", try without prefix
    if (!mappedImage && doctorName.startsWith('BS. ')) {
      const nameWithoutPrefix = doctorName.substring(4);
      mappedImage = doctorNameToImage[nameWithoutPrefix];
    }
    
    // If still not found and name doesn't start with "BS.", try with prefix
    if (!mappedImage && !doctorName.startsWith('BS. ')) {
      mappedImage = doctorNameToImage['BS. ' + doctorName];
    }
    
    if (mappedImage && doctorImages[mappedImage]) {
      return doctorImages[mappedImage];
    }
  }

  // Priority 4: Default avatar
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

/**
 * Lấy avatar của bác sĩ theo ID
 * @param doctorId - ID của bác sĩ (ví dụ: "bs001")
 * @returns Image source hoặc default avatar
 */
export function getDoctorAvatarById(doctorId: string | undefined | null): any {
  if (!doctorId) return defaultAvatar;
  const imageName = doctorIdToImage[doctorId];
  if (imageName && doctorImages[imageName]) {
    return doctorImages[imageName];
  }
  return defaultAvatar;
}
