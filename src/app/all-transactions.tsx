import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View , ActivityIndicator} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function AllTransactionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [user])
  );

  const loadTransactions = async () => {
    try {
      setLoading(true);
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
      setTransactions(sortedTxns);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        ) : (
          <>
        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
              <View style={[
                styles.transactionIcon,
                transaction.type === 'income' ? styles.incomeIcon : styles.expenseIcon
              ]}>
                <Ionicons 
                  name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                  size={20} 
                  color="#fff" 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionDate}>{transaction.date} • {transaction.time}</Text>
                </View>
                <View style={styles.transactionDetails}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{transaction.category}</Text>
                  </View>
                  <Text style={styles.transactionMethod}>{transaction.method}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {transaction.amount}
                </Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Hoàn thành</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  transactionsList: {
    paddingHorizontal: 16,
    marginTop: 16,
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
  transactionMeta: {
    marginBottom: 6,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00BCD4',
  },
  transactionMethod: {
    fontSize: 11,
    color: '#94a3b8',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  incomeAmount: {
    color: '#06D6A0',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06D6A0',
  },
  statusText: {
    fontSize: 11,
    color: '#64748b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
  },
});
