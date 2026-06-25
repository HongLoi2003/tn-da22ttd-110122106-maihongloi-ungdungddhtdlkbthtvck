const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const targetDoctors = [
  { id: 'bs004', name: 'BS. Trần Thị Lan' },
  { id: 'bs003', name: 'BS. Đỗ Minh Tuấn' }
];

async function fixDoctorConversations() {
  console.log('=== KIỂM TRA VÀ FIX 3 BÁC SĨ (CHỈ DÙNG DOCTORID) ===\n');

  try {
    for (const doctor of targetDoctors) {
      console.log(`\n📋 Đang xử lý ${doctor.name} (${doctor.id})...`);

      // 1. Tìm authUid của bác sĩ từ users collection
      console.log(`   🔍 Tìm authUid trong users collection...`);
      const usersSnapshot = await db.collection('users')
        .where('role', '==', 'doctor')
        .get();

      let matchingUser = null;
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.doctorInfo?.doctorId === doctor.id) {
          matchingUser = { id: doc.id, ...userData };
        }
      });

      if (!matchingUser) {
        console.log(`   ❌ Không tìm thấy user với doctorInfo.doctorId = ${doctor.id}`);
        continue;
      }

      const authUid = matchingUser.uid;
      console.log(`   ✅ Tìm thấy authUid: ${authUid}`);

      // 2. Tìm tất cả conversations có thể liên quan
      console.log(`\n   📨 Tìm conversations...`);
      
      // Tìm theo doctorId đúng (bs001, bs004, etc.)
      const convByDoctorId = await db.collection('conversations')
        .where('doctorId', '==', doctor.id)
        .get();
      console.log(`   - Có ${convByDoctorId.size} conversations với doctorId = ${doctor.id}`);

      // Tìm theo authUid (có thể conversations cũ lưu authUid làm doctorId)
      const convByAuthUid = await db.collection('conversations')
        .where('doctorId', '==', authUid)
        .get();
      console.log(`   - Có ${convByAuthUid.size} conversations với doctorId = authUid`);

      // 3. Fix conversations sai (doctorId = authUid) -> đổi thành doctorId đúng
      let fixedCount = 0;
      for (const doc of convByAuthUid.docs) {
        const convData = doc.data();
        if (convData.doctorId === authUid) {
          // Sửa doctorId về đúng format (bs001, bs004, etc.)
          await db.collection('conversations').doc(doc.id).update({
            doctorId: doctor.id
          });
          fixedCount++;
          console.log(`   ✅ Sửa conversation ${doc.id}: doctorId ${authUid} → ${doctor.id}`);
        }
      }

      if (fixedCount > 0) {
        console.log(`   ✅ Đã fix ${fixedCount} conversations`);
      } else {
        console.log(`   ✅ Không có conversations cần fix`);
      }

      // 4. Kiểm tra lại
      console.log(`\n   🔍 Kiểm tra lại sau khi fix...`);
      const finalCheck = await db.collection('conversations')
        .where('doctorId', '==', doctor.id)
        .get();
      console.log(`   ✅ Bác sĩ ${doctor.name} hiện có ${finalCheck.size} conversations`);
      
      if (finalCheck.size > 0) {
        console.log(`   📝 Chi tiết conversations:`);
        finalCheck.forEach(doc => {
          const c = doc.data();
          console.log(`      - ${c.patientName || 'Không rõ'} (${c.lastMessage?.substring(0, 30) || 'Chưa có tin nhắn'})`);
        });
      }
    }

    console.log('\n\n✅ HOÀN TẤT! Tất cả 3 bác sĩ đã được kiểm tra và fix.');
    console.log('\n💡 Bây giờ bác sĩ đăng nhập sẽ thấy tin nhắn từ bệnh nhân.');
    
  } catch (error) {
    console.error('\n❌ LỖI:', error);
  } finally {
    process.exit(0);
  }
}

fixDoctorConversations();
