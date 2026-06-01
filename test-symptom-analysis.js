// Test hệ thống phân tích triệu chứng
// Chạy: node test-symptom-analysis.js

const testCases = [
  // Test Thần kinh
  { input: "Tôi bị đau đầu và chóng mặt", expected: "Thần kinh" },
  { input: "đau đầu nhức đầu", expected: "Thần kinh" },
  { input: "mất ngủ khó ngủ", expected: "Thần kinh" },
  { input: "run tay run chân", expected: "Thần kinh" },
  { input: "tê tay tê chân", expected: "Thần kinh" },
  
  // Test Cơ xương khớp
  { input: "đau lưng nhức lưng", expected: "Cơ xương khớp" },
  { input: "đau khớp gối", expected: "Cơ xương khớp" },
  { input: "đau cổ vai gáy", expected: "Cơ xương khớp" },
  { input: "đau cột sống", expected: "Cơ xương khớp" },
  { input: "viêm khớp sưng khớp", expected: "Cơ xương khớp" },
  
  // Test Tim mạch
  { input: "đau ngực tức ngực", expected: "Tim mạch" },
  { input: "khó thở hụt hơi", expected: "Tim mạch" },
  { input: "tim đập nhanh hồi hộp", expected: "Tim mạch" },
  { input: "huyết áp cao", expected: "Tim mạch" },
  { input: "đau tim", expected: "Tim mạch" },
  
  // Test Tiêu hóa
  { input: "đau bụng đau dạ dày", expected: "Tiêu hóa" },
  { input: "tiêu chảy đi ngoài", expected: "Tiêu hóa" },
  { input: "buồn nôn nôn ói", expected: "Tiêu hóa" },
  { input: "táo bón khó đi ngoài", expected: "Tiêu hóa" },
  { input: "đầy hơi chướng bụng", expected: "Tiêu hóa" },
  
  // Test Hô hấp
  { input: "ho khan ho có đờm", expected: "Hô hấp" },
  { input: "khó thở thở gấp", expected: "Hô hấp" },
  { input: "đau họng viêm họng", expected: "Hô hấp" },
  { input: "nghẹt mũi sổ mũi", expected: "Hô hấp" },
  { input: "viêm phổi", expected: "Hô hấp" },
];

console.log("🧪 BẮT ĐẦU TEST HỆ THỐNG PHÂN TÍCH TRIỆU CHỨNG\n");
console.log("=" .repeat(60));

testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: "${test.input}"`);
  console.log(`   Kỳ vọng: ${test.expected}`);
  console.log(`   ✅ Cần verify bằng cách chạy app`);
});

console.log("\n" + "=".repeat(60));
console.log("\n📋 HƯỚNG DẪN TEST:");
console.log("1. Mở app và vào trang AI Chat");
console.log("2. Nhập từng câu test ở trên");
console.log("3. Kiểm tra xem chuyên khoa được gợi ý có đúng không");
console.log("4. Ghi chú lại các trường hợp sai để điều chỉnh");
