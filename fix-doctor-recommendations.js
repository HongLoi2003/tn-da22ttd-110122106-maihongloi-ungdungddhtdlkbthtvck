// Script to help convert all doctor string arrays to DoctorRecommendation objects

// Helper function to convert doctor name strings to DoctorRecommendation objects
function convertToDoctorRecommendations(doctorNames, specialty) {
  return doctorNames.map((name, index) => ({
    id: `fallback-${specialty.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: name,
    specialty: specialty
  }));
}

// Example conversions:
console.log("Tim mạch:", convertToDoctorRecommendations(['BS. Ngô Thị Hương'], 'Tim mạch'));
console.log("Tiêu hóa:", convertToDoctorRecommendations(['BS. Nguyễn Thị Hoa'], 'Tiêu hóa'));
console.log("Hô hấp:", convertToDoctorRecommendations(['BS. Trần Thị Mai'], 'Hô hấp'));
console.log("Thần kinh:", convertToDoctorRecommendations(['BS. Vũ Thị Lan'], 'Thần kinh'));
console.log("Da liễu:", convertToDoctorRecommendations(['BS. Trần Thị Lan', 'BS. Đỗ Minh Tuấn'], 'Da liễu'));
console.log("Mắt:", convertToDoctorRecommendations(['BS. Lê Thị Hằng'], 'Mắt'));
console.log("Tai mũi họng:", convertToDoctorRecommendations(['BS. Phạm Minh Quân'], 'Tai mũi họng'));
console.log("Nội tiết:", convertToDoctorRecommendations(['BS. Đặng Thị Thảo'], 'Nội tiết'));
console.log("Nhi khoa:", convertToDoctorRecommendations(['BS. Hoàng Văn Đức'], 'Nhi khoa'));
console.log("Sản phụ khoa:", convertToDoctorRecommendations(['BS. Lê Minh Tâm'], 'Sản phụ khoa'));
console.log("Răng hàm mặt:", convertToDoctorRecommendations(['BS. Nguyễn Văn Hải'], 'Răng hàm mặt'));
console.log("Cơ xương khớp:", convertToDoctorRecommendations(['BS. Trần Văn Khoa'], 'Cơ xương khớp'));
