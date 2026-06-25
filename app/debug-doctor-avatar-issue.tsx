import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function DebugDoctorAvatarIssue() {
  const router = useRouter();
  const [output, setOutput] = useState('🔍 Starting debug...\n\n');

  useEffect(() => {
    debugAvatars();
  }, []);

  const log = (msg: string) => {
    console.log(msg);
    setOutput(prev => prev + msg + '\n');
  };

  const debugAvatars = async () => {
    try {
      log('=== CHECKING DOCTORS COLLECTION ===');
      
      // Get all doctors
      const doctors = await getDocumentsWithQuery('doctors', [
        where('trang_thai', '==', true)
      ]);
      
      log(`Found ${doctors.length} doctors\n`);
      
      doctors.slice(0, 5).forEach((doc: any) => {
        log(`Doctor ID: ${doc.id}`);
        log(`  Name: ${doc.ten}`);
        log(`  Image field: ${doc.image || 'MISSING'}`);
        log(`  Image type: ${typeof doc.image}`);
        log(`  Is URL: ${doc.image?.startsWith('http') ? 'YES' : 'NO'}`);
        log('');
      });

      log('\n=== CHECKING CONVERSATIONS COLLECTION ===');
      
      // Get recent conversations
      const conversations = await getDocumentsWithQuery('conversations', []);
      
      log(`Found ${conversations.length} conversations\n`);
      
      conversations.slice(0, 3).forEach((conv: any) => {
        log(`Conversation ID: ${conv.id}`);
        log(`  Doctor ID: ${conv.doctorId}`);
        log(`  Doctor Name: ${conv.doctorName}`);
        log(`  Doctor Image: ${conv.doctorImage || 'MISSING'}`);
        log(`  Image type: ${typeof conv.doctorImage}`);
        log(`  Is URL: ${conv.doctorImage?.startsWith('http') ? 'YES' : 'NO'}`);
        log('');
      });

      log('\n=== TESTING getDoctorImage FUNCTION ===');
      
      // Test cases
      const testCases = [
        'tranthilan.png',
        'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg',
        'logo.png',
        '',
        null
      ];
      
      testCases.forEach(testCase => {
        const result = getDoctorImage(testCase as string);
        log(`Input: "${testCase}"`);
        log(`  Output: ${JSON.stringify(result)}`);
        log('');
      });

      log('✅ Debug complete!');
      
    } catch (error) {
      log(`❌ Error: ${error}`);
    }
  };

  const getDoctorImage = (imageName: string) => {
    if (imageName && (imageName.startsWith('http://') || imageName.startsWith('https://'))) {
      return { uri: imageName };
    }
    
    const images: { [key: string]: any } = {
      'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
    };
    
    if (imageName && images[imageName]) {
      return images[imageName];
    }
    
    return { uri: "https://via.placeholder.com/150" };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Debug Doctor Avatar</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.output}>{output}</Text>
      </ScrollView>

      <TouchableOpacity style={styles.refreshBtn} onPress={debugAvatars}>
        <Text style={styles.refreshText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#0ea5e9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  output: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#1e293b',
    lineHeight: 18,
  },
  refreshBtn: {
    margin: 16,
    padding: 16,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
