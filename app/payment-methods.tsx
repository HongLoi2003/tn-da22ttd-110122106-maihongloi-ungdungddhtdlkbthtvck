import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { deleteDocument, getDocumentsWithQuery, updateDocument } from './services/firebaseService';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const loadData = async () => {
    await Promise.all([loadPaymentMethods(), loadTransactions()]);
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
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <TouchableOpacity onPress={() => router.push('/add-payment-method')}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
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
            <View>
              <Text style={styles.walletLabel}>Số dư ví</Text>
              <Text style={styles.walletBalance}>500.000đ</Text>
            </View>
            <TouchableOpacity style={styles.topUpButton}>
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
});
