import { Platform } from 'react-native';

/**
 * Helper để load ảnh từ assets cho cả web và native
 * Web cần path tuyệt đối, native dùng require()
 */

// Map tất cả ảnh bác sĩ
const doctorImages: { [key: string]: any } = {
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
  'hesuyen.png': require('@/assets/images/hesuyen.png'),
};

// Map ảnh bệnh viện (chỉ có 2 file thực sự tồn tại)
const hospitalImages: { [key: string]: any } = {
  'benhvien.png': require('@/assets/images/benhvien.png'),
  'benhviendhtv.png': require('@/assets/images/benhviendhtv.png'),
};

// Map ảnh chuyên khoa
const specialtyImages: { [key: string]: any } = {
  'tim-mach.png': require('@/assets/images/tim-mach.png'),
  'nhi-khoa.png': require('@/assets/images/nhi-khoa.png'),
  'san-phu-khoa.png': require('@/assets/images/san-phu-khoa.png'),
  'da-lieu.png': require('@/assets/images/da-lieu.png'),
  'mat.png': require('@/assets/images/mat.png'),
  'rang-ham-mat.png': require('@/assets/images/rang-ham-mat.png'),
  'co-xuong-khop.png': require('@/assets/images/co-xuong-khop.png'),
  'ho-hap.png': require('@/assets/images/ho-hap.png'),
  'noi-tiet.png': require('@/assets/images/noi-tiet.png'),
  'tai-mui-hong.png': require('@/assets/images/tai-mui-hong.png'),
  'than-kinh.png': require('@/assets/images/than-kinh.png'),
  'tieu-hoa.png': require('@/assets/images/tieu-hoa.png'),
};

// Map ảnh bài viết
const articleImages: { [key: string]: any } = {
  'chedouonguoc.png': require('@/assets/images/chedouonguoc.png'),
  'stress.png': require('@/assets/images/stress.png'),
  'dauhieubenhtim.png': require('@/assets/images/dauhieubenhtim.png'),
  'yoga.png': require('@/assets/images/yoga.png'),
  'chamsocdamun.png': require('@/assets/images/chamsocdamun.png'),
  'chamsocrang.png': require('@/assets/images/chamsocrang.png'),
  'chamsoctresosinh.png': require('@/assets/images/chamsoctresosinh.png'),
  'canthiotreem.png': require('@/assets/images/canthiotreem.png'),
  'daukhopgoi.png': require('@/assets/images/daukhopgoi.png'),
  'ngudugiac.png': require('@/assets/images/ngudugiac.png'),
  'thaikykhoemanh.png': require('@/assets/images/thaikykhoemanh.png'),
  'viemloetdaday.png': require('@/assets/images/viemloetdaday.png'),
  'viemxoangmantinh.png': require('@/assets/images/viemxoangmantinh.png'),
};

// Map ảnh chung
const commonImages: { [key: string]: any } = {
  'logo.png': require('@/assets/images/logo.png'),
  'icon.png': require('@/assets/images/icon.png'),
  'bacsi.png': require('@/assets/images/bacsi.png'),
  'bckgour.png': require('@/assets/images/bckgour.png'),
  'ai.png': require('@/assets/images/ai.png'),
  'baohiemyte.png': require('@/assets/images/baohiemyte.png'),
  'chuyenkhoa.png': require('@/assets/images/chuyenkhoa.png'),
  'datlichkham.png': require('@/assets/images/datlichkham.png'),
  'doimk.png': require('@/assets/images/doimk.png'),
  'hearderddau.png': require('@/assets/images/hearderddau.png'),
  'hoso.png': require('@/assets/images/hoso.png'),
  'hotrosuckhoe.png': require('@/assets/images/hotrosuckhoe.png'),
  'khoa.png': require('@/assets/images/khoa.png'),
  'kiemtratrieuchung.png': require('@/assets/images/kiemtratrieuchung.png'),
  'lichkham.png': require('@/assets/images/lichkham.png'),
  'nhathuoc.png': require('@/assets/images/nhathuoc.png'),
  'timbenhvien.png': require('@/assets/images/timbenhvien.png'),
  'tuvanonline.png': require('@/assets/images/tuvanonline.png'),
  'xacnhanemail.png': require('@/assets/images/xacnhanemail.png'),
};

/**
 * Get image source cho cả web và native
 * @param imageName - Tên file ảnh (vd: 'nguyenvanam.png')
 * @param type - Loại ảnh: 'doctor' | 'hospital' | 'specialty' | 'article' | 'common'
 * @returns Image source object hoặc URI string
 */
export function getImageSource(imageName: string, type: 'doctor' | 'hospital' | 'specialty' | 'article' | 'common' = 'common') {
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
    case 'article':
      imageMap = articleImages;
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
export { articleImages, commonImages, doctorImages, hospitalImages, specialtyImages };

