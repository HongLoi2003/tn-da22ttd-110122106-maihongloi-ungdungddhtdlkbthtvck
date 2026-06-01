const fs = require('fs');

// Đọc file hiện tại
const currentData = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

// Giữ nguyên 100 triệu chứng hiện tại
const symptoms = currentData.symptoms;

// Thêm 38 triệu chứng mới (ID 101-138)
const newSymptoms = [
  // Hô hấp (101-105)
  { id: 101, name: "thở khò khè", icon: "🫁" },
  { id: 102, name: "đau khi hít thở", icon: "😣" },
  { id: 103, name: "ho có đờm", icon: "🤧" },
  { id: 104, name: "nghẹt mũi", icon: "👃" },
  { id: 105, name: "khó thở khi nằm", icon: "🛏️" },
  
  // Da liễu (106-110)
  { id: 106, name: "nổi mụn", icon: "😖" },
  { id: 107, name: "da khô", icon: "🏜️" },
  { id: 108, name: "vảy nến", icon: "🔴" },
  { id: 109, name: "mẩn ngứa", icon: "🤒" },
  { id: 110, name: "rụng tóc", icon: "💇" },
  
  // Mắt (111-115)
  { id: 111, name: "mờ mắt", icon: "😵" },
  { id: 112, name: "chảy nước mắt", icon: "😢" },
  { id: 113, name: "sưng mí mắt", icon: "👁️" },
  { id: 114, name: "đau nhức mắt", icon: "😣" },
  { id: 115, name: "nhìn có vệt sáng", icon: "✨" },
  
  // Hô hấp thêm (116-120)
  { id: 116, name: "khàn tiếng", icon: "🗣️" },
  { id: 117, name: "thở nhanh", icon: "💨" },
  { id: 118, name: "đau tức ngực", icon: "💔" },
  { id: 119, name: "ho dai dẳng", icon: "😷" },
  { id: 120, name: "khó thở về đêm", icon: "🌙" },
  
  // Nội tiết (121-124)
  { id: 121, name: "tăng cân nhanh", icon: "⚖️" },
  { id: 122, name: "khát nước nhiều", icon: "💧" },
  { id: 123, name: "đi tiểu nhiều", icon: "🚽" },
  { id: 124, name: "run tay chân", icon: "🤲" },
  
  // Răng hàm mặt (125-128)
  { id: 125, name: "đau răng", icon: "🦷" },
  { id: 126, name: "sưng lợi", icon: "😖" },
  { id: 127, name: "hôi miệng", icon: "😷" },
  { id: 128, name: "răng ê buốt", icon: "🥶" },
  
  // Sản phụ khoa (129-133)
  { id: 129, name: "đau bụng dưới", icon: "🤰" },
  { id: 130, name: "kinh nguyệt không đều", icon: "📅" },
  { id: 131, name: "ra máu bất thường", icon: "🩸" },
  { id: 132, name: "buồn nôn sáng sớm", icon: "🤢" },
  { id: 133, name: "đau lưng dưới", icon: "😣" },
  
  // Tiêu hóa thêm (134-138)
  { id: 134, name: "ợ hơi", icon: "💨" },
  { id: 135, name: "khó nuốt", icon: "😰" },
  { id: 136, name: "đầy hơi", icon: "🎈" },
  { id: 137, name: "ợ chua", icon: "🔥" },
  { id: 138, name: "đau thượng vị", icon: "😖" },
];

// Gộp tất cả triệu chứng
const allSymptoms = [...symptoms, ...newSymptoms];

// Cập nhật mappings với 12 chuyên khoa
const mappings = [
  {
    symptomIds: [1, 12, 13, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    specialtyId: 4,
    specialtyName: "Thần kinh",
    confidence: 95
  },
  {
    symptomIds: [5, 6, 15, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
    specialtyId: 1,
    specialtyName: "Tim mạch",
    confidence: 95
  },
  {
    symptomIds: [3, 4, 2, 16, 30, 75, 78, 101, 102, 103, 104, 105, 116, 117, 118, 119, 120],
    specialtyId: 11,
    specialtyName: "Hô hấp",
    confidence: 90
  },
  {
    symptomIds: [7, 8, 14, 41, 42, 43, 44, 45, 46, 47, 48, 49, 134, 135, 136, 137, 138],
    specialtyId: 2,
    specialtyName: "Tiêu hóa",
    confidence: 90
  },
  {
    symptomIds: [9, 10, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 106, 107, 108, 109, 110],
    specialtyId: 6,
    specialtyName: "Da liễu",
    confidence: 95
  },
  {
    symptomIds: [11, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
    specialtyId: 5,
    specialtyName: "Cơ xương khớp",
    confidence: 90
  },
  {
    symptomIds: [16, 17, 19, 20, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
    specialtyId: 7,
    specialtyName: "Tai mũi họng",
    confidence: 85
  },
  {
    symptomIds: [18, 80, 81, 82, 83, 84, 85, 86, 87, 88, 111, 112, 113, 114, 115],
    specialtyId: 8,
    specialtyName: "Mắt",
    confidence: 90
  },
  {
    symptomIds: [19, 89, 90, 91, 92, 93, 125, 126, 127, 128],
    specialtyId: 9,
    specialtyName: "Răng hàm mặt",
    confidence: 95
  },
  {
    symptomIds: [2, 15, 94, 95, 96, 97, 98, 99, 100, 121, 122, 123, 124],
    specialtyId: 10,
    specialtyName: "Nội tiết",
    confidence: 85
  },
  {
    symptomIds: [2, 3, 73, 74, 116, 117, 118, 119, 120],
    specialtyId: 12,
    specialtyName: "Nhi khoa",
    confidence: 85
  },
  {
    symptomIds: [98, 99, 129, 130, 131, 132, 133],
    specialtyId: 13,
    specialtyName: "Sản phụ khoa",
    confidence: 90
  }
];

// Tạo object mới
const newData = {
  symptoms: allSymptoms,
  mappings: mappings
};

// Ghi ra file
fs.writeFileSync('symptoms-mapping.json', JSON.stringify(newData, null, 2), 'utf8');

console.log('✅ Đã cập nhật symptoms-mapping.json');
console.log(`📊 Tổng số triệu chứng: ${allSymptoms.length}`);
console.log(`📊 Tổng số chuyên khoa: ${mappings.length}`);
console.log('\n📋 Chi tiết:');
mappings.forEach(m => {
  console.log(`  - ${m.specialtyName}: ${m.symptomIds.length} triệu chứng (${m.confidence}%)`);
});
