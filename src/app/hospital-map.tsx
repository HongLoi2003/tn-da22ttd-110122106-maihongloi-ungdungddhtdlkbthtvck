import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Hospital {
  id: number;
  name: string;
  distance: string;
  address: string;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  image: any;
}

export default function HospitalMapScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  const hospitals: Hospital[] = [
    {
      id: 1,
      name: 'Bệnh viện Trường Đại học Trà Vinh',
      distance: '1.2 km',
      address: '201B Nguyễn Chí Thanh, Quận 5, TP. HCM',
      rating: 4.6,
      reviews: 1256,
      lat: 10.7547,
      lng: 106.6636,
      image: { uri: "https://via.placeholder.com/150" },
    },
    {
      id: 2,
      name: 'Bệnh viện Đa khoa Quốc tế Vinmec',
      distance: '2.5 km',
      address: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP. HCM',
      rating: 4.8,
      reviews: 842,
      lat: 10.7891,
      lng: 106.7198,
      image: { uri: "https://via.placeholder.com/150" },
    },
    {
      id: 3,
      name: 'Bệnh viện FV',
      distance: '3.1 km',
      address: '06 Nguyễn Lương Bằng, Quận 7, TP. HCM',
      rating: 4.7,
      reviews: 615,
      lat: 10.7359,
      lng: 106.7217,
      image: { uri: "https://via.placeholder.com/150" },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản đồ bệnh viện</Text>
        <TouchableOpacity onPress={() => router.push('/find-hospital')}>
          <Ionicons name="list" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bệnh viện..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity>
          <Ionicons name="options-outline" size={20} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={80} color="#00BCD4" />
          <Text style={styles.mapPlaceholderText}>Bản đồ hiển thị ở đây</Text>
          <Text style={styles.mapNote}>
            Tích hợp Google Maps hoặc MapView để hiển thị vị trí các bệnh viện
          </Text>
        </View>

        {/* Map Markers Info */}
        {hospitals.map((hospital, index) => (
          <TouchableOpacity
            key={hospital.id}
            style={[
              styles.markerInfo,
              { top: 100 + index * 80, left: 50 + index * 60 }
            ]}
            onPress={() => setSelectedHospital(hospital)}
          >
            <View style={styles.marker}>
              <Ionicons name="location" size={32} color="#FF4444" />
            </View>
          </TouchableOpacity>
        ))}

        {/* My Location Button */}
        <TouchableOpacity style={styles.myLocationButton}>
          <Ionicons name="navigate" size={24} color="#00BCD4" />
        </TouchableOpacity>
      </View>

      {/* Hospital List Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Bệnh viện gần bạn ({hospitals.length})</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.hospitalScroll}
        >
          {hospitals.map((hospital, index) => (
            <TouchableOpacity
              key={`${hospital.id}-${index}`}
              style={[
                styles.hospitalCard,
                selectedHospital?.id === hospital.id && styles.hospitalCardActive
              ]}
              onPress={() => {
                setSelectedHospital(hospital);
                router.push({
                  pathname: '/hospital-detail',
                  params: { name: hospital.name, id: hospital.id }
                });
              }}
            >
              <Image source={hospital.image} style={styles.hospitalImage} />
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName} numberOfLines={2}>
                  {hospital.name}
                </Text>
                <View style={styles.distanceRow}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Text style={styles.distanceText}>{hospital.distance}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>
                    {hospital.rating} ({hospital.reviews})
                  </Text>
                </View>
                <TouchableOpacity style={styles.directionButton}>
                  <Ionicons name="navigate" size={16} color="#00BCD4" />
                  <Text style={styles.directionText}>Chỉ đường</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    padding: 32,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00BCD4',
    marginTop: 16,
    marginBottom: 8,
  },
  mapNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  markerInfo: {
    position: 'absolute',
  },
  marker: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  hospitalScroll: {
    paddingHorizontal: 16,
  },
  hospitalCard: {
    width: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  hospitalCardActive: {
    borderColor: '#00BCD4',
  },
  hospitalImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  hospitalInfo: {
    padding: 12,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    height: 36,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  directionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#E0F7FA',
    borderRadius: 8,
  },
  directionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
});
