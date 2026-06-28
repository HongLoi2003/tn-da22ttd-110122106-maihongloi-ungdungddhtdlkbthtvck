import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const doctorImages = {
  'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
  'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
  'lehoangnam.png': { uri: 'https://images.pexels.com/photos/14438788/pexels-photo-14438788.jpeg' },
  'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
  'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
  'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
  'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
  'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
  'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
  'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
  'phamthuha.png': { uri: 'https://images.pexels.com/photos/15962796/pexels-photo-15962796.jpeg' },
  'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
  'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
  'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
  'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
  'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
};

export default function BookingPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const selectedSpecialty = params.specialty as string;
  const selectedDoctor = params.doctor as string;
  const selectedDoctorId = params.doctorId as string;
  const selectedDoctorImage = params.doctorImage as string;
  const selectedDate = params.date as string;
  const selectedTime = params.time as string;
  const selectedHospital = params.hospital as string;
  const selectedConsultationType = params.consultationType as string;
  const doctorFee = params.doctorFee as string;
  const patientName = params.patientName as string;
  const patientPhone = params.patientPhone as string;
  const patientEmail = params.patientEmail as string;
  const patientAge = params.patientAge as string;
  const patientGender = params.patientGender as string;
  const patientAddress = params.patientAddress as string;
  const patientInsuranceCode = params.patientInsuranceCode as string;
  const patientNote = params.patientNote as string;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  const handleContinue = () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Chưa chọn phương thức thanh toán', 'Vui lòng chọn một phương thức thanh toán');
      return;
    }

    console.log('💳 [PAYMENT] Selected payment method:', selectedPaymentMethod);
    
    // Navigate to confirmation page
    router.push({
      pathname: '/booking-confirmation',
      params: {
        specialty: selectedSpecialty,
        doctor: selectedDoctor,
        doctorId: selectedDoctorId,
        doctorImage: selectedDoctorImage,
        date: selectedDate,
        time: selectedTime,
        hospital: selectedHospital,
        consultationType: selectedConsultationType,
        doctorFee: doctorFee,
        patientName: patientName,
        patientPhone: patientPhone,
        patientEmail: patientEmail,
        patientAge: patientAge,
        patientGender: patientGender,
        patientAddress: patientAddress,
        patientInsuranceCode: patientInsuranceCode,
        patientNote: patientNote,
        paymentMethod: selectedPaymentMethod,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Doctor Info Summary */}
        <View style={styles.section}>
          <View style={styles.doctorCard}>
            <Image
              source={doctorImages[selectedDoctorImage as keyof typeof doctorImages]}
              style={styles.doctorAvatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{selectedDoctor}</Text>
              <Text style={styles.doctorSpecialty}>{selectedSpecialty}</Text>
              <Text style={styles.doctorDateTime}>{selectedDate} - {selectedTime}</Text>
            </View>
          </View>
        </View>

        {/* Fee Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng chi phí</Text>
          <View style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Phí khám bệnh</Text>
              <Text style={styles.feeValue}>{parseInt(doctorFee || '0').toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeTotalLabel}>Tổng cộng</Text>
              <Text style={styles.feeTotalValue}>{parseInt(doctorFee || '0').toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
          
          <View style={styles.paymentMethodGrid}>
            {/* Row 1 */}
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'cash' && styles.paymentMethodCardActive
              ]}
              onPress={() => setSelectedPaymentMethod('cash')}
            >
              <View style={styles.paymentMethodIcon}>
                <Ionicons 
                  name="cash-outline" 
                  size={32} 
                  color={selectedPaymentMethod === 'cash' ? '#00BCD4' : '#666'} 
                />
              </View>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'cash' && styles.paymentMethodTitleActive
              ]}>
                Tiền mặt
              </Text>
              <Text style={styles.paymentMethodDesc}>Thanh toán tại bệnh viện</Text>
              {selectedPaymentMethod === 'cash' && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'momo' && styles.paymentMethodCardActive
              ]}
              onPress={() => setSelectedPaymentMethod('momo')}
            >
              <View style={styles.paymentMethodIcon}>
                <Ionicons 
                  name="wallet-outline" 
                  size={32} 
                  color={selectedPaymentMethod === 'momo' ? '#00BCD4' : '#666'} 
                />
              </View>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'momo' && styles.paymentMethodTitleActive
              ]}>
                Ví MoMo
              </Text>
              <Text style={styles.paymentMethodDesc}>Thanh toán qua ví điện tử</Text>
              {selectedPaymentMethod === 'momo' && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Row 2 */}
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'banking' && styles.paymentMethodCardActive
              ]}
              onPress={() => setSelectedPaymentMethod('banking')}
            >
              <View style={styles.paymentMethodIcon}>
                <Ionicons 
                  name="card-outline" 
                  size={32} 
                  color={selectedPaymentMethod === 'banking' ? '#00BCD4' : '#666'} 
                />
              </View>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'banking' && styles.paymentMethodTitleActive
              ]}>
                Chuyển khoản
              </Text>
              <Text style={styles.paymentMethodDesc}>Chuyển khoản ngân hàng</Text>
              {selectedPaymentMethod === 'banking' && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === 'card' && styles.paymentMethodCardActive
              ]}
              onPress={() => setSelectedPaymentMethod('card')}
            >
              <View style={styles.paymentMethodIcon}>
                <Ionicons 
                  name="card" 
                  size={32} 
                  color={selectedPaymentMethod === 'card' ? '#00BCD4' : '#666'} 
                />
              </View>
              <Text style={[
                styles.paymentMethodTitle,
                selectedPaymentMethod === 'card' && styles.paymentMethodTitleActive
              ]}>
                Thẻ tín dụng
              </Text>
              <Text style={styles.paymentMethodDesc}>Visa, Mastercard, JCB</Text>
              {selectedPaymentMethod === 'card' && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Note */}
        <View style={styles.section}>
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Ionicons name="information-circle" size={20} color="#FF9800" />
              <Text style={styles.noteTitle}>Lưu ý thanh toán</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Thanh toán tiền mặt: Vui lòng thanh toán tại quầy thu ngân trước khi khám</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Thanh toán online: Hoàn tiền trong 24h nếu bác sĩ hủy lịch</Text>
            </View>
            <View style={styles.noteItem}>
              <Text style={styles.noteBullet}>•</Text>
              <Text style={styles.noteText}>Bảo hiểm y tế: Xuất trình thẻ BHYT để được hỗ trợ chi phí</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          style={[styles.continueButton, styles.backButton]} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#00BCD4" />
          <Text style={[styles.continueButtonText, styles.backButtonText]}>Quay lại</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  doctorDateTime: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
  feeCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  feeLabel: {
    fontSize: 15,
    color: '#666',
  },
  feeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  feeTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  feeTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00BCD4',
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  paymentMethodCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 140,
  },
  paymentMethodCardActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  paymentMethodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  paymentMethodTitleActive: {
    color: '#00BCD4',
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F57F17',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteBullet: {
    fontSize: 14,
    color: '#F57F17',
    marginRight: 8,
    fontWeight: '700',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#F57F17',
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  backButtonText: {
    color: '#00BCD4',
  },
});
