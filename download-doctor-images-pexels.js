// Script tải ảnh bác sĩ từ Pexels
const https = require('https');
const fs = require('fs');
const path = require('path');

// Danh sách ảnh bác sĩ từ Pexels (chất lượng cao, miễn phí)
const doctorImages = [
  {
    name: 'nguyenvanam.png',
    url: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam châu Á'
  },
  {
    name: 'tranthilan.png',
    url: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ với áo blouse trắng'
  },
  {
    name: 'leminhtam.png',
    url: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam trẻ'
  },
  {
    name: 'tranthimai.png',
    url: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ mỉm cười'
  },
  {
    name: 'lehoangnam.png',
    url: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam với stethoscope'
  },
  {
    name: 'phamthuha.png',
    url: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ chuyên nghiệp'
  },
  {
    name: 'dominhtuan.png',
    url: 'https://images.pexels.com/photos/5215023/pexels-photo-5215023.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam đeo kính'
  },
  {
    name: 'vuthilan.png',
    url: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ trẻ'
  },
  {
    name: 'hoangvanduc.png',
    url: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam chuyên nghiệp'
  },
  {
    name: 'ngothihuong.png',
    url: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ với clipboard'
  },
  {
    name: 'nguyenthihoa.png',
    url: 'https://images.pexels.com/photos/5407204/pexels-photo-5407204.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ mỉm cười'
  },
  {
    name: 'tranvankhoa.png',
    url: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam với stethoscope'
  },
  {
    name: 'phamminhquan.png',
    url: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam châu Á'
  },
  {
    name: 'lethihang.png',
    url: 'https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ trẻ'
  },
  {
    name: 'nguyenvanhai.png',
    url: 'https://images.pexels.com/photos/5215023/pexels-photo-5215023.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nam đeo kính'
  },
  {
    name: 'dangthithao.jpg',
    url: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bác sĩ nữ với áo blouse trắng'
  }
];

// Tạo thư mục assets/images nếu chưa có
const assetsDir = path.join(__dirname, 'assets', 'images');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Đã tạo thư mục: assets/images');
}

// Hàm tải ảnh
function downloadImage(imageInfo, index) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(assetsDir, imageInfo.name);
    
    // Kiểm tra xem file đã tồn tại chưa
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Bỏ qua (đã có): ${imageInfo.name}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    
    setTimeout(() => {
      https.get(imageInfo.url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${imageInfo.name}: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`✅ [${index + 1}/${doctorImages.length}] Tải thành công: ${imageInfo.name}`);
          console.log(`   📝 ${imageInfo.description}`);
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
    }, index * 500); // Delay 500ms giữa các request
  });
}

// Tải tất cả ảnh
async function downloadAllImages() {
  console.log('🚀 Bắt đầu tải ảnh bác sĩ từ Pexels...\n');
  console.log(`📊 Tổng số ảnh cần tải: ${doctorImages.length}\n`);

  try {
    for (let i = 0; i < doctorImages.length; i++) {
      await downloadImage(doctorImages[i], i);
    }
    
    console.log('\n🎉 Hoàn thành! Đã tải tất cả ảnh bác sĩ.');
    console.log(`📁 Vị trí: ${assetsDir}`);
    console.log('\n📋 Các bước tiếp theo:');
    console.log('   1. Kiểm tra ảnh trong thư mục assets/images/');
    console.log('   2. Chạy ứng dụng để xem kết quả');
    console.log('   3. Nếu cần, thay đổi ảnh khác từ Pexels');
  } catch (error) {
    console.error('\n❌ Lỗi khi tải ảnh:', error.message);
    console.log('\n💡 Giải pháp:');
    console.log('   1. Kiểm tra kết nối internet');
    console.log('   2. Thử chạy lại script');
    console.log('   3. Hoặc tải ảnh thủ công từ: https://www.pexels.com/search/asian%20doctor/');
  }
}

// Chạy script
downloadAllImages();
