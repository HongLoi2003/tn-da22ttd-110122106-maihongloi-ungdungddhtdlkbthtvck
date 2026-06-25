const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

async function fixAllConversations() {
  try {
    console.log('🔧 Starting to fix all conversations...\n');
    
    // 1. Load all conversations
    console.log('📥 Loading all conversations...');
    const conversationsSnapshot = await getDocs(collection(db, 'conversations'));
    console.log(`✅ Found ${conversationsSnapshot.size} conversations\n`);
    
    // 2. Load all doctor users to create doctorId -> authUid mapping
    console.log('👨‍⚕️ Loading all doctor users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const doctorUsers = [];
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.role === 'doctor' && userData.doctorInfo?.doctorId) {
        doctorUsers.push(userData);
      }
    });
    console.log(`✅ Found ${doctorUsers.length} doctor users\n`);
    
    // Create mapping: doctorId (bs001, bs004) -> authUid (Firebase UID)
    const doctorIdToAuthUid = {};
    doctorUsers.forEach(userData => {
      const doctorId = userData.doctorInfo?.doctorId;
      const authUid = userData.uid;
      if (doctorId && authUid) {
        doctorIdToAuthUid[doctorId] = authUid;
        console.log(`   ${doctorId} -> ${authUid}`);
      }
    });
    console.log(`\n✅ Created mapping for ${Object.keys(doctorIdToAuthUid).length} doctors\n`);
    
    // 3. Fix each conversation
    let fixed = 0;
    let skipped = 0;
    let failed = 0;
    
    console.log('🔧 Fixing conversations...\n');
    
    for (const docSnapshot of conversationsSnapshot.docs) {
      const conversationData = docSnapshot.data();
      const conversationId = docSnapshot.id;
      const doctorId = conversationData.doctorId;
      const currentDoctorAuthUid = conversationData.doctorAuthUid;
      const patientName = conversationData.patientName || 'Unknown';
      
      // Skip if already has valid doctorAuthUid
      if (currentDoctorAuthUid && currentDoctorAuthUid !== doctorId) {
        console.log(`⏭️  Skip ${conversationId} (${patientName}) - already has doctorAuthUid`);
        skipped++;
        continue;
      }
      
      // Try to find doctorAuthUid from mapping
      const doctorAuthUid = doctorIdToAuthUid[doctorId];
      
      if (!doctorAuthUid) {
        console.log(`❌ FAILED ${conversationId} (${patientName}) - doctorId ${doctorId} not found in users`);
        failed++;
        continue;
      }
      
      // Update conversation with doctorAuthUid
      try {
        await updateDoc(doc(db, 'conversations', conversationId), {
          doctorAuthUid: doctorAuthUid
        });
        console.log(`✅ FIXED ${conversationId} (${patientName}) - set doctorAuthUid to ${doctorAuthUid}`);
        fixed++;
      } catch (error) {
        const errorMsg = error?.message || error?.code || 'Unknown error';
        console.log(`❌ ERROR ${conversationId} (${patientName}) - ${errorMsg}`);
        failed++;
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${conversationsSnapshot.size}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

fixAllConversations();
