import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TestWeb() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 HealthCare App</Text>
        <Text style={styles.subtitle}>Web Version Test</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Web is working!</Text>
        <Text style={styles.cardText}>
          If you can see this screen, your web version is running correctly.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Features</Text>
        <Text style={styles.cardText}>• Book doctor appointments</Text>
        <Text style={styles.cardText}>• AI symptom checker</Text>
        <Text style={styles.cardText}>• Chat with doctors</Text>
        <Text style={styles.cardText}>• Medical records</Text>
        <Text style={styles.cardText}>• Health insurance</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔍 Next Steps</Text>
        <Text style={styles.cardText}>
          1. Check browser console (F12) for any errors
        </Text>
        <Text style={styles.cardText}>
          2. Navigate to /login to test authentication
        </Text>
        <Text style={styles.cardText}>
          3. Use device toolbar (Ctrl+Shift+M) for mobile view
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#00BCD4',
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    lineHeight: 24,
  },
});
