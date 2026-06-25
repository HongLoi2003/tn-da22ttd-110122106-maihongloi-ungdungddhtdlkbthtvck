const fs = require('fs');

// Template function to generate medicine data
function generateMedicines() {
  const manufacturers = [
    { name: "Công ty Dược phẩm Hà Nội", address: "Hà Nội", phone: "024-3826-5454" },
    { name: "DHG Pharma", address: "Hậu Giang", phone: "0293-3956-666" },
    { name: "Traphaco", address: "Hà Nội", phone: "024-3872-7786" },
    { name: "IMEXPHARM", address: "TP.HCM", phone: "028-3862-7527" },
    { name: "OPC Pharma", address: "TP.HCM", phone: "028-3950-5858" },
    { name: "Pymepharco", address: "TP.HCM", phone: "028-3955-5229" },
    { name: "Boston Pharma", address: "TP.HCM", phone: "028-3620-5666" },
    { name: "Domesco", address: "Đồng Tháp", phone: "0277-3851-181" }
  ];

  const medicineData = [];
  let id = 1;

  // Pain Relief & Fever - 30 medicines
  const painRelief = [
    "Paracetamol 500mg", "Hapacol 500", "Panadol Extra", "Efferalgan 500mg", "Tylenol 500mg",
    "Ibuprofen 400mg", "Brufen 400mg", "Advil 200mg", "Nurofen 200mg", "Profen 400mg",
    "Aspirin 100mg", "Cardiprin 100mg", "Aspilets 80mg", "Micropirin 81mg", "Aspirin Protect 100mg",
    "Alaxan FR", "Mefenamic Acid 500mg", "Ponstan 500mg", "Ponstyl 250mg", "Mefinal 500mg",
    "Diclofenac 50mg", "Voltaren 50mg", "Cataflam 50mg", "Olfen 50mg", "Diclovit 50mg",
    "Meloxicam 7.5mg", "Mobic 7.5mg", "Melox 15mg", "Melocam 7.5mg", "Mexpharm Meloxicam 15mg"
  ];

  painRelief.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Giảm đau - Hạ sốt",
      activeIngredient: name.includes("Paracetamol") || name.includes("Hapacol") || name.includes("Panadol") || name.includes("Efferalgan") || name.includes("Tylenol") 
        ? "Paracetamol 500mg" 
        : name.includes("Ibuprofen") || name.includes("Brufen") || name.includes("Advil") || name.includes("Nurofen") || name.includes("Profen")
        ? "Ibuprofen 400mg"
        : name.includes("Aspirin") || name.includes("Cardiprin") || name.includes("Aspilets") || name.includes("Micropirin")
        ? "Aspirin 100mg"
        : name.includes("Mefenamic") || name.includes("Ponstan") || name.includes("Ponstyl") || name.includes("Mefinal")
        ? "Mefenamic Acid 500mg"
        : name.includes("Diclofenac") || name.includes("Voltaren") || name.includes("Cataflam") || name.includes("Olfen") || name.includes("Diclovit")
        ? "Diclofenac Sodium 50mg"
        : "Meloxicam 7.5mg",
      type: "OTC",
      price: Math.floor(Math.random() * 50000) + 15000,
      indication: "Giảm đau nhẹ đến vừa, hạ sốt, chống viêm",
      dosage: "Người lớn: 1-2 viên/lần, 2-3 lần/ngày sau ăn",
      contraindication: "Quá mẫn với thành phần thuốc, suy gan/thận nặng, loét dạ dày tá tràng",
      sideEffects: "Buồn nôn, chóng mặt, đau dạ dày, phát ban",
      usage: "Uống sau ăn với nhiều nước",
      expiryInfo: "36 tháng kể từ ngày sản xuất",
      storage: "Bảo quản nơi khô ráo, tránh ánh sáng, nhiệt độ dưới 30°C",
      packaging: "Viên nén bao phim",
      packSize: "Hộp 10 vỉ x 10 viên",
      warnings: "Không dùng quá liều quy định. Tránh dùng với rượu. Thai phụ cần tham khảo bác sĩ",
      manufacturer: mfr,
      qualityControl: "Đạt tiêu chuẩn GMP-WHO, đã kiểm định chất lượng",
      keywords: [name.toLowerCase(), "giảm đau", "hạ sốt"]
    });
  });

  // Antibiotics - 30 medicines
  const antibiotics = [
    "Amoxicillin 500mg", "Augmentin 625mg", "Amoclav 625mg", "Clamoxyl 500mg", "Zimox 500mg",
    "Cephalexin 500mg", "Cefalexin 500mg", "Keflex 500mg", "Ospexin 500mg", "Sporidex 500mg",
    "Azithromycin 250mg", "Zithromax 250mg", "Azithral 250mg", "Azimed 500mg", "Azithrocin 250mg",
    "Ciprofloxacin 500mg", "Ciprobay 500mg", "Ciproxin 500mg", "Quintor 500mg", "Bacproin 500mg",
    "Levofloxacin 500mg", "Tavanic 500mg", "Cravit 500mg", "Levoquin 500mg", "Levolid 500mg",
    "Metronidazole 250mg", "Flagyl 250mg", "Metrogyl 200mg", "Klion 250mg", "Rozex 0.75%"
  ];

  antibiotics.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Kháng sinh",
      activeIngredient: name.split(" ")[0] + " " + (name.match(/\d+mg/) || [""])[0],
      type: "Prescription",
      price: Math.floor(Math.random() * 100000) + 50000,
      indication: "Điều trị nhiễm khuẩn đường hô hấp, tiết niệu, da, mô mềm",
      dosage: "Theo chỉ định bác sĩ. Thông thường: 1-2 viên/lần, 2-3 lần/ngày",
      contraindication: "Quá mẫn với kháng sinh, suy gan/thận nặng",
      sideEffects: "Tiêu chảy, buồn nôn, phát ban, rối loạn tiêu hóa",
      usage: "Uống đủ liều trình theo chỉ định bác sĩ, không tự ý ngừng thuốc",
      expiryInfo: "36 tháng kể từ ngày sản xuất",
      storage: "Bảo quản nơi khô ráo, nhiệt độ dưới 30°C, tránh ánh sáng",
      packaging: "Viên nén/Viên nang",
      packSize: "Hộp 2-3 vỉ x 10 viên",
      warnings: "Chỉ dùng theo đơn bác sĩ. Uống đủ liều trình. Không tự ý mua thuốc",
      manufacturer: mfr,
      qualityControl: "Đạt chuẩn GMP, được Bộ Y tế cấp phép lưu hành",
      keywords: [name.toLowerCase(), "kháng sinh", "nhiễm khuẩn"]
    });
  });

  // Vitamins & Supplements - 40 medicines
  const vitamins = [
    "Vitamin C 1000mg", "Redoxon 1000mg", "Vita-C 1000mg", "Cevarol 500mg", "Haliborange C 500mg",
    "Vitamin E 400IU", "Evion 400", "Vitamin E Zentiva 400mg", "Nat-E 400", "Evalen 400IU",
    "Vitamin D3 1000IU", "Calcigen D3", "Calci-D 500mg", "D3-1000", "Vigantol Oil 1000IU",
    "Vitamin B Complex", "Neurobion", "Becamex", "B-Complex Vinphaco", "Univit B-Complex",
    "Omega-3 Fish Oil", "Blackmores Omega", "Nature Made Fish Oil", "Omega 369", "Nordic Naturals",
    "Calcium + D3", "Caltrate", "Os-Cal", "Calci-K", "Bonmax-D",
    "Multivitamin", "Centrum", "Pharmaton", "Berocca", "Supradyn",
    "Iron + Folic Acid", "Ferro-Folic", "Sangobion", "Feroglobin", "Fefol"
  ];

  vitamins.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Vitamin & Thực phẩm chức năng",
      activeIngredient: name.includes("Vitamin C") || name.includes("Redoxon") || name.includes("Vita-C") || name.includes("Cevarol")
        ? "Vitamin C (Ascorbic Acid) 1000mg"
        : name.includes("Vitamin E") || name.includes("Evion") || name.includes("Nat-E") || name.includes("Evalen")
        ? "Vitamin E (Tocopherol) 400IU"
        : name.includes("Vitamin D") || name.includes("Calcigen") || name.includes("Calci-D") || name.includes("Vigantol")
        ? "Vitamin D3 (Cholecalciferol) 1000IU"
        : name.includes("B Complex") || name.includes("Neurobion") || name.includes("Becamex")
        ? "Vitamin B1, B6, B12"
        : name.includes("Omega") || name.includes("Fish Oil")
        ? "Omega-3 Fatty Acids (EPA + DHA)"
        : name.includes("Calcium") || name.includes("Caltrate") || name.includes("Calci")
        ? "Calcium Carbonate 500mg + Vitamin D3"
        : name.includes("Iron") || name.includes("Ferro") || name.includes("Sangobion")
        ? "Iron Fumarate + Folic Acid"
        : "Multivitamin & Minerals",
      type: "OTC",
      price: Math.floor(Math.random() * 200000) + 50000,
      indication: "Bổ sung vitamin, khoáng chất, tăng cường sức đề kháng",
      dosage: "1-2 viên/ngày sau ăn hoặc theo chỉ dẫn của bác sĩ",
      contraindication: "Quá mẫn với thành phần thuốc",
      sideEffects: "Hiếm gặp: buồn nôn nhẹ, khó tiêu",
      usage: "Uống sau ăn với nhiều nước",
      expiryInfo: "24-36 tháng kể từ ngày sản xuất",
      storage: "Nơi khô mát, tránh ánh sáng trực tiếp, nhiệt độ dưới 30°C",
      packaging: "Viên nang mềm/Viên nén",
      packSize: "Chai 30-100 viên hoặc Hộp 3-10 vỉ x 10 viên",
      warnings: "Không thay thế chế độ ăn cân bằng. Thai phụ, trẻ em cần tham khảo bác sĩ",
      manufacturer: mfr,
      qualityControl: "Đạt chuẩn GMP, có giấy xác nhận nội dung quảng cáo",
      keywords: [name.toLowerCase(), "vitamin", "bổ sung", "sức khỏe"]
    });
  });

  // Digestive & Stomach - 30 medicines
  const digestive = [
    "Omeprazole 20mg", "Losec 20mg", "Omez 20mg", "Ultop 20mg", "Gastrazole 20mg",
    "Esomeprazole 40mg", "Nexium 40mg", "Esoz 40mg", "Esomore 40mg", "Ezoloc 40mg",
    "Ranitidine 150mg", "Zantac 150mg", "Rantin 150mg", "Rani 150mg", "Histac 150mg",
    "Domperidone 10mg", "Motilium 10mg", "Domeperidon 10mg", "Vomidome 10mg", "Costi 10mg",
    "Smecta", "Smectite Dioctahedral", "Bactivid", "Probio", "Bifilac",
    "Lactobacillus", "Bioflora", "Enterogermina", "Saccharomyces boulardii", "Probiota"
  ];

  digestive.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Tiêu hóa - Dạ dày",
      activeIngredient: name.includes("Omeprazole") || name.includes("Losec") || name.includes("Omez") || name.includes("Gastrazole")
        ? "Omeprazole 20mg"
        : name.includes("Esomeprazole") || name.includes("Nexium") || name.includes("Esoz")
        ? "Esomeprazole 40mg"
        : name.includes("Ranitidine") || name.includes("Zantac") || name.includes("Rantin")
        ? "Ranitidine HCl 150mg"
        : name.includes("Domperidone") || name.includes("Motilium") || name.includes("Costi")
        ? "Domperidone 10mg"
        : name.includes("Smecta") || name.includes("Smectite")
        ? "Diosmectite 3g"
        : "Lactobacillus acidophilus 10^9 CFU",
      type: name.includes("Smecta") || name.includes("Lactobacillus") || name.includes("Probio") ? "OTC" : "Prescription",
      price: Math.floor(Math.random() * 80000) + 30000,
      indication: "Điều trị loét dạ dày, trào ngược dạ dày, đầy hơi, khó tiêu, tiêu chảy",
      dosage: "1-2 viên/lần, 1-2 lần/ngày trước ăn hoặc theo chỉ định bác sĩ",
      contraindication: "Quá mẫn với thành phần thuốc",
      sideEffects: "Đau đầu, buồn nôn, tiêu chảy hoặc táo bón",
      usage: "Uống trước ăn 30 phút với nước lạnh",
      expiryInfo: "36 tháng kể từ ngày sản xuất",
      storage: "Nơi khô mát, tránh ánh sáng, nhiệt độ dưới 30°C",
      packaging: "Viên nang/Viên nén/Gói bột",
      packSize: "Hộp 2-3 vỉ x 10 viên hoặc Hộp 30 gói",
      warnings: "Không dùng quá 8 tuần liên tục nếu không có chỉ định bác sĩ",
      manufacturer: mfr,
      qualityControl: "Đạt tiêu chuẩn GMP, được kiểm định an toàn",
      keywords: [name.toLowerCase(), "dạ dày", "tiêu hóa", "loét dạ dày"]
    });
  });

  // Respiratory - Cold & Cough - 30 medicines
  const respiratory = [
    "Loratadine 10mg", "Claritin 10mg", "Alermizole 10mg", "Lorahexal 10mg", "Clarityne 10mg",
    "Cetirizine 10mg", "Zyrtec 10mg", "Cetidrin 10mg", "Virlix 10mg", "Cetirizin 10mg",
    "Ambroxol 30mg", "Mucosolvan 30mg", "Mucoxan 30mg", "Ambrohexal 30mg", "Ambrodil 30mg",
    "Bromhexine 8mg", "Bisolvon 8mg", "Brochex 8mg", "Bromhexin 8mg", "Solvix 8mg",
    "Salbutamol 2mg", "Ventolin 2mg", "Asmadex 2mg", "Butamol 2mg", "Asthalin 2mg",
    "Bảo Thanh", "Prospan", "Tiffy", "Fervex", "Theraflu", "Coldi-B"
  ];

  respiratory.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Hô hấp - Ho - Cảm",
      activeIngredient: name.includes("Loratadine") || name.includes("Claritin") || name.includes("Alermizole")
        ? "Loratadine 10mg"
        : name.includes("Cetirizine") || name.includes("Zyrtec") || name.includes("Cetidrin")
        ? "Cetirizine HCl 10mg"
        : name.includes("Ambroxol") || name.includes("Mucosolvan") || name.includes("Mucoxan")
        ? "Ambroxol HCl 30mg"
        : name.includes("Bromhexine") || name.includes("Bisolvon") || name.includes("Brochex")
        ? "Bromhexine HCl 8mg"
        : name.includes("Salbutamol") || name.includes("Ventolin") || name.includes("Butamol")
        ? "Salbutamol 2mg"
        : "Thảo dược tự nhiên",
      type: name.includes("Salbutamol") || name.includes("Ventolin") ? "Prescription" : "OTC",
      price: Math.floor(Math.random() * 70000) + 20000,
      indication: "Điều trị ho, long đờm, cảm cúm, viêm họng, dị ứng, hen phế quản",
      dosage: "Người lớn: 1-2 viên/lần, 2-3 lần/ngày. Trẻ em giảm liều",
      contraindication: "Quá mẫn với thành phần thuốc, loét dạ dày, hen nặng",
      sideEffects: "Buồn ngủ, khô miệng, chóng mặt nhẹ",
      usage: "Uống sau ăn với nhiều nước ấm",
      expiryInfo: "36 tháng kể từ ngày sản xuất",
      storage: "Nơi khô ráo, tránh ẩm, nhiệt độ dưới 30°C",
      packaging: "Viên nén/Viên nang/Siro",
      packSize: "Hộp 2-3 vỉ x 10 viên hoặc Chai 60ml-100ml",
      warnings: "Không lái xe sau khi dùng thuốc gây buồn ngủ. Tránh dùng rượu",
      manufacturer: mfr,
      qualityControl: "Đạt chuẩn GMP, được Bộ Y tế phê duyệt",
      keywords: [name.toLowerCase(), "ho", "cảm", "dị ứng", "long đờm"]
    });
  });

  // Cardiovascular - Blood Pressure - Diabetes - 40 medicines
  const cardiovascular = [
    "Amlodipine 5mg", "Norvasc 5mg", "Amlor 5mg", "Amlopin 5mg", "Amlosafe 5mg",
    "Atorvastatin 20mg", "Lipitor 20mg", "Atorlip 20mg", "Torvast 20mg", "Storvas 20mg",
    "Metformin 500mg", "Glucophage 500mg", "Diabetin 500mg", "Glucomin 500mg", "Metfin 500mg",
    "Gliclazide 80mg", "Diamicron 80mg", "Glizid 80mg", "Glirid 80mg", "Glicept 30mg",
    "Losartan 50mg", "Cozaar 50mg", "Lortaan 50mg", "Losagen 50mg", "Angioten 50mg",
    "Enalapril 10mg", "Renitec 10mg", "Envas 10mg", "Enapril 10mg", "Berlipril 10mg",
    "Bisoprolol 5mg", "Concor 5mg", "Bisopress 5mg", "Bisohexal 5mg", "Corbis 5mg",
    "Aspirin Cardio 100mg", "Thrombo ASS 100mg"
  ];

  cardiovascular.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Tim mạch - Huyết áp - Đái tháo đường",
      activeIngredient: name.includes("Amlodipine") || name.includes("Norvasc") || name.includes("Amlor")
        ? "Amlodipine Besilate 5mg"
        : name.includes("Atorvastatin") || name.includes("Lipitor") || name.includes("Atorlip")
        ? "Atorvastatin 20mg"
        : name.includes("Metformin") || name.includes("Glucophage") || name.includes("Diabetin")
        ? "Metformin HCl 500mg"
        : name.includes("Gliclazide") || name.includes("Diamicron") || name.includes("Glizid")
        ? "Gliclazide 80mg"
        : name.includes("Losartan") || name.includes("Cozaar") || name.includes("Lortaan")
        ? "Losartan Potassium 50mg"
        : name.includes("Enalapril") || name.includes("Renitec") || name.includes("Envas")
        ? "Enalapril Maleate 10mg"
        : name.includes("Bisoprolol") || name.includes("Concor") || name.includes("Bisopress")
        ? "Bisoprolol Fumarate 5mg"
        : "Aspirin 100mg",
      type: "Prescription",
      price: Math.floor(Math.random() * 150000) + 50000,
      indication: "Điều trị tăng huyết áp, suy tim, đái tháo đường type 2, hạ cholesterol",
      dosage: "Theo chỉ định bác sĩ. Thường 1 viên/ngày vào buổi sáng",
      contraindication: "Quá mẫn, sốc tim, tụt huyết áp nặng, suy gan/thận nặng",
      sideEffects: "Chóng mặt, mệt mỏi, hạ đường huyết (thuốc tiểu đường)",
      usage: "Uống cùng giờ mỗi ngày, có thể trước hoặc sau ăn",
      expiryInfo: "36 tháng kể từ ngày sản xuất",
      storage: "Nơi khô mát, tránh ánh sáng, nhiệt độ dưới 30°C",
      packaging: "Viên nén bao phim",
      packSize: "Hộp 3-10 vỉ x 10 viên",
      warnings: "Dùng thuốc đều đặn, không tự ý ngừng thuốc. Theo dõi huyết áp/đường huyết thường xuyên",
      manufacturer: mfr,
      qualityControl: "Đạt chuẩn GMP-WHO, chất lượng được kiểm soát chặt chẽ",
      keywords: [name.toLowerCase(), "huyết áp", "tim mạch", "đái tháo đường", "cholesterol"]
    });
  });

  // Skincare & Dermatology - 2 medicines to reach 200
  const skincare = ["Acyclovir Cream 5%", "Betamethasone 0.1%"];

  skincare.forEach(name => {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    medicineData.push({
      id: id++,
      name: name,
      category: "Da liễu - Ngoại dùng",
      activeIngredient: name.includes("Acyclovir") ? "Acyclovir 5%" : "Betamethasone Dipropionate 0.1%",
      type: "Prescription",
      price: Math.floor(Math.random() * 80000) + 40000,
      indication: "Điều trị nhiễm virus herpes, viêm da, chàm, vảy nến",
      dosage: "Bôi mỏng lên vùng da bị tổn thương 2-3 lần/ngày",
      contraindication: "Quá mẫn, nhiễm trùng da nặng",
      sideEffects: "Kích ứng da, đỏ da, khô da",
      usage: "Rửa sạch vùng da trước khi bôi thuốc",
      expiryInfo: "24 tháng kể từ ngày sản xuất",
      storage: "Nơi khô mát, tránh ánh sáng trực tiếp",
      packaging: "Tuýp kem bôi ngoài da",
      packSize: "Tuýp 10g-15g",
      warnings: "Chỉ dùng ngoài da, tránh tiếp xúc với mắt và niêm mạc",
      manufacturer: mfr,
      qualityControl: "Đạt chuẩn GMP",
      keywords: [name.toLowerCase(), "da liễu", "bôi ngoài"]
    });
  });

  // Save to JSON file
  const output = {
    medicines: medicineData,
    lastUpdated: new Date().toISOString(),
    totalCount: medicineData.length
  };

  fs.writeFileSync('medicines-database.json', JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Generated ${medicineData.length} medicines successfully!`);
  console.log('📄 File saved: medicines-database.json');
  console.log('\n📝 Next steps:');
  console.log('1. Get free API key from Pexels: https://www.pexels.com/api/');
  console.log('2. Add PEXELS_API_KEY to .env.local');
  console.log('3. Run: node download-medicine-images.js');
}

// Run the generator
generateMedicines();
