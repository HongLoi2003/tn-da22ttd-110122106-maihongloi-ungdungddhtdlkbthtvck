const fs = require('fs');
const path = require('path');

// Mapping bác sĩ với URL ảnh
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
};

console.log('🔄 Đang sửa các file còn lại...\n');

const filesToFix = [
  'app/find-hospital.tsx',
  'app/doctor-detail.tsx',
  'app/doctor-chat.tsx',
  'app/doctor/profile.tsx',
  'app/doctor/edit-profile.tsx',
  'app/doctor/dashboard.tsx',
  'app/chat-screen.tsx',
  'app/write-review.tsx',
  'app/recommended-doctors.tsx',
  'app/specialty-detail.tsx',
  'app/hospital-detail.tsx',
  'app/notifications.tsx',
];

let fixedCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Thay thế tất cả các require('@/assets/images/...') bằng URL
    Object.entries(doctorImageUrls).forEach(([fileName, url]) => {
      // Pattern 1: require('@/assets/images/filename.png')
      const requirePattern1 = new RegExp(`require\\(['"]@\\/assets\\/images\\/${fileName.replace('.', '\\.')}['"]\\)`, 'g');
      if (requirePattern1.test(content)) {
        content = content.replace(requirePattern1, `{ uri: '${url}' }`);
        modified = true;
      }
      
      // Pattern 2: require('@/assets/images/filename') without extension
      const fileNameNoExt = fileName.replace(/\.(png|jpg)$/, '');
      const requirePattern2 = new RegExp(`require\\(['"]@\\/assets\\/images\\/${fileNameNoExt}['"]\\)`, 'g');
      if (requirePattern2.test(content)) {
        content = content.replace(requirePattern2, `{ uri: '${url}' }`);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Đã sửa ${filePath}`);
      fixedCount++;
    }
  } else {
    console.log(`⚠️  File không tồn tại: ${filePath}`);
  }
});

console.log(`\n✅ Hoàn thành! Đã sửa ${fixedCount} file.`);
