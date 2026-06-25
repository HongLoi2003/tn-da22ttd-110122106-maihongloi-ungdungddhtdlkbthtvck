const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function checkUserAvatars() {
  try {
    console.log('🔍 Checking user avatars...\n');
    
    const usersSnapshot = await db.collection('users').get();
    
    console.log(`Found ${usersSnapshot.size} users\n`);
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      const hasAvatar = !!user.avatar;
      const avatarType = user.avatar ? 
        (user.avatar.startsWith('http') ? '🌐 URL' : 
         user.avatar.startsWith('data:') ? '📷 Base64' : 
         '❓ Unknown') : 
        '❌ No avatar';
      
      console.log(`User: ${user.fullName || user.email}`);
      console.log(`  UID: ${user.uid}`);
      console.log(`  Role: ${user.role || 'unknown'}`);
      console.log(`  Avatar: ${avatarType}`);
      if (user.avatar) {
        console.log(`  Avatar value: ${user.avatar.substring(0, 100)}...`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking avatars:', error);
  }
}

checkUserAvatars()
  .then(() => {
    console.log('✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
