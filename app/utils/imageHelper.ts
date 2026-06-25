import { Platform } from 'react-native';

/**
 * Helper để load ảnh từ assets cho cả web và native
 * Web cần path tuyệt đối, native dùng require()
 */

// Map tất cả ảnh bác sĩ
// Map tất cả ảnh bác sĩ THẬT từ Pexels (miễn phí bản quyền)
const doctorImages: { [key: string]: any } = {
  'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
  'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
  'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
  'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
  'lehoangnam.png': { uri: 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg' },
  'phamthuha.png': { uri: 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg' },
  'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
  'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
  'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
  'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
  'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
  'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
  'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
  'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
  'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
  'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
  'logo.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
};

// Map ảnh bệnh viện (chỉ có 2 file thực sự tồn tại)
const hospitalImages: { [key: string]: any } = {
  'benhvien.png': { uri: "https://via.placeholder.com/150" },
  'benhviendhtv.png': { uri: "https://via.placeholder.com/150" },
};

// Map ảnh chuyên khoa
const specialtyImages: { [key: string]: any } = {
  'tim-mach.png': { uri: "https://via.placeholder.com/150" },
  'nhi-khoa.png': { uri: "https://via.placeholder.com/150" },
  'san-phu-khoa.png': { uri: "https://via.placeholder.com/150" },
  'da-lieu.png': { uri: "https://via.placeholder.com/150" },
  'mat.png': { uri: "https://via.placeholder.com/150" },
  'rang-ham-mat.png': { uri: "https://via.placeholder.com/150" },
  'co-xuong-khop.png': { uri: "https://via.placeholder.com/150" },
  'ho-hap.png': { uri: "https://via.placeholder.com/150" },
  'noi-tiet.png': { uri: "https://via.placeholder.com/150" },
  'tai-mui-hong.png': { uri: "https://via.placeholder.com/150" },
  'than-kinh.png': { uri: "https://via.placeholder.com/150" },
  'tieu-hoa.png': { uri: "https://via.placeholder.com/150" },
};

// Map ảnh chung
const commonImages: { [key: string]: any } = {
  'logo.png': { uri: "https://via.placeholder.com/150" },
  'icon.png': { uri: "https://via.placeholder.com/150" },
  'bacsi.png': { uri: "https://via.placeholder.com/150" },
  'bckgour.png': { uri: "https://via.placeholder.com/150" },
  'ai.png': { uri: "https://via.placeholder.com/150" },
  'baohiemyte.png': { uri: "https://via.placeholder.com/150" },
  'chuyenkhoa.png': { uri: "https://via.placeholder.com/150" },
  'datlichkham.png': { uri: "https://via.placeholder.com/150" },
  'doimk.png': { uri: "https://via.placeholder.com/150" },
  'hearderddau.png': { uri: "https://via.placeholder.com/150" },
  'hoso.png': { uri: "https://via.placeholder.com/150" },
  'hotrosuckhoe.png': { uri: "https://via.placeholder.com/150" },
  'khoa.png': { uri: "https://via.placeholder.com/150" },
  'kiemtratrieuchung.png': { uri: "https://via.placeholder.com/150" },
  'lichkham.png': { uri: "https://via.placeholder.com/150" },
  'nhathuoc.png': { uri: "https://via.placeholder.com/150" },
  'timbenhvien.png': { uri: "https://via.placeholder.com/150" },
  'tuvanonline.png': { uri: "https://via.placeholder.com/150" },
  'xacnhanemail.png': { uri: "https://via.placeholder.com/150" },
};

/**
 * Get image source cho cả web và native
 * @param imageName - Tên file ảnh (vd: 'nguyenvanam.png')
 * @param type - Loại ảnh: 'doctor' | 'hospital' | 'specialty' | 'article' | 'common'
 * @returns Image source object hoặc URI string
 */
export function getImageSource(imageName: string, type: 'doctor' | 'hospital' | 'specialty' | 'common' = 'common') {
  let imageMap: { [key: string]: any } = {};
  
  switch (type) {
    case 'doctor':
      imageMap = doctorImages;
      break;
    case 'hospital':
      imageMap = hospitalImages;
      break;
    case 'specialty':
      imageMap = specialtyImages;
      break;
    case 'common':
      imageMap = commonImages;
      break;
  }

  const imageSource = imageMap[imageName];
  
  if (!imageSource) {
    console.warn(`Image not found: ${imageName} (type: ${type})`);
    return commonImages['logo.png']; // Fallback
  }

  return imageSource;
}

/**
 * Get URI string từ Firebase hoặc local
 * Dùng cho Image component với source={{ uri: ... }}
 */
export function getImageUri(imageUrl: string | null | undefined, fallbackType: 'doctor' | 'hospital' | 'common' = 'common'): string | null {
  // Nếu có URL từ Firebase, dùng luôn
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }

  // Nếu là tên file local, convert sang URI cho web
  if (imageUrl && Platform.OS === 'web') {
    // Trên web, cần path tuyệt đối
    return `/assets/images/${imageUrl}`;
  }

  return null;
}

/**
 * Get image source object cho Image component
 * Tự động xử lý cả local và remote images
 */
export function getImageSourceObject(imageUrl: string | null | undefined, fallbackName: string = 'logo.png', fallbackType: 'doctor' | 'hospital' | 'common' = 'common') {
  // Nếu có URL từ Firebase
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return { uri: imageUrl };
  }

  // Nếu là tên file local
  if (imageUrl) {
    const source = getImageSource(imageUrl, fallbackType);
    if (source) {
      return source;
    }
  }

  // Fallback
  return getImageSource(fallbackName, fallbackType);
}

// Export các map để dùng trực tiếp nếu cần
export { commonImages, doctorImages, hospitalImages, specialtyImages };

