import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { createDocument } from './services/firebaseService';

export default function AddPaymentMethodScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'card' | 'wallet' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [walletPhone, setWalletPhone] = useState('');
  const [walletType, setWalletType] = useState('');
  const [saving, setSaving] = useState(false);

  const paymentTypes = [
    { id: 'card', name: 'Thẻ ngân hàng', icon: 'card', description: 'Visa, Mastercard, JCB...' },
    { id: 'wallet', name: 'Ví điện tử', icon: 'wallet', description: 'MoMo, ZaloPay, VNPay...' },
  ];

  const walletOptions = [
    { id: 'momo', name: 'MoMo', icon: 'logo-electron' },
    { id: 'zalopay', name: 'ZaloPay', icon: 'logo-google-playstore' },
    { id: 'vnpay', name: 'VNPay', icon: 'card-outline' },
  ];

  const handleSave = async () => {
    if (!selectedType) {
      Alert.alert('Thông báo', 'Vui lòng chọn loại phương thức thanh toán');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm phương thức thanh toán');
      return;
    }

    if (selectedType === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin thẻ');
        return;
      }
    } else if (selectedType === 'wallet') {
      if (!walletType || !walletPhone) {
        Alert.alert('Thông báo', 'Vui lòng chọn ví và nhập số điện thoại');
        return;
      }
    }

    try {
      setSaving(true);
      const paymentData: any = {
        userId: user.uid,
        type: selectedType,
        isDefault: false,
      };

      if (selectedType === 'card') {
        const lastFour = cardNumber.slice(-4);
        paymentData.name = cardName.includes('Visa') || cardName.includes('Master') ? cardName : 'Visa';
        paymentData.number = `**** **** **** ${lastFour}`;
        paymentData.expiry = expiryDate;
        paymentData.icon = 'card';
      } else {
        const walletName = walletOptions.find(w => w.id === walletType)?.name || 'Ví điện tử';
        paymentData.name = walletName;
        paymentData.number = walletPhone;
        paymentData.icon = 'wallet';
      }

      await createDocument('paymentMethods', paymentData);

      Alert.alert(
        'Thành công',
        'Đã thêm phương thức thanh toán',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving payment method:', error);
      Alert.alert('Lỗi', 'Không thể lưu phương thức thanh toán');
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
        <Text style={styles.headerTitle}>Thêm phương thức</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Chọn loại phương thức</Text>
          <View style={styles.typeGrid}>
            {paymentTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected
                ]}
                onPress={() => setSelectedType(type.id as 'card' | 'wallet')}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={32} 
                  color={selectedType === type.id ? '#00BCD4' : '#64748b'} 
                />
                <Text style={[
                  styles.typeName,
                  selectedType === type.id && styles.typeNameSelected
                ]}>
                  {type.name}
                </Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedType === 'card' && (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số thẻ <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên chủ thẻ <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="NGUYEN VAN A"
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Ngày hết hạn <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          )}

          {selectedType === 'wallet' && (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chọn ví điện tử <Text style={styles.required}>*</Text></Text>
                <View style={styles.walletGrid}>
                  {walletOptions.map((wallet) => (
                    <TouchableOpacity
                      key={wallet.id}
                      style={[
                        styles.walletOption,
                        walletType === wallet.id && styles.walletOptionSelected
                      ]}
                      onPress={() => setWalletType(wallet.id)}
                    >
                      <Ionicons 
                        name={wallet.icon as any} 
                        size={24} 
                        color={walletType === wallet.id ? '#00BCD4' : '#64748b'} 
                      />
                      <Text style={[
                        styles.walletName,
                        walletType === wallet.id && styles.walletNameSelected
                      ]}>
                        {wallet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="0987 654 321"
                  value={walletPhone}
                  onChangeText={setWalletPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}

          {selectedType && (
            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Thêm phương thức</Text>
              )}
            </TouchableOpacity>
          )}
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  typeCardSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
  },
  typeNameSelected: {
    color: '#00BCD4',
  },
  typeDescription: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  formSection: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
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
  row: {
    flexDirection: 'row',
  },
  walletGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  walletOption: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  walletOptionSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  walletName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 8,
  },
  walletNameSelected: {
    color: '#00BCD4',
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
