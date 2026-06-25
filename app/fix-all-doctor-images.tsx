import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getAllDocuments, updateDocument } from './services/firebaseService';

// Mapping doctor names to image filenames
// Sử dụng partial match để linh hoạt hơn
const doctorImageMapping: { [key: string]: string } = {
  // Exact matches first
  'BS. Nguyễn Văn An': 'nguyenvanam.png',
  'BS. Trần Thị Lan': 'tranthilan.png',
  'BS. Trần Thị Mai': 'tranthimai.png',
  'BS. Lê Minh Tâm': 'leminhtam.png',
  'BS. Hoàng Văn Đức': 'hoangvanduc.png',
  'BS. Vũ Thị Lan': 'vuthilan.png',
  'BS. Đỗ Minh Tuấn': 'dominhtuan.png',
  'BS. Ngô Thị Hương': 'ngothihuong.png',
  'BS. Nguyễn Văn Hải': 'nguyenvanhai.png',
  'BS. Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'BS. Trần Văn Khoa': 'tranvankhoa.png',
  'BS. Phạm Minh Quân': 'phamminhquan.png',
  'BS. Lê Thị Hằng': 'lethihang.png',
  'BS. Đặng Thị Thảo': 'dangthithao.jpg',
  
  // Without BS. prefix
  'Nguyễn Văn An': 'nguyenvanam.png',
  'Trần Thị Lan': 'tranthilan.png',
  'Trần Thị Mai': 'tranthimai.png',
  'Lê Minh Tâm': 'leminhtam.png',
  'Hoàng Văn Đức': 'hoangvanduc.png',
  'Vũ Thị Lan': 'vuthilan.png',
  'Đỗ Minh Tuấn': 'dominhtuan.png',
  'Ngô Thị Hương': 'ngothihuong.png',
  'Nguyễn Văn Hải': 'nguyenvanhai.png',
  'Nguyễn Thị Hoa': 'nguyenthihoa.png',
  'Trần Văn Khoa': 'tranvankhoa.png',
  'Phạm Minh Quân': 'phamminhquan.png',
  'Lê Thị Hằng': 'lethihang.png',
  'Đặng Thị Thảo': 'dangthithao.jpg',
};

export default function FixAllDoctorImagesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const fixAllDoctorImages = async () => {
    setLoading(true);
    setResults([]);
    const newResults: string[] = [];

    try {
      // Get all doctors
      const doctors = await getAllDocuments('doctors');
      newResults.push(`📋 Tìm thấy ${doctors.length} bác sĩ`);
      console.log('📋 Found doctors:', doctors.length);

      for (const doctor of doctors) {
        const doctorData = doctor as any;
        const doctorName = doctorData.name || doctorData.fullName || '';
        const doctorId = doctorData.id;

        // Find matching image - try exact match first
        let imageName = 'logo.png';
        
        // Try exact match
        if (doctorImageMapping[doctorName]) {
          imageName = doctorImageMapping[doctorName];
        } else {
          // Try partial match
          for (const [name, image] of Object.entries(doctorImageMapping)) {
            // Remove "BS. " prefix for comparison
            const cleanDoctorName = doctorName.replace(/^BS\.\s*/i, '');
            const cleanMappingName = name.replace(/^BS\.\s*/i, '');
            
            if (cleanDoctorName === cleanMappingName) {
              imageName = image;
              break;
            }
          }
        }

        // Update doctor
        try {
          await updateDocument('doctors', doctorId, {
            image: imageName
          });
          
          const message = `✅ ${doctorName} → ${imageName}`;
          newResults.push(message);
          console.log(message);
        } catch (error) {
          const message = `❌ ${doctorName}: ${error}`;
          newResults.push(message);
          console.error(message);
        }
      }

      newResults.push('');
      newResults.push('✅ Hoàn tất! Bác sĩ gửi tin nhắn mới sẽ có avatar đúng.');
      setResults(newResults);
    } catch (error) {
      const message = `❌ Lỗi: ${error}`;
      newResults.push(message);
      console.error(message);
      setResults(newResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fix Doctor Images</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#f59e0b" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Cảnh báo</Text>
            <Text style={styles.warningText}>
              Script này sẽ cập nhật field "image" cho TẤT CẢ bác sĩ trong Firestore.
              {'\n\n'}
              Chỉ chạy nếu bạn chắc chắn!
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cách hoạt động</Text>
            <Text style={styles.infoText}>
              1. Lấy tất cả doctors từ Firestore{'\n'}
              2. Match tên bác sĩ với tên file ảnh{'\n'}
              3. Cập nhật field "image" cho mỗi doctor{'\n'}
              4. Tin nhắn MỚI sẽ có avatar đúng
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={fixAllDoctorImages}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang xử lý...</Text>
            </>
          ) : (
            <>
              <Ionicons name="hammer" size={20} color="#fff" />
              <Text style={styles.buttonText}>Fix All Doctor Images</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsBox}>
            <Text style={styles.resultsTitle}>📊 Kết quả:</Text>
            {results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.mappingBox}>
          <Text style={styles.mappingTitle}>🗺️ Mapping:</Text>
          {Object.entries(doctorImageMapping).map(([name, image]) => (
            <View key={name} style={styles.mappingRow}>
              <Text style={styles.mappingName}>{name}</Text>
              <Text style={styles.mappingArrow}>→</Text>
              <Text style={styles.mappingImage}>{image}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  mappingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  mappingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  mappingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  mappingName: {
    fontSize: 13,
    color: '#0f172a',
    flex: 1,
  },
  mappingArrow: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  mappingImage: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
    flex: 1,
  },
});
