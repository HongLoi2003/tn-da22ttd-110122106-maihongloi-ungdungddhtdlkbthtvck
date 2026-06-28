import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import doctorListService from './services/doctorListService';

export default function TestDoctorPrices() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    const data = doctorListService.getAllDoctors();
    console.log('🧪 [TEST] Raw data:', data);
    setDoctors(data);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Test Doctor Prices</Text>
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.ten}</Text>
            <Text style={styles.specialty}>{item.chuyen_khoa}</Text>
            <Text style={styles.price}>
              Giá: {item.gia_kham ? item.gia_kham.toLocaleString('vi-VN') : 'N/A'}đ
            </Text>
            <Text style={styles.debug}>Raw value: {JSON.stringify(item.gia_kham)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#00BCD4' },
  backButton: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  card: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: 'bold' },
  specialty: { fontSize: 14, color: '#666', marginTop: 4 },
  price: { fontSize: 16, color: '#00BCD4', marginTop: 8, fontWeight: '600' },
  debug: { fontSize: 12, color: '#999', marginTop: 4 },
});
