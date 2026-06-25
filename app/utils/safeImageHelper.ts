/**
 * Safe Image Helper - Xử lý ảnh an toàn cho build
 * Sử dụng URL thay vì require() để tránh lỗi bundle
 */

// Ảnh local nhỏ (< 100KB) - an toàn để bundle
const SAFE_LOCAL_IMAGES = {
  'logo.png': { uri: "https://via.placeholder.com/150" },
  'icon.png': { uri: "https://via.placeholder.com/150" },
};

// Ảnh từ URL - không gây lỗi build
const IMAGE_URLS: Record<string, string> = {
  // Doctor avatars - Ảnh THẬT từ Pexels
  'nguyenvanam.png': 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg',
  'tranthilan.png': 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg',
  'lehoangminh.png': 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg',
  'phamthihong.png': 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg',
  'hoangvantuan.png': 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg',
  
  // Article images - dùng placeholder
  'hearderddau.png': 'https://via.placeholder.com/400x200/4A90E2/ffffff?text=Headache',
  'bacsi.png': 'https://via.placeholder.com/400x200/50C878/ffffff?text=Doctor',
  'benhvien.png': 'https://via.placeholder.com/400x200/FF6B6B/ffffff?text=Hospital',
  'ai.png': 'https://via.placeholder.com/400x200/9B59B6/ffffff?text=AI+Health',
  'bckgour.png': 'https://via.placeholder.com/400x200/3498DB/ffffff?text=Background',
  
  // Default fallback
  'default.png': 'https://via.placeholder.com/150/CCCCCC/666666?text=No+Image',
};

/**
 * Lấy source ảnh an toàn
 * @param imageName - Tên file ảnh
 * @returns Image source (local require hoặc URL)
 */
export function getSafeImageSource(imageName: string | undefined) {
  if (!imageName) {
    return { uri: IMAGE_URLS['default.png'] };
  }

  // Kiểm tra ảnh local an toàn
  if (SAFE_LOCAL_IMAGES[imageName as keyof typeof SAFE_LOCAL_IMAGES]) {
    return SAFE_LOCAL_IMAGES[imageName as keyof typeof SAFE_LOCAL_IMAGES];
  }

  // Dùng URL
  const url = IMAGE_URLS[imageName] || IMAGE_URLS['default.png'];
  return { uri: url };
}

/**
 * Kiểm tra ảnh có tồn tại không
 */
export function imageExists(imageName: string): boolean {
  return !!(
    SAFE_LOCAL_IMAGES[imageName as keyof typeof SAFE_LOCAL_IMAGES] ||
    IMAGE_URLS[imageName]
  );
}

/**
 * Lấy tất cả ảnh bác sĩ
 */
export function getAllDoctorImages(): string[] {
  return Object.keys(IMAGE_URLS).filter(key => 
    !['hearderddau.png', 'bacsi.png', 'benhvien.png', 'ai.png', 'bckgour.png', 'default.png'].includes(key)
  );
}

export default {
  getSafeImageSource,
  imageExists,
  getAllDoctorImages,
};
