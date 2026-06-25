import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TestArticleNav() {
  const router = useRouter();

  const testNavigations = [
    { id: '1', title: 'Test Bài 1' },
    { id: '2', title: 'Test Bài 2' },
    { id: '3', title: 'Test Bài 3' },
    { id: 'featured', title: 'Test Featured' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Navigation</Text>
      {testNavigations.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.button}
          onPress={() => {
            console.log('Navigating with articleId:', item.id);
            router.push({
              pathname: '/article-detail',
              params: { articleId: item.id }
            });
          }}
        >
          <Text style={styles.buttonText}>{item.title} (ID: {item.id})</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
