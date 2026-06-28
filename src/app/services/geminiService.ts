import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // Chỉ khởi tạo nếu API key hợp lệ (bắt đầu bằng AIzaSy và không có dấu chấm ở đầu)
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      console.log('ℹ️ [GEMINI] API key not configured - using fallback');
      console.log('ℹ️ [GEMINI] Get API key from: https://aistudio.google.com/app/apikey');
      return;
    }

    // Kiểm tra format API key
    if (!API_KEY.startsWith('AIzaSy')) {
      console.error('❌ [GEMINI] Invalid API key format!');
      console.error('❌ [GEMINI] Your API key starts with:', API_KEY.substring(0, 10) + '...');
      console.error('❌ [GEMINI] Gemini API key MUST start with: AIzaSy');
      console.error('❌ [GEMINI] Your key appears to be from a different service');
      console.error('ℹ️ [GEMINI] Get correct API key from: https://aistudio.google.com/app/apikey');
      return;
    }

    // Kiểm tra dấu chấm ở đầu (AQ. không hợp lệ)
    if (API_KEY.startsWith('AQ.') || API_KEY.startsWith('sk-') || API_KEY.startsWith('sk-ant-')) {
      console.error('❌ [GEMINI] Invalid API key format!');
      console.error('❌ [GEMINI] This is NOT a Gemini API key');
      console.error('❌ [GEMINI] Detected format:', API_KEY.substring(0, 10) + '...');
      console.error('ℹ️ [GEMINI] Get Gemini API key from: https://aistudio.google.com/app/apikey');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      console.log('✅ [GEMINI] Service initialized successfully');
      console.log('✅ [GEMINI] API key format: AIzaSy... (' + API_KEY.length + ' chars)');
    } catch (error) {
      console.error('❌ [GEMINI] Failed to initialize:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  /**
   * Phân tích triệu chứng bằng Gemini AI với database triệu chứng đầy đủ
   * Trả về TẤT CẢ các chuyên khoa có liên quan (khi triệu chứng trùng nhiều khoa)
   */
  async analyzeSymptoms(symptomText: string, symptomsDatabase?: any[]): Promise<{
    specialties: Array<{
      specialty: string;
      confidence: number;
      explanation: string;
      matchedSymptoms: string[];
    }>;
  } | null> {
    if (!this.model) {
      console.warn('⚠️ [GEMINI] API key not configured');
      return null;
    }

    try {
      console.log('🤖 [GEMINI] Analyzing symptoms:', symptomText);

      // Tạo danh sách triệu chứng theo chuyên khoa từ database
      let symptomsBySpecialty = '';
      if (symptomsDatabase && symptomsDatabase.length > 0) {
        // Group symptoms by specialty
        const specialtyGroups: { [key: string]: string[] } = {};
        symptomsDatabase.forEach((mapping: any) => {
          if (!specialtyGroups[mapping.specialtyName]) {
            specialtyGroups[mapping.specialtyName] = [];
          }
          mapping.symptomIds.forEach((id: number) => {
            // Find symptom name from symptoms list (would need to pass this too)
            specialtyGroups[mapping.specialtyName].push(`symptom_${id}`);
          });
        });
        
        symptomsBySpecialty = Object.entries(specialtyGroups)
          .map(([specialty, symptoms]) => `${specialty}: ${symptoms.slice(0, 10).join(', ')}`)
          .join('\n');
      }

      const prompt = `
Bạn là một trợ lý y tế AI chuyên nghiệp. Phân tích triệu chứng của bệnh nhân và gợi ý chuyên khoa phù hợp nhất.

DANH SÁCH ĐẦY ĐỦ CÁC TRIỆU CHỨNG THEO CHUYÊN KHOA:

**1. THẦN KINH:**
Đau đầu, Chóng mặt, Mất ngủ, Đau nửa đầu, Run tay chân, Tê tay chân, Co giật, Mất trí nhớ, Hay quên, Mệt mỏi thần kinh, Khó tập trung, Stress kéo dài, Đau dây thần kinh, Mất thăng bằng, Hoa mắt, Ngất xỉu, Yếu cơ, Liệt mặt, Đau cổ vai gáy, Đau lưng thần kinh, Dị cảm, Rối loạn giấc ngủ, Căng thẳng thần kinh, Lo âu, Trầm cảm nhẹ, Động kinh, Khó nói, Méo miệng, Tay chân yếu, Rối loạn cảm giác

**2. CƠ XƯƠNG KHỚP:**
Đau lưng, Đau cổ vai gáy, Đau khớp gối, Đau vai, Đau cột sống, Tê tay chân, Cứng khớp, Đau cơ, Nhức mỏi xương khớp, Sưng khớp, Viêm khớp, Khó vận động, Đau thắt lưng, Đau bàn chân, Đau bàn tay, Chuột rút, Yếu cơ, Khớp phát tiếng kêu, Đau khi đi lại, Đau đầu gối khi leo cầu thang, Cứng cổ, Đau hông, Đau xương, Sưng đau cơ, Mỏi vai gáy, Thoái hóa khớp, Đau dây thần kinh tọa, Khó cúi người, Khó đứng lâu, Đau khi vận động

**3. DA LIỄU:**
Nổi mẩn đỏ, Ngứa da, Mụn trứng cá, Dị ứng da, Phát ban, Da khô, Da bong tróc, Nổi mề đay, Viêm da, Nấm da, Lang ben, Chàm da, Da nổi đốm, Da bị kích ứng, Mụn nước, Da sưng đỏ, Ngứa da đầu, Rụng tóc, Gàu nhiều, Da nhờn, Da bị thâm, Viêm nang lông, Nứt da, Da bị cháy nắng, Mụn viêm, Da nổi hạt, Da đổi màu, Ngứa toàn thân, Viêm da cơ địa, Da bị sẹo

**4. HÔ HẤP:**
Ho, Ho khan, Ho có đờm, Khó thở, Đau họng, Viêm họng, Nghẹt mũi, Sổ mũi, Hắt hơi, Đau ngực khi thở, Thở khò khè, Tức ngực, Viêm phế quản, Viêm phổi, Hen suyễn, Ho kéo dài, Khàn tiếng, Mất tiếng, Khó nuốt, Đau khi nuốt, Thở gấp, Ho ra máu, Đờm nhiều, Viêm xoang, Chảy nước mũi, Viêm amidan, Cảm lạnh, Sốt kèm ho, Mệt khi hít thở, Dị ứng hô hấp

**5. MẮT:**
Đau mắt, Mắt đỏ, Mờ mắt, Khô mắt, Ngứa mắt, Chảy nước mắt, Nhìn đôi, Sưng mắt, Cộm mắt, Nhạy cảm ánh sáng, Mỏi mắt, Giảm thị lực, Nhìn không rõ, Đau khi nhìn, Mắt có ghèn, Viêm kết mạc, Viêm bờ mi, Mắt bị kích ứng, Chớp mắt nhiều, Nhìn thấy đốm đen, Mắt bị khô rát, Chảy ghèn mắt, Mắt bị sưng đỏ, Mắt mệt mỏi, Nhìn xa không rõ, Nhìn gần không rõ, Đau hốc mắt, Cay mắt, Mắt bị lóa, Co giật mí mắt

**6. NHI KHOA:**
Sốt, Ho, Sổ mũi, Nghẹt mũi, Đau họng, Khó thở, Biếng ăn, Quấy khóc, Tiêu chảy, Nôn ói, Đau bụng, Phát ban, Dị ứng, Mệt mỏi, Khò khè, Táo bón, Sụt cân, Chậm tăng cân, Mất ngủ, Co giật, Da nổi mẩn, Viêm họng, Viêm tai, Sốt cao, Chảy nước mũi, Đổ mồ hôi nhiều, Bé bỏ bú, Khóc đêm, Mọc răng sốt, Viêm phế quản

**7. NỘI TIẾT:**
Tiểu nhiều, Khát nước nhiều, Sụt cân bất thường, Tăng cân nhanh, Mệt mỏi kéo dài, Đường huyết cao, Run tay, Đổ mồ hôi nhiều, Tim đập nhanh, Rụng tóc, Da khô, Khó ngủ, Mất ngủ, Ăn nhiều, Chán ăn, Mờ mắt, Tê tay chân, Yếu cơ, Hạ đường huyết, Huyết áp cao, Mệt sau ăn, Vết thương lâu lành, Đi tiểu ban đêm nhiều, Khô miệng, Da sạm màu, Căng thẳng nội tiết, Rối loạn kinh nguyệt, Tăng tiết mồ hôi, Lạnh tay chân, Rối loạn hormone

**8. RĂNG HÀM MẶT:**
Đau răng, Sâu răng, Chảy máu chân răng, Sưng nướu, Hôi miệng, Ê buốt răng, Viêm nướu, Viêm nha chu, Đau hàm, Mọc răng khôn, Lệch khớp cắn, Răng lung lay, Khó nhai, Đau khi ăn uống, Viêm tủy răng, Mẻ răng, Răng bị vàng, Áp xe răng, Sưng mặt do răng, Nhiệt miệng, Loét miệng, Khô miệng, Đau lợi, Khó há miệng, Đau khớp hàm, Viêm miệng, Mất răng, Răng nhạy cảm, Đau quai hàm, Cắn đau

**9. SẢN PHỤ KHOA:**
Đau bụng dưới, Rối loạn kinh nguyệt, Trễ kinh, Đau bụng kinh, Rong kinh, Khí hư bất thường, Ngứa vùng kín, Đau vùng chậu, Ra máu bất thường, Tiểu buốt, Tiểu rắt, Đau khi quan hệ, Buồn nôn khi mang thai, Mệt mỏi khi mang thai, Thai máy bất thường, Đau lưng khi mang thai, Căng tức ngực, Khó thụ thai, Viêm phụ khoa, Viêm âm đạo, Nấm âm đạo, Ra khí hư có mùi, Chậm kinh, Đau tử cung, Sảy thai dấu hiệu, Phù chân khi mang thai, Co thắt bụng, Đau sau sinh, Kinh nguyệt không đều, Ra dịch bất thường

**10. TAI MŨI HỌNG:**
Đau họng, Viêm họng, Ho, Khàn tiếng, Mất tiếng, Nghẹt mũi, Sổ mũi, Chảy nước mũi, Hắt hơi, Đau tai, Ù tai, Nghe kém, Viêm tai giữa, Chảy mủ tai, Viêm xoang, Đau vùng xoang, Khó nuốt, Đau khi nuốt, Hôi miệng, Viêm amidan, Sưng amidan, Khó thở bằng mũi, Ngứa họng, Đau đầu do xoang, Chảy máu cam, Khạc đờm, Dị ứng mũi, Thở khò khè, Cảm lạnh, Sốt kèm đau họng

**11. TIÊU HÓA:**
Đau bụng, Đầy hơi, Khó tiêu, Buồn nôn, Nôn ói, Tiêu chảy, Táo bón, Đau dạ dày, Ợ chua, Ợ nóng, Chướng bụng, Đi ngoài ra máu, Phân đen, Đau bụng dưới, Viêm đại tràng, Viêm dạ dày, Co thắt bụng, Khó nuốt, Đau khi ăn, Ăn không ngon, Sụt cân, Mệt mỏi tiêu hóa, Đau gan, Vàng da, Đắng miệng, Đau quanh rốn, Đi ngoài nhiều lần, Táo bón kéo dài, Nóng rát dạ dày, Trào ngược dạ dày

**12. TIM MẠCH:**
Đau ngực, Tức ngực, Khó thở, Tim đập nhanh, Tim đập chậm, Hồi hộp, Chóng mặt, Mệt mỏi, Đau tim, Huyết áp cao, Huyết áp thấp, Đau ngực khi vận động, Khó thở khi nằm, Phù chân, Đau vai trái, Tê tay trái, Ngất xỉu, Tim đập không đều, Đau tức vùng tim, Thở gấp, Mệt khi leo cầu thang, Đau lan lên cổ, Đổ mồ hôi lạnh, Đau ngực kéo dài, Cảm giác hụt hơi, Mệt tim, Đau vùng ngực trái, Nhịp tim bất thường, Căng tức ngực, Khó thở về đêm

Triệu chứng của bệnh nhân: "${symptomText}"

NHIỆM VỤ:
1. Phân tích kỹ lưỡng các triệu chứng bệnh nhân mô tả
2. So khớp với danh sách triệu chứng của TỪNG chuyên khoa ở trên
3. Tìm TẤT CẢ các chuyên khoa có triệu chứng khớp (không chỉ 1 chuyên khoa)
4. Đánh giá độ tin cậy cho từng chuyên khoa dựa trên số lượng và mức độ nghiêm trọng
5. Sắp xếp theo độ tin cậy từ cao xuống thấp

QUAN TRỌNG: Nếu triệu chứng xuất hiện ở NHIỀU chuyên khoa, hãy liệt kê TẤT CẢ các chuyên khoa đó!

Ví dụ: "Đau đầu, chóng mặt" có thể thuộc cả Thần kinh (90%) và Tim mạch (60%)

Hãy trả lời theo định dạng JSON chính xác như sau (không thêm markdown hay text khác):
{
  "specialties": [
    {
      "specialty": "Thần kinh",
      "confidence": 90,
      "explanation": "Đau đầu và chóng mặt là triệu chứng điển hình của bệnh lý thần kinh",
      "matchedSymptoms": ["Đau đầu", "Chóng mặt"]
    },
    {
      "specialty": "Tim mạch",
      "confidence": 60,
      "explanation": "Chóng mặt cũng có thể do huyết áp thấp hoặc rối loạn tim mạch",
      "matchedSymptoms": ["Chóng mặt"]
    }
  ]
}

LƯU Ý QUAN TRỌNG:
- Phải trả về MẢNG specialties (có thể có 1 hoặc nhiều chuyên khoa)
- Mỗi specialty phải là 1 trong 12 chuyên khoa: Thần kinh, Cơ xương khớp, Da liễu, Hô hấp, Mắt, Nhi khoa, Nội tiết, Răng hàm mặt, Sản phụ khoa, Tai mũi họng, Tiêu hóa, Tim mạch
- confidence là số từ 0-100 dựa trên mức độ phù hợp
- explanation ngắn gọn (1-2 câu), giải thích rõ ràng
- matchedSymptoms là các triệu chứng được nhận diện cho chuyên khoa đó
- Sắp xếp theo confidence từ cao xuống thấp
- Chỉ liệt kê các chuyên khoa có confidence >= 30%
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 [GEMINI] Raw response:', text);

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ [GEMINI] Could not parse JSON from response');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ [GEMINI] Parsed result:', parsed);

      // Validate and normalize confidence values
      if (parsed.specialties && Array.isArray(parsed.specialties)) {
        parsed.specialties = parsed.specialties.map((spec: any) => ({
          specialty: spec.specialty,
          confidence: Math.min(100, Math.max(0, spec.confidence)),
          explanation: spec.explanation,
          matchedSymptoms: spec.matchedSymptoms || []
        }));
        
        // Sort by confidence (highest first)
        parsed.specialties.sort((a: any, b: any) => b.confidence - a.confidence);
        
        console.log('✅ [GEMINI] Found', parsed.specialties.length, 'matching specialties');
        return parsed;
      }

      console.error('❌ [GEMINI] Invalid response format - missing specialties array');
      return null;
    } catch (error) {
      console.error('❌ [GEMINI] Error analyzing symptoms:', error);
      return null;
    }
  }

  /**
   * Kiểm tra xem Gemini AI có sẵn không
   */
  isAvailable(): boolean {
    return this.model !== null;
  }
}

export default new GeminiService();
