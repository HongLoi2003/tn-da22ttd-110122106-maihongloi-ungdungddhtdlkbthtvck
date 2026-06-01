import { StyleSheet, Text, View } from 'react-native';

export default function TestWebSimple() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ Web is Working!</Text>
      <Text style={styles.text}>If you can see this, React Native Web is rendering correctly.</Text>
      <Text style={styles.text}>Platform: Web</Text>
      <Text style={styles.text}>Time: {new Date().toLocaleTimeString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#00BCD4',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
});
