import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Copy hàm analyzeSymptoms từ ai-chat.tsx
const analyzeSymptoms = (text: string): { name: string; match: number; icon: string }[] => {
  const lowerText = text.toLowerCase().trim();
  
  const specialties: { [key: string]: { 
    name: string; 
    icon: string; 
    keywords: { word: string; weight: number; synonyms: string[] }[] 
  } } = {
    'than_kinh': {
      name: 'Thần kinh',
      icon: '🧠',
      keywords: [
        { word: 'đau đầu', weight: 10, synonyms: ['nhức đầu', 'đầu đau', 'dau dau', 'đau đầu dữ dội'] },
        { word: 'chóng mặt', weight: 9, synonyms: ['hoa mắt', 'choáng', 'choang', 'chong mat', 'hoa mat', 'váng đầu'] },
        { word: 'mất ngủ', weight: 8, synonyms: ['khó ngủ', 'không ngủ được', 'mat ngu', 'kho ngu', 'thức đêm', 'mất giấc'] },
        { word: 'run tay chân', weight: 9, synonyms: ['run tay', 'run chân', 'run rẩy', 'rung', 'run liên tục'] },
        { word: 'tê tay chân', weight: 9, synonyms: ['tê bì', 'tê tay', 'tê chân', 'tê liệt', 'tê mỏi'] },
      ]
    },
    'xuong_khop': {
      name: 'Cơ xương khớp',
      icon: '🦴',
      keywords: [
        { word: 'đau lưng', weight: 10, synonyms: ['nhức lưng', 'dau lung', 'lung dau', 'lưng đau', 'đau thắt lưng'] },
        { word: 'đau cổ vai gáy', weight: 9, synonyms: ['đau cổ', 'đau vai', 'đau gáy', 'nhức cổ vai', 'cứng cổ'] },
        { word: 'đau khớp gối', weight: 10, synonyms: ['đau gối', 'nhức gối', 'gối đau', 'dau goi'] },
      ]
    },
    'tim_mach': {
      name: 'Tim mạch',
      icon: '❤️',
      keywords: [
        { word: 'đau ngực', weight: 10, synonyms: ['tức ngực', 'ngực đau', 'dau nguc', 'nhức ngực'] },
        { word: 'khó thở', weight: 10, synonyms: ['thở khó', 'kho tho', 'thở gấp', 'hụt hơi'] },
        { word: 'tim đập nhanh', weight: 9, synonyms: ['hồi hộp', 'tim nhanh', 'đánh trống ngực'] },
      ]
    },
    'tieu_hoa': {
      name: 'Tiêu hóa',
      icon: '🍽️',
      keywords: [
        { word: 'đau bụng', weight: 10, synonyms: ['nhức bụng', 'bụng đau', 'dau bung'] },
        { word: 'tiêu chảy', weight: 10, synonyms: ['ỉa chảy', 'đi ngoài', 'tieu chay'] },
        { word: 'buồn nôn', weight: 9, synonyms: ['nôn', 'ói', 'muốn nôn', 'buon non'] },
      ]
    },
    'ho_hap': {
      name: 'Hô hấp',
      icon: '🫁',
      keywords: [
        { word: 'ho', weight: 10, synonyms: ['ho khan', 'ho có đờm', 'ho đờm'] },
        { word: 'đau họng', weight: 9, synonyms: ['họng đau', 'dau hong', 'viêm họng'] },
        { word: 'nghẹt mũi', weight: 8, synonyms: ['ngạt mũi', 'tắc mũi', 'nghet mui'] },
      ]
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  };

  const scores: { [key: string]: number } = {};

  Object.keys(specialties).forEach(specialtyKey => {
    let totalScore = 0;
    const specialty = specialties[specialtyKey];

    specialty.keywords.forEach(keywordObj => {
      if (lowerText.includes(keywordObj.word)) {
        totalScore += keywordObj.weight * 1.0;
      }

      keywordObj.synonyms.forEach(synonym => {
        if (lowerText.includes(synonym)) {
          totalScore += keywordObj.weight * 0.9;
        }
      });

      const words = lowerText.split(/\s+/);
      words.forEach(word => {
        const similarity1 = calculateSimilarity(word, keywordObj.word);
        if (similarity1 >= 0.75 && similarity1 < 1.0) {
          totalScore += keywordObj.weight * 0.7 * similarity1;
        }

        keywordObj.synonyms.forEach(synonym => {
          const similarity2 = calculateSimilarity(word, synonym);
          if (similarity2 >= 0.75 && similarity2 < 1.0) {
            totalScore += keywordObj.weight * 0.6 * similarity2;
          }
        });
      });
    });

    if (totalScore > 0) {
      scores[specialtyKey] = totalScore;
    }
  });

  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (sorted.length === 0) {
    return [];
  }

  const maxScore = sorted[0][1];

  return sorted.map(([key, score]) => ({
    name: specialties[key].name,
    icon: specialties[key].icon,
    match: Math.min(Math.round((score / maxScore) * 100), 98)
  }));
};

export default function TestSymptomAnalyzer() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const testCases = [
    "đau đầu và chóng mặt",
    "đau lưng nhức lưng",
    "đau ngực khó thở",
    "đau bụng tiêu chảy",
    "ho và đau họng",
    "dau dau va chong mat", // Test gõ sai
    "nhức đầu hoa mắt", // Test synonym
  ];

  const handleTest = () => {
    const analyzed = analyzeSymptoms(input);
    setResults(analyzed);
  };

  const handleQuickTest = (testCase: string) => {
    setInput(testCase);
    const analyzed = analyzeSymptoms(testCase);
    setResults(analyzed);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Test Phân Tích Triệu Chứng</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nhập triệu chứng:</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ví dụ: đau đầu và chóng mặt"
          multiline
        />
        
        <TouchableOpacity style={styles.button} onPress={handleTest}>
          <Text style={styles.buttonText}>Phân tích</Text>
        </TouchableOpacity>

        {results.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Kết quả:</Text>
            {results.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultIcon}>{result.icon}</Text>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.resultMatch}>Độ tin cậy: {result.match}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.quickTests}>
          <Text style={styles.quickTestsTitle}>Test nhanh:</Text>
          {testCases.map((testCase, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickTestButton}
              onPress={() => handleQuickTest(testCase)}
            >
              <Text style={styles.quickTestText}>{testCase}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 80,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  results: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  resultIcon: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  resultMatch: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  quickTests: {
    marginTop: 24,
  },
  quickTestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  quickTestButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickTestText: {
    fontSize: 13,
    color: '#4A90E2',
  },
});
