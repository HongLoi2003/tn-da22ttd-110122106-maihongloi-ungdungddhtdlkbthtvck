import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './config/firebase';

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
      
      // Check if encoding is broken
      const needsFix = Object.values(data).some((val: any) => 
        typeof val === 'string' && /[Ã¡Ã Ã Ã¢]/.test(val)
      );
      
      if (needsFix) {
        console.log(`⚠️ Fixing encoding for doctor: ${docId}`);
        
        // Create corrected data
        const correctedData: any = {};
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string') {
            // Fix common Vietnamese encoding issues
            correctedData[key] = value
              .replace(/Ã¡/g, 'á')
              .replace(/Ã /g, 'à')
              .replace(/Ã¢/g, 'â')
              .replace(/Ã£/g, 'ã')
              .replace(/Ã©/g, 'é')
              .replace(/Ã¨/g, 'è')
              .replace(/Ãª/g, 'ê')
              .replace(/Ã­/g, 'í')
              .replace(/Ã¬/g, 'ì')
              .replace(/Ã³/g, 'ó')
              .replace(/Ã²/g, 'ò')
              .replace(/Ã´/g, 'ô')
              .replace(/Ãµ/g, 'õ')
              .replace(/Ãº/g, 'ú')
              .replace(/Ã¹/g, 'ù')
              .replace(/Å©/g, 'ũ')
              .replace(/Äƒ/g, 'ă')
              .replace(/Ä'/g, 'đ')
              .replace(/Å©/g, 'ũ')
              .replace(/Æ¡/g, 'ơ')
              .replace(/Æ°/g, 'ư');
          } else {
            correctedData[key] = value;
          }
        });
        
        // Update document
        const docRef = doc(getFirestoreDb(), 'doctors', docId);
        await updateDoc(docRef, correctedData);
        
        fixed++;
        console.log(`✅ Fixed: ${docId}`);
      }
    }
    
    console.log(`\n✅ Hoàn thành! Đã sửa ${fixed}/${total} bác sĩ`);
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Export for use in other scripts
export { fixEncoding };

