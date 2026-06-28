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

export default function QuickFixDoctorImagesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const fixImages = async () => {
    setLoading(true);
    setResults([]);
    const logs: string[] = [];

    try {
      logs.push('🔄 Đang tải danh sách bác sĩ...');
      setResults([...logs]);

      const doctors = await getAllDocuments('doctors');
      logs.push(`✅ Tìm thấy ${doctors.length} bác sĩ`);
      logs.push('');
      setResults([...logs]);

      // Mapping tên bác sĩ với file ảnh
      const nameToImage: { [key: string]: string } = {
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

      let updated = 0;
      let skipped = 0;

      for (const doctor of doctors) {
        const doc = doctor as any;
        const name = (doc.name || doc.fullName || '').replace(/^BS\.\s*/i, '').trim();
        const doctorId = doc.id;

        // Tìm ảnh phù hợp
        let imageName = nameToImage[name];

        if (imageName) {
          try {
            await updateDocument('doctors', doctorId, { image: imageName });
            logs.push(`✅ ${name} → ${imageName}`);
            updated++;
          } catch (error) {
            logs.push(`❌ ${name}: Lỗi cập nhật`);
          }
        } else {
          logs.push(`⚠️ ${name}: Không tìm thấy mapping`);
          skipped++;
        }
        
        setResults([...logs]);
      }

      logs.push('');
      logs.push(`📊 Kết quả:`);
      logs.push(`   ✅ Đã cập nhật: ${updated}`);
      logs.push(`   ⚠️ Bỏ qua: ${skipped}`);
      logs.push('');
      logs.push('✅ Hoàn tất! Bác sĩ gửi tin nhắn MỚI sẽ có avatar đúng.');
      logs.push('');
      logs.push('⚠️ Lưu ý: Thông báo CŨ vẫn giữ nguyên avatar cũ.');
      
      setResults(logs);
    } catch (error) {
      logs.push(`❌ Lỗi: ${error}`);
      setResults(logs);
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
        <Text style={styles.headerTitle}>Fix Avatar Bác Sĩ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={32} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cách sử dụng</Text>
            <Text style={styles.infoText}>
              1. Bấm nút "Fix Ngay" bên dưới{'\n'}
              2. Đợi script cập nhật xong{'\n'}
              3. Yêu cầu bác sĩ gửi tin nhắn MỚI{'\n'}
              4. Avatar sẽ hiện đúng trong thông báo
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={fixImages}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Đang xử lý...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.buttonText}>Fix Ngay</Text>
            </>
          )}
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.resultsBox}>
            {results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </View>
        )}
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 20,
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
  },
  resultText: {
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'monospace',
    marginBottom: 4,
    lineHeight: 20,
  },
});
