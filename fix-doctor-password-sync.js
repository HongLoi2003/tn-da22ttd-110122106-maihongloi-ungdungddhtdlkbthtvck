/**
 * Script fix password sync giữa Firestore và Firebase Auth
 * 
 * CÁCH DÙNG:
 * 1. node fix-doctor-password-sync.js <email-bac-si>
 * 2. Hoặc chạy không tham số để fix tất cả bác sĩ
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function fixPasswordSync(email) {
  console.log(`\n🔧 Fixing password sync for: ${email}`);
  
  try {
    // 1. Lấy user từ Firestore
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email.toLowerCase())
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`❌ User not found in Firestore`);
      return { success: false };
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const firestorePassword = userData.password;
    
    if (!firestorePassword) {
      console.log(`❌ No password found in Firestore`);
      return { success: false };
    }
    
    console.log(`✅ Found user in Firestore`);
    console.log(`   UID: ${userData.uid}`);
    console.log(`   Password length: ${firestorePassword.length}`);
    
    // 2. Lấy user từ Firebase Auth
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email.toLowerCase());
      console.log(`✅ Found user in Firebase Auth`);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log(`⚠️  User not found in Firebase Auth, creating new account...`);
        
        // Tạo Firebase Auth account mới
        firebaseUser = await auth.createUser({
          email: email.toLowerCase(),
          password: firestorePassword,
          displayName: userData.fullName || 'Doctor',
        });
        
        console.log(`✅ Firebase Auth account created with UID: ${firebaseUser.uid}`);
        
        // Update UID trong Firestore
        await userDoc.ref.update({
          uid: firebaseUser.uid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ UID updated in Firestore`);
        return { success: true, action: 'created' };
      }
      throw authError;
    }
    
    // 3. Sync password từ Firestore sang Firebase Auth
    await auth.updateUser(firebaseUser.uid, {
      password: firestorePassword,
    });
    
    console.log(`✅ Password synced successfully`);
    
    // 4. Verify UID khớp
    if (firebaseUser.uid !== userData.uid) {
      console.log(`⚠️  UID mismatch detected!`);
      console.log(`   Firestore UID: ${userData.uid}`);
      console.log(`   Firebase Auth UID: ${firebaseUser.uid}`);
      console.log(`   Updating Firestore UID...`);
      
      await userDoc.ref.update({
        uid: firebaseUser.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ UID updated in Firestore`);
    }
    
    return { success: true, action: 'synced' };
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function fixAllDoctors() {
  console.log('🚀 Fixing password sync for ALL doctors...\n');
  
  try {
    const doctorsSnapshot = await db.collection('users')
      .where('role', '==', 'doctor')
      .get();
    
    console.log(`📊 Found ${doctorsSnapshot.size} doctors\n`);
    
    const results = {
      success: 0,
      failed: 0,
      created: 0,
    };
    
    for (const doc of doctorsSnapshot.docs) {
      const userData = doc.data();
      const result = await fixPasswordSync(userData.email);
      
      if (result.success) {
        results.success++;
        if (result.action === 'created') {
          results.created++;
        }
      } else {
        results.failed++;
      }
      
      // Delay
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY:');
    console.log(`✅ Success: ${results.success}`);
    console.log(`🆕 Created: ${results.created}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Main
async function main() {
  const email = process.argv[2];
  
  if (email) {
    // Fix cho 1 bác sĩ
    await fixPasswordSync(email);
  } else {
    // Fix cho tất cả bác sĩ
    await fixAllDoctors();
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
