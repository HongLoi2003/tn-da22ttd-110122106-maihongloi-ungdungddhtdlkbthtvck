// Using Firebase Client SDK to create conversations
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, Timestamp, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyD3MgpAZ3LWx3gVOlNbBJx7QJQKLzm8XKU",
  authDomain: "hearthcare-847b3.firebaseapp.com",
  projectId: "hearthcare-847b3",
  storageBucket: "hearthcare-847b3.firebasestorage.app",
  messagingSenderId: "844166056399",
  appId: "1:844166056399:web:e20f2abf6da8b8a0a93638"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestConversation() {
  console.log('=== TẠO TEST CONVERSATION CHO BS001 ===\n');

  try {
    // 1. Find a patient
    const usersCol = collection(db, 'users');
    const patientQuery = query(usersCol, where('role', '==', 'patient'), limit(1));
    const patientSnapshot = await getDocs(patientQuery);

    if (patientSnapshot.empty) {
      console.log('❌ Không tìm thấy patient nào!');
      return;
    }

    const patientDoc = patientSnapshot.docs[0];
    const patient = patientDoc.data();
    const patientId = patientDoc.id;
    console.log(`✅ Patient: ${patient.fullName || patient.email} (${patientId})`);

    // 2. Find bs001 info
    const bs001Ref = doc(db, 'doctors', 'bs001');
    const bs001Doc = await getDoc(bs001Ref);
    
    if (!bs001Doc.exists()) {
      console.log('❌ Không tìm thấy bs001!');
      return;
    }

    const bs001Data = bs001Doc.data();
    console.log(`✅ Doctor: ${bs001Data.ten || bs001Data.name}`);

    // 3. Find bs001 authUid
    const doctorUsersQuery = query(usersCol, where('role', '==', 'doctor'));
    const doctorUsersSnapshot = await getDocs(doctorUsersQuery);

    let bs001AuthUid = '';
    doctorUsersSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.doctorInfo?.doctorId === 'bs001') {
        bs001AuthUid = data.uid;
      }
    });

    if (!bs001AuthUid) {
      console.log('❌ Không tìm thấy authUid cho bs001!');
      return;
    }

    console.log(`✅ Auth UID: ${bs001AuthUid}`);

    // 4. Create conversation
    const conversationData = {
      patientId: patientId,
      patientName: patient.fullName || patient.email || 'Bệnh nhân',
      patientAvatar: patient.avatar || '',
      patientPhone: patient.phone || '',
      doctorId: 'bs001',
      doctorAuthUid: bs001AuthUid,
      doctorName: bs001Data.ten || bs001Data.name || 'BS. Nguyễn Văn An',
      lastMessage: 'Test conversation - bệnh nhân nhắn tin',
      lastMessageTimestamp: Timestamp.now(),
      lastMessageSender: 'patient',
      unreadCountPatient: 0,
      doctorUnreadCount: 1,
      createdAt: Timestamp.now(),
    };

    const conversationsCol = collection(db, 'conversations');
    const convRef = await addDoc(conversationsCol, conversationData);
    console.log(`\n✅ Đã tạo conversation: ${convRef.id}`);
    console.log('   Data:', JSON.stringify({ ...conversationData, lastMessageTimestamp: 'Timestamp.now()', createdAt: 'Timestamp.now()' }, null, 2));

    // 5. Create a test message
    const messageData = {
      conversationId: convRef.id,
      text: 'Xin chào bác sĩ Nguyễn Văn An, tôi cần tư vấn về sức khỏe',
      message: 'Xin chào bác sĩ Nguyễn Văn An, tôi cần tư vấn về sức khỏe',
      senderId: patientId,
      senderType: 'patient',
      timestamp: Timestamp.now(),
      read: false,
    };

    const messagesCol = collection(db, 'messages');
    const msgRef = await addDoc(messagesCol, messageData);
    console.log(`✅ Đã tạo message: ${msgRef.id}`);

    console.log('\n🎉 THÀNH CÔNG!');
    console.log('   Bây giờ:');
    console.log('   1. Đăng nhập bác sĩ bs001 (email: nguyenvanan@hospital.com, password: doctor123)');
    console.log('   2. Vào trang "Tin nhắn" để kiểm tra');
    console.log('   3. Bạn sẽ thấy conversation mới với bệnh nhân!');

  } catch (error) {
    console.error('\n❌ LỖI:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

createTestConversation();
