import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from './config/firebase';

export default function RemoveDuplicateSpecialtiesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const removeDuplicates = async () => {
    setLoading(true);
    let output = '🔍 KIỂM TRA VÀ XÓA CHUYÊN KHOA TRÙNG\n\n';

    try {
      // Lấy tất cả documents từ popular-specialties
      const querySnapshot = await getDocs(collection(db, 'popular-specialties'));
      const allSpecialties: any[] = [];
      
      querySnapshot.forEach((doc) => {
        allSpecialties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      output += `📊 Tổng số documents: ${allSpecialties.length}\n\n`;

      // Tìm các chuyên khoa trùng tên
      const nameMap = new Map<string, any[]>();
      
      allSpecialties.forEach((specialty) => {
        const name = specialty.name;
        if (!nameMap.has(name)) {
          nameMap.set(name, []);
        }
        nameMap.get(name)!.push(specialty);
      });

      // Tìm các tên bị trùng
      const duplicates: string[] = [];
      nameMap.forEach((specs, name) => {
        if (specs.length > 1) {
          duplicates.push(name);
        }
      });

      if (duplicates.length === 0) {
        output += '✅ KHÔNG CÓ CHUYÊN KHOA TRÙNG!\n';
        output += 'Tất cả chuyên khoa đều unique.\n';
        setResult(output);
        Alert.alert('Thông báo', 'Không có chuyên khoa trùng lặp');
        setLoading(false);
        return;
      }

      output += `⚠️ Tìm thấy ${duplicates.length} chuyên khoa bị trùng:\n\n`;

      // Xóa các documents trùng (giữ lại 1, xóa các cái còn lại)
      let deletedCount = 0;

      for (const name of duplicates) {
        const specs = nameMap.get(name)!;
        output += `📋 "${name}" - ${specs.length} documents:\n`;
        
        // Giữ lại document đầu tiên, xóa các cái còn lại
        for (let i = 1; i < specs.length; i++) {
          const spec = specs[i];
          output += `   ❌ Xóa: ${spec.id}\n`;
          
          try {
            await deleteDoc(doc(db, 'popular-specialties', spec.id));
            deletedCount++;
          } catch (error: any) {
            output += `   ⚠️ Lỗi khi xóa: ${error.message}\n`;
          }
        }
        
        output += `   ✅ Giữ lại: ${specs[0].id}\n\n`;
      }

      output += '\n---\n\n';
      output += `✅ HOÀN THÀNH!\n`;
      output += `🗑️ Đã xóa ${deletedCount} documents trùng\n`;
      output += `📋 Còn lại ${allSpecialties.length - deletedCount} chuyên khoa unique\n\n`;
      output += '💡 Bây giờ hãy:\n';
      output += '1. Quay lại trang Chuyên khoa\n';
      output += '2. Kiểm tra xem còn bị trùng không\n';

      setResult(output);
      Alert.alert('Thành công', `Đã xóa ${deletedCount} chuyên khoa trùng!`);
    } catch (error: any) {
      output += `\n❌ LỖI: ${error.message}\n`;
      setResult(output);
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkOnly = async () => {
    setLoading(true);
    let output = '🔍 KIỂM TRA CHUYÊN KHOA TRÙNG (KHÔNG XÓA)\n\n';

    try {
      const querySnapshot = await getDocs(collection(db, 'popular-specialties'));
      const allSpecialties: any[] = [];
      
      querySnapshot.forEach((doc) => {
        allSpecialties.push({
          id: doc.id,
          ...doc.data()
        });
      });

      output += `📊 Tổng số documents: ${allSpecialties.length}\n\n`;

      // Tìm các chuyên khoa trùng tên
      const nameMap = new Map<string, any[]>();
      
      allSpecialties.forEach((specialty) => {
        const name = specialty.name;
        if (!nameMap.has(name)) {
          nameMap.set(name, []);
        }
        nameMap.get(name)!.push(specialty);
      });

      output += '📋 DANH SÁCH CHUYÊN KHOA:\n\n';
      
      let hasDuplicates = false;
      nameMap.forEach((specs, name) => {
        if (specs.length > 1) {
          hasDuplicates = true;
          output += `⚠️ "${name}" - ${specs.length} documents (TRÙNG!):\n`;
          specs.forEach((spec, index) => {
            output += `   ${index + 1}. ID: ${spec.id}\n`;
            output += `      - Doctors: ${spec.doctors || 0}\n`;
            output += `      - Image: ${spec.image || 'N/A'}\n`;
          });
          output += '\n';
        } else {
          output += `✅ "${name}" - 1 document\n`;
        }
      });

      if (!hasDuplicates) {
        output += '\n✅ KHÔNG CÓ CHUYÊN KHOA TRÙNG!\n';
      } else {
        output += '\n⚠️ CÓ CHUYÊN KHOA BỊ TRÙNG!\n';
        output += 'Click nút "Xóa Chuyên Khoa Trùng" để xóa.\n';
      }

      setResult(output);
    } catch (error: any) {
      output += `\n❌ LỖI: ${error.message}\n`;
      setResult(output);
      Alert.alert('Lỗi', error.message);
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
        <Text style={styles.headerTitle}>Xóa Chuyên Khoa Trùng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="copy" size={48} color="#F59E0B" />
          <Text style={styles.infoTitle}>Xóa Dữ Liệu Trùng Lặp</Text>
          <Text style={styles.infoDescription}>
            Kiểm tra và xóa các chuyên khoa bị trùng tên trong Firestore
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.checkButton, loading && styles.buttonDisabled]}
          onPress={checkOnly}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={24} color="#fff" />
              <Text style={styles.buttonText}>Kiểm Tra Trùng Lặp</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, loading && styles.buttonDisabled]}
          onPress={removeDuplicates}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash" size={24} color="#fff" />
              <Text style={styles.buttonText}>Xóa Chuyên Khoa Trùng</Text>
            </>
          )}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#F59E0B" />
          <Text style={styles.warningText}>
            Lưu ý: Thao tác xóa không thể hoàn tác. Hãy kiểm tra trước khi xóa!
          </Text>
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultText: {
    fontSize: 13,
    color: '#0f172a',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});
