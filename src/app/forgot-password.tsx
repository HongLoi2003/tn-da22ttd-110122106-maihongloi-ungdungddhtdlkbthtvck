import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from './config/firebase';
import { sendOTPEmail } from './services/emailService';
import { sendOTPEmailViaGoogleScript } from './services/googleScriptEmailService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown cho resend OTP
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Gửi OTP qua Gmail + Firebase Reset Email
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (!db || !auth) {
      Alert.alert('Lỗi', 'Firebase chưa được khởi tạo');
      return;
    }

    setLoading(true);
    try {
      // Kiểm tra email có tồn tại
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        Alert.alert(
          'Email không tồn tại',
          'Email này chưa được đăng ký. Vui lòng kiểm tra lại.'
        );
        return;
      }

      // 1. Tạo OTP code (6 số) để user nhập vào app
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 2. Lưu OTP vào Firestore
      await addDoc(collection(db, 'password_reset_otps'), {
        email: email.toLowerCase(),
        otp: otpCode,
        createdAt: serverTimestamp(),
      });

      // 3. Gửi Firebase reset email (chạy im lặng để lấy reset code sau này)
      // BỎ: Không cần Firebase reset email nữa
      // Cloud Function sẽ xử lý trực tiếp

      // 4. Gửi OTP qua Gmail (Google Apps Script với failover)
      console.log('📧 Trying Google Apps Script...');
      let emailSent = await sendOTPEmailViaGoogleScript(email, otpCode);
      
      console.log('📧 Google Apps Script result:', emailSent);
      
      // Failover to EmailJS if Google Apps Script fails
      if (!emailSent) {
        console.log('📧 Google Apps Script failed, trying EmailJS...');
        emailSent = await sendOTPEmail(email, otpCode);
        console.log('📧 EmailJS result:', emailSent);
      }
      
      if (emailSent) {
        console.log('✅ OTP email sent successfully!');
        Alert.alert(
          '✅ Đã gửi!',
          `Mã OTP đã được gửi đến email của bạn.\nVui lòng kiểm tra hộp thư.`,
          [{ text: 'OK' }]
        );
        setStep('otp');
        startCountdown();
      } else {
        console.error('❌ Both email services failed!');
        Alert.alert('Lỗi', 'Không thể gửi email. Vui lòng thử lại sau.');
      }
    } catch (error: any) {
      console.error('❌ Error sending OTP:', error);
      Alert.alert('Lỗi', 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nhập OTP
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý xóa OTP
  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Xác minh OTP từ Firestore
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Verifying OTP for:', email);

      if (!db) {
        Alert.alert('Lỗi', 'Firebase chưa được khởi tạo');
        return;
      }

      const otpQuery = query(
        collection(db, 'password_reset_otps'),
        where('email', '==', email.toLowerCase()),
        where('otp', '==', otpCode)
      );

      const otpSnapshot = await getDocs(otpQuery);
      
      if (otpSnapshot.empty) {
        Alert.alert('Lỗi', 'Mã OTP không hợp lệ hoặc đã hết hạn');
        return;
      }

      // Kiểm tra thời gian hết hạn (15 phút)
      const otpDoc = otpSnapshot.docs[0];
      const otpData = otpDoc.data();
      const createdAt = otpData.createdAt?.toDate();
      
      if (!createdAt) {
        Alert.alert('Lỗi', 'Dữ liệu OTP không hợp lệ');
        return;
      }

      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (diffMinutes > 15) {
        Alert.alert('Lỗi', 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
        return;
      }

      console.log('✅ OTP verified successfully');
      setVerifiedOtp(otpCode);
      setStep('newPassword');
      Alert.alert('Thành công!', 'Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.');
      
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      Alert.alert('Lỗi', 'Không thể xác minh OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Reset mật khẩu - CẬP NHẬT TRỰC TIẾP (KHÔNG CẦN CLOUD FUNCTION)
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Resetting password for:', email);

      if (!db) {
        throw new Error('Firestore chưa được khởi tạo');
      }

      // 1. Kiểm tra OTP vẫn còn hợp lệ
      const otpQuery = query(
        collection(db, 'password_reset_otps'),
        where('email', '==', email.toLowerCase()),
        where('otp', '==', verifiedOtp)
      );

      const otpSnapshot = await getDocs(otpQuery);
      
      if (otpSnapshot.empty) {
        Alert.alert(
          'Mã OTP đã hết hạn',
          'Mã OTP của bạn đã hết hiệu lực. Vui lòng yêu cầu mã mới.',
          [
            {
              text: 'Yêu cầu mã mới',
              onPress: () => {
                setStep('email');
                setOtp(['', '', '', '', '', '']);
                setVerifiedOtp('');
              },
            },
          ]
        );
        return;
      }

      const otpDoc = otpSnapshot.docs[0];
      const otpData = otpDoc.data();
      const createdAt = otpData.createdAt?.toDate();
      
      if (!createdAt) {
        Alert.alert('Lỗi', 'Dữ liệu OTP không hợp lệ');
        return;
      }

      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      console.log('⏱️ OTP age (minutes):', diffMinutes);
      
      if (diffMinutes > 15) {
        Alert.alert(
          'Mã OTP đã hết hạn',
          `Mã OTP đã quá ${Math.floor(diffMinutes)} phút. Vui lòng yêu cầu mã mới.`,
          [
            {
              text: 'Yêu cầu mã mới',
              onPress: () => {
                setStep('email');
                setOtp(['', '', '', '', '', '']);
                setVerifiedOtp('');
              },
            },
          ]
        );
        return;
      }

      // 2. Tìm user trong Firestore
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        throw new Error('Không tìm thấy tài khoản');
      }

      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userUid = userData.uid;
      
      if (!userUid) {
        throw new Error('Không tìm thấy UID của user');
      }
      
      console.log('✅ [FORGOT-PW] User found with UID:', userUid);
      
      // 3. Lấy password cũ (nếu có)
      const oldPassword = userData.password;
      
      // 4. CẬP NHẬT FIRESTORE TRƯỚC (vì user đã verify qua OTP)
      await updateDoc(userDoc.ref, {
        password: newPassword,
        oldPassword: oldPassword || '', // Lưu password cũ để sync sau
        passwordResetAt: serverTimestamp(), // Đánh dấu thời điểm reset
        updatedAt: serverTimestamp(),
      });
      
      console.log('✅ [FORGOT-PW] Password updated in Firestore');
      
      // 5. THỬ sync Firebase Auth (KHÔNG BẮT BUỘC - best effort)
      try {
        const { signInWithEmailAndPassword, updatePassword: updateAuthPassword, signOut: authSignOut } = await import('firebase/auth');
        
        if (!auth) {
          throw new Error('Auth chưa khởi tạo');
        }
        
        if (oldPassword) {
          console.log('🔄 [FORGOT-PW] Attempting to sync Firebase Auth password...');
          
          try {
            // Thử đăng nhập với password cũ
            const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), oldPassword);
            
            // Cập nhật Firebase Auth password
            await updateAuthPassword(userCredential.user, newPassword);
            console.log('✅ [FORGOT-PW] Firebase Auth password synced successfully');
            
            // Sign out
            await authSignOut(auth);
            console.log('✅ [FORGOT-PW] Signed out after sync');
            
          } catch (signInError: any) {
            console.warn('⚠️ [FORGOT-PW] Could not sync Firebase Auth with old password:', signInError.code);
            console.log('ℹ️ [FORGOT-PW] Will sync on next login');
          }
        } else {
          console.log('ℹ️ [FORGOT-PW] No old password to sync, will sync on login');
        }
        
      } catch (authError: any) {
        console.warn('⚠️ [FORGOT-PW] Firebase Auth sync failed (non-critical):', authError);
        console.log('ℹ️ [FORGOT-PW] User can still login with Firestore password');
      }

      // 5. Xóa OTP đã sử dụng
      await deleteDoc(otpDoc.ref);
      console.log('✅ [FORGOT-PW] OTP deleted');

      // Chuyển sang màn hình success
      setStep('success');
      console.log('✅ [FORGOT-PW] Password reset complete');
      
    } catch (error: any) {
      console.error('❌ [FORGOT-PW] Error resetting password:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/backgourd.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.push('/login')} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập email để nhận mã OTP đặt lại mật khẩu
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {step === 'email' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập email của bạn"
                      placeholderTextColor="#64748b"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.resetButtonText}>Gửi mã OTP</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={24} color="#00BCD4" />
                  <Text style={styles.infoText}>
                    Mã OTP sẽ được gửi đến Gmail của bạn. Vui lòng kiểm tra hộp thư kể cả thư mục Spam.
                  </Text>
                </View>
              </>
            )}

            {step === 'otp' && (
              <>
                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>Nhập mã OTP (6 số) đã gửi đến email của bạn</Text>
                  <View style={styles.otpInputContainer}>
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => { otpInputRefs.current[index] = ref; }}
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(index, key)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                  {countdown > 0 && (
                    <Text style={styles.countdownText}>
                      Gửi lại OTP sau {countdown}s
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.resetButtonText}>Xác minh mã OTP</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  disabled={countdown > 0}
                >
                  <Text style={[
                    styles.resendButtonText,
                    countdown > 0 && styles.resendButtonTextDisabled
                  ]}>
                    Gửi lại mã OTP
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {step === 'newPassword' && (
              <>
                <View style={styles.successCheckContainer}>
                  <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                  <Text style={styles.otpVerifiedText}>Mã OTP đã được xác minh!</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập mật khẩu mới"
                      placeholderTextColor="#64748b"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#64748b" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="#64748b"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons 
                        name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color="#64748b" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.resetButtonText}>Đổi mật khẩu</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.warningBox}>
                  <Ionicons name="information-circle-outline" size={20} color="#00BCD4" />
                  <Text style={styles.warningText}>
                    Nhập mật khẩu mới và bấm "Đổi mật khẩu" để hoàn tất.
                  </Text>
                </View>
              </>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10b981" />
                <Text style={styles.successTitle}>Thành công!</Text>
                <Text style={styles.successText}>
                  Mật khẩu đã được thay đổi.{'\n'}
                  Bạn có thể đăng nhập ngay.
                </Text>
                
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#00BCD4',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  resetButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#94a3b8',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F7FA',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#006064',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  successNote: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#00BCD4',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  successCheckContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  otpVerifiedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginTop: 12,
  },
});
