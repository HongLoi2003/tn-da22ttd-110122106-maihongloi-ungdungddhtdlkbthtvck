const fs = require('fs');

// Read current data
const data = JSON.parse(fs.readFileSync('symptoms-mapping.json', 'utf8'));

// Create a map of symptomId -> specialtyIds
const symptomToSpecialties = {};
data.mappings.forEach(mapping => {
  mapping.symptomIds.forEach(symptomId => {
    if (!symptomToSpecialties[symptomId]) {
      symptomToSpecialties[symptomId] = [];
    }
    symptomToSpecialties[symptomId].push(mapping.specialtyId);
  });
});

// Keywords mapping for better search
const keywordsMap = {
  "đau đầu": ["dau dau", "nhuc dau", "dau nua dau", "dau dau rat"],
  "sốt": ["sot", "nong", "sot cao", "sot nhe"],
  "ho": ["ho", "ho khan", "ho co dom", "ho lau ngay"],
  "khó thở": ["kho tho", "tho kho", "kho hut tho", "nghet tho"],
  "đau ngực": ["dau nguc", "dau tuc nguc", "thot nguc"],
  "tim đập nhanh": ["tim dap nhanh", "tim dap manh", "hoi hop"],
  "đau bụng": ["dau bung", "dau bung duoi", "dau bung tren"],
  "tiêu chảy": ["tieu chay", "di ngoai", "pha phan"],
  "nổi mẩn đỏ": ["noi man do", "man do", "phat ban"],
  "ngứa": ["ngua", "ngua da", "ngua ngay"],
  "đau khớp": ["dau khop", "dau xuong khop", "nhuc khop"],
  "mất ngủ": ["mat ngu", "kho ngu", "ngu khong duoc"],
  "chóng mặt": ["chong mat", "hoa mat", "mat can bang"],
  "buồn nôn": ["buon non", "non", "cam thay non"],
  "mệt mỏi": ["met moi", "uon oai", "met liet"],
  "đau họng": ["dau hong", "ho hong", "hong dau"],
  "chảy máu cam": ["chay mau cam", "mau mui", "chay mau mui"],
  "nhức mắt": ["nhuc mat", "dau mat", "mat dau"],
  "chảy máu chân răng": ["chay mau chan rang", "chan rang chay mau", "chay mau nuou"],
  "đau tai": ["dau tai", "nhuc tai", "tai dau"],
  "huyết áp cao": ["huyet ap cao", "cao huyet ap", "tang huyet ap"],
  "huyết áp thấp": ["huyet ap thap", "thap huyet ap", "giam huyet ap"],
  "phù chân": ["phu chan", "sung chan", "chan phu"],
  "đau tay trái": ["dau tay trai", "tay trai dau", "nhuc tay trai"],
  "vã mồ hôi": ["va mo hoi", "ra mo hoi", "mo hoi trat"],
  "ngất xỉu": ["ngat xiu", "ngat", "bat tinh"],
  "mạch đập không đều": ["mach dap khong deu", "mach loan", "mach khong deu"],
  "tím môi": ["tim moi", "moi tim", "moi xanh"],
  "đau vai": ["dau vai", "nhuc vai", "vai dau"],
  "ho ra máu": ["ho ra mau", "ho mau", "dom mau"],
  "run tay": ["run tay", "tay run", "run chan tay"],
  "tê chân tay": ["te chan tay", "te tay", "te chan"],
  "mất trí nhớ": ["mat tri nho", "quen", "kho nho"],
  "co giật": ["co giat", "giat", "co thang"],
  "liệt nửa người": ["liet nua nguoi", "liet", "bi liet"],
  "nói khó": ["noi kho", "kho noi", "noi khong ro"],
  "nhìn đôi": ["nhin doi", "nhin mo", "nhin khong ro"],
  "đau dây thần kinh": ["dau day than kinh", "than kinh dau", "dau than kinh"],
  "mất thăng bằng": ["mat thang bang", "khong thang bang", "di khong vung"],
  "lo âu": ["lo au", "lo lang", "cang thang"],
  "táo bón": ["tao bon", "kho di ngoai", "kho di cau"],
  "ợ hơi": ["o hoi", "o", "day hoi"],
  "ợ chua": ["o chua", "tro chua", "chua"],
  "đầy bụng": ["day bung", "bung day", "no bung"],
  "chán ăn": ["chan an", "khong muon an", "an khong ngon"],
  "sụt cân": ["sut can", "giam can", "gay di"],
  "nôn ra máu": ["non ra mau", "non mau", "oi mau"],
  "phân đen": ["phan den", "di cau den", "phan mau den"],
  "vàng da": ["vang da", "da vang", "vang mat"],
  "ngứa da": ["ngua da", "da ngua", "ngua ngay"],
  "mụn trứng cá": ["mun trung ca", "mun", "mun ca"],
  "vảy nến": ["vay nen", "da vay", "vay trang"],
  "chàm": ["cham", "viem da", "da do"],
  "nấm da": ["nam da", "da nam", "nam"],
  "rụng tóc": ["rung toc", "toc rung", "hoi dau"],
  "mụn nhọt": ["mun nhot", "nhot", "mun sung"],
  "lang ben": ["lang ben", "ghẻ", "ghe"],
  "sẹo": ["seo", "vet seo", "vet tham"],
  "nám da": ["nam da", "nam", "tham nam"],
  "đau lưng": ["dau lung", "lung dau", "nhuc lung"],
  "đau cổ": ["dau co", "co dau", "nhuc co"],
  "đau vai gáy": ["dau vai gay", "vai gay dau", "dau gay"],
  "đau gối": ["dau goi", "goi dau", "nhuc goi"],
  "sưng khớp": ["sung khop", "khop sung", "khop phu"],
  "cứng khớp": ["cung khop", "khop cung", "khop khong uon"],
  "gai cột sống": ["gai cot song", "thoai hoa cot song", "cot song"],
  "thoát vị đĩa đệm": ["thoat vi dia dem", "thoat vi", "dia dem"],
  "loãng xương": ["loang xuong", "xuong loang", "xuong yeu"],
  "gãy xương": ["gay xuong", "xuong gay", "rang xuong"],
  "nghe kém": ["nghe kem", "diec", "kho nghe"],
  "ù tai": ["u tai", "tai u", "o o"],
  "chảy mủ tai": ["chay mu tai", "tai chay mu", "mu tai"],
  "nghẹt mũi": ["nghet mui", "mui nghet", "tac mui"],
  "sổ mũi": ["so mui", "chay mui", "mui chay"],
  "hắt hơi": ["hat hoi", "hat", "hat hoi lien tuc"],
  "viêm xoang": ["viem xoang", "xoang", "dau xoang"],
  "viêm amidan": ["viem amidan", "amidan", "sung amidan"],
  "khàn tiếng": ["khan tieng", "tieng khan", "mat tieng"],
  "nuốt khó": ["nuot kho", "kho nuot", "dau khi nuot"],
  "mờ mắt": ["mo mat", "mat mo", "nhin mo"],
  "đỏ mắt": ["do mat", "mat do", "mat hong"],
  "chảy nước mắt": ["chay nuoc mat", "mat chay nuoc", "chay le"],
  "ghèn mắt": ["ghen mat", "mat ghen", "mat chay mu"],
  "lác mắt": ["lac mat", "mat lac", "mat le"],
  "cận thị": ["can thi", "can", "nhin gan"],
  "viễn thị": ["vien thi", "vien", "nhin xa"],
  "đục thủy tinh thể": ["duc thuy tinh the", "duc mat", "mo mat"],
  "tăng nhãn áp": ["tang nhan ap", "nhan ap cao", "glocom"],
  "sâu răng": ["sau rang", "rang sau", "rang hong"],
  "đau răng": ["dau rang", "rang dau", "nhuc rang"],
  "viêm nướu": ["viem nuou", "nuou sung", "nuou do"],
  "hôi miệng": ["hoi mieng", "mieng hoi", "hoi tho"],
  "răng lung lay": ["rang lung lay", "rang lay", "rang yeu"],
  "tăng đường huyết": ["tang duong huyet", "duong huyet cao", "tieu duong"],
  "khát nước": ["khat nuoc", "khat", "muon uong nuoc"],
  "đi tiểu nhiều": ["di tieu nhieu", "tieu nhieu", "di tieu lien tuc"],
  "tăng cân": ["tang can", "beo len", "nang can"],
  "rối loạn kinh nguyệt": ["roi loan kinh nguyet", "kinh khong deu", "kinh nguyet"],
  "vô sinh": ["vo sinh", "khong co con", "hiem muon"],
  "bướu cổ": ["buou co", "co sung", "giap"],
  "thở khò khè": ["tho kho khe", "kho khe", "tho kho"],
  "đau khi hít thở": ["dau khi hit tho", "hit tho dau", "tho dau"],
  "ho có đờm": ["ho co dom", "ho dom", "dom"],
  "khó thở khi nằm": ["kho tho khi nam", "nam kho tho", "tho kho nam"],
  "nổi mụn": ["noi mun", "mun", "mun tren mat"],
  "da khô": ["da kho", "kho da", "da nut"],
  "mẩn ngứa": ["man ngua", "ngua man", "phat ban ngua"],
  "sưng mí mắt": ["sung mi mat", "mi mat sung", "mat sung"],
  "đau nhức mắt": ["dau nhuc mat", "mat dau nhuc", "nhuc mat"],
  "nhìn có vệt sáng": ["nhin co vet sang", "vet sang", "chop mat"],
  "thở nhanh": ["tho nhanh", "tho gap", "tho hoi hop"],
  "đau tức ngực": ["dau tuc nguc", "tuc nguc", "nguc tuc"],
  "ho dai dẳng": ["ho dai dang", "ho lau ngay", "ho khong dut"],
  "khó thở về đêm": ["kho tho ve dem", "dem kho tho", "tho kho dem"],
  "tăng cân nhanh": ["tang can nhanh", "beo nhanh", "nang len nhanh"],
  "khát nước nhiều": ["khat nuoc nhieu", "khat lien tuc", "uong nhieu nuoc"],
  "run tay chân": ["run tay chan", "tay chan run", "run rat"],
  "sưng lợi": ["sung loi", "loi sung", "loi do"],
  "răng ê buốt": ["rang e buot", "e buot", "rang nhay cam"],
  "đau bụng dưới": ["dau bung duoi", "bung duoi dau", "dau ha bung"],
  "kinh nguyệt không đều": ["kinh nguyet khong deu", "kinh khong deu", "kinh loan"],
  "ra máu bất thường": ["ra mau bat thuong", "chay mau", "xuat huyet"],
  "buồn nôn sáng sớm": ["buon non sang som", "non sang", "non buoi sang"],
  "đau lưng dưới": ["dau lung duoi", "lung duoi dau", "dau that lung"],
  "khó nuốt": ["kho nuot", "nuot kho", "nuot dau"],
  "đầy hơi": ["day hoi", "hoi bung", "bung day hoi"],
  "đau thượng vị": ["dau thuong vi", "thuong vi dau", "dau da day"]
};

// Update symptoms with keywords and specialtyIds
const updatedSymptoms = data.symptoms.map(symptom => {
  return {
    ...symptom,
    keywords: keywordsMap[symptom.name] || [symptom.name.toLowerCase()],
    specialtyIds: symptomToSpecialties[symptom.id] || []
  };
});

// Create updated data structure
const updatedData = {
  symptoms: updatedSymptoms,
  mappings: data.mappings
};

// Write to file
fs.writeFileSync('symptoms-mapping.json', JSON.stringify(updatedData, null, 2), 'utf8');

console.log('✅ Updated symptoms-mapping.json successfully!');
console.log(`📊 Total symptoms: ${updatedSymptoms.length}`);
console.log(`📊 Total specialties: ${data.mappings.length}`);
console.log('\n🔍 Sample symptom with new fields:');
console.log(JSON.stringify(updatedSymptoms[0], null, 2));
