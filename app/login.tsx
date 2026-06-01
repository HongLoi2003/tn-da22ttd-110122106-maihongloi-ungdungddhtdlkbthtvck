import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from './context/AuthContext';
import errorHandler from './utils/errorHandler';
import validator from './utils/validation';

export default function LoginScreen() {
  console.log('🔐 [LOGIN SCREEN] LoginScreen component rendering');
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    // Validate form
    const validation = validator.validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Lỗi xác thực', Object.values(validation.errors)[0]);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      console.log('🚀 [LOGIN] Starting login attempt...');
      console.log('📧 [LOGIN] Email:', email.trim());
      console.log('🔑 [LOGIN] Password length:', password.length);
      
      await login(email.trim(), password);
      console.log('✅ [LOGIN] Login successful!');
      
      // Đợi lâu hơn để auth state và userData update hoàn toàn
      console.log('⏳ [LOGIN] Waiting for auth state to update...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoading(false);
      console.log('🔄 [LOGIN] Navigating to index for role-based routing...');
      router.replace('/' as any);
    } catch (error: any) {
      console.error('❌ [LOGIN] Login failed with error:', error);
      console.error('❌ [LOGIN] Error code:', error?.code);
      console.error('❌ [LOGIN] Error message:', error?.message);
      
      const appError = errorHandler.handleError(error);
      errorHandler.logError(appError);
      
      // Provide helpful error message
      let errorMessage = appError.message;
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
        errorMessage = 'Email hoặc mật khẩu không đúng.\n\nNếu bạn chưa có tài khoản, vui lòng đăng ký trước.';
      }
      
      Alert.alert('Đăng nhập thất bại', errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      // Import service
      const { signInWithGoogle } = await import('./services/googleAuthService');
      
      console.log('🔄 Đang đăng nhập bằng Google...');
      await signInWithGoogle();
      
      console.log('✅ Đăng nhập Google thành công!');
      
      // Đợi auth state update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoadingGoogle(false);
      router.replace('/' as any);
    } catch (error: any) {
      console.error('❌ Lỗi đăng nhập Google:', error);
      
      let errorMessage = 'Không thể đăng nhập bằng Google';
      
      // Web errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Bạn đã đóng cửa sổ đăng nhập';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Trình duyệt đã chặn cửa sổ đăng nhập. Vui lòng cho phép popup.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Yêu cầu đăng nhập đã bị hủy';
      }
      // Mobile errors
      else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Đăng nhập thất bại', errorMessage);
      setLoadingGoogle(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/bckgour.png')}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => router.push('/forgot-password')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={[styles.socialButton, loadingGoogle && styles.socialButtonDisabled]}
              onPress={handleGoogleLogin}
              disabled={loadingGoogle || loading}
            >
              {loadingGoogle ? (
                <ActivityIndicator color="#00BCD4" size="small" />
              ) : (
                <Image
                  source={require('@/assets/images/Google.png')}
                  style={styles.googleIcon}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Alert.alert(
                'Thông báo',
                'Tính năng đăng nhập bằng Facebook đang được phát triển. Vui lòng đăng nhập bằng Email.',
                [{ text: 'OK' }]
              )}
            >
              <Image
                source={require('@/assets/images/Facebook.png')}
                style={styles.facebookIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
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
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  formContainer: {
    paddingBottom: 0,
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
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#0f172a',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  loginButton: {
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
    marginBottom: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#64748b',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    width: 52,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  googleIcon: {
    width: 45,
    height: 45,
  },
  facebookIcon: {
    width: 35,
    height: 35,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  registerText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  registerLink: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
  },
  utilityLink: {
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  utilityLinkText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  doctorLinkContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  doctorLink: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
});
