import { Stack } from 'expo-router';

export default function DoctorLayout() {
  // Bỏ loading screen riêng cho doctor, dùng splash-screen chung
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="appointment-detail" />
      <Stack.Screen name="patients" />
      <Stack.Screen name="patient-detail" />
      <Stack.Screen name="chats" />
      <Stack.Screen name="chat-detail" />
    </Stack>
  );
}
