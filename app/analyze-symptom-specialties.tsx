import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import symptomsMapping from '../symptoms-mapping.json';

interface SymptomAnalysis {
  symptomId: number;
  symptomName: string;
  specialtyCount: number;
  specialties: string[];
}

export default function AnalyzeSymptomSpecialties() {
  const [analysis, setAnalysis] = useState<{
    totalSymptoms: number;
    totalSpecialties: number;
    specialtyList: string[];
    symptomsWithMultipleSpecialties: SymptomAnalysis[];
    symptomDistribution: { [key: number]: number };
  } | null>(null);

  useEffect(() => {
    analyzeData();
  }, []);

  const analyzeData = () => {
    const { symptoms, mappings } = symptomsMapping;

    // Đếm số chuyên khoa
    const specialtySet = new Set(mappings.map(m => m.specialtyName));
    const specialtyList = Array.from(specialtySet);

    // Tạo map: symptomId -> danh sách chuyên khoa
    const symptomToSpecialties: { [key: number]: string[] } = {};
    
    mappings.forEach(mapping => {
      mapping.symptomIds.forEach(symptomId => {
        if (!symptomToSpecialties[symptomId]) {
          symptomToSpecialties[symptomId] = [];
        }
        if (!symptomToSpecialties[symptomId].includes(mapping.specialtyName)) {
          symptomToSpecialties[symptomId].push(mapping.specialtyName);
        }
      });
    });

    // Phân tích triệu chứng xuất hiện ở nhiều chuyên khoa
    const symptomsWithMultiple: SymptomAnalysis[] = [];
    const distribution: { [key: number]: number } = {};

    Object.entries(symptomToSpecialties).forEach(([symptomIdStr, specialties]) => {
      const symptomId = parseInt(symptomIdStr);
      const count = specialties.length;
      
      // Đếm phân bố
      distribution[count] = (distribution[count] || 0) + 1;

      if (count > 1) {
        const symptom = symptoms.find(s => s.id === symptomId);
        if (symptom) {
          symptomsWithMultiple.push({
            symptomId,
            symptomName: symptom.name,
            specialtyCount: count,
            specialties: specialties.sort()
          });
        }
      }
    });

    // Sắp xếp theo số chuyên khoa giảm dần
    symptomsWithMultiple.sort((a, b) => b.specialtyCount - a.specialtyCount);

    setAnalysis({
      totalSymptoms: symptoms.length,
      totalSpecialties: specialtyList.length,
      specialtyList: specialtyList.sort(),
      symptomsWithMultipleSpecialties: symptomsWithMultiple,
      symptomDistribution: distribution
    });
  };

  if (!analysis) {
    return (
      <View style={styles.container}>
        <Text>Đang phân tích...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>📊 PHÂN TÍCH TRIỆU CHỨNG VÀ CHUYÊN KHOA</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tổng quan</Text>
          <Text style={styles.stat}>• Tổng số triệu chứng: {analysis.totalSymptoms}</Text>
          <Text style={styles.stat}>• Tổng số chuyên khoa: {analysis.totalSpecialties}</Text>
          <Text style={styles.stat}>• Triệu chứng trùng nhiều khoa: {analysis.symptomsWithMultipleSpecialties.length}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Danh sách {analysis.totalSpecialties} chuyên khoa</Text>
          {analysis.specialtyList.map((specialty, index) => (
            <Text key={index} style={styles.specialtyItem}>
              {index + 1}. {specialty}
            </Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phân bố triệu chứng theo số chuyên khoa</Text>
          {Object.entries(analysis.symptomDistribution)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([count, total]) => (
              <Text key={count} style={styles.stat}>
                • {total} triệu chứng xuất hiện ở {count} chuyên khoa
              </Text>
            ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🔍 Chi tiết {analysis.symptomsWithMultipleSpecialties.length} triệu chứng trùng nhiều khoa
          </Text>
          {analysis.symptomsWithMultipleSpecialties.map((item, index) => (
            <View key={item.symptomId} style={styles.symptomCard}>
              <Text style={styles.symptomName}>
                {index + 1}. {item.symptomName} ({item.specialtyCount} khoa)
              </Text>
              <Text style={styles.specialtyList}>
                → {item.specialties.join(', ')}
              </Text>
            </View>
          ))}
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
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2196F3',
  },
  stat: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  specialtyItem: {
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 8,
    color: '#555',
  },
  symptomCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  specialtyList: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
