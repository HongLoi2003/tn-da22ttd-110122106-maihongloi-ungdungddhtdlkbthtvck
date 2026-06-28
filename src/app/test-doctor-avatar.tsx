import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

// Helper function to get doctor image
const getDoctorImage = (imageName: string) => {
  const images: { [key: string]: any } = {
    'nguyenvanam.png': { uri: 'https://images.pexels.com/photos/26336880/pexels-photo-26336880.jpeg' },
    'tranthilan.png': { uri: 'https://images.pexels.com/photos/15641079/pexels-photo-15641079.jpeg' },
    'leminhtam.png': { uri: 'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg' },
    'hoangvanduc.png': { uri: 'https://images.pexels.com/photos/27666713/pexels-photo-27666713.jpeg' },
    'vuthilan.png': { uri: 'https://images.pexels.com/photos/27392531/pexels-photo-27392531.jpeg' },
    'tranthimai.png': { uri: 'https://images.pexels.com/photos/27666717/pexels-photo-27666717.jpeg' },
    'dominhtuan.png': { uri: 'https://images.pexels.com/photos/14628069/pexels-photo-14628069.jpeg' },
    'ngothihuong.png': { uri: 'https://images.pexels.com/photos/14628046/pexels-photo-14628046.jpeg' },
    'nguyenvanhai.png': { uri: 'https://images.pexels.com/photos/19601385/pexels-photo-19601385.jpeg' },
    'nguyenthihoa.png': { uri: 'https://images.pexels.com/photos/14628045/pexels-photo-14628045.jpeg' },
    'tranvankhoa.png': { uri: 'https://images.pexels.com/photos/15962798/pexels-photo-15962798.jpeg' },
    'phamminhquan.png': { uri: 'https://images.pexels.com/photos/29995617/pexels-photo-29995617.jpeg' },
    'lethihang.png': { uri: 'https://images.pexels.com/photos/4173248/pexels-photo-4173248.jpeg' },
    'dangthithao.jpg': { uri: 'https://images.pexels.com/photos/29995629/pexels-photo-29995629.jpeg' },
    'logo.png': require('../assets/images/logo.png'),
  };
  
  if (imageName && images[imageName]) {
    return images[imageName];
  }
  
  return require('../assets/images/logo.png');
};

const doctors = [
  { name: 'BS. Nguyễn Văn An', image: 'nguyenvanam.png' },
  { name: 'BS. Trần Thị Lan', image: 'tranthilan.png' },
  { name: 'BS. Lê Minh Tâm', image: 'leminhtam.png' },
  { name: 'BS. Hoàng Văn Đức', image: 'hoangvanduc.png' },
  { name: 'BS. Vũ Thị Lan', image: 'vuthilan.png' },
  { name: 'BS. Trần Thị Mai', image: 'tranthimai.png' },
  { name: 'BS. Đỗ Minh Tuấn', image: 'dominhtuan.png' },
  { name: 'BS. Ngô Thị Hương', image: 'ngothihuong.png' },
  { name: 'BS. Nguyễn Văn Hải', image: 'nguyenvanhai.png' },
  { name: 'BS. Nguyễn Thị Hoa', image: 'nguyenthihoa.png' },
  { name: 'BS. Trần Văn Khoa', image: 'tranvankhoa.png' },
  { name: 'BS. Phạm Minh Quân', image: 'phamminhquan.png' },
  { name: 'BS. Lê Thị Hằng', image: 'lethihang.png' },
  { name: 'BS. Đặng Thị Thảo', image: 'dangthithao.jpg' },
];

export default function TestDoctorAvatarScreen() {
  const router = useRouter();

  const testNavigation = (doctor: typeof doctors[0]) => {
    router.push({
      pathname: '/doctor-chat',
      params: {
        doctorId: 'test-id',
        doctorName: doctor.name,
        doctorImage: doctor.image,
        doctorSpecialty: 'Chuyên khoa Test',
        doctorPhone: '0901234567',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Doctor Avatars</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#00BCD4" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Hướng dẫn test</Text>
            <Text style={styles.infoText}>
              Bấm vào bất kỳ bác sĩ nào để mở trang chat và kiểm tra xem avatar có hiển thị đúng không.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách bác sĩ</Text>
          {doctors.map((doctor, index) => (
            <TouchableOpacity
              key={index}
              style={styles.doctorCard}
              onPress={() => testNavigation(doctor)}
            >
              <Image
                source={getDoctorImage(doctor.image)}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorImage}>Image: {doctor.image}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  doctorImage: {
    fontSize: 12,
    color: '#64748b',
  },
});
