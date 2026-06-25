/**
 * Script kiểm tra chi tiết 3 bác sĩ: bs001, bs002, bs007
 * 
 * Chạy: node check-3-doctors.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const PROBLEM_DOCTORS = [
  { id: 'bs001', name: 'Nguyễn Văn An', specialty: 'Tim mạch' },
  { id: 'bs002', name: 'Trần Thị Lan', specialty: 'Da liễu' },
  { id: 'bs007', name: 'Đỗ Minh Tuấn', specialty: 'Da liễu' }
];

async function checkDoctor(doctorId, doctorName, specialty) {
  console.log('\n' + '='.repeat(60));
  console.log(`🔍 KIỂM TRA: ${doctorName} (${doctorId}) - ${specialty}`);
  console.log('='.repeat(60));
  
  const issues = [];
  
  // 1. Kiểm tra doctor document
  console.log('\n📋 BƯỚC 1: Doctor Document');
  try {
    const doctorDoc = await db.collection('doctors').doc(doctorId).get();
    
    if (!doctorDoc.exists) {
      console.log('  ❌ Doctor document KHÔNG TỒN TẠI');
      issues.push('Doctor document không tồn tại');
      return issues;
    }
    
    console.log('  ✅ Doctor document tồn tại');
    
    const doctorData = doctorDoc.data();
    const authUid = doctorData.authUid;
    
    if (!authUid) {
      console.log('  ❌ THIẾU authUid');
      issues.push('Thiếu authUid trong doctor document');
    } else {
      console.log(`  ✅ AuthUid: ${authUid}`);
    }
    
    // 2. Kiểm tra user account
    console.log('\n📋 BƯỚC 2: User Account');
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .where('doctorInfo.doctorId', '==', doctorId)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('  ❌ KHÔNG TÌM THẤY user account');
      issues.push('Không có user account');
    } else {
      const userData = usersSnapshot.docs[0].data();
      const userUid = usersSnapshot.docs[0].id;
      
      console.log('  ✅ Tìm thấy user account');
      console.log(`     User UID: ${userUid}`);
      console.log(`     Email: ${userData.email}`);
      
      // So sánh authUid
      if (authUid && authUid !== userUid) {
        console.log('  ❌ AuthUid KHÔNG KHỚP với User UID');
        console.log(`     Doctor authUid: ${authUid}`);
        console.log(`     User UID: ${userUid}`);
        issues.push(`AuthUid không khớp (doctor: ${authUid}, user: ${userUid})`);
      } else if (authUid === userUid) {
        console.log('  ✅ AuthUid KHỚP với User UID');
      }
    }
    
    // 3. Kiểm tra conversations
    console.log('\n📋 BƯỚC 3: Conversations');
    
    // Query theo doctorId
    const convsSnapshot = await db.collection('conversations')
      .where('doctorId', '==', doctorId)
      .get();
    
    console.log(`  Conversations với doctorId=${doctorId}: ${convsSnapshot.size}`);
    
    if (convsSnapshot.empty) {
      console.log('  ℹ️ Chưa có conversation nào');
    } else {
      convsSnapshot.forEach(doc => {
        const convData = doc.data();
        console.log(`\n  📝 Conversation: ${doc.id}`);
        console.log(`     Patient: ${convData.patientName}`);
        console.log(`     DoctorId: ${convData.doctorId}`);
        console.log(`     DoctorAuthUid: ${convData.doctorAuthUid || 'KHÔNG CÓ'}`);
        
        if (!convData.doctorAuthUid) {
          console.log('     ⚠️ Thiếu doctorAuthUid');
          issues.push(`Conversation ${doc.id} thiếu doctorAuthUid`);
        } else if (authUid && convData.doctorAuthUid !== authUid) {
          console.log('     ⚠️ doctorAuthUid không khớp');
          issues.push(`Conversation ${doc.id} có doctorAuthUid không khớp`);
        }
      });
    }
    
    // Query theo authUid nếu có
    if (authUid) {
      const convsByAuthUidSnapshot = await db.collection('conversations')
        .where('doctorAuthUid', '==', authUid)
        .get();
      
      console.log(`\n  Conversations với doctorAuthUid=${authUid}: ${convsByAuthUidSnapshot.size}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Lỗi: ${error.message}`);
    issues.push(`Lỗi: ${error.message}`);
  }
  
  // Tổng kết
  console.log('\n' + '─'.repeat(60));
  if (issues.length === 0) {
    console.log('✅ KHÔNG CÓ VẤN ĐỀ');
  } else {
    console.log('❌ CÓ VẤN ĐỀ:');
    issues.forEach(issue => {
      console.log(`   • ${issue}`);
    });
  }
  console.log('─'.repeat(60));
  
  return issues;
}

async function main() {
  console.log('\n🔧 BẮT ĐẦU KIỂM TRA 3 BÁC SĨ\n');
  
  const allIssues = {};
  
  for (const doctor of PROBLEM_DOCTORS) {
    const issues = await checkDoctor(doctor.id, doctor.name, doctor.specialty);
    allIssues[doctor.id] = issues;
  }
  
  // Tổng kết chung
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TỔNG KẾT');
  console.log('='.repeat(60));
  
  for (const doctor of PROBLEM_DOCTORS) {
    const issues = allIssues[doctor.id];
    console.log(`\n${doctor.name} (${doctor.id}):`);
    if (issues.length === 0) {
      console.log('  ✅ OK - Không có vấn đề');
    } else {
      console.log(`  ❌ ${issues.length} vấn đề:`);
      issues.forEach(issue => {
        console.log(`     • ${issue}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ HOÀN THÀNH\n');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Lỗi:', error);
  process.exit(1);
});
