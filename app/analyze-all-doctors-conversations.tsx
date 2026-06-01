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

interface DoctorAnalysis {
  doctorId: string;
  doctorName: string;
  authUid: string;
  
  // Conversations
  totalConversations: number;
  conversationsByDoctorId: number;
  conversationsByAuthUid: number;
  
  // Sample conversation analysis
  sampleConv: any;
  convDoctorIdType: 'bs-format' | 'firebase-uid' | 'none';
  convDoctorAuthUidExists: boolean;
  convDoctorAuthUidMatches: boolean;
  
  // Status
  canReceiveMessages: boolean;
  issues: string[];
}

export default function AnalyzeAllDoctorsConversations() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorAnalysis[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    working: 0,
    broken: 0,
    bsFormatWorking: 0,
    bsFormatBroken: 0,
    uidFormatWorking: 0,
    uidFormatBroken: 0,
  });

  const analyzeAllDoctors = async () => {
    try {
      setLoading(true);
      setDoctors([]);
      
      console.log('=== ANALYZING ALL DOCTORS ===');
      
      // 1. Get all doctors
      const allDoctors = await getDocumentsWithQuery('doctors', []);
      console.log(`Found ${allDoctors.length} doctors`);
      
      const results: DoctorAnalysis[] = [];
      let working = 0;
      let broken = 0;
      let bsFormatWorking = 0;
      let bsFormatBroken = 0;
      let uidFormatWorking = 0;
      let uidFormatBroken = 0;
      
      for (const doctor of allDoctors) {
        const doctorId = doctor.id;
        const doctorName = (doctor as any).ten || 'Unknown';
        const authUid = (doctor as any).authUid || '';
        
        console.log(`\n--- Analyzing: ${doctorName} (${doctorId}) ---`);
        
        const issues: string[] = [];
        
        if (!authUid) {
          issues.push('Thiếu authUid');
        }
        
        // Query conversations
        const convsByDoctorId = await getDocumentsWithQuery('conversations', [
          where('doctorId', '==', doctorId)
        ]);
        
        let convsByAuthUid: any[] = [];
        if (authUid) {
          convsByAuthUid = await getDocumentsWithQuery('conversations', [
            where('doctorAuthUid', '==', authUid)
          ]);
        }
        
        // Merge
        const convMap = new Map();
        [...convsByDoctorId, ...convsByAuthUid].forEach(conv => {
          if (!convMap.has(conv.id)) {
            convMap.set(conv.id, conv);
          }
        });
        const allConversations = Array.from(convMap.values());
        
        console.log(`Conversations: ${allConversations.length} (by doctorId: ${convsByDoctorId.length}, by authUid: ${convsByAuthUid.length})`);
        
        // Analyze sample conversation
        let convDoctorIdType: 'bs-format' | 'firebase-uid' | 'none' = 'none';
        let convDoctorAuthUidExists = false;
        let convDoctorAuthUidMatches = false;
        
        if (allConversations.length > 0) {
          const sampleConv = allConversations[0];
          const convDoctorId = (sampleConv as any).doctorId;
          const convDoctorAuthUid = (sampleConv as any).doctorAuthUid;
          
          console.log(`Sample conversation:`);
          console.log(`  doctorId: ${convDoctorId}`);
          console.log(`  doctorAuthUid: ${convDoctorAuthUid || 'N/A'}`);
          
          // Check doctorId format
          if (convDoctorId && convDoctorId.startsWith('bs')) {
            convDoctorIdType = 'bs-format';
            console.log(`  ✅ doctorId is bs-format (${convDoctorId})`);
          } else if (convDoctorId && convDoctorId.length > 20) {
            convDoctorIdType = 'firebase-uid';
            console.log(`  ⚠️ doctorId is Firebase UID (${convDoctorId})`);
          }
          
          // Check doctorAuthUid
          if (convDoctorAuthUid) {
            convDoctorAuthUidExists = true;
            if (convDoctorAuthUid === authUid) {
              convDoctorAuthUidMatches = true;
              console.log(`  ✅ doctorAuthUid matches authUid`);
            } else {
              console.log(`  ❌ doctorAuthUid does NOT match authUid`);
              issues.push('doctorAuthUid không khớp');
            }
          } else {
            console.log(`  ❌ doctorAuthUid is missing`);
            issues.push('Thiếu doctorAuthUid');
          }
        }
        
        // Determine if can receive messages
        const canReceiveMessages = allConversations.length > 0;
        
        if (canReceiveMessages) {
          working++;
          if (convDoctorIdType === 'bs-format') {
            bsFormatWorking++;
          } else if (convDoctorIdType === 'firebase-uid') {
            uidFormatWorking++;
          }
        } else {
          broken++;
          if (convDoctorIdType === 'bs-format') {
            bsFormatBroken++;
          } else if (convDoctorIdType === 'firebase-uid') {
            uidFormatBroken++;
          }
        }
        
        results.push({
          doctorId,
          doctorName,
          authUid,
          totalConversations: allConversations.length,
          conversationsByDoctorId: convsByDoctorId.length,
          conversationsByAuthUid: convsByAuthUid.length,
          sampleConv: allConversations.length > 0 ? allConversations[0] : null,
          convDoctorIdType,
          convDoctorAuthUidExists,
          convDoctorAuthUidMatches,
          canReceiveMessages,
          issues,
        });
      }
      
      setDoctors(results);
      setSummary({
        total: allDoctors.length,
        working,
        broken,
        bsFormatWorking,
        bsFormatBroken,
        uidFormatWorking,
        uidFormatBroken,
      });
      
      console.log('\n=== SUMMARY ===');
      console.log(`Total: ${allDoctors.length}`);
      console.log(`Working: ${working}`);
      console.log(`Broken: ${broken}`);
      console.log(`BS-format working: ${bsFormatWorking}`);
      console.log(`BS-format broken: ${bsFormatBroken}`);
      console.log(`UID-format working: ${uidFormatWorking}`);
      console.log(`UID-format broken: ${uidFormatBroken}`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phân tích Tất cả BS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="analytics" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Phân tích Toàn bộ</Text>
            <Text style={styles.infoText}>
              Kiểm tra tất cả bác sĩ và tìm pattern chung
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={analyzeAllDoctors}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang phân tích...</Text>
            </>
          ) : (
            <>
              <Ionicons name="analytics" size={20} color="#fff" />
              <Text style={styles.buttonText}>Phân tích Tất cả</Text>
            </>
          )}
        </TouchableOpacity>

        {summary.total > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Tổng quan</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng số bác sĩ:</Text>
              <Text style={styles.summaryValue}>{summary.total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hoạt động tốt:</Text>
              <Text style={[styles.summaryValue, styles.successText]}>{summary.working}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Không hoạt động:</Text>
              <Text style={[styles.summaryValue, styles.errorText]}>{summary.broken}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.summarySubtitle}>Format doctorId trong conversations:</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>BS-format (bs001) - Hoạt động:</Text>
              <Text style={[styles.summaryValue, styles.successText]}>{summary.bsFormatWorking}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>BS-format (bs001) - Không:</Text>
              <Text style={[styles.summaryValue, styles.errorText]}>{summary.bsFormatBroken}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>UID-format - Hoạt động:</Text>
              <Text style={[styles.summaryValue, styles.successText]}>{summary.uidFormatWorking}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>UID-format - Không:</Text>
              <Text style={[styles.summaryValue, styles.errorText]}>{summary.uidFormatBroken}</Text>
            </View>
          </View>
        )}

        {doctors.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Chi tiết từng bác sĩ</Text>
            
            {/* Working doctors */}
            {doctors.filter(d => d.canReceiveMessages).length > 0 && (
              <>
                <Text style={styles.categoryTitle}>✅ Hoạt động tốt ({doctors.filter(d => d.canReceiveMessages).length})</Text>
                {doctors.filter(d => d.canReceiveMessages).map((doctor, index) => (
                  <View key={index} style={[styles.doctorCard, styles.workingCard]}>
                    <Text style={styles.doctorName}>{doctor.doctorName}</Text>
                    <Text style={styles.doctorId}>ID: {doctor.doctorId}</Text>
                    
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>Conversations: {doctor.totalConversations}</Text>
                    </View>
                    
                    {doctor.sampleConv && (
                      <View style={styles.convInfo}>
                        <Text style={styles.convLabel}>Sample conversation:</Text>
                        <Text style={styles.convText}>
                          doctorId: {(doctor.sampleConv as any).doctorId} 
                          {doctor.convDoctorIdType === 'bs-format' && ' ✅ (bs-format)'}
                          {doctor.convDoctorIdType === 'firebase-uid' && ' ⚠️ (UID)'}
                        </Text>
                        <Text style={styles.convText}>
                          doctorAuthUid: {(doctor.sampleConv as any).doctorAuthUid || '❌ THIẾU'}
                          {doctor.convDoctorAuthUidMatches && ' ✅'}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
            
            {/* Broken doctors */}
            {doctors.filter(d => !d.canReceiveMessages).length > 0 && (
              <>
                <Text style={styles.categoryTitle}>❌ Không hoạt động ({doctors.filter(d => !d.canReceiveMessages).length})</Text>
                {doctors.filter(d => !d.canReceiveMessages).map((doctor, index) => (
                  <View key={index} style={[styles.doctorCard, styles.brokenCard]}>
                    <Text style={styles.doctorName}>{doctor.doctorName}</Text>
                    <Text style={styles.doctorId}>ID: {doctor.doctorId}</Text>
                    
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>Conversations: {doctor.totalConversations}</Text>
                    </View>
                    
                    {doctor.issues.length > 0 && (
                      <View style={styles.issuesBox}>
                        <Text style={styles.issuesTitle}>Vấn đề:</Text>
                        {doctor.issues.map((issue, i) => (
                          <Text key={i} style={styles.issueText}>• {issue}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}
          </>
        )}
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
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summarySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  workingCard: {
    borderLeftColor: '#4CAF50',
  },
  brokenCard: {
    borderLeftColor: '#F44336',
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  doctorId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  statsRow: {
    marginBottom: 8,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  convInfo: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  convLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  convText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  issuesBox: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  issuesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 11,
    color: '#C62828',
    marginBottom: 2,
  },
});
