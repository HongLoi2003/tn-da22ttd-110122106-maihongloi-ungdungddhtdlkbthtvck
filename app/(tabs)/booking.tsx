import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import doctorService, { Doctor } from '../services/doctorService';
import { createDocument, getDocumentsWithQuery } from '../services/firebaseService';
import { scheduleAppointmentReminder } from '../services/notificationService';
import symptomAnalysisService, { SpecialtyRecommendation, SymptomItem } from '../services/symptomAnalysisService';

const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'tranthimai.png': require('@/assets/images/tranthimai.png'),
  'lehoangnam.png': require('@/assets/images/lehoangnam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
  'dominhtuan.png': require('@/assets/images/dominhtuan.png'),
  'vuthilan.png': require('@/assets/images/vuthilan.png'),
  'hoangvanduc.png': require('@/assets/images/hoangvanduc.png'),
  'ngothihuong.png': require('@/assets/images/ngothihuong.png'),
  'nguyenthihoa.png': require('@/assets/images/nguyenthihoa.png'),
  'tranvankhoa.png': require('@/assets/images/tranvankhoa.png'),
  'phamminhquan.png': require('@/assets/images/phamminhquan.png'),
  'lethihang.png': require('@/assets/images/lethihang.png'),
  'nguyenvanhai.png': require('@/assets/images/nguyenvanhai.png'),
  'dangthithao.jpg': require('@/assets/images/dangthithao.jpg'),
};

export default function BookingScreen() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string || '/(tabs)/appointments';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctorImage, setSelectedDoctorImage] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [appointmentId, setAppointmentId] = useState('');

  // Symptom analysis states
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomItem[]>([]);
  const [recommendations, setRecommendations] = useState<SpecialtyRecommendation[]>([]);
  const [showSymptomSuggestions, setShowSymptomSuggestions] = useState(false);
  const [symptomSuggestions, setSymptomSuggestions] = useState<SymptomItem[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);

  // Load user data on mount
  useEffect(() => {
    if (userData) {
      setPatientName(userData.fullName || '');
      setPatientPhone(userData.phone || '');
      setPatientEmail(userData.email || '');
      setPatientAddress(userData.address || '');
      console.log('✅ [BOOKING] Loaded user data:', userData);
    }
  }, [userData]);

  // Load available dates and times from Firebase
  useEffect(() => {
    loadAvailableDatesAndTimes();
    loadHospitals();
  }, [selectedDoctorId]);

  const loadAvailableDatesAndTimes = async () => {
    try {
      if (!selectedDoctorId) return;
      
      console.log('🔍 [BOOKING] Loading available dates and times for doctor:', selectedDoctorId);
      
      // Lấy danh sách ngày khám từ Firebase
      const datesSnapshot = await getDocumentsWithQuery('availableDates', [
        where('doctorId', '==', selectedDoctorId)
      ]);
      
      if (datesSnapshot.length > 0) {
        setAvailableDates(datesSnapshot);
        console.log('✅ [BOOKING] Loaded dates:', datesSnapshot);
      } else {
        // Nếu không có dữ liệu, dùng dữ liệu mặc định
        setAvailableDates([
          { day: 'T2', date: '20/05', fullDate: '20/05/2025' },
          { day: 'T3', date: '21/05', fullDate: '21/05/2025' },
          { day: 'T4', date: '22/05', fullDate: '22/05/2025' },
          { day: 'T5', date: '23/05', fullDate: '23/05/2025' },
          { day: 'T6', date: '24/05', fullDate: '24/05/2025' },
          { day: 'T7', date: '25/05', fullDate: '25/05/2025' },
        ]);
      }
    } catch (error) {
      console.error('❌ [BOOKING] Error loading dates:', error);
      // Dùng dữ liệu mặc định nếu có lỗi
      setAvailableDates([
        { day: 'T2', date: '20/05', fullDate: '20/05/2025' },
        { day: 'T3', date: '21/05', fullDate: '21/05/2025' },
        { day: 'T4', date: '22/05', fullDate: '22/05/2025' },
        { day: 'T5', date: '23/05', fullDate: '23/05/2025' },
        { day: 'T6', date: '24/05', fullDate: '24/05/2025' },
        { day: 'T7', date: '25/05', fullDate: '25/05/2025' },
      ]);
    }
  };

  const loadHospitals = async () => {
    try {
      console.log('🔍 [BOOKING] Loading hospitals...');
      const hospitalsSnapshot = await getDocumentsWithQuery('hospitals', []);
      
      if (hospitalsSnapshot.length > 0) {
        setHospitals(hospitalsSnapshot);
        console.log('✅ [BOOKING] Loaded hospitals:', hospitalsSnapshot);
      }
    } catch (error) {
      console.error('❌ [BOOKING] Error loading hospitals:', error);
    }
  };

  const handleSymptomInputChange = (text: string) => {
    setSymptomInput(text);
    if (text.trim()) {
      const suggestions = symptomAnalysisService.searchSymptoms(text);
      setSymptomSuggestions(suggestions);
      setShowSymptomSuggestions(true);
    } else {
      setShowSymptomSuggestions(false);
    }
  };

  const addSymptom = (symptom: SymptomItem) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
    setSymptomInput('');
    setShowSymptomSuggestions(false);
  };

  const removeSymptom = (symptomId: number) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một triệu chứng');
      return;
    }

    const symptomNames = selectedSymptoms.map(s => s.name);
    const result = symptomAnalysisService.analyzeSymptoms(symptomNames);
    setRecommendations(result);
  };

  const selectSpecialtyFromRecommendation = (specialty: SpecialtyRecommendation) => {
    handleSpecialtyChange(specialty);
  };

  const handleContinue = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      // Lưu lịch khám vào Firebase
      await saveAppointmentToFirebase();
    }
  };

  const handleConfirmBooking = async () => {
    // This is called from Step 3 confirmation button
    console.log('💾 [BOOKING] handleConfirmBooking called');
    // Move to Step 4 (success screen) first
    setCurrentStep(4);
    // Then save appointment to Firebase
    await saveAppointmentToFirebase();
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      // Cho phép quay lại các bước trước
      setCurrentStep(step);
    }
  };

  // Smart reset logic khi thay đổi dữ liệu
  const handleSpecialtyChange = (specialty: SpecialtyRecommendation) => {
    setSelectedSpecialty(specialty.specialtyName);
    const doctors = doctorService.getDoctorsBySpecialty(specialty.specialtyName);
    setRecommendedDoctors(doctors);
    // Reset bác sĩ và giờ khi đổi chuyên khoa
    setSelectedDoctor('');
    setSelectedDoctorId('');
    setSelectedDoctorImage('');
    setSelectedDate('');
    setSelectedTime('');
    console.log('🔄 [BOOKING] Specialty changed, reset doctor and time');
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor.ten);
    setSelectedDoctorId(doctor.id);
    setSelectedDoctorImage(doctor.image);
    // Set default hospital
    setSelectedHospital('Bệnh viện Đa khoa Tâm Anh');
    // Reset giờ khi đổi bác sĩ
    setSelectedTime('');
    console.log('🔄 [BOOKING] Doctor changed, reset time');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Reset giờ khi đổi ngày
    setSelectedTime('');
    console.log('🔄 [BOOKING] Date changed, reset time');
  };

  const saveAppointmentToFirebase = async () => {
    try {
      if (!user) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt lịch');
        return;
      }

      setSubmitting(true);
      console.log('💾 [BOOKING] Saving appointment to Firebase...');
      console.log('📅 [BOOKING] Selected date:', selectedDate);
      console.log('⏰ [BOOKING] Selected time:', selectedTime);

      // Validate required fields
      if (!selectedDate || !selectedTime || !selectedDoctor || !selectedDoctorId) {
        throw new Error('Thiếu thông tin bắt buộc');
      }

      // Parse date from format "DD/MM/YYYY" to create proper Date object
      const dateParts = selectedDate.split('/');
      if (dateParts.length !== 3) {
        throw new Error(`Invalid date format: ${selectedDate}`);
      }

      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]);
      const year = parseInt(dateParts[2]);

      // Validate date values
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error(`Invalid date values: day=${day}, month=${month}, year=${year}`);
      }

      const appointmentDateObj = new Date(year, month - 1, day);
      const appointmentDateISO = appointmentDateObj.toISOString();

      console.log('📅 [BOOKING] Parsed appointment date:', appointmentDateObj);
      console.log('📅 [BOOKING] ISO format:', appointmentDateISO);
      console.log('📅 [BOOKING] Date parts: day=' + day + ', month=' + month + ', year=' + year);
      console.log('📅 [BOOKING] Date is valid:', !isNaN(appointmentDateObj.getTime()));
      console.log('📅 [BOOKING] Date is in future:', appointmentDateObj > new Date());

      // Validate time format (HH:MM)
      if (!/^\d{2}:\d{2}$/.test(selectedTime)) {
        throw new Error(`Invalid time format: ${selectedTime}`);
      }

      // Tạo appointment document với format đúng
      const appointmentData = {
        userId: user.uid,
        doctorId: selectedDoctorId,
        doctor: selectedDoctor,
        specialty: selectedSpecialty,
        hospital: selectedHospital,
        date: 'T4', // Ngày trong tuần
        fullDate: selectedDate, // DD/MM/YYYY format
        time: selectedTime, // HH:MM format
        duration: '30 phút',
        room: 'Phòng 204',
        floor: 'Tầng 2',
        image: selectedDoctorImage,
        patientName: patientName,
        patientPhone: patientPhone,
        patientEmail: patientEmail,
        patientAddress: patientAddress,
        status: 'confirmed',
        appointmentDate: appointmentDateISO, // ISO 8601 for comparison
        createdAt: new Date().toISOString(), // Add createdAt for sorting
      };

      console.log('💾 [BOOKING] Appointment data to save:', appointmentData);

      // Validate all required fields exist
      const requiredFields = [
        'userId',
        'doctorId',
        'doctor',
        'specialty',
        'hospital',
        'date',
        'fullDate',
        'time',
        'status',
        'appointmentDate',
        'createdAt',
      ];

      for (const field of requiredFields) {
        if (!appointmentData[field as keyof typeof appointmentData]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      console.log('💾 [BOOKING] About to save appointment...');
      console.log('💾 [BOOKING] User UID:', user.uid);
      console.log('💾 [BOOKING] Appointment data userId:', appointmentData.userId);
      
      const appointmentRef = await createDocument('appointments', appointmentData);
      
      console.log('✅ [BOOKING] Appointment saved with ID:', appointmentRef?.id);
      console.log('✅ [BOOKING] Full appointment data:', appointmentRef);
      console.log('✅ [BOOKING] Saved to Firebase - verify in console above');
      
      // Generate appointment code: DL + DDMMYYHHMM + random 4 digits
      // Example: DL24052210000 (DL + 24/05/22 + 10:00 + 0000)
      const now = new Date();
      const codeDay = String(now.getDate()).padStart(2, '0');
      const codeMonth = String(now.getMonth() + 1).padStart(2, '0');
      const codeYear = String(now.getFullYear()).slice(-2);
      const codeHours = String(now.getHours()).padStart(2, '0');
      const codeMinutes = String(now.getMinutes()).padStart(2, '0');
      const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const appointmentCode = `DL${codeDay}${codeMonth}${codeYear}${codeHours}${codeMinutes}${randomNum}`;
      
      // Save appointment code to state for display in Step 4
      setAppointmentId(appointmentCode);
      console.log('💾 [BOOKING] Appointment code generated:', appointmentCode);
      
      // Verify the save by querying immediately
      console.log('🔍 [BOOKING] Verifying appointment was saved...');
      const verifyData = await getDocumentsWithQuery('appointments', [
        where('userId', '==', user.uid)
      ]);
      console.log('✅ [BOOKING] Verification query returned:', verifyData.length, 'appointments');
      if (verifyData.length > 0) {
        console.log('✅ [BOOKING] Latest appointment:', verifyData[0]);
      }

      // Tạo thông báo
      const notificationData = {
        userId: user.uid,
        title: '✅ Đặt lịch thành công',
        body: `Lịch khám với ${selectedDoctor} vào ${selectedDate} lúc ${selectedTime} đã được xác nhận.`,
        type: 'appointment',
        read: false,
        data: {
          appointmentId: appointmentRef?.id,
          doctorName: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
        },
      };

      await createDocument('notifications', notificationData);
      console.log('✅ [BOOKING] Notification created');

      // Lên lịch nhắc nhở
      await scheduleAppointmentReminder({
        doctorName: selectedDoctor,
        appointmentDate: appointmentDateObj,
        hospital: selectedHospital,
      });

      console.log('✅ [BOOKING] Appointment reminder scheduled');

      // Auto-navigate to appointments page after 2 seconds
      console.log('✅ [BOOKING] Auto-navigating to appointments page...');
      setTimeout(() => {
        console.log('✅ [BOOKING] Navigating to:', returnTo);
        router.push(returnTo as any);
      }, 2000);

      setSubmitting(false);
    } catch (error) {
      console.error('❌ [BOOKING] Error saving appointment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu lịch khám';
      Alert.alert('Lỗi', errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt lịch khám</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.stepsRow}>
            {/* Background lines */}
            <View style={styles.linesContainer}>
              {[0, 1, 2].map((index) => (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.stepLineBackground,
                    currentStep > index + 1 && styles.stepLineBackgroundActive
                  ]}
                />
              ))}
            </View>

            {/* Steps */}
            {[1, 2, 3, 4].map((step, index) => (
              <TouchableOpacity 
                key={step} 
                style={styles.stepWrapper}
                onPress={() => handleStepClick(step)}
                disabled={step >= currentStep}
              >
                <View style={[
                  styles.stepCircle,
                  currentStep >= step && styles.stepCircleActive
                ]}>
                  <Text style={[
                    styles.stepNumber,
                    currentStep >= step && styles.stepNumberActive
                  ]}>
                    {step}
                  </Text>
                </View>
                <Text style={[
                  styles.stepLabelText,
                  currentStep >= step && styles.stepLabelActive
                ]}>
                  {['Thông tin', 'Thời gian', 'Xác nhận', 'Hoàn thành'][index]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 1: Symptom Input */}
        {currentStep === 1 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nhập triệu chứng của bạn</Text>
              
              {/* Symptom Input */}
              <View style={styles.symptomInputContainer}>
                <TextInput
                  style={styles.symptomInput}
                  placeholder="Tôi bị đau đầu, chóng mặt và mất ngủ"
                  placeholderTextColor="#999"
                  value={symptomInput}
                  onChangeText={handleSymptomInputChange}
                />
                {symptomInput.length > 0 && (
                  <TouchableOpacity onPress={() => {
                    setSymptomInput('');
                    setShowSymptomSuggestions(false);
                  }}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.helperText}>Vd dụ: đau đầu, ho, sốt, đau bụng...</Text>

              {/* Symptom Suggestions */}
              {showSymptomSuggestions && symptomSuggestions.length > 0 && (
                <View style={styles.suggestionsList}>
                  {symptomSuggestions.map((symptom) => (
                    <TouchableOpacity
                      key={symptom.id}
                      style={styles.suggestionItem}
                      onPress={() => addSymptom(symptom)}
                    >
                      <Text style={styles.suggestionIcon}>{symptom.icon}</Text>
                      <Text style={styles.suggestionText}>{symptom.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Common Symptoms */}
              <Text style={styles.commonSymptomsLabel}>Triệu chứng phổ biến</Text>
              <View style={styles.commonSymptomsGrid}>
                {symptomAnalysisService.getCommonSymptoms().slice(0, 8).map((symptom) => (
                  <TouchableOpacity
                    key={symptom.id}
                    style={styles.commonSymptomButton}
                    onPress={() => addSymptom(symptom)}
                  >
                    <Text style={styles.commonSymptomText}>{symptom.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selected Symptoms */}
              {selectedSymptoms.length > 0 && (
                <View style={styles.selectedSymptomsContainer}>
                  <View style={styles.symptomTagsContainer}>
                    {selectedSymptoms.map((symptom) => (
                      <View key={symptom.id} style={styles.symptomTag}>
                        <Text style={styles.symptomTagText}>{symptom.name}</Text>
                        <TouchableOpacity onPress={() => removeSymptom(symptom.id)}>
                          <Ionicons name="close" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Analyze Button */}
              {selectedSymptoms.length > 0 && (
                <TouchableOpacity style={styles.analyzeButton} onPress={analyzeSymptoms}>
                  <Ionicons name="search" size={18} color="#fff" />
                  <Text style={styles.analyzeButtonText}>Phân tích triệu chứng</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Analysis Results */}
            {recommendations.length > 0 && (
              <View style={styles.section}>
                <View style={styles.resultHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                  <Text style={styles.resultTitle}>Kết quả phân tích</Text>
                </View>

                <Text style={styles.resultNote}>
                  Dựa trên triệu chứng của bạn, chúng tôi gợi ý các chuyên khoa phù hợp
                </Text>

                {recommendations.map((rec, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recommendationCard}
                    onPress={() => selectSpecialtyFromRecommendation(rec)}
                  >
                    <View style={styles.recLeft}>
                      <View style={[styles.recIcon, { backgroundColor: getSpecialtyColor(rec.specialtyName) }]}>
                        <Text style={styles.recIconText}>{getSpecialtyIcon(rec.specialtyName)}</Text>
                      </View>
                      <View style={styles.recContent}>
                        <Text style={styles.recTitle}>{rec.specialtyName}</Text>
                        <Text style={styles.recSubtitle}>Phù hợp: {rec.confidence}%</Text>
                        <Text style={styles.recSymptoms}>{rec.matchedSymptoms.join(', ')}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#00BCD4" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recommended Doctors */}
            {recommendedDoctors.length > 0 && (
              <View style={styles.section}>
                <View style={styles.doctorsHeader}>
                  <Text style={styles.doctorsTitle}>Bác sĩ gợi ý</Text>
                  <TouchableOpacity>
                    <Text style={styles.seeAll}>Xem tất cả</Text>
                  </TouchableOpacity>
                </View>

                {recommendedDoctors.slice(0, 3).map((doctor) => (
                  <TouchableOpacity
                    key={doctor.id}
                    style={styles.doctorCard}
                    onPress={async () => {
                      handleDoctorSelect(doctor);
                      await handleContinue();
                    }}
                  >
                    <Image
                      source={doctorImages[doctor.image as keyof typeof doctorImages]}
                      style={styles.doctorAvatar}
                    />
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.ten}</Text>
                      <Text style={styles.doctorSpecialty}>{doctor.chuyen_khoa}</Text>
                      <View style={styles.doctorMeta}>
                        <Ionicons name="star" size={14} color="#FFB800" />
                        <Text style={styles.doctorRating}>{doctor.rating} ({doctor.kinh_nghiem} năm kinh nghiệm)</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.bookButton}>
                      <Text style={styles.bookButtonText}>Chọn đặt lịch</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity 
              style={[styles.continueButton, !selectedDoctor && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!selectedDoctor}
            >
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chọn thời gian khám</Text>
              
              {/* Doctor Info */}
              <View style={styles.doctorInfoCard}>
                <Image
                  source={doctorImages[selectedDoctorImage as keyof typeof doctorImages]}
                  style={styles.doctorInfoAvatar}
                />
                <View style={styles.doctorInfoContent}>
                  <Text style={styles.doctorInfoName}>{selectedDoctor}</Text>
                  <Text style={styles.doctorInfoSpecialty}>{selectedSpecialty}</Text>
                  <View style={styles.doctorInfoMeta}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.doctorInfoRating}>4.9 (128 đánh giá)</Text>
                  </View>
                  <Text style={styles.doctorInfoExp}>15 năm kinh nghiệm</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chọn ngày khám</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.dateScrollView}
              >
                {availableDates.length > 0 ? (
                  availableDates.map((date, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateCard,
                        selectedDate === date.fullDate && styles.dateCardActive
                      ]}
                      onPress={() => handleDateSelect(date.fullDate)}
                    >
                      <Text style={[
                        styles.dateDay,
                        selectedDate === date.fullDate && styles.dateDayActive
                      ]}>
                        {date.day}
                      </Text>
                      <Text style={[
                        styles.dateNumber,
                        selectedDate === date.fullDate && styles.dateNumberActive
                      ]}>
                        {date.date}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noDataText}>Đang tải dữ liệu...</Text>
                )}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chọn khung giờ</Text>
              <View style={styles.timeGrid}>
                {[
                  '07:30', '08:00', '08:30', '09:00',
                  '09:30', '10:00', '10:30', '11:00',
                  '13:30', '14:00', '14:30', '15:00',
                  '15:30', '16:00', '16:30', '17:00',
                ].map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.timeSlotActive
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[
                      styles.timeText,
                      selectedTime === time && styles.timeTextActive
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.timeNote}>
                <Ionicons name="information-circle" size={14} color="#00BCD4" />
                {' '}Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.
              </Text>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.continueButton, styles.backButton]} 
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={20} color="#00BCD4" />
              <Text style={[styles.continueButtonText, styles.backButtonText]}>Quay lại</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Xác nhận thông tin đặt lịch</Text>
              
              {/* Patient Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <Ionicons name="person" size={20} color="#00BCD4" />
                  <Text style={styles.infoTitle}>Thông tin bệnh nhân</Text>
                  <TouchableOpacity>
                    <Text style={styles.editLink}>Sửa</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tên bệnh nhân</Text>
                  <TextInput
                    style={styles.infoInput}
                    placeholder="Nguyễn Văn A"
                    value={patientName}
                    onChangeText={setPatientName}
                  />
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Tuổi</Text>
                  <TextInput
                    style={styles.infoInput}
                    placeholder="28 tuổi"
                  />
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.infoInput}
                    placeholder="0123 456 789"
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                  />
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <TextInput
                    style={styles.infoInput}
                    placeholder="nguyenvanA@gmail.com"
                    value={patientEmail}
                    onChangeText={setPatientEmail}
                  />
                </View>
              </View>

              {/* Appointment Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <Ionicons name="medical" size={20} color="#00BCD4" />
                  <Text style={styles.infoTitle}>Thông tin khám</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="medical-outline" size={18} color="#00BCD4" />
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoRowLabel}>Chuyên khoa</Text>
                    <Text style={styles.infoRowValue}>{selectedSpecialty}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={18} color="#00BCD4" />
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoRowLabel}>Bác sĩ</Text>
                    <Text style={styles.infoRowValue}>{selectedDoctor}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={18} color="#00BCD4" />
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoRowLabel}>Ngày khám</Text>
                    <Text style={styles.infoRowValue}>Thứ 4, 22/05/2024</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={18} color="#00BCD4" />
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoRowLabel}>Giờ khám</Text>
                    <Text style={styles.infoRowValue}>{selectedTime}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#00BCD4" />
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoRowLabel}>Địa điểm</Text>
                    <Text style={styles.infoRowValue}>Bệnh viện Đa khoa Tâm Anh</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="document-outline" size={18} color="#00BCD4" />
                  <View style={styles.infoRowContent}>
                    <Text style={styles.infoRowLabel}>Lý do khám</Text>
                    <Text style={styles.infoRowValue}>Đau đầu, chóng mặt và mất ngủ</Text>
                  </View>
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <Ionicons name="card-outline" size={20} color="#00BCD4" />
                  <Text style={styles.infoTitle}>Phương thức thanh toán</Text>
                  <TouchableOpacity>
                    <Text style={styles.editLink}>Sửa</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.paymentItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#00BCD4" />
                  <Text style={styles.paymentText}>Thanh toán tại bệnh viện</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleConfirmBooking}>
              <Text style={styles.continueButtonText}>Xác nhận đặt lịch</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.continueButton, styles.backButton]} 
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={20} color="#00BCD4" />
              <Text style={[styles.continueButtonText, styles.backButtonText]}>Quay lại</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 4: Success */}
        {currentStep === 4 && (
          <View style={styles.section}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={60} color="#fff" />
              </View>
              
              <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
              <Text style={styles.successSubtitle}>
                Thông tin đặt lịch đã được gửi đến email và số điện thoại của bạn
              </Text>

              <View style={styles.successInfoCard}>
                <Text style={styles.successInfoLabel}>Mã đặt lịch</Text>
                <View style={styles.successInfoValue}>
                  <Text style={styles.successInfoCode}>{appointmentId || 'DL...'}</Text>
                  <TouchableOpacity>
                    <Ionicons name="copy" size={20} color="#00BCD4" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.successDetails}>
                <View style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Bác sĩ</Text>
                  <Text style={styles.successDetailValue}>{selectedDoctor}</Text>
                </View>

                <View style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Chuyên khoa</Text>
                  <Text style={styles.successDetailValue}>{selectedSpecialty}</Text>
                </View>

                <View style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Thời gian</Text>
                  <Text style={styles.successDetailValue}>{selectedTime} - Thứ 4, 22/05/2024</Text>
                </View>

                <View style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Địa điểm</Text>
                  <Text style={styles.successDetailValue}>Bệnh viện Đa khoa Tâm Anh</Text>
                </View>
              </View>

              <View style={styles.successNote}>
                <Text style={styles.successNoteTitle}>Lưu ý</Text>
                <Text style={styles.successNoteText}>
                  • Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.
                </Text>
                <Text style={styles.successNoteText}>
                  • Mang theo CMND/CCCD và thẻ bảo hiểm y tế (nếu có).
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.successButtonSecondary}
                onPress={() => {
                  // Reset form to Step 1
                  setCurrentStep(1);
                  setSelectedSpecialty('');
                  setSelectedDoctor('');
                  setSelectedDoctorId('');
                  setSelectedDoctorImage('');
                  setSelectedHospital('');
                  setSelectedDate('');
                  setSelectedTime('');
                  setSelectedSymptoms([]);
                  setRecommendations([]);
                  setRecommendedDoctors([]);
                  setAppointmentId('');
                  console.log('🔄 [BOOKING] Form reset for new booking');
                }}
              >
                <Text style={styles.successButtonSecondaryText}>Đặt lịch mới</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getSpecialtyColor = (specialty: string): string => {
  const colors: { [key: string]: string } = {
    'Tim mạch': '#FF6B9D',
    'Thần kinh': '#4ECDC4',
    'Hô hấp': '#45B7D1',
    'Tiêu hóa': '#96CEB4',
    'Da liễu': '#FFEAA7',
    'Cơ xương khớp': '#DDA15E',
    'Tai mũi họng': '#BC6C25',
    'Mắt': '#8E44AD',
    'Răng hàm mặt': '#E74C3C',
    'Nội tiết': '#F39C12',
    'Nhi khoa': '#3498DB',
    'Sản phụ khoa': '#E91E63',
  };
  return colors[specialty] || '#00BCD4';
};

const getSpecialtyIcon = (specialty: string): string => {
  const icons: { [key: string]: string } = {
    'Tim mạch': '❤️',
    'Thần kinh': '🧠',
    'Hô hấp': '🫁',
    'Tiêu hóa': '🫁',
    'Da liễu': '🧴',
    'Cơ xương khớp': '🦴',
    'Tai mũi họng': '👂',
    'Mắt': '👁️',
    'Răng hàm mặt': '🦷',
    'Nội tiết': '⚕️',
    'Nhi khoa': '👶',
    'Sản phụ khoa': '🤰',
  };
  return icons[specialty] || '🏥';
};

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
  progressContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
  },
  linesContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 0,
  },
  stepLineBackground: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  stepLineBackgroundActive: {
    backgroundColor: '#00BCD4',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: '#00BCD4',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#e0e0e0',
    top: 20,
    left: '50%',
    right: '-50%',
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: '#00BCD4',
  },
  stepLabelText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#00BCD4',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  symptomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  symptomInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#000',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  suggestionsList: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
    maxHeight: 150,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  suggestionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  commonSymptomsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commonSymptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  commonSymptomButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E0F7FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  commonSymptomText: {
    fontSize: 12,
    color: '#00838F',
    fontWeight: '500',
  },
  selectedSymptomsContainer: {
    marginBottom: 12,
  },
  symptomTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BCD4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  symptomTagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  resultNote: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  recLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recIconText: {
    fontSize: 24,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  recSubtitle: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
    marginBottom: 2,
  },
  recSymptoms: {
    fontSize: 11,
    color: '#666',
  },
  doctorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  seeAll: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorRating: {
    fontSize: 11,
    color: '#666',
  },
  bookButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#00BCD4',
    borderRadius: 6,
  },
  bookButtonText: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
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
  stepPlaceholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 32,
  },
  doctorInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  doctorInfoAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  doctorInfoContent: {
    flex: 1,
  },
  doctorInfoName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  doctorInfoSpecialty: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  doctorInfoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  doctorInfoRating: {
    fontSize: 11,
    color: '#666',
  },
  doctorInfoExp: {
    fontSize: 11,
    color: '#666',
  },
  dateScrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  dateDayActive: {
    color: '#fff',
  },
  dateNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  dateNumberActive: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  timeSlot: {
    width: '23%',
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeSlotActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  timeTextActive: {
    color: '#fff',
  },
  timeNote: {
    fontSize: 12,
    color: '#00BCD4',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  editLink: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
  },
  infoItem: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoRowContent: {
    flex: 1,
  },
  infoRowLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  successInfoCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  successInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  successInfoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successInfoCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
  },
  successDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  successDetail: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  successDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  successDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  successNote: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 16,
  },
  successNoteTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 6,
  },
  successNoteText: {
    fontSize: 12,
    color: '#F57F17',
    marginBottom: 4,
  },
  successButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  successButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  successButtonSecondary: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00BCD4',
  },
  successButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00BCD4',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
