/**
 * Script để xóa tất cả lịch khám và tin nhắn test của bác sĩ
 * Chạy: node clear-doctor-test-data.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin đã được khởi tạo\n');

const db = admin.firestore();

async function clearAllAppointments() {
  console.log('🗑️  Đang xóa tất cả lịch khám...');
  
  try {
    const appointmentsSnapshot = await db.collection('appointments').get();
    
    if (appointmentsSnapshot.empty) {
      console.log('✅ Không có lịch khám nào để xóa');
      return 0;
    }

    console.log(`📋 Tìm thấy ${appointmentsSnapshot.size} lịch khám`);
    
    const batch = db.batch();
    let count = 0;
    
    appointmentsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      console.log(`   ➡️  Xóa lịch khám: ${doc.id}`);
    });
    
    await batch.commit();
    console.log(`✅ Đã xóa ${count} lịch khám`);
    return count;
  } catch (error) {
    console.error('❌ Lỗi khi xóa lịch khám:', error);
    return 0;
  }
}

async function clearAllConversations() {
  console.log('\n🗑️  Đang xóa tất cả cuộc hội thoại...');
  
  try {
    const conversationsSnapshot = await db.collection('conversations').get();
    
    if (conversationsSnapshot.empty) {
      console.log('✅ Không có cuộc hội thoại nào để xóa');
      return 0;
    }

    console.log(`💬 Tìm thấy ${conversationsSnapshot.size} cuộc hội thoại`);
    
    const batch = db.batch();
    let count = 0;
    
    conversationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      count++;
      console.log(`   ➡️  Xóa conversation: ${doc.id}`);
    });
    
    await batch.commit();
    console.log(`✅ Đã xóa ${count} cuộc hội thoại`);
    return count;
  } catch (error) {
    console.error('❌ Lỗi khi xóa cuộc hội thoại:', error);
    return 0;
  }
}

async function clearAllMessages() {
  console.log('\n🗑️  Đang xóa tất cả tin nhắn...');
  
  try {
    const messagesSnapshot = await db.collection('messages').get();
    
    if (messagesSnapshot.empty) {
      console.log('✅ Không có tin nhắn nào để xóa');
      return 0;
    }

    console.log(`📨 Tìm thấy ${messagesSnapshot.size} tin nhắn`);
    
    // Firestore batch có giới hạn 500 operations
    // Nên ta cần chia nhỏ nếu có quá nhiều messages
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    let totalCount = 0;
    
    messagesSnapshot.forEach(doc => {
      currentBatch.delete(doc.ref);
      operationCount++;
      totalCount++;
      
      if (operationCount === 500) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
      
      if (totalCount % 100 === 0) {
        console.log(`   ➡️  Đã chuẩn bị xóa ${totalCount} tin nhắn...`);
      }
    });
    
    // Push batch cuối cùng nếu còn
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // Commit tất cả batches
    console.log(`📦 Thực thi ${batches.length} batch(es)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`   ✅ Batch ${i + 1}/${batches.length} hoàn thành`);
    }
    
    console.log(`✅ Đã xóa ${totalCount} tin nhắn`);
    return totalCount;
  } catch (error) {
    console.error('❌ Lỗi khi xóa tin nhắn:', error);
    return 0;
  }
}

async function main() {
  console.log('🚀 BẮT ĐẦU XÓA DỮ LIỆU TEST CỦA BÁC SĨ\n');
  console.log('⚠️  Cảnh báo: Thao tác này sẽ xóa TẤT CẢ dữ liệu test!');
  console.log('⚠️  Bấm Ctrl+C để hủy bỏ trong 3 giây...\n');
  
  // Đợi 3 giây để người dùng có thể hủy
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('▶️  Bắt đầu xóa...\n');
  
  const startTime = Date.now();
  
  // Xóa tất cả dữ liệu
  const appointmentsCount = await clearAllAppointments();
  const conversationsCount = await clearAllConversations();
  const messagesCount = await clearAllMessages();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 KẾT QUẢ:');
  console.log('='.repeat(50));
  console.log(`📋 Lịch khám đã xóa:      ${appointmentsCount}`);
  console.log(`💬 Cuộc hội thoại đã xóa: ${conversationsCount}`);
  console.log(`📨 Tin nhắn đã xóa:       ${messagesCount}`);
  console.log(`⏱️  Thời gian:             ${duration}s`);
  console.log('='.repeat(50));
  console.log('✅ HOÀN THÀNH!\n');
  
  process.exit(0);
}

// Chạy script
main().catch(error => {
  console.error('❌ LỖI:', error);
  process.exit(1);
});
