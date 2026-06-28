import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { auth, db, isConfigValid } from './config/firebase';
import { useAuth } from './context/AuthContext';

export default function DebugWeb() {
  const { loading, isLoggedIn, user, userData } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>🔍 Debug Web Platform</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Firebase Config</Text>
          <Text style={styles.text}>Config Valid: {isConfigValid ? '✅ Yes' : '❌ No'}</Text>
          <Text style={styles.text}>Auth: {auth ? '✅ Initialized' : '❌ Not initialized'}</Text>
          <Text style={styles.text}>DB: {db ? '✅ Initialized' : '❌ Not initialized'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Auth State</Text>
          <Text style={styles.text}>Loading: {loading ? '⏳ Yes' : '✅ No'}</Text>
          <Text style={styles.text}>Logged In: {isLoggedIn ? '✅ Yes' : '❌ No'}</Text>
          <Text style={styles.text}>User UID: {user?.uid || 'None'}</Text>
          <Text style={styles.text}>User Email: {user?.email || 'None'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Data</Text>
          <Text style={styles.text}>Full Name: {userData?.fullName || 'None'}</Text>
          <Text style={styles.text}>Role: {userData?.role || 'None'}</Text>
          <Text style={styles.text}>Email: {userData?.email || 'None'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Environment</Text>
          <Text style={styles.text}>Platform: Web</Text>
          <Text style={styles.text}>Window: {typeof window !== 'undefined' ? '✅ Available' : '❌ Not available'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#00BCD4',
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});
