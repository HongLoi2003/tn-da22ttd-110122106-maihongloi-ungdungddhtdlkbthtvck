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

async function clearAllConversations() {
  try {
    console.log('🗑️  Starting to delete all conversations...');
    
    const conversationsRef = db.collection('conversations');
    const snapshot = await conversationsRef.get();
    
    console.log(`Found ${snapshot.size} conversations to delete`);
    
    if (snapshot.empty) {
      console.log('✅ No conversations to delete');
      return;
    }
    
    // Delete in batches
    const batchSize = 500;
    let batch = db.batch();
    let count = 0;
    
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      
      if (count % batchSize === 0) {
        await batch.commit();
        console.log(`✅ Deleted ${count} conversations...`);
        batch = db.batch();
      }
    }
    
    // Commit remaining deletions
    if (count % batchSize !== 0) {
      await batch.commit();
    }
    
    console.log(`✅ Successfully deleted ${count} conversations`);
    
    // Also delete all messages
    console.log('\n🗑️  Starting to delete all messages...');
    const messagesRef = db.collection('messages');
    const messagesSnapshot = await messagesRef.get();
    
    console.log(`Found ${messagesSnapshot.size} messages to delete`);
    
    if (messagesSnapshot.empty) {
      console.log('✅ No messages to delete');
      return;
    }
    
    batch = db.batch();
    count = 0;
    
    for (const doc of messagesSnapshot.docs) {
      batch.delete(doc.ref);
      count++;
      
      if (count % batchSize === 0) {
        await batch.commit();
        console.log(`✅ Deleted ${count} messages...`);
        batch = db.batch();
      }
    }
    
    // Commit remaining deletions
    if (count % batchSize !== 0) {
      await batch.commit();
    }
    
    console.log(`✅ Successfully deleted ${count} messages`);
    console.log('\n✅ All conversations and messages cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing conversations:', error);
  }
}

// Run the script
clearAllConversations()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
