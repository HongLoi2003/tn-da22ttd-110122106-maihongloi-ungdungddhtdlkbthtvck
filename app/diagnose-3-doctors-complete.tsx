import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDocumentById, getDocumentsWithQuery } from './services/firebaseService';

const PROBLEM_DOCTORS = [
  { id: 'bs001', name: 'Nguyễn Văn An', specialty: 'Tim mạch' },
  { id: 'bs002', name: 'Trần Thị Lan', specialty: 'Da liễu' },
  { id: 'bs007', name: 'Đỗ Minh Tuấn', specialty: 'Da liễu' }
];

interface DiagnosticResult {
  doctorId: string;
  doctorName: string;
  specialty: string;
  issues: string[];
  doctorExists: boolean;
  hasAuthUid: boolean;
  authUid: string | null;
  userExists: boolean;
  userUid: string | null;
  userEmail: string | null;
  authUidMatches: boolean;
  conversationCount: number;
  conversationsWithoutAuthUid: number;
  conversationsWithMismatchedAuthUid: number;
  status: 'ok' | 'error';
}

export default function Diagnose3DoctorsComplete() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const diagnoseDoctor = async (doctorId: string, doctorName: string, specialty: string): Promise<DiagnosticResult> => {
    const result: DiagnosticResult = {
      doctorId,
      doctorName,
      specialty,
      issues: [],
      doctorExists: false,
      hasAuthUid: false,
      authUid: null,
      userExists: false,
      userUid: null,
      userEmail: null,
      authUidMatches: false,
      conversationCount: 0,
      conversationsWithoutAuthUid: 0,
      conversationsWithMismatchedAuthUid: 0,
      status: 'ok'
    };

    try {
      // 1. Kiểm tra doctor document
      const doctorDoc = await getDocumentById('doctors', doctorId);
      
      if (!doctorDoc) {
        result.issues.push('❌ Doctor document không tồn tại');
        result.status = 'error';
        return result;
      }

      result.doctorExists = true;
      const authUid = (doctorDoc as any).authUid;

      if (!authUid) {
        result.issues.push('❌ Thiếu authUid trong doctor document');
        result.status = 'error';
      } else {
        result.hasAuthUid = true;
        result.authUid = authUid;
      }

      // 2. Kiểm tra user account
      const users = await getDocumentsWithQuery('users', [
        where('role', '==', 'doctor'),
        where('doctorInfo.doctorId', '==', doctorId)
      ]);

      if (users.length === 0) {
        result.issues.push('❌ Không có user account');
        result.status = 'error';
      } else {
        result.userExists = true;
        const user = users[0] as any;
        result.userUid = user.uid;
        result.userEmail = user.email;

        // 3. So sánh authUid với user UID
        if (authUid && result.userUid) {
          if (authUid === result.userUid) {
            result.authUidMatches = true;
          } else {
            result.authUidMatches = false;
            result.issues.push(`❌ AuthUid không khớp (doctor: ${authUid.substring(0, 8)}..., user: ${result.userUid.substring(0, 8)}...)`);
            result.status = 'error';
          }
        }
      }

      // 4. Kiểm tra conversations
      const conversations = await getDocumentsWithQuery('conversations', [
        where('doctorId', '==', doctorId)
      ]);

      result.conversationCount = conversations.length;

      for (const conv of conversations) {
        const c = conv as any;
        
        if (!c.doctorAuthUid) {
          result.conversationsWithoutAuthUid++;
          result.issues.push(`⚠️ Conversation ${c.id.substring(0, 8)}... thiếu doctorAuthUid`);
          result.status = 'error';
        } else if (authUid && c.doctorAuthUid !== authUid) {
          result.conversationsWithMismatchedAuthUid++;
          result.issues.push(`⚠️ Conversation ${c.id.substring(0, 8)}... có doctorAuthUid không khớp`);
          result.status = 'error';
        }
      }

      // Nếu không có vấn đề gì
      if (result.issues.length === 0) {
        result.status = 'ok';
      }

    } catch (error) {
      result.issues.push(`❌ Lỗi: ${error}`);
      result.status = 'error';
    }

    return result;
  };

  const runDiagnostics = async () => {
    try {
      setLoading(true);
      setResults([]);
      
      const diagnosticResults: DiagnosticResult[] = [];
      
      for (const doctor of PROBLEM_DOCTORS) {
        const result = await diagnoseDoctor(doctor.id, doctor.name, doctor.specialty);
        diagnosticResults.push(result);
      }

      setResults(diagnosticResults);
      setLoading(false);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setLoading(false);
    }
  };

  const getSolution = (result: DiagnosticResult): string => {
    const solutions: string[] = [];

    if (!result.doctorExists) {
      return '→ Doctor chưa được import vào Firestore. Chạy import-doctors.js';
    }

    if (!result.hasAuthUid) {
      solutions.push('→ Chạy /fix-doctor-auth-uid để thêm authUid');
    }

    if (!result.userExists) {
      solutions.push('→ Chạy /create-doctor-account để tạo user account');
    }

    if (result.hasAuthUid && result.userExists && !result.authUidMatches) {
      solutions.push('→ AuthUid không khớp! Cần update authUid = userUid thủ công');
    }

    if (result.conversationsWithoutAuthUid > 0 || result.conversationsWithMismatchedAuthUid > 0) {
      solutions.push('→ Chạy /fix-conversations-auth-uid để sửa conversations');
    }

    return solutions.length > 0 ? solutions.join('\n') : '✅ Không có vấn đề';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chẩn đoán 3 bác sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="medical" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Chẩn đoán chi tiết</Text>
            <Text style={styles.infoText}>
              Kiểm tra từng vấn đề cụ thể của bs001, bs002, bs007
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={runDiagnostics}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang chẩn đoán...</Text>
            </>
          ) : (
            <>
              <Ionicons name="analytics" size={20} color="#fff" />
              <Text style={styles.buttonText}>Chạy chẩn đoán</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>📊 Kết quả chẩn đoán</Text>
            
            {results.map((result, index) => (
              <View 
                key={result.doctorId} 
                style={[
                  styles.resultCard,
                  result.status === 'ok' ? styles.resultOk : styles.resultError
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultDoctorName}>
                    {result.doctorName}
                  </Text>
                  <Text style={styles.resultDoctorId}>({result.doctorId})</Text>
                </View>
                
                <Text style={styles.resultSpecialty}>{result.specialty}</Text>

                <View style={styles.checklistSection}>
                  <Text style={styles.sectionTitle}>Checklist:</Text>
                  
                  <View style={styles.checkItem}>
                    <Ionicons 
                      name={result.doctorExists ? 'checkmark-circle' : 'close-circle'} 
                      size={18} 
                      color={result.doctorExists ? '#4CAF50' : '#F44336'} 
                    />
                    <Text style={styles.checkText}>Doctor document tồn tại</Text>
                  </View>

                  <View style={styles.checkItem}>
                    <Ionicons 
                      name={result.hasAuthUid ? 'checkmark-circle' : 'close-circle'} 
                      size={18} 
                      color={result.hasAuthUid ? '#4CAF50' : '#F44336'} 
                    />
                    <Text style={styles.checkText}>
                      Có authUid {result.authUid ? `(${result.authUid.substring(0, 8)}...)` : ''}
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <Ionicons 
                      name={result.userExists ? 'checkmark-circle' : 'close-circle'} 
                      size={18} 
                      color={result.userExists ? '#4CAF50' : '#F44336'} 
                    />
                    <Text style={styles.checkText}>
                      User account tồn tại {result.userEmail ? `(${result.userEmail})` : ''}
                    </Text>
                  </View>

                  {result.hasAuthUid && result.userExists && (
                    <View style={styles.checkItem}>
                      <Ionicons 
                        name={result.authUidMatches ? 'checkmark-circle' : 'close-circle'} 
                        size={18} 
                        color={result.authUidMatches ? '#4CAF50' : '#F44336'} 
                      />
                      <Text style={styles.checkText}>
                        AuthUid khớp với User UID
                      </Text>
                    </View>
                  )}

                  <View style={styles.checkItem}>
                    <Ionicons 
                      name="chatbubbles-outline" 
                      size={18} 
                      color="#64748b" 
                    />
                    <Text style={styles.checkText}>
                      {result.conversationCount} conversations
                    </Text>
                  </View>

                  {result.conversationsWithoutAuthUid > 0 && (
                    <View style={styles.checkItem}>
                      <Ionicons name="warning" size={18} color="#FF9800" />
                      <Text style={styles.checkText}>
                        {result.conversationsWithoutAuthUid} conversations thiếu doctorAuthUid
                      </Text>
                    </View>
                  )}

                  {result.conversationsWithMismatchedAuthUid > 0 && (
                    <View style={styles.checkItem}>
                      <Ionicons name="warning" size={18} color="#FF9800" />
                      <Text style={styles.checkText}>
                        {result.conversationsWithMismatchedAuthUid} conversations có authUid sai
                      </Text>
                    </View>
                  )}
                </View>

                {result.issues.length > 0 && (
                  <View style={styles.issuesSection}>
                    <Text style={styles.sectionTitle}>Vấn đề:</Text>
                    {result.issues.map((issue, idx) => (
                      <Text key={idx} style={styles.issueText}>{issue}</Text>
                    ))}
                  </View>
                )}

                <View style={styles.solutionSection}>
                  <Text style={styles.sectionTitle}>Giải pháp:</Text>
                  <Text style={styles.solutionText}>{getSolution(result)}</Text>
                </View>
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tóm tắt</Text>
              <Text style={styles.summaryText}>
                ✅ OK: {results.filter(r => r.status === 'ok').length} bác sĩ
              </Text>
              <Text style={styles.summaryText}>
                ❌ Có vấn đề: {results.filter(r => r.status === 'error').length} bác sĩ
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
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
  resultsContainer: {
    gap: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultOk: {
    borderColor: '#4CAF50',
  },
  resultError: {
    borderColor: '#F44336',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultDoctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultDoctorId: {
    fontSize: 14,
    color: '#64748b',
  },
  resultSpecialty: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 12,
  },
  checklistSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  checkText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  issuesSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  issueText: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 4,
  },
  solutionSection: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
  },
  solutionText: {
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
});
