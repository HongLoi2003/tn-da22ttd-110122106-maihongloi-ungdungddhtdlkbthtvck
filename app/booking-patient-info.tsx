import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';

export default function BookingPatientInfoScreen() {
  const router = useRouter();
  const { userData } = useAuth();
  const params = useLocalSearchParams();
  
  // Get booking data from params
  const selectedSpecialty = params.specialty as string;
  const selectedDoctor = params.doctor as string;
  const selectedDoctorId = params.doctorId as string;
  const selectedDoctorImage = params.doctorImage as string;
  const selectedDate = params.date as string;
  const selectedTime = params.time as string;
  const selectedHospital = params.hospital as string;
  const selectedConsultationType = params.consultationType as string;
  const doctorFee = params.doctorFee as string;
  
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientNote, setPatientNote] = useState('');
  const [patientInsuranceCode, setPatientInsuranceCode] = useState('');

  // Load user data on mount
  useEffect(() => {
    if (userData) {
      setPatientName(userData.fullName || '');
      setPatientPhone(userData.phone || '');
      setPatientEmail(userData.email || '');
      setPatientAddress(userData.address || '');
    }
  }, [userData]);

  const handleContinue = () => {
    // Navigate to confirmation screen with all data
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
        patientName,
        patientPhone,
        patientEmail,
        patientAge,
        patientGender,
        patientAddress,
        patientNote,
        patientInsuranceCode,
      }
    });
  };

  const isFormValid = patientName.trim() && patientPhone.trim() && patientEmail.trim() && patientAge.trim() && patientGender.trim() && patientAddress.trim();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin bệnh nhân</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Patient Information Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Họ và tên</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="Lê Quốc Tuấn"
            value={patientName}
            onChangeText={setPatientName}
          />

          <Text style={styles.sectionTitle}>Số điện thoại</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="0355073362"
            value={patientPhone}
            onChangeText={setPatientPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.sectionTitle}>Email</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="maihongloi22@gmail.com"
            value={patientEmail}
            onChangeText={setPatientEmail}
            keyboardType="email-address"
          />

          <Text style={styles.sectionTitle}>Tuổi</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="28"
            value={patientAge}
            onChangeText={setPatientAge}
            keyboardType="number-pad"
            maxLength={3}
          />

          <Text style={styles.sectionTitle}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                patientGender === 'Nam' && styles.genderButtonActive
              ]}
              onPress={() => setPatientGender('Nam')}
            >
              <Ionicons 
                name="male" 
                size={20} 
                color={patientGender === 'Nam' ? '#00BCD4' : '#666'} 
              />
              <Text style={[
                styles.genderButtonText,
                patientGender === 'Nam' && styles.genderButtonTextActive
              ]}>
                Nam
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                patientGender === 'Nữ' && styles.genderButtonActive
              ]}
              onPress={() => setPatientGender('Nữ')}
            >
              <Ionicons 
                name="female" 
                size={20} 
                color={patientGender === 'Nữ' ? '#00BCD4' : '#666'} 
              />
              <Text style={[
                styles.genderButtonText,
                patientGender === 'Nữ' && styles.genderButtonTextActive
              ]}>
                Nữ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                patientGender === 'Khác' && styles.genderButtonActive
              ]}
              onPress={() => setPatientGender('Khác')}
            >
              <Ionicons 
                name="transgender" 
                size={20} 
                color={patientGender === 'Khác' ? '#00BCD4' : '#666'} 
              />
              <Text style={[
                styles.genderButtonText,
                patientGender === 'Khác' && styles.genderButtonTextActive
              ]}>
                Khác
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Nơi ở</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="Trà Vinh"
            value={patientAddress}
            onChangeText={setPatientAddress}
          />

          <Text style={styles.sectionTitle}>Mã số BHYT (không bắt buộc)</Text>
          <TextInput
            style={styles.infoInput}
            placeholder="VD: DN4012345678901"
            value={patientInsuranceCode}
            onChangeText={setPatientInsuranceCode}
            maxLength={15}
          />

          <Text style={styles.sectionTitle}>Ghi chú (không bắt buộc)</Text>
          <TextInput
            style={[styles.infoInput, styles.noteInput]}
            placeholder="Tôi thường có dấu hiệu vào buổi tối"
            value={patientNote}
            onChangeText={setPatientNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, !isFormValid && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!isFormValid}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

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
    marginBottom: 12,
    marginTop: 12,
  },
  infoInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noteInput: {
    height: 100,
    paddingTop: 14,
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
  continueButtonDisabled: {
    backgroundColor: '#ccc',
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
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  genderButtonActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderButtonTextActive: {
    color: '#00BCD4',
  },
});
