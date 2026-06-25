const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
try {
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

async function checkConversations() {
  try {
    console.log('🔍 Checking conversations...\n');
    
    const conversationsSnapshot = await db.collection('conversations').get();
    console.log(`📊 Total conversations: ${conversationsSnapshot.size}\n`);
    
    let withAuthUid = 0;
    let withoutAuthUid = 0;
    
    conversationsSnapshot.forEach(doc => {
      const data = doc.data();
      const hasAuthUid = data.doctorAuthUid && data.doctorAuthUid !== data.doctorId;
      
      if (hasAuthUid) {
        withAuthUid++;
        console.log(`✅ ${doc.id}: ${data.patientName} -> ${data.doctorName}`);
        console.log(`   doctorId: ${data.doctorId}`);
        console.log(`   doctorAuthUid: ${data.doctorAuthUid}`);
      } else {
        withoutAuthUid++;
        console.log(`❌ ${doc.id}: ${data.patientName} -> ${data.doctorName}`);
        console.log(`   doctorId: ${data.doctorId}`);
        console.log(`   doctorAuthUid: ${data.doctorAuthUid || 'MISSING'}`);
      }
      console.log('');
    });
    
    console.log('=== SUMMARY ===');
    console.log(`✅ With doctorAuthUid: ${withAuthUid}`);
    console.log(`❌ Without doctorAuthUid: ${withoutAuthUid}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

checkConversations();
