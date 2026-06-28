import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { articleData } from './article-data';

export default function DebugArticles() {
  const router = useRouter();

  const allArticles = Object.keys(articleData).map(key => ({
    id: key,
    title: articleData[key].title,
    category: articleData[key].category,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>DEBUG: Article IDs</Text>
      <ScrollView>
        {allArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.item}
            onPress={() => {
              console.log('Navigating to:', article.id);
              router.push({
                pathname: '/article-detail',
                params: { articleId: article.id }
              });
            }}
          >
            <Text style={styles.id}>ID: "{article.id}"</Text>
            <Text style={styles.title}>{article.title}</Text>
            <Text style={styles.category}>{article.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#00BCD4',
    color: '#fff',
  },
  item: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  id: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff5722',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
  },
});
