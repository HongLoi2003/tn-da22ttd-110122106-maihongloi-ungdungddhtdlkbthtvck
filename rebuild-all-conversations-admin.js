// Rebuild all conversations from existing messages using Firebase Client SDK
// This will create conversations for bs001, bs003, bs004 and all other doctors
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where, Timestamp } = require('firebase/firestore');

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

async function rebuildAllConversations() {
  console.log('=== REBUILD TẤT CẢ CONVERSATIONS TỪ MESSAGES ===\n');

  try {
    // 1. Load all messages
    console.log('📨 Đang tải tất cả messages...');
    const messagesCol = collection(db, 'messages');
    const messagesSnapshot = await getDocs(messagesCol);
    console.log(`✅ Tìm thấy ${messagesSnapshot.size} messages\n`);

    if (messagesSnapshot.empty) {
      console.log('❌ Không có messages nào!');
      return;
    }

    // 2. Group messages by conversationId
    const messagesByConversation = {};
    messagesSnapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const convId = msg.conversationId;
      if (!messagesByConversation[convId]) {
        messagesByConversation[convId] = [];
      }
      messagesByConversation[convId].push({
        id: docSnap.id,
        ...msg
      });
    });

    console.log(`📋 Tìm thấy ${Object.keys(messagesByConversation).length} conversation IDs\n`);

    // 3. Load doctor auth UIDs mapping
    console.log('👨‍⚕️ Đang tải thông tin bác sĩ...');
    const usersCol = collection(db, 'users');
    const doctorUsersQuery = query(usersCol, where('role', '==', 'doctor'));
    const doctorUsersSnapshot = await getDocs(doctorUsersQuery);
    
    const doctorAuthUidMap = {}; // doctorId => authUid
    doctorUsersSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.doctorInfo?.doctorId) {
        doctorAuthUidMap[data.doctorInfo.doctorId] = data.uid;
      }
    });
    
    console.log(`✅ Tìm thấy ${Object.keys(doctorAuthUidMap).length} bác sĩ`);
    console.log('   Doctors:', Object.keys(doctorAuthUidMap).join(', '));
    console.log('');

    // 4. Load doctors collection for names
    const doctorsCol = collection(db, 'doctors');
    const doctorsSnapshot = await getDocs(doctorsCol);
    const doctorNamesMap = {}; // doctorId => name
    doctorsSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      doctorNamesMap[docSnap.id] = data.ten || data.name || 'Bác sĩ';
    });

    // 5. Load users for patient names
    const usersSnapshot = await getDocs(usersCol);
    const userNamesMap = {}; // userId => userData
    usersSnapshot.forEach(docSnap => {
      userNamesMap[docSnap.id] = docSnap.data();
    });

    // 6. Create conversations from messages
    let createdCount = 0;
    let skippedCount = 0;
    const conversationsToCreate = [];

    for (const [convId, messages] of Object.entries(messagesByConversation)) {
      // Sort messages by timestamp to find the latest
      messages.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA; // newest first
      });

      const latestMessage = messages[0];
      const firstMessage = messages[messages.length - 1];

      // Extract doctorId from messages
      let doctorId = null;
      let patientId = null;

      for (const msg of messages) {
        if (msg.senderType === 'doctor' && msg.senderId) {
          // Find doctorId by authUid
          for (const [dId, authUid] of Object.entries(doctorAuthUidMap)) {
            if (msg.senderId === authUid) {
              doctorId = dId;
              break;
            }
          }
        }
        if (msg.senderType === 'patient' && msg.senderId) {
          patientId = msg.senderId;
        }
        if (doctorId && patientId) break;
      }

      // If no doctor found in messages, try to infer from conversation structure
      if (!doctorId && latestMessage.receiverId) {
        // receiverId might be doctorAuthUid
        for (const [dId, authUid] of Object.entries(doctorAuthUidMap)) {
          if (latestMessage.receiverId === authUid) {
            doctorId = dId;
            break;
          }
        }
      }

      if (!doctorId) {
        console.log(`⚠️  Bỏ qua conversation ${convId} - không tìm thấy doctorId`);
        skippedCount++;
        continue;
      }

      if (!patientId) {
        console.log(`⚠️  Bỏ qua conversation ${convId} - không tìm thấy patientId`);
        skippedCount++;
        continue;
      }

      const doctorAuthUid = doctorAuthUidMap[doctorId];
      const doctorName = doctorNamesMap[doctorId] || 'Bác sĩ';
      const patientData = userNamesMap[patientId] || {};
      const patientName = patientData.fullName || patientData.email || 'Bệnh nhân';

      // Count unread for doctor (messages from patient that are unread)
      const doctorUnreadCount = messages.filter(m => 
        m.senderType === 'patient' && !m.read
      ).length;

      const conversationData = {
        patientId: patientId,
        patientName: patientName,
        patientAvatar: patientData.avatar || '',
        patientPhone: patientData.phone || '',
        doctorId: doctorId,
        doctorAuthUid: doctorAuthUid,
        doctorName: doctorName,
        lastMessage: latestMessage.text || latestMessage.message || 'Tin nhắn',
        lastMessageTimestamp: latestMessage.timestamp || Timestamp.now(),
        lastMessageSender: latestMessage.senderType || 'patient',
        unreadCountPatient: 0,
        doctorUnreadCount: doctorUnreadCount,
        createdAt: firstMessage.timestamp || Timestamp.now(),
      };

      conversationsToCreate.push({
        id: convId,
        data: conversationData,
        messageCount: messages.length
      });
    }

    console.log(`\n📊 Sẽ tạo ${conversationsToCreate.length} conversations`);
    console.log(`⚠️  Bỏ qua ${skippedCount} conversations (thiếu thông tin)\n`);

    // Group by doctor
    const byDoctor = {};
    conversationsToCreate.forEach(conv => {
      const dId = conv.data.doctorId;
      if (!byDoctor[dId]) byDoctor[dId] = [];
      byDoctor[dId].push(conv);
    });

    for (const [dId, convs] of Object.entries(byDoctor)) {
      console.log(`   ${dId}: ${convs.length} conversations`);
    }
    console.log('');

    // 7. Create conversations
    console.log('🚀 Bắt đầu tạo conversations...\n');
    
    for (const conv of conversationsToCreate) {
      try {
        const conversationsCol = collection(db, 'conversations');
        const docRef = await addDoc(conversationsCol, conv.data);
        console.log(`✅ [${conv.data.doctorId}] Created ${docRef.id} (${conv.messageCount} msgs)`);
        createdCount++;
      } catch (error) {
        console.log(`❌ [${conv.data.doctorId}] Failed for conversation ${conv.id}: ${error.message}`);
      }
    }

    console.log(`\n🎉 HOÀN TẤT!`);
    console.log(`   Đã tạo: ${createdCount} conversations`);
    console.log(`   Bỏ qua: ${skippedCount} conversations`);
    console.log('\n💡 Bây giờ đăng nhập bác sĩ và kiểm tra trang "Tin nhắn"!');

  } catch (error) {
    console.error('\n❌ LỖI:', error);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

rebuildAllConversations();
