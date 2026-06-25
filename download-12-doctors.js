/**
 * Tải 12 ảnh bác sĩ cho 12 chuyên khoa
 * Chạy: node download-12-doctors.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 12 ảnh bác sĩ từ Pexels (kích thước Small - 50-100KB)
const doctors = [
  {
    name: 'nguyenvanam.png',
    specialty: 'Tim mạch',
    gender: 'nam',
    url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'tranthilan.png',
    specialty: 'Sản phụ khoa',
    gender: 'nữ',
    url: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'leminhtam.png',
    specialty: 'Nhi khoa',
    gender: 'nam',
    url: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'tranthimai.png',
    specialty: 'Da liễu',
    gender: 'nữ',
    url: 'https://images.pexels.com/photos/3845457/pexels-photo-3845457.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'dominhtuan.png',
    specialty: 'Mắt',
    gender: 'nam',
    url: 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'vuthilan.png',
    specialty: 'Răng hàm mặt',
    gender: 'nữ',
    url: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'nguyenthihoa.png',
    specialty: 'Cơ xương khớp',
    gender: 'nữ',
    url: 'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'hoangvanduc.png',
    specialty: 'Hô hấp',
    gender: 'nam',
    url: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'ngothihuong.png',
    specialty: 'Nội tiết',
    gender: 'nữ',
    url: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'tranvankhoa.png',
    specialty: 'Tai mũi họng',
    gender: 'nam',
    url: 'https://images.pexels.com/photos/5327653/pexels-photo-5327653.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'phamminhquan.png',
    specialty: 'Thần kinh',
    gender: 'nam',
    url: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'lethihang.png',
    specialty: 'Tiêu hóa',
    gender: 'nữ',
    url: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const ASSETS_DIR = path.join(__dirname, 'assets', 'images');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

function downloadImage(doctor, index) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(ASSETS_DIR, doctor.name);
    
    // Kiểm tra file đã tồn tại
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Bỏ qua: ${doctor.name} (đã tồn tại)`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(doctor.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        
        // Kiểm tra kích thước
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        console.log(`✅ ${index + 1}/12: ${doctor.name}`);
        console.log(`   Chuyên khoa: ${doctor.specialty}`);
        console.log(`   Kích thước: ${sizeKB} KB`);
        console.log('');
        
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🚀 BẮT ĐẦU TẢI 12 ẢNH BÁC SĨ\n');
  console.log('='.repeat(60));
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < doctors.length; i++) {
    try {
      await downloadImage(doctors[i], i);
      successCount++;
    } catch (error) {
      console.error(`❌ Lỗi tải ${doctors[i].name}:`, error.message);
      errorCount++;
    }
  }

  console.log('='.repeat(60));
  console.log('\n✅ HOÀN THÀNH!\n');
  console.log(`📊 Kết quả:`);
  console.log(`   Thành công: ${successCount}/12`);
  console.log(`   Lỗi: ${errorCount}/12`);
  console.log('');
  console.log('📁 Ảnh đã lưu vào: assets/images/');
  console.log('');
  console.log('🎯 Bước tiếp theo:');
  console.log('   1. Kiểm tra ảnh trong assets/images/');
  console.log('   2. Chạy: .\\build-now.ps1');
  console.log('');
}

main().catch(console.error);
