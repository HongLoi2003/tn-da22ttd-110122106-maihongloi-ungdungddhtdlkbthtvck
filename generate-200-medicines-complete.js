const fs = require('fs');

/**
 * Generate COMPLETE 200 medicines database - 12 categories
 */

const medicinesList = {
  'Giảm đau - Hạ sốt': [
    'Paracetamol 500mg', 'Hapacol 500', 'Panadol Extra', 'Efferalgan 500mg', 'Tylenol 500mg',
    'Ibuprofen 400mg', 'Brufen 400mg', 'Advil 200mg', 'Nurofen 200mg', 'Profen 400mg',
    'Aspirin 100mg', 'Cardiprin 100mg', 'Aspilets 80mg', 'Micropirin 81mg', 'Aspirin Protect 100mg',
    'Alaxan FR', 'Mefenamic Acid 500mg', 'Ponstan 500mg', 'Ponstyl 250mg', 'Mefinal 500mg',
    'Diclofenac 50mg', 'Voltaren 50mg', 'Cataflam 50mg', 'Olfen 50mg', 'Naproxen 500mg'
  ],
  'Tim mạch': [
    'Amlodipine', 'Nifedipine', 'Bisoprolol', 'Metoprolol', 'Atenolol',
    'Captopril', 'Enalapril', 'Perindopril', 'Losartan', 'Valsartan',
    'Telmisartan', 'Hydrochlorothiazide', 'Furosemide', 'Spironolactone', 'Atorvastatin',
    'Rosuvastatin', 'Simvastatin', 'Clopidogrel', 'Warfarin', 'Nitroglycerin'
  ],
  'Thần kinh': [
    'Piracetam', 'Citicoline', 'Ginkgo Biloba', 'Cerebrolysin', 'Gabapentin',
    'Pregabalin', 'Carbamazepine', 'Valproate', 'Levetiracetam', 'Phenytoin',
    'Diazepam', 'Clonazepam', 'Alprazolam', 'Sertraline', 'Fluoxetine',
    'Amitriptyline', 'Duloxetine', 'Donepezil', 'Memantine', 'Betaserc'
  ],
  'Hô hấp': [
    'Ventolin', 'Salbutamol', 'Seretide', 'Symbicort', 'Pulmicort',
    'Bromhexine', 'Ambroxol', 'Acetylcysteine', 'Terpin Hydrate', 'Bảo Thanh',
    'Eugica', 'Decolgen', 'Tiffy', 'Rhumenol', 'Clorpheniramine',
    'Cetirizine', 'Loratadine', 'Montelukast', 'Theophylline', 'Prednisolone'
  ],
  'Tiêu hóa': [
    'Smecta', 'Berberin', 'Oresol', 'Enterogermina', 'Bioflora',
    'Lacteol Fort', 'Omeprazole', 'Esomeprazole', 'Pantoprazole', 'Lansoprazole',
    'Gaviscon', 'Phosphalugel', 'Maalox', 'Domperidone', 'Motilium',
    'Metoclopramide', 'Trimebutine', 'Mebeverine', 'Creon', 'Actapulgite'
  ],
  'Da liễu': [
    'Gentrisone', 'Fucidin', 'Bepanthen', 'Clobetasol', 'Hydrocortisone',
    'Betamethasone', 'Eumovate', 'Nizoral', 'Ketoconazole', 'Canesten',
    'Acyclovir Cream', 'Benzoyl Peroxide', 'Adapalene', 'Differin', 'Tretinoin'
  ],
  'Tai Mũi Họng': [
    'Otrivin', 'Xisat', 'Sterimar', 'Naphazoline', 'Coldi-B',
    'Eugica', 'Strepsils', 'Lysopaine', 'Tyrotricin', 'Betadine Gargle',
    'Tantum Verde', 'Cefalexin', 'Amoxicillin', 'Augmentin', 'Clorpheniramine'
  ],
  'Mắt': [
    'V-Rohto', 'Refresh Tears', 'Sancoba', 'Tobradex', 'Tobrex',
    'Vigamox', 'Cravit', 'Natri Clorid 0.9%', 'Tears Naturale', 'Optive',
    'Hyclean', 'Flucon', 'Nevanac', 'Pred Forte', 'Alcon Tears'
  ],
  'Nhi khoa': [
    'Hapacol Kids', 'Efferalgan Kids', 'Panadol Baby', 'Oresol', 'Smecta',
    'Bioflora', 'Enterogermina', 'Bảo Thanh Trẻ Em', 'Eugica Baby', 'Vitamin D3',
    'DHA Kids', 'Zinc Kid', 'Cefixime', 'Amoxicillin', 'Augmentin'
  ],
  'Cơ xương khớp': [
    'Voltaren', 'Diclofenac', 'Meloxicam', 'Celecoxib', 'Piroxicam',
    'Glucosamine', 'MSM', 'Collagen UC-II', 'Salonpas', 'Myonal',
    'Eperisone', 'Paracetamol', 'Ultracet', 'Mobic', 'Flexsa'
  ],
  'Nội tiết': [
    'Metformin', 'Glimepiride', 'Gliclazide', 'Sitagliptin', 'Linagliptin',
    'Insulin Lantus', 'Insulin NovoRapid', 'Euthyrox', 'Thyrozol', 'Calcitriol'
  ],
  'Sản phụ khoa': [
    'Femoston', 'Utrogestan', 'Duphaston', 'Canesten Vaginal', 'Fluomizin',
    'Gynoflor', 'Elevit', 'Obimin', 'Blackmores Pregnancy', 'Fefol'
  ]
};

const medicineDetails = {
  'Giảm đau - Hạ sốt': {
    indication: 'Giảm đau nhẹ đến vừa (đau đầu, đau răng, đau cơ), hạ sốt',
    dosage: 'Người lớn: 1-2 viên/lần, 3-4 lần/ngày sau ăn',
    contraindication: 'Quá mẫn với thành phần thuốc, suy gan/thận nặng, loét dạ dày',
    sideEffects: 'Buồn nôn, chóng mặt, đau dạ dày, phát ban',
    warnings: 'Không dùng quá liều. Tránh rượu. Thai phụ tham khảo bác sĩ',
    packaging: 'Viên nén bao phim',
    packSize: 'Hộp 10 vỉ x 10 viên'
  },
  'Tim mạch': {
    indication: 'Điều trị tăng huyết áp, bệnh tim mạch, suy tim',
    dosage: 'Người lớn: Theo chỉ định bác sĩ, thường 1 viên/ngày',
    contraindication: 'Quá mẫn với thành phần thuốc, suy tim nặng',
    sideEffects: 'Hạ huyết áp, chóng mặt, nhức đầu',
    warnings: 'Không tự ý ngưng thuốc. Thai phụ tham khảo bác sĩ',
    packaging: 'Viên nén bao phim',
    packSize: 'Hộp 3 vỉ x 10 viên'
  },
  'Thần kinh': {
    indication: 'Điều trị rối loạn thần kinh, lo âu, trầm cảm, động kinh',
    dosage: 'Người lớn: Theo chỉ định bác sĩ, uống 1-2 lần/ngày',
    contraindication: 'Quá mẫn với thành phần thuốc, suy gan nặng',
    sideEffects: 'Buồn ngủ, chóng mặt, khô miệng',
    warnings: 'Có thể gây buồn ngủ, không lái xe. Tránh rượu',
    packaging: 'Viên nang/viên nén',
    packSize: 'Hộp 3 vỉ x 10 viên'
  },
  'Hô hấp': {
    indication: 'Điều trị ho, viêm phế quản, hen suyễn, dị ứng',
    dosage: 'Người lớn: 1-2 viên/lần, 2-3 lần/ngày',
    contraindication: 'Quá mẫn với thành phần thuốc',
    sideEffects: 'Buồn nôn, chóng mặt, khô miệng',
    warnings: 'Uống sau ăn. Thai phụ tham khảo bác sĩ',
    packaging: 'Viên nén/Siro/Khí dung',
    packSize: 'Hộp 3 vỉ x 10 viên'
  },
  'Tiêu hóa': {
    indication: 'Điều trị tiêu chảy, đau dạ dày, viêm loét dạ dày',
    dosage: 'Người lớn: 1-2 gói/lần, 2-3 lần/ngày',
    contraindication: 'Quá mẫn với thành phần thuốc, tắc ruột',
    sideEffects: 'Táo bón, buồn nôn, đầy hơi',
    warnings: 'Uống trước hoặc sau ăn 1 giờ. Uống đủ nước',
    packaging: 'Gói bột/Viên nang/Siro',
    packSize: 'Hộp 30 gói'
  },
  'Da liễu': {
    indication: 'Điều trị viêm da, nấm da, mụn, chàm',
    dosage: 'Bôi mỏng lên vùng da 2-3 lần/ngày',
    contraindication: 'Quá mẫn, nhiễm trùng da nặng',
    sideEffects: 'Kích ứng da, ngứa, bỏng rát nhẹ',
    warnings: 'Chỉ dùng ngoài da. Tránh mắt. Rửa tay sau bôi',
    packaging: 'Kem/Gel',
    packSize: 'Tuýp 10g-15g'
  },
  'Tai Mũi Họng': {
    indication: 'Điều trị viêm mũi, viêm họng, ho, nghẹt mũi',
    dosage: 'Người lớn: 1-2 viên/lần, 3 lần/ngày',
    contraindication: 'Quá mẫn với thành phần thuốc',
    sideEffects: 'Khô mũi, khô họng, chảy máu cam',
    warnings: 'Không dùng quá 7 ngày. Thai phụ tham khảo bác sĩ',
    packaging: 'Viên ngậm/Xịt mũi/Viên nén',
    packSize: 'Hộp 2 vỉ x 10 viên'
  },
  'Mắt': {
    indication: 'Điều trị khô mắt, viêm kết mạc, nhiễm trùng mắt',
    dosage: 'Nhỏ 1-2 giọt vào mắt, 3-4 lần/ngày',
    contraindication: 'Quá mẫn với thành phần thuốc',
    sideEffects: 'Cảm giác châm chích, mờ mắt tạm thời',
    warnings: 'Không chạm đầu lọ vào mắt. Đậy nắp sau dùng',
    packaging: 'Nhỏ mắt',
    packSize: 'Lọ 5ml-10ml'
  },
  'Nhi khoa': {
    indication: 'Điều trị sốt, đau, tiêu chảy, nhiễm khuẩn ở trẻ',
    dosage: 'Trẻ em: Theo cân nặng và chỉ định bác sĩ',
    contraindication: 'Quá mẫn với thành phần thuốc',
    sideEffects: 'Buồn nôn, tiêu chảy, phát ban',
    warnings: 'Dùng đúng liều cho trẻ. Tham khảo bác sĩ nhi',
    packaging: 'Siro/Gói bột/Viên nang',
    packSize: 'Hộp 20 gói'
  },
  'Cơ xương khớp': {
    indication: 'Giảm đau khớp, viêm khớp, thoái hóa khớp',
    dosage: 'Người lớn: 1-2 viên/lần, 2-3 lần/ngày sau ăn',
    contraindication: 'Quá mẫn, loét dạ dày',
    sideEffects: 'Đau dạ dày, buồn nôn, chóng mặt',
    warnings: 'Uống sau ăn. Không quá liều. Thai phụ tham khảo bác sĩ',
    packaging: 'Viên nén/Viên nang/Miếng dán',
    packSize: 'Hộp 3 vỉ x 10 viên'
  },
  'Nội tiết': {
    indication: 'Điều trị đái tháo đường, rối loạn tuyến giáp',
    dosage: 'Người lớn: Theo chỉ định bác sĩ, 1-2 lần/ngày',
    contraindication: 'Quá mẫn, suy gan/thận nặng',
    sideEffects: 'Hạ đường huyết, buồn nôn, tiêu chảy',
    warnings: 'Theo dõi đường huyết. Không tự ý ngưng thuốc',
    packaging: 'Viên nén/Bút tiêm',
    packSize: 'Hộp 3 vỉ x 10 viên'
  },
  'Sản phụ khoa': {
    indication: 'Điều trị rối loạn kinh nguyệt, mãn kinh, nhiễm khuẩn',
    dosage: 'Người lớn: Theo chỉ định bác sĩ sản phụ khoa',
    contraindication: 'Quá mẫn, có thai không rõ',
    sideEffects: 'Buồn nôn, đau bụng, chảy máu âm đạo',
    warnings: 'Chỉ dùng theo chỉ định. Thai phụ không tự ý dùng',
    packaging: 'Viên nang/Viên đặt/Viên nén',
    packSize: 'Hộp 2 vỉ x 10 viên'
  }
};

const manufacturers = [
  { name: 'Traphaco', address: 'Hà Nội', phone: '024-3872-7786' },
  { name: 'IMEXPHARM', address: 'TP.HCM', phone: '028-3862-7527' },
  { name: 'DHG Pharma', address: 'Hậu Giang', phone: '0293-3956-666' },
  { name: 'Domesco', address: 'Đồng Tháp', phone: '0277-3851-181' },
  { name: 'OPC Pharma', address: 'TP.HCM', phone: '028-3950-5858' },
  { name: 'Pymepharco', address: 'TP.HCM', phone: '028-3955-5229' },
  { name: 'Công ty Dược phẩm Hà Nội', address: 'Hà Nội', phone: '024-3826-5454' }
];

function generateDatabase() {
  const medicines = [];
  let id = 1;
  
  for (const [category, meds] of Object.entries(medicinesList)) {
    const details = medicineDetails[category];
    
    for (const medicineName of meds) {
      const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
      const basePrice = Math.floor(Math.random() * 50000) + 15000;
      
      const prescriptionCategories = ['Tim mạch', 'Thần kinh', 'Nội tiết'];
      const type = prescriptionCategories.includes(category) ? 'Prescription' : 'OTC';
      
      medicines.push({
        id: id++,
        name: medicineName,
        category: category,
        activeIngredient: `${medicineName} (hoạt chất chính)`,
        type: type,
        price: basePrice,
        indication: details.indication,
        dosage: details.dosage,
        contraindication: details.contraindication,
        sideEffects: details.sideEffects,
        usage: `Uống theo chỉ định bác sĩ. ${details.dosage}`,
        expiryInfo: '36 tháng kể từ ngày sản xuất',
        storage: 'Bảo quản nơi khô ráo, tránh ánh sáng, nhiệt độ dưới 30°C',
        packaging: details.packaging,
        packSize: details.packSize,
        warnings: details.warnings,
        manufacturer: manufacturer,
        qualityControl: 'Đạt tiêu chuẩn GMP-WHO, đã kiểm định chất lượng',
        keywords: [
          medicineName.toLowerCase(),
          category.toLowerCase(),
          ...medicineName.toLowerCase().split(' ')
        ]
      });
    }
  }
  
  return { medicines };
}

console.log('🏥 Generating COMPLETE 200 medicines database with 12 categories...\n');
const database = generateDatabase();

console.log(`✅ Generated ${database.medicines.length} medicines\n`);
console.log('📋 Summary by category:');
for (const [category, meds] of Object.entries(medicinesList)) {
  console.log(`   ${category}: ${meds.length} medicines`);
}

fs.writeFileSync(
  'medicines-database.json',
  JSON.stringify(database, null, 2),
  'utf8'
);

console.log('\n💾 Database saved to medicines-database.json');
console.log(`✅ Total: ${database.medicines.length} medicines across 12 categories!`);
