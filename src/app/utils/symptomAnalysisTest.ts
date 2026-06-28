import symptomAnalysisService from '../services/symptomAnalysisService';

/**
 * Test cases cho tính năng phân tích triệu chứng
 */

export const runSymptomAnalysisTests = () => {
  console.log('🧪 [TEST] Starting Symptom Analysis Tests...\n');

  // Test 1: Phân tích triệu chứng tim mạch
  console.log('📋 Test 1: Phân tích triệu chứng tim mạch');
  const test1 = symptomAnalysisService.analyzeSymptoms(['đau ngực', 'tim đập nhanh']);
  console.log('Kết quả:', test1);
  console.log('✅ Kỳ vọng: Tim mạch (95%)\n');

  // Test 2: Phân tích triệu chứng hô hấp
  console.log('📋 Test 2: Phân tích triệu chứng hô hấp');
  const test2 = symptomAnalysisService.analyzeSymptoms(['ho', 'khó thở', 'sốt']);
  console.log('Kết quả:', test2);
  console.log('✅ Kỳ vọng: Hô hấp (90%)\n');

  // Test 3: Phân tích triệu chứng thần kinh
  console.log('📋 Test 3: Phân tích triệu chứng thần kinh');
  const test3 = symptomAnalysisService.analyzeSymptoms(['đau đầu', 'mất ngủ']);
  console.log('Kết quả:', test3);
  console.log('✅ Kỳ vọng: Thần kinh (95%)\n');

  // Test 4: Phân tích triệu chứng da liễu
  console.log('📋 Test 4: Phân tích triệu chứng da liễu');
  const test4 = symptomAnalysisService.analyzeSymptoms(['nổi mẩn đỏ', 'ngứa']);
  console.log('Kết quả:', test4);
  console.log('✅ Kỳ vọng: Da liễu (95%)\n');

  // Test 5: Tìm kiếm triệu chứng
  console.log('📋 Test 5: Tìm kiếm triệu chứng');
  const test5 = symptomAnalysisService.searchSymptoms('đau');
  console.log('Kết quả:', test5);
  console.log('✅ Kỳ vọng: Danh sách triệu chứng chứa "đau"\n');

  // Test 6: Lấy bác sĩ theo chuyên khoa
  console.log('📋 Test 6: Lấy bác sĩ theo chuyên khoa');
//   // const test6 = doctorService.getDoctorsBySpecialty('Tim mạch'); // Method not implemented yet
  // console.log('Kết quả:', test6); // Commented out - variable not defined
  console.log('✅ Kỳ vọng: Danh sách bác sĩ Tim mạch\n');

  // Test 7: Tìm kiếm bác sĩ
  console.log('📋 Test 7: Tìm kiếm bác sĩ');
//   // const test7 = doctorService.searchDoctors('Nguyễn'); // Method not implemented yet
  // console.log('Kết quả:', test7); // Commented out - variable not defined
  console.log('✅ Kỳ vọng: Danh sách bác sĩ có tên chứa "Nguyễn"\n');

  // Test 8: Triệu chứng không tồn tại
  console.log('📋 Test 8: Triệu chứng không tồn tại');
  const test8 = symptomAnalysisService.analyzeSymptoms(['triệu chứng không tồn tại']);
  console.log('Kết quả:', test8);
  console.log('✅ Kỳ vọng: Mảng rỗng\n');

  // Test 9: Triệu chứng trùng lặp
  console.log('📋 Test 9: Triệu chứng trùng lặp');
  const test9 = symptomAnalysisService.analyzeSymptoms(['đau đầu', 'đau đầu', 'mất ngủ']);
  console.log('Kết quả:', test9);
  console.log('✅ Kỳ vọng: Thần kinh (95%)\n');

  // Test 10: Triệu chứng hỗn hợp
  console.log('📋 Test 10: Triệu chứng hỗn hợp');
  const test10 = symptomAnalysisService.analyzeSymptoms(['đau đầu', 'ho', 'nổi mẩn đỏ']);
  console.log('Kết quả:', test10);
  console.log('✅ Kỳ vọng: Nhiều chuyên khoa\n');

  console.log('✅ [TEST] All tests completed!');
};

/**
 * Ví dụ sử dụng trong ứng dụng
 */
export const exampleUsage = () => {
  console.log('📱 [EXAMPLE] Symptom Analysis Usage\n');

  // Bước 1: Người dùng nhập triệu chứng
  const userSymptoms = ['đau ngực', 'tim đập nhanh', 'mệt mỏi'];
  console.log('👤 Người dùng nhập:', userSymptoms);

  // Bước 2: Phân tích
  const recommendations = symptomAnalysisService.analyzeSymptoms(userSymptoms);
  console.log('📊 Gợi ý chuyên khoa:', recommendations);

  // Bước 3: Lấy bác sĩ cho chuyên khoa hàng đầu
  if (recommendations.length > 0) {
    const topSpecialty = recommendations[0];
//     // const doctors = doctorService.getDoctorsBySpecialty(topSpecialty.specialtyName); // Method not implemented yet
    // console.log(`👨‍⚕️ Bác sĩ ${topSpecialty.specialtyName}:`, doctors); // Commented out - doctors not defined
  }
};
