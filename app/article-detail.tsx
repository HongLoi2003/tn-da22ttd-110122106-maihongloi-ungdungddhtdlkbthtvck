import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { addComment, toggleCommentLike } from './services/commentService';
import { getAllDocuments } from './services/firebaseService';

const articleImages = {
  '1': require('@/assets/images/chedouonguoc.png'),
  '2': require('@/assets/images/stress.png'),
  '3': require('@/assets/images/dauhieubenhtim.png'),
  '4': require('@/assets/images/yoga.png'),
  '5': require('@/assets/images/chamsocdamun.png'),
  '6': require('@/assets/images/chamsoctresosinh.png'),
  '7': require('@/assets/images/thaikykhoemanh.png'),
  '8': require('@/assets/images/daukhopgoi.png'),
  '9': require('@/assets/images/viemxoangmantinh.png'),
  '10': require('@/assets/images/canthiotreem.png'),
  '11': require('@/assets/images/chamsocrang.png'),
  '12': require('@/assets/images/Phongnguatieuduong.png'),
  'featured': require('@/assets/images/dauhieubenhtim.png'),
};

const doctorImages = {
  'nguyenvanam.png': require('@/assets/images/nguyenvanam.png'),
  'tranthilan.png': require('@/assets/images/tranthilan.png'),
  'leminhtam.png': require('@/assets/images/leminhtam.png'),
  'phamthuha.png': require('@/assets/images/phamthuha.png'),
};

const articleData = {
  '1': {
    title: 'Uống đủ nước mỗi ngày',
    category: 'Dinh dưỡng',
    author: 'BS. Nguyễn Văn An',
    authorSpecialty: 'Chuyên khoa Dinh dưỡng',
    authorImage: 'nguyenvanam.png',
    subtitle: 'Nước là nguồn sống, chiếm 60-70% trọng lượng cơ thể. Uống đủ nước mỗi ngày giúp cơ thể hoạt động tốt, duy trì sức khỏe và phòng ngừa nhiều bệnh tật.',
    sections: [
      {
        id: 1,
        title: 'Lợi ích của việc uống đủ nước',
        description: 'Nước giúp điều hòa nhiệt độ cơ thể, vận chuyển chất dinh dưỡng, thải độc tố, bôi trơn khớp và bảo vệ các cơ quan nội tạng.',
        tip: 'Uống 2-2.5 lít nước mỗi ngày, chia đều trong suốt cả ngày.',
        icon: 'water',
        color: '#06B6D4',
      },
      {
        id: 2,
        title: 'Dấu hiệu thiếu nước',
        description: 'Khát nước, môi khô, nước tiểu vàng đậm, mệt mỏi, chóng mặt, đau đầu là những dấu hiệu cơ thể đang thiếu nước.',
        tip: 'Không đợi khát mới uống nước. Hãy uống nước đều đặn trong ngày.',
        icon: 'alert-circle',
        color: '#EF4444',
      },
      {
        id: 3,
        title: 'Thời điểm nên uống nước',
        description: 'Uống nước khi thức dậy, trước bữa ăn 30 phút, sau khi tập thể dục, trước khi ngủ và khi cảm thấy khát.',
        tip: 'Mang theo chai nước bên mình để nhắc nhở uống nước thường xuyên.',
        icon: 'time',
        color: '#10B981',
      },
    ],
  },
  '2': {
    title: 'Cách ngủ ngon hơn',
    category: 'Sức khỏe tâm thần',
    author: 'BS. Phạm Thu Hà',
    authorSpecialty: 'Chuyên khoa Tâm thần',
    authorImage: 'phamthuha.png',
    subtitle: 'Giấc ngủ chất lượng là nền tảng của sức khỏe. Ngủ đủ giấc giúp cơ thể phục hồi, tăng cường trí nhớ và cải thiện tâm trạng.',
    sections: [
      {
        id: 1,
        title: 'Tạo môi trường ngủ lý tưởng',
        description: 'Phòng ngủ nên tối, mát mẻ (18-22°C), yên tĩnh. Sử dụng rèm che sáng, máy tạo tiếng ồn trắng nếu cần.',
        tip: 'Tắt tất cả thiết bị điện tử 1 giờ trước khi ngủ.',
        icon: 'moon',
        color: '#8B5CF6',
      },
      {
        id: 2,
        title: 'Xây dựng thói quen ngủ',
        description: 'Đi ngủ và thức dậy cùng giờ mỗi ngày, kể cả cuối tuần. Tạo nghi thức trước khi ngủ như đọc sách, nghe nhạc nhẹ.',
        tip: 'Ngủ 7-9 giờ mỗi đêm để cơ thể được nghỉ ngơi đầy đủ.',
        icon: 'bed',
        color: '#06B6D4',
      },
      {
        id: 3,
        title: 'Tránh những thứ làm mất ngủ',
        description: 'Hạn chế caffeine sau 2 giờ chiều, tránh ăn no trước khi ngủ, không uống nhiều nước trước khi đi ngủ.',
        tip: 'Tập thể dục đều đặn nhưng tránh tập quá gần giờ ngủ.',
        icon: 'close-circle',
        color: '#EF4444',
      },
    ],
  },
  '3': {
    title: 'Dấu hiệu bệnh tim',
    category: 'Tim mạch',
    author: 'BS. Trần Thị Lan',
    authorSpecialty: 'Chuyên khoa Tim mạch',
    authorImage: 'tranthilan.png',
    subtitle: 'Bệnh tim là nguyên nhân gây tử vong hàng đầu. Nhận biết sớm các dấu hiệu cảnh báo giúp phát hiện và điều trị kịp thời.',
    sections: [
      {
        id: 1,
        title: 'Đau ngực và khó thở',
        description: 'Đau thắt ngực, cảm giác nặng ngực, khó thở khi gắng sức hoặc nghỉ ngơi là dấu hiệu cảnh báo quan trọng.',
        tip: 'Gọi cấp cứu 115 ngay lập tức nếu có triệu chứng đau ngực dữ dội.',
        icon: 'heart',
        color: '#EF4444',
      },
      {
        id: 2,
        title: 'Mệt mỏi bất thường',
        description: 'Mệt mỏi kéo dài, chóng mặt, buồn nôn, đổ mồ hôi lạnh có thể là dấu hiệu của vấn đề tim mạch.',
        tip: 'Không bỏ qua các triệu chứng bất thường, đặc biệt ở phụ nữ.',
        icon: 'alert-circle',
        color: '#F59E0B',
      },
      {
        id: 3,
        title: 'Phòng ngừa bệnh tim',
        description: 'Ăn uống lành mạnh, tập thể dục đều đặn, kiểm soát huyết áp, cholesterol, không hút thuốc, giảm stress.',
        tip: 'Khám sức khỏe định kỳ 6 tháng/lần, đặc biệt nếu có tiền sử gia đình.',
        icon: 'shield-checkmark',
        color: '#10B981',
      },
    ],
  },
  '4': {
    title: 'Tập thể dục đều đặn',
    category: 'Thể dục',
    author: 'BS. Lê Minh Tâm',
    authorSpecialty: 'Chuyên khoa Y học thể thao',
    authorImage: 'leminhtam.png',
    subtitle: 'Vận động thể chất đều đặn là chìa khóa cho sức khỏe toàn diện. Tập luyện giúp tăng cường thể lực, cải thiện tâm trạng và phòng ngừa bệnh tật.',
    sections: [
      {
        id: 1,
        title: 'Lợi ích của tập thể dục',
        description: 'Tăng cường tim mạch, xương khớp, cơ bắp. Giảm nguy cơ béo phì, tiểu đường, huyết áp cao, ung thư.',
        tip: 'Tập ít nhất 150 phút/tuần với cường độ vừa phải.',
        icon: 'fitness',
        color: '#10B981',
      },
      {
        id: 2,
        title: 'Các loại hình tập luyện',
        description: 'Kết hợp cardio (chạy, bơi, đạp xe), tập sức mạnh (tạ, kháng lực), và tập dẻo dai (yoga, stretching).',
        tip: 'Chọn môn thể thao bạn yêu thích để duy trì lâu dài.',
        icon: 'barbell',
        color: '#06B6D4',
      },
      {
        id: 3,
        title: 'An toàn khi tập luyện',
        description: 'Khởi động kỹ trước khi tập, tăng cường độ dần dần, nghỉ ngơi đủ giữa các buổi tập, uống đủ nước.',
        tip: 'Nghe cơ thể mình, dừng lại nếu cảm thấy đau hoặc khó chịu.',
        icon: 'shield',
        color: '#F59E0B',
      },
    ],
  },
  '5': {
    title: 'Chế độ ăn cân bằng',
    category: 'Dinh dưỡng',
    author: 'BS. Nguyễn Văn An',
    authorSpecialty: 'Chuyên khoa Dinh dưỡng',
    authorImage: 'nguyenvanam.png',
    subtitle: 'Dinh dưỡng cân bằng là nền tảng của sức khỏe. Ăn uống đúng cách cung cấp năng lượng, duy trì cân nặng và phòng ngừa bệnh tật.',
    sections: [
      {
        id: 1,
        title: 'Nguyên tắc ăn uống lành mạnh',
        description: 'Ăn đa dạng thực phẩm, nhiều rau củ quả, ngũ cốc nguyên hạt, protein nạc, hạn chế đường, muối, chất béo bão hòa.',
        tip: 'Ăn 5 bữa nhỏ trong ngày thay vì 3 bữa lớn.',
        icon: 'restaurant',
        color: '#10B981',
      },
      {
        id: 2,
        title: 'Nhóm thực phẩm cần thiết',
        description: 'Carbohydrate (50-60%), protein (15-20%), chất béo (25-30%), vitamin, khoáng chất và nước.',
        tip: 'Ăn nhiều màu sắc khác nhau để đảm bảo đa dạng dinh dưỡng.',
        icon: 'nutrition',
        color: '#F59E0B',
      },
      {
        id: 3,
        title: 'Thói quen ăn uống tốt',
        description: 'Ăn chậm, nhai kỹ, không ăn khi xem TV, uống nước trước bữa ăn, không bỏ bữa sáng.',
        tip: 'Chuẩn bị bữa ăn tại nhà để kiểm soát chất lượng và khẩu phần.',
        icon: 'time',
        color: '#06B6D4',
      },
    ],
  },
  '6': {
    title: 'Yoga cho người mới bắt đầu',
    category: 'Thể dục',
    author: 'BS. Lê Minh Tâm',
    authorSpecialty: 'Chuyên khoa Y học thể thao',
    authorImage: 'leminhtam.png',
    subtitle: 'Yoga là bộ môn kết hợp thể chất, hơi thở và thiền định. Phù hợp với mọi lứa tuổi, giúp tăng sự dẻo dai, cân bằng và thư giãn.',
    sections: [
      {
        id: 1,
        title: 'Lợi ích của Yoga',
        description: 'Tăng sự dẻo dai, cải thiện tư thế, giảm đau lưng, tăng cường cơ bắp, cải thiện hô hấp và tuần hoàn.',
        tip: 'Tập yoga 3-4 lần/tuần, mỗi lần 30-60 phút.',
        icon: 'body',
        color: '#8B5CF6',
      },
      {
        id: 2,
        title: 'Các tư thế cơ bản',
        description: 'Mountain Pose (Tadasana), Downward Dog (Adho Mukha Svanasana), Child Pose (Balasana), Warrior Pose (Virabhadrasana).',
        tip: 'Bắt đầu với các tư thế đơn giản, tăng độ khó dần theo thời gian.',
        icon: 'fitness',
        color: '#06B6D4',
      },
      {
        id: 3,
        title: 'Lưu ý khi tập Yoga',
        description: 'Tập trên thảm yoga, mặc quần áo thoải mái, không tập khi đói hoặc quá no, lắng nghe cơ thể.',
        tip: 'Tập với giáo viên hoặc video hướng dẫn khi mới bắt đầu.',
        icon: 'information-circle',
        color: '#F59E0B',
      },
    ],
  },
  '7': {
    title: 'Quản lý stress hiệu quả',
    category: 'Sức khỏe tâm thần',
    author: 'BS. Phạm Thu Hà',
    authorSpecialty: 'Chuyên khoa Tâm thần',
    authorImage: 'phamthuha.png',
    subtitle: 'Stress kéo dài ảnh hưởng xấu đến sức khỏe thể chất và tinh thần. Học cách quản lý stress giúp cải thiện chất lượng cuộc sống.',
    sections: [
      {
        id: 1,
        title: 'Nhận biết dấu hiệu stress',
        description: 'Lo lắng, căng thẳng, mất ngủ, đau đầu, mệt mỏi, thay đổi cảm xúc, khó tập trung.',
        tip: 'Ghi nhật ký cảm xúc để nhận biết nguyên nhân gây stress.',
        icon: 'alert-circle',
        color: '#EF4444',
      },
      {
        id: 2,
        title: 'Kỹ thuật giảm stress',
        description: 'Hít thở sâu, thiền định, yoga, tập thể dục, nghe nhạc, đọc sách, gặp gỡ bạn bè.',
        tip: 'Dành 10-15 phút mỗi ngày để thư giãn và tĩnh tâm.',
        icon: 'happy',
        color: '#10B981',
      },
      {
        id: 3,
        title: 'Thay đổi lối sống',
        description: 'Ngủ đủ giấc, ăn uống lành mạnh, tập thể dục đều đặn, giảm caffeine, tránh rượu bia.',
        tip: 'Tìm kiếm sự hỗ trợ từ gia đình, bạn bè hoặc chuyên gia khi cần.',
        icon: 'heart',
        color: '#06B6D4',
      },
    ],
  },
  '8': {
    title: 'Phòng ngừa tiểu đường',
    category: 'Nội tiết',
    author: 'BS. Trần Thị Lan',
    authorSpecialty: 'Chuyên khoa Nội tiết',
    authorImage: 'tranthilan.png',
    subtitle: 'Tiểu đường type 2 có thể phòng ngừa được thông qua lối sống lành mạnh. Thay đổi nhỏ mỗi ngày mang lại lợi ích lớn cho sức khỏe.',
    sections: [
      {
        id: 1,
        title: 'Yếu tố nguy cơ',
        description: 'Thừa cân béo phì, ít vận động, tiền sử gia đình, tuổi trên 45, huyết áp cao, cholesterol cao.',
        tip: 'Kiểm tra đường huyết định kỳ nếu có yếu tố nguy cơ.',
        icon: 'warning',
        color: '#EF4444',
      },
      {
        id: 2,
        title: 'Chế độ ăn phòng ngừa',
        description: 'Hạn chế đường, tinh bột tinh chế. Ăn nhiều rau xanh, ngũ cốc nguyên hạt, protein nạc, chất béo lành mạnh.',
        tip: 'Kiểm soát khẩu phần ăn, tránh ăn quá no.',
        icon: 'nutrition',
        color: '#10B981',
      },
      {
        id: 3,
        title: 'Vận động và kiểm soát cân nặng',
        description: 'Tập thể dục 30 phút/ngày, duy trì cân nặng hợp lý, giảm 5-10% cân nặng nếu thừa cân.',
        tip: 'Đi bộ sau bữa ăn giúp kiểm soát đường huyết hiệu quả.',
        icon: 'walk',
        color: '#06B6D4',
      },
    ],
  },
  '9': {
    title: 'Thực phẩm tốt cho não bộ',
    category: 'Dinh dưỡng',
    author: 'BS. Nguyễn Văn An',
    authorSpecialty: 'Chuyên khoa Dinh dưỡng',
    authorImage: 'nguyenvanam.png',
    subtitle: 'Não bộ cần dinh dưỡng đặc biệt để hoạt động tốt. Ăn đúng thực phẩm giúp tăng cường trí nhớ, tập trung và phòng ngừa suy giảm nhận thức.',
    sections: [
      {
        id: 1,
        title: 'Thực phẩm giàu Omega-3',
        description: 'Cá hồi, cá thu, cá trích, hạt óc chó, hạt chia giàu omega-3, tốt cho não bộ và tim mạch.',
        tip: 'Ăn cá béo 2-3 lần/tuần để cung cấp đủ omega-3.',
        icon: 'fish',
        color: '#06B6D4',
      },
      {
        id: 2,
        title: 'Thực phẩm chống oxy hóa',
        description: 'Quả mọng (blueberry, strawberry), rau xanh đậm, chocolate đen, trà xanh giàu chất chống oxy hóa.',
        tip: 'Ăn nhiều màu sắc khác nhau để đa dạng chất chống oxy hóa.',
        icon: 'leaf',
        color: '#10B981',
      },
      {
        id: 3,
        title: 'Vitamin và khoáng chất',
        description: 'Vitamin B, E, folate, sắt, kẽm quan trọng cho não. Có trong trứng, ngũ cốc, thịt nạc, đậu.',
        tip: 'Ăn sáng đầy đủ để cung cấp năng lượng cho não hoạt động.',
        icon: 'nutrition',
        color: '#F59E0B',
      },
    ],
  },
  '10': {
    title: 'Cận thị ở trẻ em - Phòng ngừa sớm',
    category: 'Nhãn khoa',
    author: 'BS. Trần Thị Lan',
    authorSpecialty: 'Chuyên khoa Mắt',
    authorImage: 'tranthilan.png',
    subtitle: 'Cận thị ở trẻ em ngày càng phổ biến do sử dụng thiết bị điện tử nhiều. Phòng ngừa sớm giúp bảo vệ thị lực cho trẻ.',
    sections: [
      {
        id: 1,
        title: 'Nguyên nhân cận thị ở trẻ',
        description: 'Sử dụng điện thoại, máy tính nhiều, đọc sách gần, thiếu ánh sáng tự nhiên, yếu tố di truyền.',
        tip: 'Hạn chế thời gian sử dụng thiết bị điện tử dưới 2 giờ/ngày.',
        icon: 'phone-portrait',
        color: '#EF4444',
      },
      {
        id: 2,
        title: 'Dấu hiệu nhận biết',
        description: 'Trẻ nheo mắt khi nhìn xa, ngồi gần TV, than đau đầu, mỏi mắt, cọ mắt thường xuyên.',
        tip: 'Khám mắt định kỳ 6 tháng/lần để phát hiện sớm.',
        icon: 'eye',
        color: '#F59E0B',
      },
      {
        id: 3,
        title: 'Phòng ngừa hiệu quả',
        description: 'Cho trẻ chơi ngoài trời 2 giờ/ngày, ánh sáng đủ khi đọc sách, nghỉ mắt 20 giây sau 20 phút nhìn gần.',
        tip: 'Quy tắc 20-20-20: Cứ 20 phút nhìn gần, nhìn xa 20 feet trong 20 giây.',
        icon: 'sunny',
        color: '#10B981',
      },
    ],
  },
  '11': {
    title: 'Chăm sóc răng miệng đúng cách',
    category: 'Răng hàm mặt',
    author: 'BS. Lê Minh Tâm',
    authorSpecialty: 'Chuyên khoa Răng hàm mặt',
    authorImage: 'leminhtam.png',
    subtitle: 'Vệ sinh răng miệng đúng cách giúp phòng ngừa sâu răng, viêm nướu và các bệnh lý răng miệng khác.',
    sections: [
      {
        id: 1,
        title: 'Đánh răng đúng cách',
        description: 'Đánh răng 2 lần/ngày, mỗi lần 2-3 phút. Chải theo chiều dọc từ nướu xuống răng, không chải ngang.',
        tip: 'Thay bàn chải 3 tháng/lần hoặc khi lông bàn chải bung.',
        icon: 'brush',
        color: '#06B6D4',
      },
      {
        id: 2,
        title: 'Sử dụng chỉ nha khoa',
        description: 'Dùng chỉ nha khoa 1 lần/ngày để làm sạch kẽ răng, nơi bàn chải không với tới.',
        tip: 'Dùng chỉ nha khoa trước khi đánh răng để kem đánh răng thấm vào kẽ răng.',
        icon: 'git-branch',
        color: '#10B981',
      },
      {
        id: 3,
        title: 'Khám nha khoa định kỳ',
        description: 'Khám răng 6 tháng/lần để phát hiện sớm sâu răng, cao răng, viêm nướu và các vấn đề khác.',
        tip: 'Hạn chế đồ ngọt, nước ngọt có ga. Uống nước sau khi ăn.',
        icon: 'calendar',
        color: '#F59E0B',
      },
    ],
  },
  '12': {
    title: 'Phòng ngừa tiểu đường type 2',
    category: 'Nội tiết',
    author: 'BS. Nguyễn Văn An',
    authorSpecialty: 'Chuyên khoa Nội tiết',
    authorImage: 'nguyenvanam.png',
    subtitle: 'Tiểu đường type 2 có thể phòng ngừa được thông qua lối sống lành mạnh. Thay đổi nhỏ mỗi ngày mang lại lợi ích lớn.',
    sections: [
      {
        id: 1,
        title: 'Yếu tố nguy cơ',
        description: 'Thừa cân béo phì, ít vận động, tiền sử gia đình, tuổi trên 45, huyết áp cao, cholesterol cao.',
        tip: 'Kiểm tra đường huyết định kỳ nếu có yếu tố nguy cơ.',
        icon: 'warning',
        color: '#EF4444',
      },
      {
        id: 2,
        title: 'Chế độ ăn phòng ngừa',
        description: 'Hạn chế đường, tinh bột tinh chế. Ăn nhiều rau xanh, ngũ cốc nguyên hạt, protein nạc, chất béo lành mạnh.',
        tip: 'Kiểm soát khẩu phần ăn, tránh ăn quá no.',
        icon: 'nutrition',
        color: '#10B981',
      },
      {
        id: 3,
        title: 'Vận động và kiểm soát cân nặng',
        description: 'Tập thể dục 30 phút/ngày, duy trì cân nặng hợp lý, giảm 5-10% cân nặng nếu thừa cân.',
        tip: 'Đi bộ sau bữa ăn giúp kiểm soát đường huyết hiệu quả.',
        icon: 'walk',
        color: '#06B6D4',
      },
    ],
  },
  'featured': {
    title: '5 thói quen giúp tăng sức đề kháng',
    category: 'Sức khỏe',
    author: 'BS. Lê Minh Tâm',
    authorSpecialty: 'Chuyên khoa Y học dự phòng',
    authorImage: 'leminhtam.png',
    subtitle: 'Tăng sức đề kháng là chìa khóa giúp cơ thể khỏe mạnh, phòng ngừa bệnh tật. Dưới đây là 5 thói quen đơn giản bạn nên duy trì mỗi ngày.',
    sections: [
      {
        id: 1,
        title: 'Uống đủ nước mỗi ngày',
        description: 'Nước giúp cơ thể duy trì hoạt động tốt, duy trì hoạt động của các cơ quan và hỗ trợ hệ miễn dịch hoạt động hiệu quả hơn.',
        tip: 'Nên uống từ 1.5 - 2 lít nước mỗi ngày, chia đều trong suốt ngày dài.',
        icon: 'water',
        color: '#06B6D4',
      },
      {
        id: 2,
        title: 'Ngủ đủ giấc',
        description: 'Giấc ngủ đóng vai trò quan trọng trong việc phục hồi năng lượng và tăng cường hệ miễn dịch.',
        tip: 'Ngủ đủ 7 - 8 tiếng mỗi đêm giúp cơ thể khỏe mạnh và tinh thần minh mẫn.',
        icon: 'moon',
        color: '#8B5CF6',
      },
      {
        id: 3,
        title: 'Tập thể dục đều đặn',
        description: 'Tập thể dục giúp tăng cường tuần hoàn máu, cải thiện chức năng miễn dịch và giảm căng thẳng.',
        tip: 'Dành ít nhất 30 phút mỗi ngày cho các hoạt động như đi bộ, chạy bộ, yoga, đạp xe...',
        icon: 'fitness',
        color: '#10B981',
      },
    ],
  },
};

export default function ArticleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get articleId from params
  const articleId = (params.articleId as string) || 'featured';
  
  console.log('🔍 Article Detail - articleId from params:', params.articleId);
  console.log('🔍 Article Detail - using articleId:', articleId);
  
  const articleInfo = articleData[articleId as keyof typeof articleData];
  
  // Nếu không tìm thấy bài viết, redirect về trang articles
  useEffect(() => {
    if (!articleInfo) {
      Alert.alert('Thông báo', 'Bài viết không tồn tại', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [articleInfo]);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (articleInfo) {
      loadComments();
    }
  }, [articleId, articleInfo]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const allComments = await getAllDocuments('comments');
      // Lọc comments theo articleId
      const articleComments = allComments.filter((comment: any) => comment.articleId === articleId);
      setComments(articleComments);
      
      // Đếm tổng số comments bao gồm cả replies
      let total = articleComments.length;
      articleComments.forEach((comment: any) => {
        if (comment.replies && Array.isArray(comment.replies)) {
          total += comment.replies.length;
        }
      });
      setCommentCount(total);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    // Có thể thêm logic share thực tế ở đây
    alert('Chia sẻ bài viết');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleComment = () => {
    if (showCommentInput) {
      // Nếu đang hiện input thì ẩn đi
      setShowCommentInput(false);
      setCommentText('');
    } else {
      // Hiện input và scroll xuống
      setShowCommentInput(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    if (!userData) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận');
      return;
    }

    try {
      setSubmitting(true);

      const newComment = await addComment(
        articleId,
        userData.id || userData.uid || 'user001',
        userData.fullName || 'Người dùng',
        userData.avatar || 'logo.png',
        commentText
      );

      if (newComment) {
        setCommentText('');
        setShowCommentInput(false);
        await loadComments();
        Alert.alert('Thành công', 'Đã thêm bình luận của bạn');
      } else {
        Alert.alert('Lỗi', 'Không thể thêm bình luận');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const getUserAvatar = () => {
    if (userData?.avatar) {
      if (userData.avatar.startsWith('http://') || userData.avatar.startsWith('https://')) {
        return { uri: userData.avatar };
      }
      if (doctorImages[userData.avatar as keyof typeof doctorImages]) {
        return doctorImages[userData.avatar as keyof typeof doctorImages];
      }
    }
    return require('@/assets/images/logo.png');
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    const isLiked = likedComments.has(commentId);
    const newLikes = await toggleCommentLike(commentId, currentLikes, isLiked);
    
    // Update local state
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId ? { ...comment, likes: newLikes } : comment
      )
    );

    // Update liked state
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const article = {
    id: articleId,
    title: articleInfo.title,
    category: articleInfo.category,
    author: articleInfo.author,
    authorSpecialty: articleInfo.authorSpecialty,
    date: '20/03/2024',
    readTime: '5 phút đọc',
    views: '1.2k',
    image: articleImages[articleId as keyof typeof articleImages] || articleImages['1'],
  };

  const contentSections = articleInfo.sections || [];

  const relatedArticles = [
    {
      id: '2',
      title: '7 mẹo giúp ngủ ngon và sâu giấc hơn',
      date: '18/03/2024',
      image: articleImages['2'],
    },
    {
      id: '3',
      title: 'Top thực phẩm tăng cường miễn dịch',
      date: '15/03/2024',
      image: articleImages['3'],
    },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleLike}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#EF4444" : "#0f172a"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Image */}
        <View style={styles.imageContainer}>
          <Image source={article.image} style={styles.featuredImage} contentFit="cover" />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>SỨC KHỎE</Text>
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          {/* Title */}
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.subtitle}>
            {articleInfo.subtitle || 'Nội dung bài viết sức khỏe hữu ích cho bạn.'}
          </Text>

          {/* Author Info */}
          <View style={styles.authorSection}>
            <Image 
              source={doctorImages[articleInfo.authorImage as keyof typeof doctorImages]} 
              style={styles.authorAvatar} 
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{article.author}</Text>
              <Text style={styles.authorSpecialty}>{article.authorSpecialty}</Text>
            </View>
            <View style={styles.metaInfo}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>{article.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>{article.views} lượt xem</Text>
              </View>
            </View>
          </View>

          {/* Content Sections */}
          {contentSections.map((section) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
                  <Ionicons name={section.icon as any} size={24} color={section.color} />
                </View>
                <Text style={styles.sectionTitle}>
                  {section.id}. {section.title}
                </Text>
              </View>
              <Text style={styles.sectionDescription}>{section.description}</Text>
              <View style={styles.tipBox}>
                <Ionicons name="water" size={20} color={section.color} />
                <Text style={styles.tipText}>{section.tip}</Text>
              </View>
            </View>
          ))}

          {/* Related Articles */}
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Bài viết liên quan</Text>
              <TouchableOpacity onPress={() => router.push('/articles')}>
                <Text style={styles.seeAllText}>Xem tất cả →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
              {relatedArticles.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.relatedCard}
                  onPress={() => router.push({
                    pathname: '/article-detail',
                    params: { articleId: item.id }
                  })}
                >
                  <Image source={item.image} style={styles.relatedImage} contentFit="cover" />
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedText} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.relatedDate}>{item.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Bình luận ({commentCount})
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00BCD4" />
                <Text style={styles.loadingText}>Đang tải bình luận...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
                <Text style={styles.emptySubtext}>Hãy là người đầu tiên bình luận!</Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.slice(0, 3).map((comment) => {
                  // Xử lý avatar source
                  let avatarSource;
                  if (comment.userAvatar && (comment.userAvatar.startsWith('http://') || comment.userAvatar.startsWith('https://'))) {
                    avatarSource = { uri: comment.userAvatar };
                  } else if (comment.userAvatar && doctorImages[comment.userAvatar as keyof typeof doctorImages]) {
                    avatarSource = doctorImages[comment.userAvatar as keyof typeof doctorImages];
                  } else {
                    avatarSource = require('@/assets/images/logo.png');
                  }

                  // Format date
                  let formattedDate = 'Vừa xong';
                  try {
                    const date = new Date(comment.createdAt);
                    if (!isNaN(date.getTime())) {
                      formattedDate = date.toLocaleDateString('vi-VN');
                    }
                  } catch (error) {
                    console.error('Error formatting date:', error);
                  }

                  return (
                    <View key={comment.id} style={styles.commentCard}>
                      <Image 
                        source={avatarSource} 
                        style={styles.commentAvatar} 
                      />
                      <View style={styles.commentContent}>
                        <Text style={styles.commentUserName}>{comment.userName}</Text>
                        <Text style={styles.commentText}>{comment.content}</Text>
                        <View style={styles.commentFooter}>
                          <Text style={styles.commentTime}>{formattedDate}</Text>
                          <TouchableOpacity 
                            style={styles.commentLike}
                            onPress={() => handleLikeComment(comment.id, comment.likes)}
                          >
                            <Ionicons 
                              name={likedComments.has(comment.id) ? "heart" : "heart-outline"} 
                              size={14} 
                              color={likedComments.has(comment.id) ? "#EF4444" : "#64748b"} 
                            />
                            <Text style={[
                              styles.commentLikeText,
                              likedComments.has(comment.id) && { color: '#EF4444', fontWeight: '600' }
                            ]}>
                              {comment.likes}
                            </Text>
                          </TouchableOpacity>
                          {comment.replies && comment.replies.length > 0 && (
                            <Text style={styles.commentReply}>
                              {comment.replies.length} phản hồi
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
                
                {comments.length > 3 && (
                  <TouchableOpacity 
                    style={styles.viewAllComments}
                    onPress={() => router.push({
                      pathname: '/article-comments',
                      params: { 
                        articleId: articleId,
                        articleTitle: article.title 
                      }
                    })}
                  >
                    <Text style={styles.viewAllCommentsText}>
                      Xem tất cả {commentCount} bình luận
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#00BCD4" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Comment Input Section */}
          {showCommentInput && (
            <View style={styles.commentInputSection}>
              <View style={styles.commentInputHeader}>
                <Text style={styles.commentInputTitle}>Viết bình luận</Text>
                <TouchableOpacity onPress={() => {
                  setShowCommentInput(false);
                  setCommentText('');
                }}>
                  <Ionicons name="close-circle" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View style={styles.commentInputWrapper}>
                <Image 
                  source={getUserAvatar()} 
                  style={styles.commentInputAvatar} 
                />
                <View style={styles.commentInputBox}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Nhập bình luận của bạn..."
                    placeholderTextColor="#94a3b8"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={500}
                    autoFocus
                  />
                  <View style={styles.commentInputActions}>
                    <Text style={styles.commentCharCount}>{commentText.length}/500</Text>
                    <TouchableOpacity 
                      style={[styles.commentSubmitBtn, (!commentText.trim() || submitting) && styles.commentSubmitBtnDisabled]}
                      onPress={handleSubmitComment}
                      disabled={!commentText.trim() || submitting}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="send" size={16} color="#fff" />
                          <Text style={styles.commentSubmitText}>Gửi</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={24} 
            color={isLiked ? "#EF4444" : "#64748b"} 
          />
          <Text style={[styles.actionText, isLiked && { color: '#EF4444' }]}>
            Yêu thích
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? "#00BCD4" : "#64748b"} 
          />
          <Text style={[styles.actionText, isSaved && { color: '#00BCD4' }]}>
            Lưu bài
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleComment}>
          <Ionicons 
            name={showCommentInput ? "chatbubble" : "chatbubble-outline"} 
            size={24} 
            color={showCommentInput ? "#00BCD4" : "#64748b"} 
          />
          <Text style={[styles.actionText, showCommentInput && { color: '#00BCD4' }]}>
            Bình luận {commentCount > 0 ? `(${commentCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#64748b" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  articleContent: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748b',
    marginBottom: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 20,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  authorSpecialty: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  metaInfo: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 12,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#06B6D4',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  relatedSection: {
    marginTop: 32,
    marginBottom: 100,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  seeAllText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  relatedScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  relatedCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  relatedImage: {
    width: '100%',
    height: 100,
  },
  relatedContent: {
    padding: 12,
  },
  relatedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 6,
  },
  relatedDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  commentsSection: {
    marginTop: 24,
    marginBottom: 100,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  commentsList: {
    gap: 16,
  },
  commentCard: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentTime: {
    fontSize: 11,
    color: '#94a3b8',
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentLikeText: {
    fontSize: 11,
    color: '#64748b',
  },
  commentReply: {
    fontSize: 11,
    color: '#00BCD4',
    fontWeight: '500',
  },
  viewAllComments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllCommentsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  commentInputSection: {
    marginTop: 24,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  commentInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentInputTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  commentInputWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  commentInputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentInputBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  commentInput: {
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  commentInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  commentCharCount: {
    fontSize: 11,
    color: '#94a3b8',
  },
  commentSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  commentSubmitBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  commentSubmitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
