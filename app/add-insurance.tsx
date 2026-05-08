import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument } from './services/firebaseService';

export default function AddInsuranceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [provider, setProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!provider || !cardNumber || !holder || !validFrom || !validUntil) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm bảo hiểm');
      return;
    }

    try {
      setSaving(true);
      await createDocument('insurances', {
        userId: user.uid,
        provider,
        cardNumber,
        holder,
        validFrom,
        validUntil,
        notes,
        status: 'active'
      });

      Alert.alert(
        'Thành công',
        'Đã thêm thông tin bảo hiểm',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving insurance:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin bảo hiểm');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm bảo hiểm y tế</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nhà cung cấp <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Bảo hiểm Y tế Việt Nam"
              value={provider}
              onChangeText={setProvider}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số thẻ bảo hiểm <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số thẻ bảo hiểm"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chủ thẻ <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên chủ thẻ"
              value={holder}
              onChangeText={setHolder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày bắt đầu <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={validFrom}
              onChangeText={setValidFrom}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày hết hạn <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              value={validUntil}
              onChangeText={setValidUntil}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nhập ghi chú (nếu có)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thông tin</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
