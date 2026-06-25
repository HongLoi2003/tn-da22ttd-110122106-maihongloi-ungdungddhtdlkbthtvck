import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getDocumentsWithQuery } from './services/firebaseService';

interface DoctorComparison {
  doctorId: string;
  doctorName: string;
  status: 'working' | 'broken';
  
  // Doctor document
  doctorDoc: any;
  hasAuthUid: boolean;
  authUid: string;
  
  // User account
  userAccount: any;
  userUid: string;
  
  // Conversations
  conversations: any[];
  conversationsByDoctorId: number;
  conversationsByAuthUid: number;
  
  // Sample conversation
  sampleConversation: any;
  
  // Differences
  differences: string[];
}

export default function CompareWorkingVsBrokenDoctors() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [workingDoctor, setWorkingDoctor] = useState<DoctorComparison | null>(null);
  const [brokenDoctors, setBrokenDoctors] = useState<DoctorComparison[]>([]);
  const [keyDifferences, setKeyDifferences] = useState<string[]>([]);

  const compareDoctors = async () => {
    try {
      setLoading(true);
      
      console.log('=== COMPARING WORKING VS BROKEN DOCTORS ===');
      
      // Working doctor: Trần Thị Mai (bs004)
      const workingDoc = await analyzeDoctor('bs004', 'BS. Trần Thị Mai', 'working');
      setWorkingDoctor(workingDoc);
      
      // Broken doctors
      const broken1 = await analyzeDoctor('bs001', 'BS. Nguyễn Văn An', 'broken');
      const broken2 = await analyzeDoctor('bs002', 'BS. Trần Thị Lan', 'broken');
      const broken3 = await analyzeDoctor('bs007', 'BS. Đỗ Minh Tuấn', 'broken');
      
      setBrokenDoctors([broken1, broken2, broken3]);
      
      // Find key differences
      const diffs = findKeyDifferences(workingDoc, [broken1, broken2, broken3]);
      setKeyDifferences(diffs);
      
      setLoading(false);
      console.log('=== COMPARISON COMPLETED ===');
    } catch (error) {
      console.error('❌ Error:', error);
      setLoading(false);
    }
  };

  const analyzeDoctor = async (
    doctorId: string, 
    doctorName: string, 
    status: 'working' | 'broken'
  ): Promise<DoctorComparison> => {
    console.log(`\n--- Analyzing: ${doctorName} (${doctorId}) ---`);
    
    const differences: string[] = [];
    
    // 1. Get doctor document
    const { getDocumentById } = await import('./services/firebaseService');
    const doctorDoc = await getDocumentById('doctors', doctorId);
    const authUid = doctorDoc ? (doctorDoc as any).authUid : '';
    
    console.log('Doctor doc:', doctorDoc);
    console.log('authUid:', authUid);
    
    // 2. Get user account
    const users = await getDocumentsWithQuery('users', [
      where('role', '==', 'doctor'),
      where('doctorInfo.doctorId', '==', doctorId)
    ]);
    const userAccount = users.length > 0 ? users[0] : null;
    const userUid = userAccount ? (userAccount as any).uid : '';
    
    console.log('User account:', userAccount);
    console.log('User UID:', userUid);
    
    // 3. Query conversations - Method 1: by doctorId
    const convsByDoctorId = await getDocumentsWithQuery('conversations', [
      where('doctorId', '==', doctorId)
    ]);
    console.log(`Conversations by doctorId: ${convsByDoctorId.length}`);
    
    // 4. Query conversations - Method 2: by doctorAuthUid
    let convsByAuthUid: any[] = [];
    if (authUid) {
      convsByAuthUid = await getDocumentsWithQuery('conversations', [
        where('doctorAuthUid', '==', authUid)
      ]);
      console.log(`Conversations by doctorAuthUid: ${convsByAuthUid.length}`);
    }
    
    // 5. Merge conversations
    const convMap = new Map();
    [...convsByDoctorId, ...convsByAuthUid].forEach(conv => {
      if (!convMap.has(conv.id)) {
        convMap.set(conv.id, conv);
      }
    });
    const allConversations = Array.from(convMap.values());
    
    // 6. Get sample conversation
    const sampleConversation = allConversations.length > 0 ? allConversations[0] : null;
    
    if (sampleConversation) {
      console.log('Sample conversation:', {
        id: sampleConversation.id,
        doctorId: (sampleConversation as any).doctorId,
        doctorAuthUid: (sampleConversation as any).doctorAuthUid,
        patientName: (sampleConversation as any).patientName,
      });
    }
    
    return {
      doctorId,
      doctorName,
      status,
      doctorDoc,
      hasAuthUid: !!authUid,
      authUid,
      userAccount,
      userUid,
      conversations: allConversations,
      conversationsByDoctorId: convsByDoctorId.length,
      conversationsByAuthUid: convsByAuthUid.length,
      sampleConversation,
      differences,
    };
  };

  const findKeyDifferences = (
    working: DoctorComparison,
    broken: DoctorComparison[]
  ): string[] => {
    const diffs: string[] = [];
    
    console.log('\n=== FINDING KEY DIFFERENCES ===');
    
    // Compare doctor document structure
    if (working.doctorDoc && broken[0].doctorDoc) {
      const workingKeys = Object.keys(working.doctorDoc).sort();
      const brokenKeys = Object.keys(broken[0].doctorDoc).sort();
      
      const workingOnly = workingKeys.filter(k => !brokenKeys.includes(k));
      const brokenOnly = brokenKeys.filter(k => !workingKeys.includes(k));
      
      if (workingOnly.length > 0) {
        diffs.push(`Working doctor có fields: ${workingOnly.join(', ')}`);
      }
      if (brokenOnly.length > 0) {
        diffs.push(`Broken doctors có fields: ${brokenOnly.join(', ')}`);
      }
      
      // Compare specific fields
      const fieldsToCompare = ['authUid', 'id', 'ten', 'chuyen_khoa'];
      fieldsToCompare.forEach(field => {
        const workingValue = (working.doctorDoc as any)[field];
        const brokenValue = (broken[0].doctorDoc as any)[field];
        
        if (typeof workingValue !== typeof brokenValue) {
          diffs.push(`Field "${field}" type khác: working=${typeof workingValue}, broken=${typeof brokenValue}`);
        }
      });
    }
    
    // Compare user account structure
    if (working.userAccount && broken[0].userAccount) {
      const workingKeys = Object.keys(working.userAccount).sort();
      const brokenKeys = Object.keys(broken[0].userAccount).sort();
      
      const workingOnly = workingKeys.filter(k => !brokenKeys.includes(k));
      const brokenOnly = brokenKeys.filter(k => !workingKeys.includes(k));
      
      if (workingOnly.length > 0) {
        diffs.push(`Working user có fields: ${workingOnly.join(', ')}`);
      }
      if (brokenOnly.length > 0) {
        diffs.push(`Broken users có fields: ${brokenOnly.join(', ')}`);
      }
    }
    
    // Compare conversation structure
    if (working.sampleConversation && broken[0].sampleConversation) {
      const workingKeys = Object.keys(working.sampleConversation).sort();
      const brokenKeys = Object.keys(broken[0].sampleConversation).sort();
      
      const workingOnly = workingKeys.filter(k => !brokenKeys.includes(k));
      const brokenOnly = brokenKeys.filter(k => !workingKeys.includes(k));
      
      if (workingOnly.length > 0) {
        diffs.push(`Working conversation có fields: ${workingOnly.join(', ')}`);
      }
      if (brokenOnly.length > 0) {
        diffs.push(`Broken conversations có fields: ${brokenOnly.join(', ')}`);
      }
      
      // Compare doctorId vs doctorAuthUid
      const workingDoctorId = (working.sampleConversation as any).doctorId;
      const workingDoctorAuthUid = (working.sampleConversation as any).doctorAuthUid;
      const brokenDoctorId = (broken[0].sampleConversation as any).doctorId;
      const brokenDoctorAuthUid = (broken[0].sampleConversation as any).doctorAuthUid;
      
      diffs.push(`Working: doctorId="${workingDoctorId}", doctorAuthUid="${workingDoctorAuthUid}"`);
      diffs.push(`Broken: doctorId="${brokenDoctorId}", doctorAuthUid="${brokenDoctorAuthUid}"`);
      
      if (workingDoctorId === working.authUid) {
        diffs.push('⚠️ Working: doctorId = authUid (Firebase UID)');
      }
      if (brokenDoctorId === broken[0].authUid) {
        diffs.push('⚠️ Broken: doctorId = authUid (Firebase UID)');
      }
      if (workingDoctorId === working.doctorId) {
        diffs.push('✅ Working: doctorId = doctor document ID (bs004)');
      }
      if (brokenDoctorId === broken[0].doctorId) {
        diffs.push('✅ Broken: doctorId = doctor document ID (bs001)');
      }
    }
    
    // Compare query results
    diffs.push(`Working: ${working.conversationsByDoctorId} convs by doctorId, ${working.conversationsByAuthUid} by authUid`);
    diffs.push(`Broken: ${broken[0].conversationsByDoctorId} convs by doctorId, ${broken[0].conversationsByAuthUid} by authUid`);
    
    console.log('Differences found:', diffs);
    return diffs;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>So sánh Bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="git-compare" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>So sánh</Text>
            <Text style={styles.infoText}>
              So sánh BS. Trần Thị Mai (hoạt động tốt) với 3 bác sĩ khác (không hoạt động)
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={compareDoctors}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang so sánh...</Text>
            </>
          ) : (
            <>
              <Ionicons name="git-compare" size={20} color="#fff" />
              <Text style={styles.buttonText}>Bắt đầu So sánh</Text>
            </>
          )}
        </TouchableOpacity>

        {keyDifferences.length > 0 && (
          <View style={styles.differencesCard}>
            <Text style={styles.differencesTitle}>🔍 Sự khác biệt chính:</Text>
            {keyDifferences.map((diff, index) => (
              <Text key={index} style={styles.differenceText}>• {diff}</Text>
            ))}
          </View>
        )}

        {workingDoctor && (
          <View style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.doctorTitle}>✅ {workingDoctor.doctorName}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Doctor Document:</Text>
              <Text style={styles.detailText}>ID: {workingDoctor.doctorId}</Text>
              <Text style={styles.detailText}>authUid: {workingDoctor.authUid}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>User Account:</Text>
              <Text style={styles.detailText}>UID: {workingDoctor.userUid}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Conversations:</Text>
              <Text style={styles.detailText}>Total: {workingDoctor.conversations.length}</Text>
              <Text style={styles.detailText}>By doctorId: {workingDoctor.conversationsByDoctorId}</Text>
              <Text style={styles.detailText}>By authUid: {workingDoctor.conversationsByAuthUid}</Text>
            </View>
            
            {workingDoctor.sampleConversation && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Sample Conversation:</Text>
                <Text style={styles.detailText}>
                  doctorId: {(workingDoctor.sampleConversation as any).doctorId}
                </Text>
                <Text style={styles.detailText}>
                  doctorAuthUid: {(workingDoctor.sampleConversation as any).doctorAuthUid || 'N/A'}
                </Text>
              </View>
            )}
          </View>
        )}

        {brokenDoctors.map((doctor, index) => (
          <View key={index} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Ionicons name="close-circle" size={24} color="#F44336" />
              <Text style={styles.doctorTitle}>❌ {doctor.doctorName}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Doctor Document:</Text>
              <Text style={styles.detailText}>ID: {doctor.doctorId}</Text>
              <Text style={styles.detailText}>authUid: {doctor.authUid}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>User Account:</Text>
              <Text style={styles.detailText}>UID: {doctor.userUid}</Text>
            </View>
            
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Conversations:</Text>
              <Text style={styles.detailText}>Total: {doctor.conversations.length}</Text>
              <Text style={styles.detailText}>By doctorId: {doctor.conversationsByDoctorId}</Text>
              <Text style={styles.detailText}>By authUid: {doctor.conversationsByAuthUid}</Text>
            </View>
            
            {doctor.sampleConversation && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Sample Conversation:</Text>
                <Text style={styles.detailText}>
                  doctorId: {(doctor.sampleConversation as any).doctorId}
                </Text>
                <Text style={styles.detailText}>
                  doctorAuthUid: {(doctor.sampleConversation as any).doctorAuthUid || 'N/A'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  differencesCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  differencesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 12,
  },
  differenceText: {
    fontSize: 13,
    color: '#E65100',
    marginBottom: 6,
    lineHeight: 18,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  doctorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  detailSection: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
