import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Tool {
  name: string;
  description: string;
  icon: string;
  path: string;
  category: string;
}

const tools: Tool[] = [
  // Chat Debug Tools
  { name: 'Chat Debug Center', description: '🎯 Trung tâm debug hệ thống chat', icon: 'chatbubbles', path: '/chat-debug-center', category: 'Chat Debug' },
  { name: 'Quick Check 16 Doctors', description: 'Kiểm tra nhanh chat 16 bác sĩ', icon: 'search', path: '/quick-check-all-doctors-chat', category: 'Chat Debug' },
  { name: 'Check All Doctors Chat', description: 'Kiểm tra chi tiết chat tất cả bác sĩ', icon: 'analytics', path: '/check-all-doctors-chat-status', category: 'Chat Debug' },
  { name: 'Debug Chat Issue', description: 'Debug vấn đề chat cụ thể', icon: 'bug', path: '/debug-chat-issue', category: 'Chat Debug' },
  
  // Debug Tools
  { name: 'Debug Auth State', description: 'Kiểm tra trạng thái authentication', icon: 'shield-checkmark', path: '/_dev/debug/debug-auth-state', category: 'Debug' },
  { name: 'Debug Firebase Login', description: 'Debug Firebase login', icon: 'log-in', path: '/_dev/debug/debug-firebase-login', category: 'Debug' },
  { name: 'Debug Appointments', description: 'Debug appointments data', icon: 'calendar', path: '/_dev/debug/debug-appointments', category: 'Debug' },
  { name: 'Debug Conversations', description: 'Debug chat conversations', icon: 'chatbubbles', path: '/_dev/debug/debug-conversations', category: 'Debug' },
  
  // Check Tools
  { name: 'Check Firestore Rules', description: 'Kiểm tra Firestore security rules', icon: 'shield', path: '/_dev/check/check-firestore-rules', category: 'Check' },
  { name: 'Check User Roles', description: 'Kiểm tra và sửa user roles', icon: 'people', path: '/_dev/check/check-user-role', category: 'Check' },
  { name: 'Check Doctor Auth UID', description: 'Kiểm tra authUid của bác sĩ', icon: 'medical', path: '/_dev/check/check-all-doctors-auth-uid', category: 'Check' },
  { name: 'Check Doctor IDs', description: 'Kiểm tra doctorInfo.doctorId của tất cả bác sĩ', icon: 'checkmark-circle', path: '/check-all-doctors-have-doctorid', category: 'Check' },
  
  // Cleanup Tools
  { name: 'Check Duplicate Doctors', description: '🔍 Kiểm tra tài khoản bác sĩ duplicate', icon: 'copy', path: '/check-duplicate-doctors', category: 'Cleanup' },
  { name: 'Delete Duplicate Test Accounts', description: '🗑️ Xóa 2 tài khoản test duplicate', icon: 'trash', path: '/delete-duplicate-test-accounts', category: 'Cleanup' },
  { name: 'Recreate BS001', description: '🏥 Tạo lại tài khoản BS. Nguyễn Văn An', icon: 'person-add', path: '/recreate-bs001-account', category: 'Cleanup' },
  
  // Test Tools
  { name: 'Test Firebase Connection', description: 'Test kết nối Firebase', icon: 'cloud', path: '/_dev/test/test-firebase-connection', category: 'Test' },
  { name: 'Test Symptom Analysis', description: 'Test phân tích triệu chứng', icon: 'fitness', path: '/_dev/test/test-symptom-analysis', category: 'Test' },
  { name: 'Test Gemini AI', description: 'Test Gemini AI integration', icon: 'sparkles', path: '/_dev/test/test-gemini-ai', category: 'Test' },
  
  // Seed Tools
  { name: 'Seed Medical Data', description: 'Tạo dữ liệu y tế mẫu', icon: 'medkit', path: '/_dev/seed/seed-medical-data', category: 'Seed' },
  { name: 'Seed Doctor Accounts', description: 'Tạo tài khoản bác sĩ mẫu', icon: 'person-add', path: '/_dev/seed/seed-doctor-accounts', category: 'Seed' },
  { name: 'Seed Specialties', description: 'Tạo dữ liệu chuyên khoa', icon: 'list', path: '/_dev/seed/seed-specialties', category: 'Seed' },
];

export default function DevToolsScreen() {
  const router = useRouter();
  
  const categories = Array.from(new Set(tools.map(t => t.category)));
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Development Tools</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.banner}>
          <Ionicons name="construct" size={48} color="#00BCD4" />
          <Text style={styles.bannerTitle}>🛠️ Dev Tools</Text>
          <Text style={styles.bannerSubtitle}>
            Công cụ phát triển và debug
          </Text>
        </View>

        {categories.map(category => {
          const categoryTools = tools.filter(t => t.category === category);
          return (
            <View key={category} style={styles.section}>
              <Text style={styles.sectionTitle}>{category} ({categoryTools.length})</Text>
              {categoryTools.map((tool, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.toolCard}
                  onPress={() => {
                    try {
                      router.push(tool.path as any);
                    } catch (error) {
                      console.error('Navigation error:', error);
                      alert('Không thể mở tool này. Path: ' + tool.path);
                    }
                  }}
                >
                  <View style={styles.toolIcon}>
                    <Ionicons name={tool.icon as any} size={24} color="#00BCD4" />
                  </View>
                  <View style={styles.toolInfo}>
                    <Text style={styles.toolName}>{tool.name}</Text>
                    <Text style={styles.toolDescription}>{tool.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ⚠️ Chỉ sử dụng trong môi trường development
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#00BCD4',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  banner: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
