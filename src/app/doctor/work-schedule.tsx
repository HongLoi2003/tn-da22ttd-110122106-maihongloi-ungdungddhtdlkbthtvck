import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getDocumentById, updateDocument } from '../services/firebaseService';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DaySchedule {
  day: string;
  dayName: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export default function DoctorWorkSchedule() {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    {
      day: 'monday',
      dayName: 'Thứ 2',
      enabled: true,
      timeSlots: [
        { id: '1', time: '08:00', available: true },
        { id: '2', time: '09:00', available: true },
        { id: '3', time: '10:00', available: true },
        { id: '4', time: '11:00', available: false },
        { id: '5', time: '14:00', available: true },
        { id: '6', time: '15:00', available: true },
        { id: '7', time: '16:00', available: true },
        { id: '8', time: '17:00', available: false },
      ],
    },
    {
      day: 'tuesday',
      dayName: 'Thứ 3',
      enabled: true,
      timeSlots: [
        { id: '1', time: '08:00', available: true },
        { id: '2', time: '09:00', available: true },
        { id: '3', time: '10:00', available: true },
        { id: '4', time: '11:00', available: true },
        { id: '5', time: '14:00', available: true },
        { id: '6', time: '15:00', available: true },
        { id: '7', time: '16:00', available: true },
        { id: '8', time: '17:00', available: true },
      ],
    },
    {
      day: 'wednesday',
      dayName: 'Thứ 4',
      enabled: true,
      timeSlots: [
        { id: '1', time: '08:00', available: true },
        { id: '2', time: '09:00', available: true },
        { id: '3', time: '10:00', available: true },
        { id: '4', time: '11:00', available: true },
        { id: '5', time: '14:00', available: true },
        { id: '6', time: '15:00', available: true },
        { id: '7', time: '16:00', available: true },
        { id: '8', time: '17:00', available: true },
      ],
    },
    {
      day: 'thursday',
      dayName: 'Thứ 5',
      enabled: true,
      timeSlots: [
        { id: '1', time: '08:00', available: true },
        { id: '2', time: '09:00', available: true },
        { id: '3', time: '10:00', available: true },
        { id: '4', time: '11:00', available: true },
        { id: '5', time: '14:00', available: true },
        { id: '6', time: '15:00', available: true },
        { id: '7', time: '16:00', available: true },
        { id: '8', time: '17:00', available: true },
      ],
    },
    {
      day: 'friday',
      dayName: 'Thứ 6',
      enabled: true,
      timeSlots: [
        { id: '1', time: '08:00', available: true },
        { id: '2', time: '09:00', available: true },
        { id: '3', time: '10:00', available: true },
        { id: '4', time: '11:00', available: true },
        { id: '5', time: '14:00', available: true },
        { id: '6', time: '15:00', available: true },
        { id: '7', time: '16:00', available: false },
        { id: '8', time: '17:00', available: false },
      ],
    },
    {
      day: 'saturday',
      dayName: 'Thứ 7',
      enabled: true,
      timeSlots: [
        { id: '1', time: '08:00', available: true },
        { id: '2', time: '09:00', available: true },
        { id: '3', time: '10:00', available: true },
        { id: '4', time: '11:00', available: true },
        { id: '5', time: '14:00', available: false },
        { id: '6', time: '15:00', available: false },
        { id: '7', time: '16:00', available: false },
        { id: '8', time: '17:00', available: false },
      ],
    },
    {
      day: 'sunday',
      dayName: 'Chủ nhật',
      enabled: false,
      timeSlots: [
        { id: '1', time: '08:00', available: false },
        { id: '2', time: '09:00', available: false },
        { id: '3', time: '10:00', available: false },
        { id: '4', time: '11:00', available: false },
        { id: '5', time: '14:00', available: false },
        { id: '6', time: '15:00', available: false },
        { id: '7', time: '16:00', available: false },
        { id: '8', time: '17:00', available: false },
      ],
    },
  ]);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      // ✅ Use display doctor ID for work schedule
      const displayDoctorId = (userData?.doctorInfo as any)?.doctorId;
      
      if (!displayDoctorId) {
        console.log('❌ No doctorId found');
        setLoading(false);
        return;
      }

      console.log('🔍 Loading work schedule for doctor:', displayDoctorId);
      
      // Load schedule from Firebase
      const doctorData = await getDocumentById('doctors', displayDoctorId);
      
      if (doctorData && (doctorData as any).workSchedule) {
        console.log('✅ Loaded work schedule from Firebase');
        setSchedule((doctorData as any).workSchedule);
      } else {
        console.log('ℹ️ No saved schedule, using default');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading schedule:', error);
      setLoading(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].enabled = !newSchedule[dayIndex].enabled;
    setSchedule(newSchedule);
  };

  const toggleTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].timeSlots[slotIndex].available = 
      !newSchedule[dayIndex].timeSlots[slotIndex].available;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // ✅ Use display doctor ID for saving schedule
      const displayDoctorId = (userData?.doctorInfo as any)?.doctorId;
      
      if (!displayDoctorId) {
        console.log('❌ No doctorId found');
        setSaving(false);
        return;
      }

      console.log('💾 Saving work schedule for doctor:', displayDoctorId);
      
      // Save schedule to Firebase
      await updateDocument('doctors', displayDoctorId, {
        workSchedule: schedule,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Work schedule saved successfully');
      setSaving(false);
      router.back();
    } catch (error) {
      console.error('❌ Error saving schedule:', error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch làm việc</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch làm việc</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoBannerText}>
            Cài đặt lịch làm việc để bệnh nhân có thể đặt lịch khám
          </Text>
        </View>

        {/* Schedule by Day */}
        {schedule.map((daySchedule, dayIndex) => (
          <View key={daySchedule.day} style={styles.daySection}>
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <View style={styles.dayHeaderLeft}>
                <Text style={styles.dayName}>{daySchedule.dayName}</Text>
                <Text style={styles.daySubtext}>
                  {daySchedule.enabled 
                    ? `${daySchedule.timeSlots.filter(s => s.available).length} khung giờ`
                    : 'Không làm việc'
                  }
                </Text>
              </View>
              <Switch
                value={daySchedule.enabled}
                onValueChange={() => toggleDay(dayIndex)}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            </View>

            {/* Time Slots */}
            {daySchedule.enabled && (
              <View style={styles.timeSlotsContainer}>
                <Text style={styles.timeSlotsTitle}>Khung giờ khám:</Text>
                <View style={styles.timeSlots}>
                  {daySchedule.timeSlots.map((slot, slotIndex) => (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlot,
                        slot.available && styles.timeSlotActive
                      ]}
                      onPress={() => toggleTimeSlot(dayIndex, slotIndex)}
                    >
                      <Ionicons 
                        name={slot.available ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={slot.available ? "#10b981" : "#ef4444"} 
                      />
                      <Text style={[
                        styles.timeSlotText,
                        slot.available && styles.timeSlotTextActive
                      ]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Thao tác nhanh</Text>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              const newSchedule = schedule.map(day => ({
                ...day,
                enabled: true,
                timeSlots: day.timeSlots.map(slot => ({ ...slot, available: true }))
              }));
              setSchedule(newSchedule);
            }}
          >
            <Ionicons name="checkmark-done" size={20} color="#10b981" />
            <Text style={styles.quickActionText}>Bật tất cả khung giờ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              const newSchedule = schedule.map(day => ({
                ...day,
                timeSlots: day.timeSlots.map(slot => ({ ...slot, available: false }))
              }));
              setSchedule(newSchedule);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#ef4444" />
            <Text style={styles.quickActionText}>Tắt tất cả khung giờ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              const newSchedule = schedule.map(day => ({
                ...day,
                enabled: day.day !== 'sunday',
                timeSlots: day.timeSlots.map(slot => ({
                  ...slot,
                  available: day.day !== 'sunday'
                }))
              }));
              setSchedule(newSchedule);
            }}
          >
            <Ionicons name="calendar" size={20} color="#3b82f6" />
            <Text style={styles.quickActionText}>Làm việc T2-T7</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00BCD4',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  daySection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  daySubtext: {
    fontSize: 13,
    color: '#64748b',
  },
  timeSlotsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  timeSlotsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  timeSlotActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#10b981',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  timeSlotTextActive: {
    color: '#10b981',
  },
  quickActions: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
});
