const fs = require('fs');

// Load medicines database
const data = JSON.parse(fs.readFileSync('medicines-database.json', 'utf8'));
const medicines = data.medicines;

/**
 * Từ điển tên thuốc Anh - Việt
 * Chỉ dịch những thuốc có tên tiếng Việt phổ biến
 * Các thuốc còn lại giữ nguyên tên tiếng Anh
 */
const medicineTranslations = {
  // Giảm đau - Hạ sốt
  'Paracetamol': 'Paracetamol',
  'Ibuprofen': 'Ibuprofen', 
  'Aspirin': 'Aspirin',
  'Brufen': 'Brufen',
  'Advil': 'Advil',
  'Nurofen': 'Nurofen',
  'Voltaren': 'Voltaren',
  'Cataflam': 'Cataflam',
  'Naproxen': 'Naproxen',
  'Mefenamic Acid': 'Axit Mefenamic',
  'Ponstan': 'Ponstan',
  'Diclofenac': 'Diclofenac',
  
  // Tim mạch
  'Amlodipine': 'Amlodipine',
  'Nifedipine': 'Nifedipine',
  'Bisoprolol': 'Bisoprolol',
  'Metoprolol': 'Metoprolol',
  'Atenolol': 'Atenolol',
  'Captopril': 'Captopril',
  'Enalapril': 'Enalapril',
  'Losartan': 'Losartan',
  'Valsartan': 'Valsartan',
  'Hydrochlorothiazide': 'Hydrochlorothiazide',
  'Furosemide': 'Furosemide',
  'Atorvastatin': 'Atorvastatin',
  'Rosuvastatin': 'Rosuvastatin',
  'Simvastatin': 'Simvastatin',
  'Warfarin': 'Warfarin',
  'Nitroglycerin': 'Nitroglycerin',
  
  // Thần kinh
  'Piracetam': 'Piracetam',
  'Citicoline': 'Citicoline',
  'Ginkgo Biloba': 'Bạch Quả',
  'Gabapentin': 'Gabapentin',
  'Pregabalin': 'Pregabalin',
  'Carbamazepine': 'Carbamazepine',
  'Valproate': 'Valproate',
  'Diazepam': 'Diazepam',
  'Clonazepam': 'Clonazepam',
  'Alprazolam': 'Alprazolam',
  'Sertraline': 'Sertraline',
  'Fluoxetine': 'Fluoxetine',
  'Amitriptyline': 'Amitriptyline',
  'Donepezil': 'Donepezil',
  'Memantine': 'Memantine',
  'Betaserc': 'Betaserc',
  
  // Hô hấp
  'Ventolin': 'Ventolin',
  'Salbutamol': 'Salbutamol',
  'Seretide': 'Seretide',
  'Symbicort': 'Symbicort',
  'Pulmicort': 'Pulmicort',
  'Bromhexine': 'Bromhexine',
  'Ambroxol': 'Ambroxol',
  'Acetylcysteine': 'Acetylcysteine',
  'Terpin Hydrate': 'Terpin Hydrate',
  'Decolgen': 'Decolgen',
  'Tiffy': 'Tiffy',
  'Rhumenol': 'Rhumenol',
  'Clorpheniramine': 'Clorpheniramine',
  'Cetirizine': 'Cetirizine',
  'Loratadine': 'Loratadine',
  'Montelukast': 'Montelukast',
  'Prednisolone': 'Prednisolone',
  
  // Tiêu hóa
  'Smecta': 'Smecta',
  'Berberin': 'Berberin',
  'Oresol': 'Oresol',
  'Enterogermina': 'Enterogermina',
  'Bioflora': 'Bioflora',
  'Lacteol Fort': 'Lacteol Fort',
  'Omeprazole': 'Omeprazole',
  'Esomeprazole': 'Esomeprazole',
  'Pantoprazole': 'Pantoprazole',
  'Lansoprazole': 'Lansoprazole',
  'Gaviscon': 'Gaviscon',
  'Phosphalugel': 'Phosphalugel',
  'Maalox': 'Maalox',
  'Domperidone': 'Domperidone',
  'Motilium': 'Motilium',
  'Metoclopramide': 'Metoclopramide',
  'Trimebutine': 'Trimebutine',
  'Mebeverine': 'Mebeverine',
  'Creon': 'Creon',
  'Actapulgite': 'Actapulgite',
  
  // Da liễu
  'Gentrisone': 'Gentrisone',
  'Fucidin': 'Fucidin',
  'Bepanthen': 'Bepanthen',
  'Clobetasol': 'Clobetasol',
  'Hydrocortisone': 'Hydrocortisone',
  'Betamethasone': 'Betamethasone',
  'Eumovate': 'Eumovate',
  'Nizoral': 'Nizoral',
  'Ketoconazole': 'Ketoconazole',
  'Canesten': 'Canesten',
  'Acyclovir Cream': 'Kem Acyclovir',
  'Benzoyl Peroxide': 'Benzoyl Peroxide',
  'Adapalene': 'Adapalene',
  'Differin': 'Differin',
  'Tretinoin': 'Tretinoin',
  
  // Tai Mũi Họng
  'Otrivin': 'Otrivin',
  'Xisat': 'Xisat',
  'Sterimar': 'Sterimar',
  'Naphazoline': 'Naphazoline',
  'Coldi-B': 'Coldi-B',
  'Eugica': 'Eugica',
  'Strepsils': 'Strepsils',
  'Lysopaine': 'Lysopaine',
  'Tyrotricin': 'Tyrotricin',
  'Betadine Gargle': 'Betadine Súc Miệng',
  'Tantum Verde': 'Tantum Verde',
  
  // Mắt
  'V-Rohto': 'V-Rohto',
  'Refresh Tears': 'Nước Mắt Nhân Tạo',
  'Sancoba': 'Sancoba',
  'Tobradex': 'Tobradex',
  'Tobrex': 'Tobrex',
  'Vigamox': 'Vigamox',
  'Cravit': 'Cravit',
  'Natri Clorid': 'Natri Clorid',
  'Tears Naturale': 'Nước Mắt Tự Nhiên',
  'Optive': 'Optive',
  'Hyclean': 'Hyclean',
  'Flucon': 'Flucon',
  'Nevanac': 'Nevanac',
  'Pred Forte': 'Pred Forte',
  'Alcon Tears': 'Alcon Nước Mắt',
  
  // Kháng sinh
  'Amoxicillin': 'Amoxicillin',
  'Augmentin': 'Augmentin',
  'Cefalexin': 'Cefalexin',
  'Cefixime': 'Cefixime',
  
  // Xương khớp
  'Meloxicam': 'Meloxicam',
  'Celecoxib': 'Celecoxib',
  'Piroxicam': 'Piroxicam',
  'Glucosamine': 'Glucosamine',
  'MSM': 'MSM',
  'Collagen UC-II': 'Collagen UC-II',
  'Salonpas': 'Salonpas',
  'Myonal': 'Myonal',
  'Eperisone': 'Eperisone',
  'Ultracet': 'Ultracet',
  'Mobic': 'Mobic',
  'Flexsa': 'Flexsa',
  
  // Nội tiết
  'Metformin': 'Metformin',
  'Glimepiride': 'Glimepiride',
  'Gliclazide': 'Gliclazide',
  'Sitagliptin': 'Sitagliptin',
  'Linagliptin': 'Linagliptin',
  'Insulin Lantus': 'Insulin Lantus',
  'Insulin NovoRapid': 'Insulin NovoRapid',
  'Euthyrox': 'Euthyrox',
  'Thyrozol': 'Thyrozol',
  'Calcitriol': 'Calcitriol',
  
  // Sản phụ khoa
  'Femoston': 'Femoston',
  'Utrogestan': 'Utrogestan',
  'Duphaston': 'Duphaston',
  'Canesten Vaginal': 'Canesten Phụ Khoa',
  'Fluomizin': 'Fluomizin',
  'Gynoflor': 'Gynoflor',
  'Elevit': 'Elevit',
  'Obimin': 'Obimin',
  'Blackmores Pregnancy': 'Blackmores Mẹ Bầu',
  'Fefol': 'Fefol',
  
  // Nhi khoa
  'Hapacol Kids': 'Hapacol Trẻ Em',
  'Efferalgan Kids': 'Efferalgan Trẻ Em',
  'Panadol Baby': 'Panadol Trẻ Sơ Sinh',
  'Bảo Thanh Trẻ Em': 'Bảo Thanh Trẻ Em',
  'Eugica Baby': 'Eugica Trẻ Em',
  'Vitamin D3': 'Vitamin D3',
  'DHA Kids': 'DHA Trẻ Em',
  'Zinc Kid': 'Kẽm Trẻ Em',
};

// Function to translate medicine name
function translateMedicineName(name) {
  // Remove dosage information for matching
  const baseName = name.split(/\s+\d+/)[0].trim();
  
  // Check if translation exists
  for (const [english, vietnamese] of Object.entries(medicineTranslations)) {
    if (baseName.includes(english) || name.includes(english)) {
      // Replace English name with Vietnamese, keep dosage
      const dosageMatch = name.match(/\d+\s*(mg|g|ml|%|mcg)/i);
      if (dosageMatch && !vietnamese.includes(dosageMatch[0])) {
        return `${vietnamese} ${dosageMatch[0]}`;
      }
      return vietnamese;
    }
  }
  
  // Return original name if no translation found
  return name;
}

// Main function
function translateAllMedicineNames() {
  console.log('🔄 Đang chuyển tên thuốc sang tiếng Việt...\n');
  
  let translatedCount = 0;
  let unchangedCount = 0;
  
  medicines.forEach((medicine, index) => {
    const originalName = medicine.name;
    const translatedName = translateMedicineName(originalName);
    
    if (translatedName !== originalName) {
      medicine.name = translatedName;
      console.log(`[${index + 1}/${medicines.length}] ✓ ${originalName} → ${translatedName}`);
      translatedCount++;
    } else {
      console.log(`[${index + 1}/${medicines.length}] - ${originalName} (giữ nguyên)`);
      unchangedCount++;
    }
  });
  
  // Save updated database
  data.medicines = medicines;
  fs.writeFileSync('medicines-database.json', JSON.stringify(data, null, 2));
  
  console.log(`\n✅ HOÀN TẤT!`);
  console.log(`📊 Thống kê:`);
  console.log(`   • Đã dịch: ${translatedCount} thuốc`);
  console.log(`   • Giữ nguyên: ${unchangedCount} thuốc`);
  console.log(`   • Tổng cộng: ${medicines.length} thuốc`);
}

// Run
translateAllMedicineNames();
