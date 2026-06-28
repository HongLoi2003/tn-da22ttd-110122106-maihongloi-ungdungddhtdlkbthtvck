import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View , ActivityIndicator} from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function AllClaimsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, [user])
  );

  const loadClaims = async () => {
    try {
      setLoading(true);
      if (!user) {
        setClaims([]);
        return;
      }
      
      const data = await getDocumentsWithQuery('claims', [
        where('userId', '==', user.uid)
      ]);
      const sortedData = data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setClaims(sortedData);
    } catch (error) {
      console.error('Error loading claims:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Đang xử lý';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử bồi thường</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : claims.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có yêu cầu bồi thường</Text>
          </View>
        ) : (
          <>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tổng yêu cầu</Text>
            <Text style={styles.summaryValue}>{claims.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Đã duyệt</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              {claims.filter(c => c.status === 'approved').length}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Đang xử lý</Text>
            <Text style={[styles.summaryValue, { color: '#D97706' }]}>
              {claims.filter(c => c.status === 'pending').length}
            </Text>
          </View>
        </View>

        <View style={styles.claimsList}>
          {claims.map((claim) => {
            const statusColor = getStatusColor(claim.status);
            return (
              <View key={claim.id} style={styles.claimCard}>
                <View style={styles.claimHeader}>
                  <View style={styles.claimInfo}>
                    <Text style={styles.claimType}>{claim.type}</Text>
                    <Text style={styles.claimDate}>Ngày khám: {claim.date}</Text>
                    <Text style={styles.claimHospital}>{claim.hospital}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {getStatusText(claim.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.claimDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ngày yêu cầu:</Text>
                    <Text style={styles.detailValue}>{claim.claimDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tổng chi phí:</Text>
                    <Text style={styles.detailValue}>{claim.amount}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bảo hiểm chi trả:</Text>
                    <Text style={[styles.detailValue, { color: '#06D6A0', fontWeight: '700' }]}>
                      {claim.coverage}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push(`/claim-detail?id=${claim.id}`)}
                >
                  <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                  <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
                </TouchableOpacity>
              </View>
            );
          })}
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
  summary: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  claimsList: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  claimCard: {
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
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  claimInfo: {
    flex: 1,
  },
  claimType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  claimDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  claimHospital: {
    fontSize: 13,
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  claimDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
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
