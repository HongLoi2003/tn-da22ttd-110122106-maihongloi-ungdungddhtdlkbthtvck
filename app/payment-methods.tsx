import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { deleteDocument, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletId, setWalletId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedTopUpMethod, setSelectedTopUpMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    await Promise.all([loadPaymentMethods(), loadTransactions(), loadWalletBalance()]);
  };

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      if (!user) {
        setPaymentMethods([]);
        return;
      }
      
      const methods = await getDocumentsWithQuery('paymentMethods', [
        where('userId', '==', user.uid)
      ]);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      if (!user) {
        setTransactions([]);
        return;
      }
      
      const txns = await getDocumentsWithQuery('transactions', [
        where('userId', '==', user.uid)
      ]);
      // Sắp xếp theo thời gian mới nhất
      const sortedTxns = txns.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setTransactions(sortedTxns.slice(0, 3)); // Chỉ lấy 3 giao dịch gần nhất
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const loadWalletBalance = async () => {
    try {
      if (!user) {
        setWalletBalance(0);
        return;
      }
      
      // Lấy số dư ví từ collection wallets
      const wallets = await getDocumentsWithQuery('wallets', [
        where('userId', '==', user.uid)
      ]);
      
      if (wallets.length > 0) {
        setWalletBalance((wallets[0] as any).balance || 0);
        setWalletId(wallets[0].id);
      } else {
        // Tạo ví mới nếu chưa có
        const { createDocument } = await import('./services/firebaseService');
        const newWallet = await createDocument('wallets', {
          userId: user.uid,
          balance: 0,
          createdAt: new Date().toISOString(),
        });
        setWalletBalance(0);
        setWalletId(newWallet.id);
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(0);
    }
  };

  const handleTopUp = () => {
    setTopUpAmount('');
    setSelectedTopUpMethod('momo');
    setShowTopUpModal(true);
  };

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const handleQuickAmount = (amount: number) => {
    setTopUpAmount(amount.toString());
  };

  const handleConfirmTopUp = async () => {
    const amount = parseInt(topUpAmount);
    
    if (!amount || amount < 10000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 10.000đ');
      return;
    }

    if (amount > 50000000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối đa là 50.000.000đ');
      return;
    }

    if (!walletId) {
      Alert.alert('Lỗi', 'Không tìm thấy ví. Vui lòng thử lại!');
      return;
    }

    try {
      setIsProcessing(true);

      // Cập nhật số dư ví
      const newBalance = walletBalance + amount;
      await updateDocument('wallets', walletId, {
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });

      // Tạo transaction record
      const { createDocument } = await import('./services/firebaseService');
      await createDocument('transactions', {
        userId: user?.uid,
        amount: `+${amount.toLocaleString('vi-VN')}đ`,
        description: 'Nạp tiền vào ví',
        method: selectedTopUpMethod === 'momo' ? 'Ví MoMo' : 
                selectedTopUpMethod === 'banking' ? 'Chuyển khoản' : 'Thẻ tín dụng',
        date: new Date().toLocaleDateString('vi-VN'),
        createdAt: new Date().toISOString(),
        type: 'top_up',
        status: 'completed',
      });

      setIsProcessing(false);
      setShowTopUpModal(false);
      
      Alert.alert(
        'Nạp tiền thành công!',
        `Bạn đã nạp ${amount.toLocaleString('vi-VN')}đ vào ví`,
        [
          {
            text: 'OK',
            onPress: () => loadData(),
          }
        ]
      );
    } catch (error) {
      console.error('Error topping up:', error);
      setIsProcessing(false);
      Alert.alert('Lỗi', 'Không thể nạp tiền. Vui lòng thử lại!');
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert('Thêm phương thức thanh toán', 'Chức năng đang phát triển');
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Bỏ default của tất cả các phương thức khác
      for (const method of paymentMethods) {
        if (method.id !== id && method.isDefault) {
          await updateDocument('paymentMethods', method.id, { isDefault: false });
        }
      }
      
      // Set default cho phương thức được chọn
      await updateDocument('paymentMethods', id, { isDefault: true });
      
      Alert.alert('Thành công', 'Đã đặt làm phương thức mặc định');
      loadPaymentMethods();
    } catch (error) {
      console.error('Error setting default:', error);
      Alert.alert('Lỗi', 'Không thể đặt làm mặc định');
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      'Xóa phương thức thanh toán',
      'Bạn có chắc chắn muốn xóa?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument('paymentMethods', id);
              Alert.alert('Thành công', 'Đã xóa phương thức thanh toán');
              loadPaymentMethods();
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Lỗi', 'Không thể xóa phương thức thanh toán');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <TouchableOpacity 
          onPress={() => router.push('/add-payment-method')}
          style={styles.backButton}
        >
          <Ionicons name="add-circle-outline" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : (
          <>
        {/* Wallet Balance */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.walletLabel}>Số dư ví</Text>
              {walletBalance > 0 ? (
                <Text style={styles.walletBalance}>
                  {walletBalance.toLocaleString('vi-VN')}đ
                </Text>
              ) : (
                <Text style={styles.walletBalanceEmpty}>
                  Chưa có số dư
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.topUpButton}
              onPress={handleTopUp}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.topUpText}>Nạp tiền</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có phương thức thanh toán</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/add-payment-method')}
              >
                <Text style={styles.addButtonText}>Thêm phương thức</Text>
              </TouchableOpacity>
            </View>
          ) : (
            paymentMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={styles.methodIcon}>
                <Ionicons name={method.icon as any} size={24} color="#00BCD4" />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodHeader}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Mặc định</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodNumber}>{method.number}</Text>
                {method.expiry && (
                  <Text style={styles.methodExpiry}>Hết hạn: {method.expiry}</Text>
                )}
              </View>
              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity 
                    style={styles.actionIcon}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={24} color="#64748b" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.actionIcon}
                  onPress={() => handleRemove(method.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
          )}
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            <TouchableOpacity onPress={() => router.push('/all-transactions')}>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[
                styles.transactionIcon,
                transaction.amount.startsWith('+') ? styles.incomeIcon : styles.expenseIcon
              ]}>
                <Ionicons 
                  name={transaction.amount.startsWith('+') ? 'arrow-down' : 'arrow-up'} 
                  size={20} 
                  color="#fff" 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionMethod}>{transaction.method}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                transaction.amount.startsWith('+') ? styles.incomeAmount : styles.expenseAmount
              ]}>
                {transaction.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={showTopUpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp tiền vào ví</Text>
              <TouchableOpacity onPress={() => setShowTopUpModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Số tiền nạp</Text>
                <View style={styles.amountInputWrapper}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Nhập số tiền"
                    keyboardType="numeric"
                    value={topUpAmount}
                    onChangeText={setTopUpAmount}
                  />
                  <Text style={styles.currencyText}>đ</Text>
                </View>
                {topUpAmount && parseInt(topUpAmount) >= 10000 && (
                  <Text style={styles.amountPreview}>
                    {parseInt(topUpAmount).toLocaleString('vi-VN')} đồng
                  </Text>
                )}
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountSection}>
                <Text style={styles.inputLabel}>Chọn nhanh</Text>
                <View style={styles.quickAmountGrid}>
                  {quickAmounts.map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.quickAmountBtn,
                        topUpAmount === amount.toString() && styles.quickAmountBtnActive
                      ]}
                      onPress={() => handleQuickAmount(amount)}
                    >
                      <Text style={[
                        styles.quickAmountText,
                        topUpAmount === amount.toString() && styles.quickAmountTextActive
                      ]}>
                        {(amount / 1000).toLocaleString('vi-VN')}K
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Payment Method Selection */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Phương thức thanh toán</Text>
                
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    selectedTopUpMethod === 'momo' && styles.methodOptionActive
                  ]}
                  onPress={() => setSelectedTopUpMethod('momo')}
                >
                  <View style={styles.methodOptionLeft}>
                    <Ionicons name="wallet" size={24} color="#00BCD4" />
                    <Text style={styles.methodOptionText}>Ví MoMo</Text>
                  </View>
                  {selectedTopUpMethod === 'momo' && (
                    <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    selectedTopUpMethod === 'banking' && styles.methodOptionActive
                  ]}
                  onPress={() => setSelectedTopUpMethod('banking')}
                >
                  <View style={styles.methodOptionLeft}>
                    <Ionicons name="card" size={24} color="#00BCD4" />
                    <Text style={styles.methodOptionText}>Chuyển khoản ngân hàng</Text>
                  </View>
                  {selectedTopUpMethod === 'banking' && (
                    <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    selectedTopUpMethod === 'card' && styles.methodOptionActive
                  ]}
                  onPress={() => setSelectedTopUpMethod('card')}
                >
                  <View style={styles.methodOptionLeft}>
                    <Ionicons name="card-outline" size={24} color="#00BCD4" />
                    <Text style={styles.methodOptionText}>Thẻ tín dụng/Ghi nợ</Text>
                  </View>
                  {selectedTopUpMethod === 'card' && (
                    <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Note */}
              <View style={styles.noteBox}>
                <Ionicons name="information-circle" size={20} color="#00BCD4" />
                <Text style={styles.noteBoxText}>
                  Số tiền tối thiểu: 10.000đ{'\n'}
                  Số tiền tối đa: 50.000.000đ
                </Text>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!topUpAmount || parseInt(topUpAmount) < 10000 || isProcessing) && styles.confirmButtonDisabled
                ]}
                onPress={handleConfirmTopUp}
                disabled={!topUpAmount || parseInt(topUpAmount) < 10000 || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận nạp tiền</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  walletCard: {
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  walletBalanceEmpty: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  topUpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  defaultBadge: {
    backgroundColor: '#06D6A0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  methodNumber: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
    color: '#94a3b8',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#06D6A0',
  },
  expenseIcon: {
    backgroundColor: '#EF4444',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#94a3b8',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#06D6A0',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    paddingVertical: 16,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  amountPreview: {
    fontSize: 13,
    color: '#00BCD4',
    marginTop: 8,
    fontWeight: '500',
  },
  quickAmountSection: {
    marginBottom: 24,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountBtn: {
    width: '31%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  quickAmountTextActive: {
    color: '#00BCD4',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  methodOptionActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  methodOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  noteBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
