const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'app/booking-confirmation.tsx',
  'app/booking-patient-info.tsx',
  'app/find-hospital.tsx',
  'app/doctor/profile.tsx',
  'app/doctor/edit-profile.tsx',
  'app/doctor/dashboard.tsx',
  'app/booking-success.tsx',
  'app/booking-payment.tsx',
  'app/appointment-detail.tsx',
  'app/reviews.tsx',
  'app/write-review.tsx',
  'app/article-comments.tsx',
];

const oldImportPattern = /const doctorImages = \{[\s\S]*?\};/;
const newImport = "import { getDoctorAvatarSmart, getDoctorAvatarById, getDoctorAvatarByFileName, doctorImages } from './utils/doctorAvatars';";

console.log('🔧 Bắt đầu cập nhật các file sử dụng doctorImages...\n');

filesToUpdate.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Bỏ qua ${filePath} (file không tồn tại)`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Kiểm tra xem file có import hoặc define doctorImages không
    if (content.includes('doctorImages')) {
      // Xóa định nghĩa cũ của doctorImages nếu có
      if (oldImportPattern.test(content)) {
        content = content.replace(oldImportPattern, '');
        updated = true;
        console.log(`✅ Đã xóa định nghĩa cũ trong ${filePath}`);
      }

      // Thêm import mới nếu chưa có
      if (!content.includes("from './utils/doctorAvatars'") && 
          !content.includes('from "../utils/doctorAvatars"')) {
        
        // Tìm vị trí import cuối cùng
        const importMatches = content.match(/import .+ from .+;/g);
        if (importMatches && importMatches.length > 0) {
          const lastImport = importMatches[importMatches.length - 1];
          const lastImportIndex = content.lastIndexOf(lastImport);
          
          // Xác định đường dẫn tương đối đúng
          const relativePath = filePath.startsWith('app/doctor/') 
            ? '../utils/doctorAvatars' 
            : './utils/doctorAvatars';
          
          const importStatement = `import { getDoctorAvatarSmart, getDoctorAvatarById, getDoctorAvatarByFileName, doctorImages } from '${relativePath}';`;
          
          content = content.slice(0, lastImportIndex + lastImport.length) + 
                   '\n' + importStatement + 
                   content.slice(lastImportIndex + lastImport.length);
          
          updated = true;
          console.log(`✅ Đã thêm import mới vào ${filePath}`);
        }
      }

      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Đã cập nhật ${filePath}\n`);
      } else {
        console.log(`ℹ️  Không cần thay đổi ${filePath}\n`);
      }
    }
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý ${filePath}:`, error.message);
  }
});

console.log('\n✅ Hoàn thành!');
console.log('\n📝 Lưu ý: Bạn cần thay thế thủ công các đoạn code sử dụng doctorImages[] bằng getDoctorAvatarSmart()');
