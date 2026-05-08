import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import aiDiagnosticService, { DiagnosticResult, Symptom } from './services/aiDiagnosticService';

export default function AIDiagnosticScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const commonSymptoms = [
    { id: '1', name: 'Đau đầu', icon: '🤕' },
    { id: '2', name: 'Sốt', icon: '🌡️' },
    { id: '3', name: 'Ho', icon: '😷' },
    { id: '4', name: 'Đau ngực', icon: '💔' },
    { id: '5', name: 'Đau bụng', icon: '🤢' },
    { id: '6', name: 'Khó thở', icon: '😮‍💨' },
    { id: '7', name: 'Chóng mặt', icon: '😵' },
    { id: '8', name: 'Mệt mỏi', icon: '😴' },
  ];

  const durations = [
    { id: '1', label: '< 1 ngày', value: 'less_than_1_day' },
    { id: '2', label: '1-3 ngày', value: '1_3_days' },
    { id: '3', label: '3-7 ngày', value: '3_7_days' },
    { id: '4', label: '> 1 tuần', value: 'more_than_week' },
  ];

  const addSymptom = () => {
    if (!currentSymptom.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập triệu chứng');
      return;
    }

    if (!selectedDuration) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian');
      return;
    }

    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: currentSymptom,
      severity: selectedSeverity,
      duration: selectedDuration,
      frequency: 'daily',
    };

    setSymptoms([...symptoms, newSymptom]);
    setCurrentSymptom('');
    setSelectedSeverity('mild');
    setSelectedDuration('');
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 triệu chứng');
      return;
    }

    setAnalyzing(true);
    try {
      const diagnosticResult = await aiDiagnosticService.analyzeSymptoms(symptoms);
      setResult(diagnosticResult);
      setCurrentStep(2);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phân tích triệu chứng');
    } finally {
      setAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return '#FF4444';
      case 'high': return '#FF9800';
      case 'medium': return '#FFB800';
      default: return '#4CAF50';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      default: return 'Thấp';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return '#FF4444';
      case 'moderate': return '#FFB800';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chẩn đoán AI</Text>
        <View style={{ width: 24 }} />
      </View>

      {currentStep === 1 ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#00BCD4" />
            <Text style={styles.infoText}>
              Mô tả chi tiết các triệu chứng để AI có thể phân tích chính xác hơn
            </Text>
          </View>

          {/* Common Symptoms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Triệu chứng thường gặp</Text>
            <View style={styles.symptomsGrid}>
              {commonSymptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom.id}
                  style={styles.symptomChip}
                  onPress={() => setCurrentSymptom(symptom.name)}
                >
                  <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                  <Text style={styles.symptomName}>{symptom.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Symptom */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thêm triệu chứng</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nhập triệu chứng..."
              value={currentSymptom}
              onChangeText={setCurrentSymptom}
            />

            <Text style={styles.label}>Mức độ nghiêm trọng</Text>
            <View style={styles.severityRow}>
              <TouchableOpacity
                style={[
                  styles.severityBtn,
                  selectedSeverity === 'mild' && styles.severityBtnActive,
                  { borderColor: '#4CAF50' }
                ]}
                onPress={() => setSelectedSeverity('mild')}
              >
                <Text style={[
                  styles.severityText,
                  selectedSeverity === 'mild' && { color: '#4CAF50' }
                ]}>
                  Nhẹ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.severityBtn,
                  selectedSeverity === 'moderate' && styles.severityBtnActive,
                  { borderColor: '#FFB800' }
                ]}
                onPress={() => setSelectedSeverity('moderate')}
              >
                <Text style={[
                  styles.severityText,
                  selectedSeverity === 'moderate' && { color: '#FFB800' }
                ]}>
                  Trung bình
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.severityBtn,
                  selectedSeverity === 'severe' && styles.severityBtnActive,
                  { borderColor: '#FF4444' }
                ]}
                onPress={() => setSelectedSeverity('severe')}
              >
                <Text style={[
                  styles.severityText,
                  selectedSeverity === 'severe' && { color: '#FF4444' }
                ]}>
                  Nặng
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Thời gian xuất hiện</Text>
            <View style={styles.durationRow}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.durationBtn,
                    selectedDuration === duration.value && styles.durationBtnActive
                  ]}
                  onPress={() => setSelectedDuration(duration.value)}
                >
                  <Text style={[
                    styles.durationText,
                    selectedDuration === duration.value && styles.durationTextActive
                  ]}>
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={addSymptom}>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Thêm triệu chứng</Text>
            </TouchableOpacity>
          </View>

          {/* Symptoms List */}
          {symptoms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Các triệu chứng đã thêm ({symptoms.length})</Text>
              {symptoms.map((symptom) => (
                <View key={symptom.id} style={styles.symptomItem}>
                  <View style={styles.symptomInfo}>
                    <Text style={styles.symptomItemName}>{symptom.name}</Text>
                    <View style={styles.symptomMeta}>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(symptom.severity) + '20' }
                      ]}>
                        <Text style={[
                          styles.severityBadgeText,
                          { color: getSeverityColor(symptom.severity) }
                        ]}>
                          {symptom.severity === 'mild' ? 'Nhẹ' : 
                           symptom.severity === 'moderate' ? 'Trung bình' : 'Nặng'}
                        </Text>
                      </View>
                      <Text style={styles.durationText2}>{symptom.duration}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeSymptom(symptom.id)}>
                    <Ionicons name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.analyzeBtn, analyzing && styles.analyzeBtnDisabled]}
            onPress={analyzeSymptoms}
            disabled={analyzing}
          >
            {analyzing ? (
              <Text style={styles.analyzeBtnText}>Đang phân tích...</Text>
            ) : (
              <>
                <Ionicons name="analytics" size={20} color="#fff" />
                <Text style={styles.analyzeBtnText}>Phân tích triệu chứng</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Result Header */}
          <View style={styles.resultHeader}>
            <View style={[
              styles.urgencyBadge,
              { backgroundColor: getUrgencyColor(result?.urgencyLevel || 'low') }
            ]}>
              <Ionicons name="alert-circle" size={20} color="#fff" />
              <Text style={styles.urgencyText}>
                Mức độ: {getUrgencyText(result?.urgencyLevel || 'low')}
              </Text>
            </View>
            <Text style={styles.confidenceText}>
              Độ tin cậy: {result?.confidence}%
            </Text>
          </View>

          {/* Possible Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Các bệnh có thể</Text>
            {result?.possibleConditions.map((condition, index) => (
              <View key={index} style={styles.conditionCard}>
                <View style={styles.conditionHeader}>
                  <Text style={styles.conditionName}>{condition.name}</Text>
                  <View style={styles.probabilityBadge}>
                    <Text style={styles.probabilityText}>{condition.probability}%</Text>
                  </View>
                </View>
                <Text style={styles.conditionDesc}>{condition.description}</Text>
              </View>
            ))}
          </View>

          {/* Recommended Specialty */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chuyên khoa gợi ý</Text>
            <View style={styles.specialtyCard}>
              <Ionicons name="medical" size={24} color="#00BCD4" />
              <Text style={styles.specialtyText}>{result?.recommendedSpecialty}</Text>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Các bước tiếp theo</Text>
            {result?.nextSteps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => router.push('/(tabs)/booking')}
            >
              <Ionicons name="calendar" size={20} color="#fff" />
              <Text style={styles.bookBtnText}>Đặt lịch khám</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <Ionicons name="chatbubbles" size={20} color="#00BCD4" />
              <Text style={styles.chatBtnText}>Tư vấn với bác sĩ</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.newAnalysisBtn}
            onPress={() => {
              setCurrentStep(1);
              setSymptoms([]);
              setResult(null);
            }}
          >
            <Text style={styles.newAnalysisBtnText}>Phân tích mới</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#00838F',
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  symptomIcon: {
    fontSize: 16,
  },
  symptomName: {
    fontSize: 13,
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  severityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  severityBtnActive: {
    backgroundColor: '#f8fafc',
  },
  severityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  durationBtnActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  durationText: {
    fontSize: 13,
    color: '#64748b',
  },
  durationTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  symptomItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  symptomInfo: {
    flex: 1,
  },
  symptomItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 6,
  },
  symptomMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  durationText2: {
    fontSize: 11,
    color: '#64748b',
  },
  analyzeBtn: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  analyzeBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultHeader: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  confidenceText: {
    fontSize: 14,
    color: '#64748b',
  },
  conditionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  probabilityBadge: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  probabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  conditionDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  specialtyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  specialtyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  stepItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
    lineHeight: 18,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  bookBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
  newAnalysisBtn: {
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  newAnalysisBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
});
