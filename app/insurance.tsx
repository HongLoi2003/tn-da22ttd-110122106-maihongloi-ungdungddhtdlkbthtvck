import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { getDocumentsWithQuery } from './services/firebaseService';

export default function InsuranceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [insuranceCards, setInsuranceCards] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadInsuranceData();
    }, [user])
  );

  const loadInsuranceData = async () => {
    try {
      setLoading(true);
      if (!user) {
        setInsuranceCards([]);
        setBenefits([]);
        setClaims([]);
        return;
      }
      
      const cards = await getDocumentsWithQuery('insurances', [
        where('userId', '==', user.uid)
      ]);
      setInsuranceCards(cards);

      // Load benefits from Firebase
      const benefitsData = await getDocumentsWithQuery('insurance-benefits', [
        where('userId', '==', user.uid)
      ]);
      setBenefits(benefitsData);

      // Load claims from Firebase
      const claimsData = await getDocumentsWithQuery('insurance-claims', [
        where('userId', '==', user.uid)
      ]);
      setClaims(claimsData);
    } catch (error) {
      console.error('Error loading insurance:', error);
      setInsuranceCards([]);
      setBenefits([]);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const insuranceCard = insuranceCards.length > 0 ? insuranceCards[0] : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảo hiểm y tế</Text>
        <TouchableOpacity onPress={() => router.push('/add-insurance')}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : insuranceCard ? (
          <>
            {/* Insurance Card */}
            <View style={styles.cardContainer}>
              <View style={styles.insuranceCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardProvider}>{insuranceCard.provider}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Đang hoạt động</Text>
                  </View>
                </View>
                <Text style={styles.cardNumber}>{insuranceCard.cardNumber}</Text>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardLabel}>Chủ thẻ</Text>
                    <Text style={styles.cardValue}>{insuranceCard.holder}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardLabel}>Hiệu lực đến</Text>
                    <Text style={styles.cardValue}>{insuranceCard.validUntil}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Chưa có thông tin bảo hiểm</Text>
            <Text style={styles.emptyText}>Thêm thông tin bảo hiểm y tế của bạn</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/add-insurance')}
            >
              <Text style={styles.addButtonText}>Thêm bảo hiểm</Text>
            </TouchableOpacity>
          </View>
        )}

        {insuranceCard && (
          <>
            {/* Benefits */}
            {benefits.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quyền lợi bảo hiểm</Text>
                <View style={styles.benefitsGrid}>
                  {benefits.map((benefit) => (
                    <View key={benefit.id} style={styles.benefitCard}>
                      <View style={styles.benefitIcon}>
                        <Ionicons name={benefit.icon as any} size={24} color="#00BCD4" />
                      </View>
                      <Text style={styles.benefitName}>{benefit.name}</Text>
                      <Text style={styles.benefitCoverage}>{benefit.coverage}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Claims History */}
            {claims.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Lịch sử yêu cầu bồi thường</Text>
                  <TouchableOpacity onPress={() => router.push('/all-claims')}>
                    <Text style={styles.seeAll}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>
                {claims.slice(0, 2).map((claim) => (
                  <View key={claim.id} style={styles.claimCard}>
                    <View style={styles.claimHeader}>
                      <View style={styles.claimInfo}>
                        <Text style={styles.claimDate}>{claim.date}</Text>
                        <Text style={styles.claimHospital}>{claim.hospital}</Text>
                      </View>
                      <View style={[
                        styles.claimStatusBadge,
                        claim.status === 'approved' ? styles.approvedBadge : styles.pendingBadge
                      ]}>
                        <Text style={styles.claimStatusText}>
                          {claim.status === 'approved' ? 'Đã duyệt' : 'Đang xử lý'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.claimAmounts}>
                      <View style={styles.amountItem}>
                        <Text style={styles.amountLabel}>Tổng chi phí</Text>
                        <Text style={styles.amountValue}>{claim.amount}</Text>
                      </View>
                      <View style={styles.amountItem}>
                        <Text style={styles.amountLabel}>Bảo hiểm chi trả</Text>
                        <Text style={styles.coverageValue}>{claim.coverage}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text-outline" size={24} color="#00BCD4" />
                <Text style={styles.actionText}>Yêu cầu bồi thường</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="information-circle-outline" size={24} color="#00BCD4" />
                <Text style={styles.actionText}>Hướng dẫn sử dụng</Text>
              </TouchableOpacity>
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
  cardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  insuranceCard: {
    backgroundColor: '#00BCD4',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardProvider: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  cardValue: {
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
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitName: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitCoverage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
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
    marginBottom: 12,
  },
  claimInfo: {
    flex: 1,
  },
  claimDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  claimHospital: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  claimStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  claimStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  claimAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  coverageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06D6A0',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
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
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
