import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './app/config/firebase';

/**
 * Script để sửa lỗi encoding tiếng Việt trong Firebase
 * Chạy script này để cập nhật dữ liệu trong Firestore
 */

async function fixEncoding() {
  console.log('🔧 Bắt đầu sửa lỗi encoding trong Firebase...');
  
  try {
    // Lấy tất cả doctors từ Firebase
    const doctorsRef = collection(getFirestoreDb(), 'doctors');
    const snapshot = await getDocs(doctorsRef);
    
    let fixed = 0;
    let total = 0;
    
    for (const docSnap of snapshot.docs) {
      total++;
      const data = docSnap.data();
      const docId = docSnap.id;
      
      // Kiểm tra và sửa các field
      let needsUpdate = false;
      const updates: any = {};
      
      // Sửa tên
      if (data.ten && (data.ten.includes('�') || data.ten.includes('?'))) {
        needsUpdate = true;
        // Map các tên bị lỗi sang tên đúng
        const nameMap: { [key: string]: string } = {
          'Nguy?n Van An': 'Nguyễn Văn An',
          'Tr?n Th? Lan': 'Trần Thị Lan',
          'L� Minh T�m': 'Lê Minh Tâm',
          'Tr?n Th? Mai': 'Trần Thị Mai',
          '�? Minh Tu?n': 'Đỗ Minh Tuấn',
          'Vu Th? Lan': 'Vũ Thị Lan',
          'Nguy?n Th? Hoa': 'Nguyễn Thị Hoa',
          'Ho�ng Van �?c': 'Hoàng Văn Đức',
          'Ng� Th? Huong': 'Ngô Thị Hương',
          'Tr?n Van Khoa': 'Trần Văn Khoa',
          'Ph?m Minh Qu�n': 'Phạm Minh Quân',
          'L� Th? H?ng': 'Lê Thị Hằng',
        };
        
        const fixedName = nameMap[data.ten] || data.ten;
        updates.ten = fixedName;
        console.log(`  ✓ Sửa tên: ${data.ten} → ${fixedName}`);
      }
      
      // Sửa chuyên khoa
      if (data.chuyen_khoa && (data.chuyen_khoa.includes('�') || data.chuyen_khoa.includes('?'))) {
        needsUpdate = true;
        const specialtyMap: { [key: string]: string } = {
          'Tim m?ch': 'Tim mạch',
          'S?n ph? khoa': 'Sản phụ khoa',
          'Da li?u': 'Da liễu',
          'M?t': 'Mắt',
          'Rang h�m m?t': 'Răng hàm mặt',
          'Co xuong kh?p': 'Cơ xương khớp',
          'H� h?p': 'Hô hấp',
          'N?i ti?t': 'Nội tiết',
          'Tai mui h?ng': 'Tai mũi họng',
          'Th?n kinh': 'Thần kinh',
          'Ti�u h�a': 'Tiêu hóa',
          '�a khoa': 'Đa khoa',
        };
        
        const fixedSpecialty = specialtyMap[data.chuyen_khoa] || data.chuyen_khoa;
        updates.chuyen_khoa = fixedSpecialty;
        console.log(`  ✓ Sửa chuyên khoa: ${data.chuyen_khoa} → ${fixedSpecialty}`);
      }
      
      // Cập nhật nếu cần
      if (needsUpdate) {
        const docRef = doc(getFirestoreDb(), 'doctors', docId);
        await updateDoc(docRef, updates);
        fixed++;
        console.log(`✅ Đã cập nhật doctor: ${docId}`);
      }
    }
    
    console.log(`\n🎉 Hoàn thành!`);
    console.log(`   - Tổng số bác sĩ: ${total}`);
    console.log(`   - Đã sửa: ${fixed}`);
    console.log(`   - Không cần sửa: ${total - fixed}`);
    
  } catch (error) {
    console.error('❌ Lỗi khi sửa encoding:', error);
  }
}

// Chạy script
fixEncoding();
