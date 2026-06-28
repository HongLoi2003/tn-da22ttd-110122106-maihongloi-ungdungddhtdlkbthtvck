import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import doctorListService, { doctor } from '../services/doctorListService';
import { createDocument, getDocumentsWithQuery } from '../services/firebaseService';
import geminiService from '../services/geminiService';
import { getDoctorAvailability } from '../services/scheduleService';
import symptomAnalysisService, { SpecialtyRecommendation, SymptomItem } from '../services/symptomAnalysisService';
import { calculateAge } from '../utils/dateHelper';
import { getDoctorAvatarByFileName } from '../utils/doctorAvatars';

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
  const [selectedConsultationType, setSelectedConsultationType] = useState('in-person'); // 'in-person' or 'online'
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash'); // 'cash', 'momo', 'bank', 'insurance'
  const [submitting, setSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesByDate, setTimesByDate] = useState<{ [key: string]: string[] }>({});
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [checkInCode, setCheckInCode] = useState('');

  // Symptom analysis states
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomItem[]>([]);
  const [recommendations, setRecommendations] = useState<SpecialtyRecommendation[]>([]);
  const [showSymptomSuggestions, setShowSymptomSuggestions] = useState(false);
  const [symptomSuggestions, setSymptomSuggestions] = useState<SymptomItem[]>([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState<doctor[]>([]);
  const [selectedDoctorData, setSelectedDoctorData] = useState<doctor | null>(null);
  const [showOtherSpecialties, setShowOtherSpecialties] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [allSpecialtyRecommendations, setAllSpecialtyRecommendations] = useState<SpecialtyRecommendation[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]); // Danh sách giờ đã được đặt
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Loading state for AI analysis
  const [aiExplanation, setAiExplanation] = useState<string>(''); // AI explanation for specialty recommendation

  // Load user data on mount AND when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userData) {
        setPatientName(userData.fullName || '');
        setPatientPhone(userData.phone || '');
        setPatientEmail(userData.email || '');
        setPatientAddress(userData.address || '');
        
        // Tính tuổi từ ngày sinh
        console.log('🔍 [BOOKING] userData.dateOfBirth:', userData.dateOfBirth);
        if (userData.dateOfBirth) {
          const age = calculateAge(userData.dateOfBirth);
          console.log('✅ [BOOKING] Calculated age:', age);
          setPatientAge(age > 0 ? age.toString() : '');
        } else {
          console.log('⚠️ [BOOKING] No dateOfBirth found in userData');
          setPatientAge('');
        }
        
        console.log('✅ [BOOKING] Loaded user data:', userData);
      }
    }, [userData])
  );

  // Load user data on mount
  useEffect(() => {
    if (userData) {
      setPatientName(userData.fullName || '');
      setPatientPhone(userData.phone || '');
      setPatientEmail(userData.email || '');
      setPatientAddress(userData.address || '');
      
      // Tính tuổi từ ngày sinh
      console.log('🔍 [BOOKING] userData.dateOfBirth:', userData.dateOfBirth);
      if (userData.dateOfBirth) {
        const age = calculateAge(userData.dateOfBirth);
        console.log('✅ [BOOKING] Calculated age:', age);
        setPatientAge(age > 0 ? age.toString() : '');
      } else {
        console.log('⚠️ [BOOKING] No dateOfBirth found in userData');
        setPatientAge('');
      }
      
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
      
      // Get doctor availability from schedule service
      const availability = await getDoctorAvailability(selectedDoctorId);
      
      if (availability.dates.length > 0) {
        setAvailableDates(availability.dates);
        setTimesByDate(availability.timesByDate);
        console.log('✅ [BOOKING] Loaded availability:', availability);
      } else {
        // Fallback: Generate default dates if no schedule found
        const today = new Date();
        const dates = [];
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const defaultTimes: { [key: string]: string[] } = {};
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const dayOfWeek = dayNames[date.getDay()];
          
          const fullDate = `${day}/${month}/${year}`;
          
          dates.push({
            day: dayOfWeek,
            date: `${day}/${month}`,
            fullDate: fullDate
          });
          
          defaultTimes[fullDate] = ['08:00', '09:30', '10:30', '14:00', '15:30'];
        }
        
        setAvailableDates(dates);
        setTimesByDate(defaultTimes);
        console.log('✅ [BOOKING] Using default availability');
      }
    } catch (error) {
      console.error('❌ [BOOKING] Error loading dates:', error);
      // Use default data on error
      const today = new Date();
      const dates = [];
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const defaultTimes: { [key: string]: string[] } = {};
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dayOfWeek = dayNames[date.getDay()];
        
        const fullDate = `${day}/${month}/${year}`;
        
        dates.push({
          day: dayOfWeek,
          date: `${day}/${month}`,
          fullDate: fullDate
        });
        
        defaultTimes[fullDate] = ['08:00', '09:30', '10:30', '14:00', '15:30'];
      }
      
      setAvailableDates(dates);
      setTimesByDate(defaultTimes);
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
      setShowSymptomSuggestions(suggestions.length > 0);
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

  const analyzeSymptoms = async () => {
    // Phân tích trực tiếp từ text người dùng nhập
    const symptomText = symptomInput.trim();
    
    if (!symptomText) {
      Alert.alert('Thông báo', 'Vui lòng nhập triệu chứng của bạn');
      return;
    }

    console.log('🔍 [BOOKING] Analyzing symptoms:', symptomText);
    setIsAnalyzing(true);
    setAiExplanation('');
    
    let result: SpecialtyRecommendation[] = [];
    let usedAI = false;
    
    // Try Gemini AI first if available
    if (geminiService.isAvailable()) {
      try {
        console.log('🤖 [BOOKING] Using Gemini AI for analysis...');
        const aiResult = await geminiService.analyzeSymptoms(symptomText);
        
        if (aiResult && aiResult.specialties && aiResult.specialties.length > 0) {
          console.log('✅ [BOOKING] Gemini AI result:', aiResult);
          console.log('✅ [BOOKING] Found', aiResult.specialties.length, 'matching specialties');
          
          // Convert AI result to SpecialtyRecommendation format
          result = aiResult.specialties.map((spec, index) => ({
            specialtyId: index,
            specialtyName: spec.specialty,
            confidence: spec.confidence,
            matchedSymptoms: spec.matchedSymptoms
          }));
          
          // Lưu explanation của chuyên khoa phù hợp nhất (đầu tiên)
          setAiExplanation(aiResult.specialties[0].explanation);
          usedAI = true;
          
          console.log('✅ [BOOKING] Converted to', result.length, 'recommendations');
        }
      } catch (error) {
        console.error('❌ [BOOKING] Gemini AI error:', error);
        // Fall through to keyword matching
      }
    }
    
    // Fallback to keyword matching if AI not available or failed
    if (!usedAI) {
      console.log('🔍 [BOOKING] Using keyword matching...');
      // Sử dụng phương thức mới: analyzeSymptomText
      result = symptomAnalysisService.analyzeSymptomText(symptomText);
    }
    
    setIsAnalyzing(false);
    
    console.log('📊 [BOOKING] Analysis result:', result);
    
    // Lưu tất cả kết quả phân tích (bao gồm cả chuyên khoa có confidence thấp)
    setAllSpecialtyRecommendations(result);
    
    // Luôn hiển thị ít nhất 1 chuyên khoa nếu có kết quả
    // Chỉ lọc nếu có nhiều hơn 3 kết quả
    let topRecommendations = result;
    if (result.length > 3) {
      topRecommendations = result.filter(r => r.confidence >= 30);
      // Nếu sau khi lọc không còn gì, lấy top 3
      if (topRecommendations.length === 0) {
        topRecommendations = result.slice(0, 3);
      }
    }
    
    setRecommendations(topRecommendations);
    
    console.log('📊 [BOOKING] Top recommendations:', topRecommendations);
    
    // Tự động chọn chuyên khoa phù hợp nhất (confidence cao nhất)
    if (topRecommendations.length > 0) {
      const bestMatch = topRecommendations[0];
      setSelectedSpecialty(bestMatch.specialtyName);
      const doctors = doctorListService.getdoctorsBySpecialty(bestMatch.specialtyName);
      setRecommendedDoctors(doctors);
      console.log('✅ [BOOKING] Auto-selected specialty:', bestMatch.specialtyName);
      console.log('👨‍⚕️ [BOOKING] Found doctors:', doctors.length);
      
      // Nếu không tìm thấy bác sĩ, thử tìm với tên tương tự
      if (doctors.length === 0) {
        console.warn('⚠️ [BOOKING] No doctors found for:', bestMatch.specialtyName);
        console.log('🔍 [BOOKING] Trying to find similar specialty...');
        
        // Thử các biến thể tên chuyên khoa
        const specialtyVariants = [
          bestMatch.specialtyName,
          bestMatch.specialtyName.replace('Khoa ', ''),
          'Khoa ' + bestMatch.specialtyName,
        ];
        
        for (const variant of specialtyVariants) {
          const foundDoctors = doctorListService.getdoctorsBySpecialty(variant);
          if (foundDoctors.length > 0) {
            console.log('✅ [BOOKING] Found doctors with variant:', variant);
            setRecommendedDoctors(foundDoctors);
            setSelectedSpecialty(variant);
            break;
          }
        }
      }
    }
    
    // Tự động chuyển sang bước 2 để xem chuyên khoa
    if (result.length > 0) {
      setCurrentStep(2);
    } else {
      Alert.alert(
        'Không tìm thấy chuyên khoa phù hợp', 
        'Vui lòng thử mô tả triệu chứng chi tiết hơn hoặc chọn từ danh sách gợi ý.'
      );
    }
  };

  const selectSpecialtyFromRecommendation = (specialty: SpecialtyRecommendation) => {
    handleSpecialtyChange(specialty);
    // Tự động chuyển sang bước 3 để xem danh sách bác sĩ
    setCurrentStep(3);
  };

  const handleContinue = async () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 7) {
      // Lưu lịch khám vào Firebase
      await saveAppointmentToFirebase();
    }
  };

  const handleConfirmBooking = async () => {
    console.log('💾 [BOOKING] handleConfirmBooking called');
    
    // Kiểm tra lại xem khung giờ có bị trùng không trước khi lưu
    try {
      console.log('🔍 [BOOKING] Double-checking for conflicts...');
      const conflictCheck = await getDocumentsWithQuery('appointments', [
        where('doctorId', '==', selectedDoctorId),
        where('date', '==', selectedDate),
        where('time', '==', selectedTime),
        where('status', 'in', ['pending', 'confirmed'])
      ]);
      
      if (conflictCheck.length > 0) {
        console.error('❌ [BOOKING] Conflict detected! Time slot already booked');
        Alert.alert(
          'Lỗi đặt lịch',
          'Khung giờ này vừa được đặt bởi người khác. Vui lòng chọn khung giờ khác.',
          [{ text: 'OK', onPress: () => setCurrentStep(4) }]
        );
        return;
      }
      
      console.log('✅ [BOOKING] No conflicts, proceeding with booking');
    } catch (error) {
      console.error('❌ [BOOKING] Error checking conflicts:', error);
      Alert.alert('Lỗi', 'Không thể kiểm tra lịch trùng. Vui lòng thử lại.');
      return;
    }
    
    // Move to Step 7 (success screen) first
    setCurrentStep(7);
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
    const doctors = doctorListService.getdoctorsBySpecialty(specialty.specialtyName);
    setRecommendedDoctors(doctors);
    // Reset bác sĩ và giờ khi đổi chuyên khoa
    setSelectedDoctor('');
    setSelectedDoctorId('');
    setSelectedDoctorImage('');
    setSelectedDoctorData(null);
    setSelectedDate('');
    setSelectedTime('');
    console.log('🔄 [BOOKING] Specialty changed, reset doctor and time');
  };

  const handleDoctorSelect = (doctor: doctor) => {
    setSelectedDoctor(doctor.ten);
    setSelectedDoctorId(doctor.id);
    setSelectedDoctorImage(doctor.image);
    setSelectedDoctorData(doctor);
    // Set default hospital
    setSelectedHospital('Bệnh viện Trường Đại học Trà Vinh');
    // Reset giờ khi đổi bác sĩ
    setSelectedTime('');
    console.log('🔄 [BOOKING] Doctor selected:', doctor.ten);
    console.log('💰 [BOOKING] Doctor fee:', doctor.phi_kham);
    // Không tự động chuyển bước nữa, để người dùng bấm nút "Chọn bác sĩ"
  };

  const handleDateSelect = async (date: string) => {
    // Toggle selection: nếu đã chọn ngày này thì bỏ chọn
    if (selectedDate === date) {
      setSelectedDate('');
      setAvailableTimes([]);
      setSelectedTime('');
      setBookedTimes([]);
      console.log('🔄 [BOOKING] Date deselected');
    } else {
      setSelectedDate(date);
      // Load available times for selected date
      const times = timesByDate[date] || [];
      setAvailableTimes(times);
      // Reset giờ khi đổi ngày
      setSelectedTime('');
      console.log('🔄 [BOOKING] Date selected:', date);
      console.log('🔄 [BOOKING] Available times:', times);
      console.log('🔄 [BOOKING] Doctor ID:', selectedDoctorId);
      
      // Load danh sách giờ đã được đặt cho bác sĩ này vào ngày này
      if (!selectedDoctorId) {
        console.warn('⚠️ [BOOKING] No doctor selected, cannot check booked times');
        setBookedTimes([]);
        return;
      }
      
      try {
        console.log('🔍 [BOOKING] Querying appointments for doctor:', selectedDoctorId, 'date:', date);
        const appointments = await getDocumentsWithQuery('appointments', [
          where('doctorId', '==', selectedDoctorId),
          where('date', '==', date),
          where('status', 'in', ['pending', 'confirmed'])
        ]);
        
        console.log('📋 [BOOKING] Found appointments:', appointments.length);
        const booked = appointments.map((apt: any) => {
          console.log('  - Appointment:', apt.time, 'status:', apt.status);
          return apt.time;
        });
        setBookedTimes(booked);
        console.log('📅 [BOOKING] Booked times:', booked);
      } catch (error) {
        console.error('❌ [BOOKING] Error loading booked times:', error);
        setBookedTimes([]);
      }
    }
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
        fee: selectedDoctorData?.phi_kham || 300000, // Thêm phí khám
        status: 'pending', // Chờ bác sĩ xác nhận
        appointmentDate: appointmentDateISO, // ISO 8601 for comparison
        createdAt: new Date().toISOString(), // Add createdAt for sorting
      };

      console.log('💾 [BOOKING] Appointment data to save:', appointmentData);
      console.log('💰 [BOOKING] Doctor fee being saved:', appointmentData.fee);

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
      
      // Generate check-in code: CI + DDMMYY + random 6 digits
      // Example: CI240522123456
      const checkInRandomNum = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      const checkInCodeGenerated = `CI${codeDay}${codeMonth}${codeYear}${checkInRandomNum}`;
      
      // Save appointment code to state for display in Step 5
      setAppointmentId(appointmentCode);
      setCheckInCode(checkInCodeGenerated);
      console.log('💾 [BOOKING] Appointment code generated:', appointmentCode);
      console.log('💾 [BOOKING] Check-in code generated:', checkInCodeGenerated);
      
      // Navigate to booking success screen
      console.log('✅ [BOOKING] Navigating to booking-success screen');
      router.push({
        pathname: '/booking-success',
        params: {
          appointmentCode: appointmentCode,
          checkInCode: checkInCodeGenerated,
          specialty: selectedSpecialty,
          doctor: selectedDoctor,
          doctorImage: selectedDoctorImage,
          date: selectedDate,
          time: selectedTime,
          hospital: selectedHospital,
          patientName: patientName,
          patientPhone: patientPhone,
          patientEmail: patientEmail,
          patientAge: patientAge,
          patientGender: userData?.gender || '',
          patientAddress: patientAddress,
          patientInsuranceCode: userData?.insuranceCode || '',
        },
      });

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
          <Text style={styles.headerTitle}>
            {currentStep === 1 && 'Nhập triệu chứng'}
            {currentStep === 2 && 'Chọn chuyên khoa'}
            {currentStep === 3 && 'Chọn bác sĩ'}
            {currentStep === 4 && 'Chọn ngày và giờ'}
            {currentStep === 5 && 'Thông tin bệnh nhân'}
            {currentStep === 6 && 'Phương thức thanh toán'}
            {currentStep === 7 && 'Đặt lịch thành công'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Loading Modal */}
        <Modal
          visible={isAnalyzing}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <ActivityIndicator size="large" color="#00BCD4" />
              </View>
              <Text style={styles.modalTitle}>
                {geminiService.isAvailable() ? '🤖 AI đang phân tích...' : '🔍 Đang phân tích...'}
              </Text>
              <Text style={styles.modalMessage}>
                Vui lòng đợi trong giây lát
              </Text>
            </View>
          </View>
        </Modal>

        {/* Step 1: Symptom Input */}
        {currentStep === 1 && (
          <>
            <View style={styles.section}>
              
              
              {/* Common Symptoms */}
              <Text style={styles.commonSymptomsLabel}>Triệu chứng phổ biến</Text>
              <View style={styles.commonSymptomsGrid}>
                {[
                  { emoji: '❤️', text: 'Đau ngực' },
                  { emoji: '🧠', text: 'Đau đầu' },
                  { emoji: '🫁', text: 'Ho' },
                  { emoji: '🍽️', text: 'Đau bụng' },
                  { emoji: '🧴', text: 'Ngứa da' },
                  { emoji: '👶', text: 'Sốt' },
                  { emoji: '🤰', text: 'Đau bụng dưới' },
                  { emoji: '🦴', text: 'Đau khớp' },
                  { emoji: '👂', text: 'Đau họng' },
                  { emoji: '👁️', text: 'Mờ mắt' },
                  { emoji: '🦷', text: 'Đau răng' },
                  { emoji: '🩺', text: 'Khát nước nhiều' },
                ].map((symptom, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.commonSymptomButton}
                    onPress={async () => {
                      // Phân tích triệu chứng ngay lập tức
                      console.log('🔍 [BOOKING] Quick analyzing symptom:', symptom.text);
                      setIsAnalyzing(true);
                      setSymptomInput(symptom.text.toLowerCase()); // Set để có thể theo dõi
                      
                      let result: SpecialtyRecommendation[] = [];
                      let usedAI = false;
                      
                      // Try Gemini AI first if available
                      if (geminiService.isAvailable()) {
                        try {
                          console.log('🤖 [BOOKING] Using Gemini AI for quick analysis...');
                          const aiResult = await geminiService.analyzeSymptoms(symptom.text.toLowerCase());
                          
                          if (aiResult && aiResult.specialties && aiResult.specialties.length > 0) {
                            result = aiResult.specialties.map((spec, idx) => ({
                              specialtyId: idx,
                              specialtyName: spec.specialty,
                              confidence: spec.confidence,
                              matchedSymptoms: spec.matchedSymptoms
                            }));
                            setAiExplanation(aiResult.specialties[0].explanation);
                            usedAI = true;
                          }
                        } catch (error) {
                          console.error('❌ [BOOKING] Gemini AI error:', error);
                        }
                      }
                      
                      // Fallback to keyword matching
                      if (!usedAI) {
                        console.log('🔍 [BOOKING] Using keyword matching for quick analysis...');
                        result = symptomAnalysisService.analyzeSymptomText(symptom.text.toLowerCase());
                      }
                      
                      setIsAnalyzing(false);
                      
                      // Lưu kết quả
                      setAllSpecialtyRecommendations(result);
                      let topRecommendations = result;
                      if (result.length > 3) {
                        topRecommendations = result.filter(r => r.confidence >= 30);
                        if (topRecommendations.length === 0) {
                          topRecommendations = result.slice(0, 3);
                        }
                      }
                      setRecommendations(topRecommendations);
                      
                      // Auto-select best match
                      if (topRecommendations.length > 0) {
                        const bestMatch = topRecommendations[0];
                        setSelectedSpecialty(bestMatch.specialtyName);
                        const doctors = doctorListService.getdoctorsBySpecialty(bestMatch.specialtyName);
                        setRecommendedDoctors(doctors);
                      }
                      
                      // Chuyển sang bước 2 ngay lập tức
                      if (result.length > 0) {
                        setCurrentStep(2);
                      } else {
                        Alert.alert(
                          'Không tìm thấy chuyên khoa phù hợp', 
                          'Vui lòng thử nhập triệu chứng chi tiết hơn.'
                        );
                      }
                    }}
                  >
                    <Text style={styles.commonSymptomText}>{symptom.emoji} {symptom.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Symptom Input */}
              <Text style={styles.sectionTitle}>Bạn đang gặp vấn đề gì?</Text>
              <Text style={styles.sectionSubtitle}>Mô tả triệu chứng của bạn (gõ tự do hoặc chọn từ gợi ý)</Text>
              <View style={styles.symptomInputContainer}>
                
                <TextInput
                  style={styles.symptomInput}
                  placeholder="Ví dụ: Tôi bị đau đầu dữ dội, chóng mặt, buồn nôn và mất ngủ trong 2 tuần..."
                  placeholderTextColor="#999"
                  value={symptomInput}
                  onChangeText={setSymptomInput}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{symptomInput.length}/300</Text>
              </View>

              {/* Analyze Button - Hiển thị khi có text */}
              {symptomInput.trim() && (
                <TouchableOpacity 
                  style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]} 
                  onPress={analyzeSymptoms}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.analyzeButtonText}>
                        {geminiService.isAvailable() ? 'AI đang phân tích...' : 'Đang phân tích...'}
                      </Text>
                    </>
                  ) : (
                    <>
                      {geminiService.isAvailable() && (
                        <Ionicons name="sparkles" size={18} color="#fff" />
                      )}
                      <Text style={styles.analyzeButtonText}>
                        {geminiService.isAvailable() ? 'Phân tích bằng AI' : 'Xem chuyên khoa'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Step 2: Choose Specialty */}
        {currentStep === 2 && (
          <>
            {recommendations.length > 0 ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.mainSpecialtyTitle}>Chuyên khoa phù hợp nhất</Text>

                  {/* Card chuyên khoa đang được chọn hoặc phù hợp nhất */}
                  {(() => {
                    // Tìm chuyên khoa đang được chọn trong danh sách recommendations
                    const selectedRec = selectedSpecialty 
                      ? allSpecialtyRecommendations.find(r => r.specialtyName === selectedSpecialty) || recommendations[0]
                      : recommendations[0];

                    return (
                      <TouchableOpacity
                        style={[
                          styles.bestMatchCard,
                          selectedSpecialty === selectedRec.specialtyName && styles.bestMatchCardSelected
                        ]}
                        onPress={() => {
                          if (selectedSpecialty === selectedRec.specialtyName) {
                            // Không cho phép bỏ chọn
                          } else {
                            handleSpecialtyChange(selectedRec);
                          }
                        }}
                      >
                        <View style={styles.bestMatchHeader}>
                          <View style={[styles.bestMatchIcon, { backgroundColor: getSpecialtyColor(selectedRec.specialtyName) }]}>
                            <Text style={styles.bestMatchIconText}>{getSpecialtyIcon(selectedRec.specialtyName)}</Text>
                          </View>
                          <View style={styles.bestMatchInfo}>
                            <Text style={styles.bestMatchName}>{selectedRec.specialtyName}</Text>
                            <Text style={styles.bestMatchConfidence}>({selectedRec.confidence}%)</Text>
                          </View>
                          {selectedSpecialty === selectedRec.specialtyName && (
                            <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })()}
                </View>

                {/* Nút xem bác sĩ - xuất hiện khi đã chọn chuyên khoa */}
                {selectedSpecialty && (
                  <View style={styles.section}>
                    <TouchableOpacity 
                      style={styles.viewDoctorsButton}
                      onPress={() => setCurrentStep(3)}
                    >
                      <Text style={styles.viewDoctorsButtonText}>Xem bác sĩ chuyên khoa</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.section}>
                <View style={styles.noResultContainer}>
                  <Ionicons name="alert-circle-outline" size={64} color="#FF9800" />
                  <Text style={styles.noResultTitle}>Không tìm thấy chuyên khoa phù hợp</Text>
                  <Text style={styles.noResultText}>
                    Vui lòng thử mô tả triệu chứng chi tiết hơn hoặc chọn chuyên khoa từ danh sách bên dưới
                  </Text>
                </View>
              </View>
            )}

            {/* Dropdown các chuyên khoa khác không liên quan (nếu có) */}
            {allSpecialtyRecommendations.length > recommendations.length && (
              <View style={styles.section}>
                <TouchableOpacity 
                  style={styles.otherSpecialtiesHeader}
                  onPress={() => setShowOtherSpecialties(!showOtherSpecialties)}
                >
                  <Text style={styles.otherSpecialtiesTitle}>Chuyên khoa khác (độ phù hợp thấp)</Text>
                  <Ionicons 
                    name={showOtherSpecialties ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>

                {showOtherSpecialties && (
                  <View style={styles.otherSpecialtiesList}>
                    {allSpecialtyRecommendations
                      .filter(rec => !recommendations.some(r => r.specialtyName === rec.specialtyName))
                      .slice(0, 10)
                      .map((specialty, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.otherSpecialtyItem,
                            selectedSpecialty === specialty.specialtyName && styles.otherSpecialtyItemSelected
                          ]}
                          onPress={() => {
                            if (selectedSpecialty === specialty.specialtyName) {
                              setSelectedSpecialty('');
                              setRecommendedDoctors([]);
                            } else {
                              setSelectedSpecialty(specialty.specialtyName);
                              const doctors = doctorListService.getdoctorsBySpecialty(specialty.specialtyName);
                              setRecommendedDoctors(doctors);
                            }
                          }}
                        >
                          <View style={styles.otherSpecialtyLeft}>
                            <Text style={styles.otherSpecialtyName}>
                              {getSpecialtyIcon(specialty.specialtyName)} {specialty.specialtyName}
                            </Text>
                            <Text style={styles.otherSpecialtyMatch}>{specialty.confidence}% phù hợp</Text>
                          </View>
                          <Ionicons 
                            name={selectedSpecialty === specialty.specialtyName ? "checkmark-circle" : "chevron-forward"} 
                            size={20} 
                            color={selectedSpecialty === specialty.specialtyName ? "#00BCD4" : "#999"} 
                          />
                        </TouchableOpacity>
                      ))}
                  </View>
                )}
              </View>
            )}

            {/* Dropdown tất cả chuyên khoa liên quan */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.allSpecialtiesHeader}
                onPress={() => setShowAllSpecialties(!showAllSpecialties)}
              >
                <Text style={styles.allSpecialtiesTitle}>
                  {allSpecialtyRecommendations.length > 0 
                    ? `Hoặc chọn từ các chuyên khoa liên quan (${allSpecialtyRecommendations.length})` 
                    : 'Hoặc chọn từ danh sách chuyên khoa'}
                </Text>
                <Ionicons 
                  name={showAllSpecialties ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>

              {showAllSpecialties && (
                <View style={styles.allSpecialtiesList}>
                  {allSpecialtyRecommendations.length > 0 ? (
                    // Hiển thị TẤT CẢ chuyên khoa từ kết quả phân tích (đã được sắp xếp theo confidence)
                    allSpecialtyRecommendations.map((specialty, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.allSpecialtyItem,
                          selectedSpecialty === specialty.specialtyName && styles.allSpecialtyItemSelected
                        ]}
                        onPress={() => {
                          if (selectedSpecialty === specialty.specialtyName) {
                            setSelectedSpecialty('');
                            setRecommendedDoctors([]);
                          } else {
                            setSelectedSpecialty(specialty.specialtyName);
                            const doctors = doctorListService.getdoctorsBySpecialty(specialty.specialtyName);
                            setRecommendedDoctors(doctors);
                          }
                        }}
                      >
                        <View style={styles.allSpecialtyLeft}>
                          <Text style={styles.allSpecialtyName}>
                            {getSpecialtyIcon(specialty.specialtyName)} {specialty.specialtyName}
                          </Text>
                          <Text style={styles.allSpecialtyMatch}>{specialty.confidence}% phù hợp</Text>
                          {specialty.matchedSymptoms && specialty.matchedSymptoms.length > 0 && (
                            <Text style={styles.allSpecialtySymptoms}>
                              {specialty.matchedSymptoms.slice(0, 2).join(', ')}
                              {specialty.matchedSymptoms.length > 2 && '...'}
                            </Text>
                          )}
                        </View>
                        <Ionicons 
                          name={selectedSpecialty === specialty.specialtyName ? "checkmark-circle" : "chevron-forward"} 
                          size={20} 
                          color={selectedSpecialty === specialty.specialtyName ? "#00BCD4" : "#999"} 
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    // Nếu không có kết quả phân tích, hiển thị danh sách mặc định
                    ['Tim mạch', 'Tai mũi họng', 'Nội tiết', 'Mắt', 
                     'Nhi khoa', 'Sản phụ khoa', 'Da liễu', 'Tiêu hóa',
                     'Thần kinh', 'Cơ xương khớp', 'Hô hấp', 'Tiết niệu'].map((specialtyName, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.allSpecialtyItem,
                          selectedSpecialty === specialtyName && styles.allSpecialtyItemSelected
                        ]}
                        onPress={() => {
                          if (selectedSpecialty === specialtyName) {
                            setSelectedSpecialty('');
                            setRecommendedDoctors([]);
                          } else {
                            setSelectedSpecialty(specialtyName);
                            const doctors = doctorListService.getdoctorsBySpecialty(specialtyName);
                            setRecommendedDoctors(doctors);
                          }
                        }}
                      >
                        <View style={styles.allSpecialtyLeft}>
                          <Text style={styles.allSpecialtyName}>
                            {getSpecialtyIcon(specialtyName)} {specialtyName}
                          </Text>
                        </View>
                        <Ionicons 
                          name={selectedSpecialty === specialtyName ? "checkmark-circle" : "chevron-forward"} 
                          size={20} 
                          color={selectedSpecialty === specialtyName ? "#00BCD4" : "#999"} 
                        />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.continueButton, styles.backButton]} 
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={20} color="#00BCD4" />
              <Text style={[styles.continueButtonText, styles.backButtonText]}>Quay lại</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: Choose Doctor */}
        {currentStep === 3 && (
          <>
            <View style={styles.section}>
              <View style={styles.specialtyBadge}>
                <Text style={styles.specialtyBadgeText}>Chuyên khoa: {selectedSpecialty}</Text>
              </View>

              <Text style={styles.sectionTitle}>Bác sĩ phù hợp</Text>

              {recommendedDoctors.map((doctor) => {
                // Get earliest available date from actual availability
                let earliestDate = 'Đang cập nhật lịch...';
                
                // Check if we have loaded dates for this doctor
                if (selectedDoctorId === doctor.id && availableDates.length > 0) {
                  const firstDate = availableDates[0];
                  earliestDate = `${firstDate.day}, ${firstDate.fullDate}`;
                } else {
                  // Show today as earliest (will be updated when doctor is selected)
                  const today = new Date();
                  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                  const day = String(today.getDate()).padStart(2, '0');
                  const month = String(today.getMonth() + 1).padStart(2, '0');
                  const year = today.getFullYear();
                  const dayOfWeek = dayNames[today.getDay()];
                  earliestDate = `${dayOfWeek}, ${day}/${month}/${year}`;
                }

                return (
                  <TouchableOpacity
                    key={doctor.id}
                    style={[
                      styles.doctorCardLarge,
                      selectedDoctorId === doctor.id && styles.doctorCardSelected
                    ]}
                    onPress={() => handleDoctorSelect(doctor)}
                  >
                    <View style={styles.doctorCardHeader}>
                      <Image
                        source={getDoctorAvatarByFileName(doctor.image)}
                        style={styles.doctorAvatarLarge}
                      />
                      <View style={styles.doctorInfoLarge}>
                        <Text style={styles.doctorNameLarge}>{doctor.ten}</Text>
                        <Text style={styles.doctorSpecialtyLarge}>{doctor.chuyen_khoa}</Text>
                        <View style={styles.doctorMetaRow}>
                          <Ionicons name="star" size={14} color="#FFB800" />
                          <Text style={styles.doctorRatingText}>{doctor.rating} (120 đánh giá)</Text>
                        </View>
                        <Text style={styles.doctorExpText}>{doctor.kinh_nghiem} năm kinh nghiệm</Text>
                      </View>
                      {selectedDoctorId === doctor.id && (
                        <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                      )}
                    </View>

                    <View style={styles.doctorCardBody}>
                      <Text style={styles.doctorDetailLabel}>Lịch khám sớm nhất:</Text>
                      <Text style={styles.doctorDetailValue}>{earliestDate}</Text>
                    </View>

                    {selectedDoctorId === doctor.id && (
                      <TouchableOpacity 
                        style={styles.selectDoctorButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          setCurrentStep(4);
                        }}
                      >
                        <Text style={styles.selectDoctorButtonText}>Chọn bác sĩ</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={[styles.continueButton, styles.backButton]} 
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={20} color="#00BCD4" />
              <Text style={[styles.continueButtonText, styles.backButtonText]}>Quay lại</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 4: Booking Information & Confirmation */}
        {currentStep === 4 && (
          <>
            <View style={styles.section}>
              {/* Selected Doctor Info */}
              {selectedDoctorData && (
                <View style={styles.selectedDoctorCard}>
                  <View style={styles.specialtyBadge}>
                    <Text style={styles.specialtyBadgeTextSmall}>Chuyên khoa: {selectedSpecialty}</Text>
                  </View>
                  
                  <View style={styles.doctorCardHeader}>
                    <Image
                      source={getDoctorAvatarByFileName(selectedDoctorImage)}
                      style={styles.doctorAvatarMedium}
                    />
                    <View style={styles.doctorInfoMedium}>
                      <Text style={styles.doctorNameMedium}>{selectedDoctor}</Text>
                      <Text style={styles.doctorSpecialtyMedium}>{selectedDoctorData.chuyen_khoa}</Text>
                      <View style={styles.doctorMetaRow}>
                        <Ionicons name="star" size={12} color="#FFB800" />
                        <Text style={styles.doctorRatingTextSmall}>{selectedDoctorData.rating} (120 đánh giá)</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Consultation Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hình thức khám</Text>
              
              <TouchableOpacity
                style={[
                  styles.consultationTypeCard,
                  selectedConsultationType === 'in-person' && styles.consultationTypeCardActive
                ]}
                onPress={() => setSelectedConsultationType('in-person')}
              >
                <View style={styles.consultationTypeIcon}>
                  <Ionicons 
                    name="business" 
                    size={24} 
                    color={selectedConsultationType === 'in-person' ? '#00BCD4' : '#666'} 
                  />
                </View>
                <View style={styles.consultationTypeContent}>
                  <Text style={[
                    styles.consultationTypeTitle,
                    selectedConsultationType === 'in-person' && styles.consultationTypeTitleActive
                  ]}>
                    Khám tại bệnh viện
                  </Text>
                  <Text style={styles.consultationTypeDesc}>
                    Gặp bác sĩ trực tiếp tại bệnh viện
                  </Text>
                </View>
                {selectedConsultationType === 'in-person' && (
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.consultationTypeCard,
                  selectedConsultationType === 'online' && styles.consultationTypeCardActive
                ]}
                onPress={() => setSelectedConsultationType('online')}
              >
                <View style={styles.consultationTypeIcon}>
                  <Ionicons 
                    name="videocam" 
                    size={24} 
                    color={selectedConsultationType === 'online' ? '#00BCD4' : '#666'} 
                  />
                </View>
                <View style={styles.consultationTypeContent}>
                  <Text style={[
                    styles.consultationTypeTitle,
                    selectedConsultationType === 'online' && styles.consultationTypeTitleActive
                  ]}>
                    Khám trực tuyến
                  </Text>
                  <Text style={styles.consultationTypeDesc}>
                    Tư vấn qua video call với bác sĩ
                  </Text>
                </View>
                {selectedConsultationType === 'online' && (
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                )}
              </TouchableOpacity>
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thời gian khám</Text>
              
              <Text style={styles.timeLabel}>Chọn ngày khám</Text>
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

              <Text style={styles.timeLabel}>Chọn giờ khám</Text>
              <View style={styles.timeGrid}>
                {availableTimes.length > 0 ? (
                  availableTimes.map((time, index) => {
                    const isBooked = bookedTimes.includes(time);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.timeSlot,
                          selectedTime === time && styles.timeSlotActive,
                          isBooked && styles.timeSlotDisabled
                        ]}
                        onPress={() => {
                          if (isBooked) {
                            Alert.alert('Thông báo', 'Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.');
                            return;
                          }
                          // Toggle selection: nếu đã chọn thì bỏ chọn, nếu chưa chọn thì chọn
                          if (selectedTime === time) {
                            setSelectedTime('');
                          } else {
                            setSelectedTime(time);
                          }
                        }}
                        disabled={isBooked}
                      >
                        <Text style={[
                          styles.timeText,
                          selectedTime === time && styles.timeTextActive,
                          isBooked && styles.timeTextDisabled
                        ]}>
                          {time}
                        </Text>
                        {isBooked && (
                          <Text style={styles.bookedLabel}>Đã đặt</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noDataText}>
                    {selectedDate ? 'Không có giờ khám khả dụng' : 'Vui lòng chọn ngày khám'}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={() => {
                console.log('🔍 [BOOKING] Step 4 - Continue button pressed');
                console.log('📅 Selected date:', selectedDate);
                console.log('⏰ Selected time:', selectedTime);
                console.log('👨‍⚕️ Doctor data:', selectedDoctorData);
                
                if (!selectedDate) {
                  Alert.alert('Chưa chọn ngày', 'Vui lòng chọn ngày khám');
                  return;
                }
                
                if (!selectedTime) {
                  Alert.alert('Chưa chọn giờ', 'Vui lòng chọn giờ khám');
                  return;
                }
                
                if (!selectedDoctorData) {
                  Alert.alert('Lỗi', 'Không tìm thấy thông tin bác sĩ');
                  return;
                }
                
                console.log('✅ [BOOKING] Moving to patient info form (Step 5)');
                setCurrentStep(5);
              }}
            >
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

        {/* Step 5: Patient Information */}
        {currentStep === 5 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin bệnh nhân</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ tên đầy đủ"
                  value={patientName}
                  onChangeText={setPatientName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  value={patientPhone}
                  onChangeText={setPatientPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tuổi</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  placeholder="Chưa cập nhật"
                  value={patientAge ? `${patientAge} tuổi` : ''}
                  editable={false}
                />
                <Text style={styles.inputHint}>Vui lòng cập nhật ngày sinh trong Hồ sơ</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email (tùy chọn)"
                  value={patientEmail}
                  onChangeText={setPatientEmail}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Nhập địa chỉ (tùy chọn)"
                  value={patientAddress}
                  onChangeText={setPatientAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Booking Summary */}
              <View style={styles.bookingSummary}>
                <Text style={styles.summaryTitle}>Thông tin đặt lịch</Text>
                
                <View style={styles.summaryRowWithIcon}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="person-outline" size={24} color="#00BCD4" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Bác sĩ</Text>
                    <Text style={styles.summaryValue}>{selectedDoctor}</Text>
                  </View>
                </View>

                <View style={styles.summaryRowWithIcon}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="medical-outline" size={24} color="#00BCD4" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Chuyên khoa</Text>
                    <Text style={styles.summaryValue}>{selectedSpecialty}</Text>
                  </View>
                </View>

                <View style={styles.summaryRowWithIcon}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="calendar-outline" size={24} color="#00BCD4" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Thời gian khám</Text>
                    <Text style={styles.summaryValue}>{selectedDate} - {selectedTime}</Text>
                  </View>
                </View>

                <View style={styles.summaryRowWithIcon}>
                  <View style={styles.summaryIconContainer}>
                    <Ionicons name="business-outline" size={24} color="#00BCD4" />
                  </View>
                  <View style={styles.summaryContent}>
                    <Text style={styles.summaryLabel}>Bệnh viện</Text>
                    <Text style={styles.summaryValue} numberOfLines={2} ellipsizeMode="tail">{selectedHospital}</Text>
                  </View>
                </View>

                {selectedDoctorData && (
                  <View style={styles.summaryRowWithIcon}>
                    <View style={styles.summaryIconContainer}>
                      <Ionicons name="card-outline" size={24} color="#00BCD4" />
                    </View>
                    <View style={styles.summaryContent}>
                      <Text style={styles.summaryLabel}>Phí khám</Text>
                      <Text style={styles.summaryPriceBlue}>{selectedDoctorData.phi_kham.toLocaleString('vi-VN')} đ</Text>
                    </View>
                  </View>
                )}
              </View>

            </View>

            <TouchableOpacity 
              style={[styles.continueButton, submitting && styles.disabledButton]}
              disabled={submitting}
              onPress={async () => {
                if (!patientName.trim()) {
                  Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên');
                  return;
                }
                if (!patientPhone.trim()) {
                  Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại');
                  return;
                }
                
                console.log('✅ [BOOKING] Moving to payment method selection (Step 6)');
                setCurrentStep(6);
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>Tiếp tục</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
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

        {/* Step 6: Payment Method */}
        {currentStep === 6 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
              
              {/* Tiền mặt */}
              <TouchableOpacity 
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'cash' && styles.paymentMethodCardActive
                ]}
                onPress={() => setSelectedPaymentMethod('cash')}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, selectedPaymentMethod === 'cash' && styles.paymentMethodIconActive]}>
                    <Ionicons name="cash-outline" size={28} color="#00BCD4" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.paymentMethodName, selectedPaymentMethod === 'cash' && styles.paymentMethodNameActive]}>
                      Tiền mặt
                    </Text>
                    <Text style={styles.paymentMethodDesc}>Thanh toán tại bệnh viện</Text>
                  </View>
                </View>
                {selectedPaymentMethod === 'cash' && (
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                )}
              </TouchableOpacity>

              {/* Ví MoMo */}
              <TouchableOpacity 
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'momo' && styles.paymentMethodCardActive
                ]}
                onPress={() => setSelectedPaymentMethod('momo')}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, selectedPaymentMethod === 'momo' && styles.paymentMethodIconActive]}>
                    <Ionicons name="wallet-outline" size={28} color="#D82D8B" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.paymentMethodName, selectedPaymentMethod === 'momo' && styles.paymentMethodNameActive]}>
                      Ví MoMo
                    </Text>
                    <Text style={styles.paymentMethodDesc}>Thanh toán qua ví điện tử</Text>
                  </View>
                </View>
                {selectedPaymentMethod === 'momo' && (
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                )}
              </TouchableOpacity>

              {/* Thẻ ngân hàng */}
              <TouchableOpacity 
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'bank' && styles.paymentMethodCardActive
                ]}
                onPress={() => setSelectedPaymentMethod('bank')}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, selectedPaymentMethod === 'bank' && styles.paymentMethodIconActive]}>
                    <Ionicons name="card-outline" size={28} color="#1E40AF" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.paymentMethodName, selectedPaymentMethod === 'bank' && styles.paymentMethodNameActive]}>
                      Thẻ ngân hàng
                    </Text>
                    <Text style={styles.paymentMethodDesc}>Thanh toán qua ATM/Visa</Text>
                  </View>
                </View>
                {selectedPaymentMethod === 'bank' && (
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                )}
              </TouchableOpacity>

              {/* Bảo hiểm y tế */}
              <TouchableOpacity 
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === 'insurance' && styles.paymentMethodCardActive
                ]}
                onPress={() => setSelectedPaymentMethod('insurance')}
              >
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, selectedPaymentMethod === 'insurance' && styles.paymentMethodIconActive]}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#16A34A" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.paymentMethodName, selectedPaymentMethod === 'insurance' && styles.paymentMethodNameActive]}>
                      Bảo hiểm y tế
                    </Text>
                    <Text style={styles.paymentMethodDesc}>Sử dụng thẻ BHYT</Text>
                  </View>
                </View>
                {selectedPaymentMethod === 'insurance' && (
                  <Ionicons name="checkmark-circle" size={24} color="#00BCD4" />
                )}
              </TouchableOpacity>

              {/* Thông tin */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                backgroundColor: '#E0F7FA',
                borderRadius: 12,
                padding: 12,
                marginTop: 12,
              }}>
                <Ionicons name="information-circle-outline" size={20} color="#00BCD4" />
                <Text style={{
                  flex: 1,
                  fontSize: 13,
                  color: '#00838F',
                  marginLeft: 8,
                  lineHeight: 18,
                }}>
                  Hệ thống sẽ xác nhận đặt lịch sau khi bạn hoàn tất thanh toán.
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={async () => {
                console.log('✅ [BOOKING] Confirming booking with payment method:', selectedPaymentMethod);
                await handleConfirmBooking();
              }}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color="#fff" />
                  <Text style={styles.continueButtonText}>Xác nhận đặt lịch</Text>
                </>
              )}
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

        {/* Step 7: Success */}
        {currentStep === 7 && (
          <>
            <View style={styles.section}>
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
                <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
                <Text style={styles.successSubtitle}>
                  Lịch khám của bạn đã được xác nhận. Chúng tôi sẽ gửi thông báo nhắc nhở trước giờ khám.
                </Text>

                {appointmentId && (
                  <>
                    <View style={styles.successInfoCard}>
                      <Text style={styles.successInfoLabel}>Mã đặt lịch</Text>
                      <View style={styles.successInfoValue}>
                        <Text style={styles.successInfoCode}>{appointmentId}</Text>
                        <TouchableOpacity>
                          <Ionicons name="copy-outline" size={20} color="#00BCD4" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {checkInCode && (
                      <View style={[styles.successInfoCard, { marginTop: 12 }]}>
                        <Text style={styles.successInfoLabel}>Mã check-in tại bệnh viện</Text>
                        <View style={styles.successInfoValue}>
                          <Text style={styles.successInfoCode}>{checkInCode}</Text>
                          <TouchableOpacity>
                            <Ionicons name="copy-outline" size={20} color="#00BCD4" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.checkInNote}>
                          Vui lòng xuất trình mã này tại quầy tiếp nhận khi đến bệnh viện
                        </Text>
                      </View>
                    )}
                  </>
                )}

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
                    <Text style={styles.successDetailValue}>{selectedDate} - {selectedTime}</Text>
                  </View>
                  <View style={styles.successDetail}>
                    <Text style={styles.successDetailLabel}>Địa điểm</Text>
                    <Text style={styles.successDetailValue}>{selectedHospital}</Text>
                  </View>
                </View>

                <View style={styles.successNote}>
                  <Text style={styles.successNoteTitle}>Lưu ý quan trọng</Text>
                  <Text style={styles.successNoteText}>• Vui lòng đến trước giờ khám 15 phút</Text>
                  <Text style={styles.successNoteText}>• Mang theo giấy tờ tùy thân và thẻ BHYT (nếu có)</Text>
                  <Text style={styles.successNoteText}>• Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => router.push(returnTo as any)}
            >
              <Text style={styles.successButtonText}>Xem lịch khám của tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.successButtonSecondary}
              onPress={() => {
                // Reset tất cả state về bước 1 để đặt lịch mới
                setCurrentStep(1);
                setSelectedSpecialty('');
                setSelectedDoctor('');
                setSelectedDoctorId('');
                setSelectedDoctorImage('');
                setSelectedHospital('');
                setSelectedDate('');
                setSelectedTime('');
                setSelectedConsultationType('in-person');
                setSymptomInput('');
                setSelectedSymptoms([]);
                setRecommendations([]);
                setRecommendedDoctors([]);
                setSelectedDoctorData(null);
                setShowOtherSpecialties(false);
                setShowAllSpecialties(false);
                setAllSpecialtyRecommendations([]);
                setBookedTimes([]);
                setAiExplanation('');
                setAppointmentId('');
                setCheckInCode('');
                setSelectedPaymentMethod('cash');
                console.log('🔄 [BOOKING] Reset all states for new booking');
              }}
            >
              <Text style={styles.successButtonSecondaryText}>Đặt lịch mới</Text>
            </TouchableOpacity>
          </>
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
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 120,
  },
  symptomInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    minHeight: 100,
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
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    padding: 10,
    paddingBottom: 5,
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
    flex: 1,
  },
  commonSymptomsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  commonSymptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  commonSymptomButton: {
    flexBasis: '30%',
    flexGrow: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B2EBF2',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  commonSymptomText: {
    fontSize: 13,
    color: '#00838F',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedSymptomsContainer: {
    marginBottom: 12,
  },
  selectedSymptomsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  analyzeButtonDisabled: {
    opacity: 0.7,
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
    color: '#000',
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
  otherRecommendationsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 8,
  },
  noResultContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
  viewDoctorButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewDoctorButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
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
  timeSlotDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  timeTextActive: {
    color: '#fff',
  },
  timeTextDisabled: {
    color: '#999',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
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
  checkInNote: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
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
  // New styles for redesigned booking flow
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  charCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 11,
    color: '#999',
  },
  recommendationCardSelected: {
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  specialtyBadgeText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
  specialtyBadgeTextSmall: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '500',
  },
  doctorCardLarge: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  doctorCardSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  doctorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },
  doctorAvatarMedium: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  doctorInfoLarge: {
    flex: 1,
  },
  doctorInfoMedium: {
    flex: 1,
  },
  doctorNameLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  doctorNameMedium: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  doctorSpecialtyLarge: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  doctorSpecialtyMedium: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  doctorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  doctorRatingText: {
    fontSize: 12,
    color: '#666',
  },
  doctorRatingTextSmall: {
    fontSize: 11,
    color: '#666',
  },
  doctorExpText: {
    fontSize: 11,
    color: '#666',
  },
  doctorCardBody: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 12,
  },
  doctorDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  doctorDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  selectDoctorButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectDoctorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  selectedDoctorCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 12,
  },
  noteInput: {
    height: 80,
    paddingTop: 10,
  },
  successInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  successCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successCodeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00BCD4',
  },
  consultationTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  consultationTypeCardActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  consultationTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  consultationTypeContent: {
    flex: 1,
  },
  consultationTypeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  consultationTypeTitleActive: {
    color: '#00BCD4',
  },
  consultationTypeDesc: {
    fontSize: 12,
    color: '#666',
  },
  // Other specialties dropdown styles
  otherSpecialtiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  otherSpecialtiesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  otherSpecialtiesList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  otherSpecialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  otherSpecialtyItemSelected: {
    backgroundColor: '#E0F7FA',
  },
  otherSpecialtyLeft: {
    flex: 1,
  },
  otherSpecialtyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  otherSpecialtyMatch: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '500',
  },
  // New styles for improved Step 2
  mainSpecialtyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  bestMatchCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  bestMatchCardSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  bestMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bestMatchIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bestMatchIconText: {
    fontSize: 28,
  },
  bestMatchInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bestMatchName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  bestMatchConfidence: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
  },
  explanationBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  symptomMatchText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 6,
  },
  selectedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  relatedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  relatedTable: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  tableColSpecialty: {
    flex: 2,
  },
  tableColConfidence: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowSelected: {
    backgroundColor: '#E0F7FA',
  },
  tableCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialtyEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  specialtyNameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  confidenceBar: {
    width: 60,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#00BCD4',
  },
  confidenceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  viewDoctorsButton: {
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewDoctorsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  allSpecialtiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  allSpecialtiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  allSpecialtiesList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  allSpecialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    marginBottom: 4,
  },
  allSpecialtyItemSelected: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  allSpecialtyLeft: {
    flex: 1,
  },
  allSpecialtyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  allSpecialtyMatch: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '500',
  },
  allSpecialtySymptoms: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Patient Info Form Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  inputHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  bookingSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
    flexWrap: 'wrap',
  },
  summaryPriceBlue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  summaryTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#00BCD4',
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00BCD4',
    flex: 2,
    textAlign: 'right',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Payment Method Styles
  paymentMethodSection: {
    marginTop: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  paymentMethodCardActive: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodIconActive: {
    backgroundColor: '#E0F7FA',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  paymentMethodNameActive: {
    color: '#00BCD4',
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#666',
  },
});
