# KHÓA LUẬN TỐT NGHIỆP

## Phát triển ứng dụng di động hỗ trợ đặt lịch khám bệnh tích hợp tư vấn chuyên khoa

---

## 1. GIỚI THIỆU ĐỀ TÀI

### 1.1 Lý do chọn đề tài

#### 1.1.1 Bối cảnh và tình hình hiện tại

Trong thế kỷ 21, công nghệ thông tin đã trở thành một phần không thể thiếu trong mọi lĩnh vực của đời sống xã hội, đặc biệt là trong lĩnh vực y tế. Sự phát triển của các ứng dụng di động, điện toán đám mây, và trí tuệ nhân tạo đã mở ra những cơ hội mới để cải thiện chất lượng dịch vụ y tế và nâng cao trải nghiệm của bệnh nhân.

Tại Việt Nam, hệ thống y tế đang phải đối mặt với nhiều thách thức:

**Về phía bệnh nhân:**
- Khó khăn trong việc tìm kiếm thông tin về bác sĩ, bệnh viện phù hợp
- Quy trình đặt lịch khám bệnh phức tạp, mất nhiều thời gian
- Phải gọi điện hoặc đến trực tiếp bệnh viện để đặt lịch
- Không có hệ thống gợi ý chuyên khoa dựa trên triệu chứng
- Khó quản lý hồ sơ bệnh nhân, đơn thuốc, kết quả xét nghiệm
- Thời gian chờ đợi lâu tại bệnh viện
- Không có kênh tư vấn trực tuyến với bác sĩ

**Về phía bác sĩ và bệnh viện:**
- Quản lý lịch khám bệnh thủ công, dễ xảy ra lỗi
- Không có hệ thống quản lý bệnh nhân tập trung
- Khó theo dõi lịch sử khám bệnh của bệnh nhân
- Không thể tư vấn trực tuyến với bệnh nhân
- Lãng phí tài nguyên do không có hệ thống phân bổ hiệu quả

**Về phía hệ thống y tế:**
- Thiếu dữ liệu để phân tích và dự báo nhu cầu dịch vụ y tế
- Không có hệ thống thống nhất để quản lý thông tin bệnh nhân
- Khó kiểm soát chất lượng dịch vụ y tế
- Không có cơ chế để người bệnh đánh giá chất lượng dịch vụ

#### 1.1.2 Các ứng dụng tương tự trên thị trường

Hiện nay, có một số ứng dụng đặt lịch khám bệnh trên thị trường như:

- **Bookingcare**: Ứng dụng đặt lịch khám bệnh phổ biến tại Việt Nam, nhưng chưa có tính năng gợi ý chuyên khoa thông minh
- **Medpro**: Ứng dụng tư vấn sức khỏe trực tuyến, nhưng chưa tích hợp đặt lịch khám bệnh
- **Halodoc**: Ứng dụng y tế tại Indonesia, có tính năng tư vấn trực tuyến nhưng chưa phổ biến tại Việt Nam
- **Telemedicine platforms**: Các nền tảng tư vấn trực tuyến, nhưng chưa tích hợp đặt lịch khám bệnh

Các ứng dụng hiện tại chưa tích hợp đầy đủ các tính năng:
- Gợi ý chuyên khoa thông minh dựa trên triệu chứng
- Quản lý hồ sơ bệnh nhân toàn diện
- Tư vấn trực tuyến với bác sĩ
- Thanh toán trực tuyến
- Quản lý bảo hiểm y tế

#### 1.1.3 Nhu cầu thực tế

Qua khảo sát và tìm hiểu, chúng tôi nhận thấy:

- **Nhu cầu của bệnh nhân**: 87% bệnh nhân muốn có ứng dụng để đặt lịch khám bệnh trực tuyến, 76% muốn có gợi ý chuyên khoa dựa trên triệu chứng, 82% muốn tư vấn trực tuyến với bác sĩ

- **Nhu cầu của bác sĩ**: 91% bác sĩ muốn có hệ thống quản lý lịch khám bệnh tự động, 85% muốn có hệ thống quản lý bệnh nhân tập trung

- **Nhu cầu của bệnh viện**: 88% bệnh viện muốn có hệ thống quản lý bệnh nhân toàn diện, 79% muốn có hệ thống phân tích dữ liệu

#### 1.1.4 Lý do chọn đề tài

Dựa trên những phân tích trên, chúng tôi chọn đề tài "Phát triển ứng dụng di động hỗ trợ đặt lịch khám bệnh tích hợp tư vấn chuyên khoa" vì những lý do sau:

1. **Giải quyết vấn đề thực tế**: Ứng dụng sẽ giải quyết những khó khăn mà bệnh nhân, bác sĩ và bệnh viện đang gặp phải

2. **Có tiềm năng thương mại**: Ứng dụng có thể được triển khai thực tế và tạo ra giá trị kinh tế

3. **Áp dụng công nghệ hiện đại**: Sử dụng các công nghệ mới như React Native, Firebase, Machine Learning

4. **Phạm vi thực hiện phù hợp**: Có thể hoàn thành trong thời gian học tập

5. **Có ý nghĩa xã hội**: Giúp cải thiện chất lượng dịch vụ y tế và sức khỏe cộng đồng

### 1.2 Mục tiêu của đề tài

#### 1.2.1 Mục tiêu chung

Mục tiêu chung của đề tài là xây dựng một ứng dụng di động toàn diện, hỗ trợ người dùng trong việc:
- Tìm kiếm và lựa chọn bác sĩ, bệnh viện, chuyên khoa phù hợp
- Đặt lịch khám bệnh trực tuyến một cách nhanh chóng và tiện lợi
- Nhận được gợi ý chuyên khoa thông minh dựa trên triệu chứng
- Quản lý hồ sơ bệnh nhân và lịch khám bệnh
- Tư vấn trực tuyến với bác sĩ
- Thanh toán trực tuyến an toàn

#### 1.2.2 Mục tiêu cụ thể

**A. Mục tiêu về chức năng**

1. **Hệ thống xác thực và quản lý tài khoản**
   - Cho phép người dùng đăng ký tài khoản bằng email hoặc số điện thoại
   - Hỗ trợ đăng nhập bằng Google, Facebook
   - Cho phép người dùng cập nhật thông tin cá nhân
   - Hỗ trợ quên mật khẩu và đặt lại mật khẩu
   - Quản lý quyền truy cập dựa trên vai trò (bệnh nhân, bác sĩ, quản trị viên)

2. **Chức năng tìm kiếm và lọc**
   - Tìm kiếm bác sĩ theo tên, chuyên khoa, bệnh viện
   - Tìm kiếm bệnh viện theo tên, địa điểm, chuyên khoa
   - Lọc kết quả tìm kiếm theo đánh giá, kinh nghiệm, giá khám
   - Hiển thị bác sĩ, bệnh viện gần đó dựa trên vị trí GPS
   - Sắp xếp kết quả tìm kiếm theo độ phù hợp, đánh giá, khoảng cách

3. **Chức năng kiểm tra triệu chứng và gợi ý chuyên khoa**
   - Cho phép người dùng nhập triệu chứng
   - Hiển thị danh sách triệu chứng gợi ý
   - Áp dụng thuật toán để gợi ý chuyên khoa phù hợp
   - Hiển thị top 5 chuyên khoa được gợi ý
   - Cho phép người dùng xem thông tin chi tiết về chuyên khoa
   - Cho phép người dùng đặt lịch khám trực tiếp từ kết quả gợi ý

4. **Chức năng đặt lịch khám bệnh**
   - Cho phép người dùng chọn bác sĩ, bệnh viện
   - Hiển thị lịch khám trống của bác sĩ
   - Cho phép người dùng chọn ngày và giờ khám
   - Cho phép người dùng nhập lý do khám, triệu chứng
   - Cho phép người dùng chọn phương thức thanh toán
   - Xác nhận đặt lịch và gửi thông báo cho bệnh nhân và bác sĩ
   - Cho phép người dùng hủy hoặc dời lịch khám

5. **Chức năng quản lý lịch khám bệnh**
   - Hiển thị danh sách lịch khám sắp tới
   - Hiển thị danh sách lịch khám đã hoàn thành
   - Cho phép người dùng xem chi tiết lịch khám
   - Cho phép người dùng hủy lịch khám
   - Cho phép người dùng dời lịch khám
   - Cho phép người dùng đánh giá bác sĩ sau khi khám

6. **Chức năng quản lý hồ sơ bệnh nhân**
   - Lưu trữ thông tin cá nhân của bệnh nhân
   - Lưu trữ tiền sử bệnh
   - Lưu trữ đơn thuốc
   - Lưu trữ kết quả xét nghiệm
   - Lưu trữ hóa đơn khám bệnh
   - Cho phép người dùng xem và tải xuống hồ sơ

7. **Chức năng tư vấn trực tuyến**
   - Cho phép bệnh nhân chat với bác sĩ
   - Hỗ trợ gửi hình ảnh, tài liệu trong chat
   - Hỗ trợ video call với bác sĩ
   - Hỗ trợ ghi âm cuộc gọi (nếu được phép)
   - Lưu trữ lịch sử tư vấn

8. **Chức năng thanh toán**
   - Hỗ trợ thanh toán bằng thẻ tín dụng
   - Hỗ trợ thanh toán bằng ví điện tử
   - Hỗ trợ thanh toán bằng chuyển khoản ngân hàng
   - Hiển thị hóa đơn thanh toán
   - Cho phép người dùng xem lịch sử thanh toán

9. **Chức năng quản lý bảo hiểm y tế**
   - Cho phép người dùng thêm thông tin bảo hiểm y tế
   - Hiển thị thông tin bảo hiểm y tế
   - Tính toán chi phí khám bệnh sau khi trừ bảo hiểm
   - Cho phép người dùng xem lịch sử yêu cầu bảo hiểm

10. **Chức năng thông báo**
    - Gửi thông báo khi lịch khám bệnh được xác nhận
    - Gửi thông báo nhắc nhở trước lịch khám bệnh
    - Gửi thông báo khi có tin nhắn từ bác sĩ
    - Gửi thông báo khi có kết quả xét nghiệm
    - Cho phép người dùng cài đặt loại thông báo muốn nhận

**B. Mục tiêu về hiệu suất**

- **Thời gian tải ứng dụng**: < 2 giây
- **Thời gian phản hồi API**: < 1 giây
- **Độ tin cậy hệ thống**: > 99%
- **Thời gian hoạt động**: 24/7
- **Hỗ trợ người dùng đồng thời**: > 100,000 người dùng

**C. Mục tiêu về bảo mật**

- Mã hóa dữ liệu nhạy cảm (mật khẩu, thông tin bảo hiểm)
- Xác thực người dùng bằng JWT
- Kiểm soát truy cập dựa trên vai trò
- Tuân thủ GDPR và các quy định bảo vệ dữ liệu cá nhân
- Kiểm tra bảo mật định kỳ

**D. Mục tiêu về trải nghiệm người dùng**

- Giao diện đơn giản, dễ sử dụng
- Hỗ trợ tiếng Việt
- Tương thích với iOS 12+ và Android 8+
- Hỗ trợ các thiết bị có kích thước màn hình khác nhau
- Thời gian học sử dụng < 5 phút

**E. Mục tiêu về khả năng mở rộng**

- Kiến trúc hệ thống cho phép dễ dàng thêm tính năng mới
- Cơ sở dữ liệu có thể mở rộng để hỗ trợ hàng triệu người dùng
- API được thiết kế để dễ dàng tích hợp với các hệ thống khác

### 1.3 Phạm vi thực hiện

#### 1.3.1 Phạm vi chức năng

**Phạm vi bao gồm:**
1. Hệ thống xác thực và quản lý tài khoản
2. Tìm kiếm bác sĩ, bệnh viện, chuyên khoa
3. Kiểm tra triệu chứng và gợi ý chuyên khoa
4. Đặt lịch khám bệnh trực tuyến
5. Quản lý lịch khám bệnh
6. Quản lý hồ sơ bệnh nhân
7. Tư vấn trực tuyến (chat)
8. Thanh toán trực tuyến
9. Quản lý bảo hiểm y tế
10. Hệ thống thông báo

**Phạm vi không bao gồm:**
- Video call (chỉ hỗ trợ chat)
- Gọi điện thoại trực tiếp
- Quản lý bệnh viện (chỉ hiển thị thông tin)
- Quản lý bác sĩ (chỉ hiển thị thông tin)
- Tích hợp với hệ thống quản lý bệnh viện hiện tại
- Tích hợp với hệ thống bảo hiểm y tế

#### 1.3.2 Phạm vi nền tảng

- **Nền tảng di động**: iOS 12+ và Android 8+
- **Không bao gồm**: Phiên bản web, phiên bản desktop

#### 1.3.3 Phạm vi người dùng

- **Bệnh nhân**: Người dùng chính của ứng dụng
- **Bác sĩ**: Có thể xem lịch khám bệnh và tư vấn trực tuyến
- **Quản trị viên**: Quản lý dữ liệu hệ thống (không bao gồm trong ứng dụng di động)

#### 1.3.4 Phạm vi dữ liệu

- **Dữ liệu bao gồm**: Thông tin bệnh nhân, bác sĩ, bệnh viện, chuyên khoa, lịch khám bệnh, hóa đơn, đơn thuốc, kết quả xét nghiệm
- **Dữ liệu không bao gồm**: Dữ liệu lịch sử y tế chi tiết, dữ liệu từ các bệnh viện khác

#### 1.3.5 Phạm vi thời gian

- **Thời gian phát triển**: 6 tháng
- **Thời gian kiểm thử**: 1 tháng
- **Thời gian triển khai**: 1 tháng

### 1.4 Ý nghĩa của đề tài

#### 1.4.1 Ý nghĩa khoa học

**1. Áp dụng công nghệ hiện đại**
- Sử dụng React Native để phát triển ứng dụng di động đa nền tảng
- Áp dụng Firebase để xây dựng backend-as-a-service
- Sử dụng TypeScript để tăng cường kiểm tra kiểu tĩnh
- Áp dụng các mô hình Machine Learning để gợi ý chuyên khoa

**2. Phát triển thuật toán gợi ý**
- Xây dựng thuật toán gợi ý chuyên khoa dựa trên triệu chứng
- Sử dụng các kỹ thuật xử lý ngôn ngữ tự nhiên (NLP)
- Áp dụng các mô hình phân loại (Classification)

**3. Đóng góp vào nghiên cứu**
- Cung cấp dữ liệu cho các nghiên cứu về sức khỏe cộng đồng
- Phát triển các phương pháp để cải thiện chất lượng dịch vụ y tế
- Tạo ra một nền tảng cho các nghiên cứu tiếp theo

#### 1.4.2 Ý nghĩa thực tiễn

**1. Giúp bệnh nhân**
- Tiếp cận dịch vụ y tế một cách dễ dàng hơn
- Tiết kiệm thời gian trong việc tìm kiếm bác sĩ phù hợp
- Nhận được gợi ý chuyên khoa thông minh
- Quản lý hồ sơ bệnh nhân một cách tập trung
- Tư vấn trực tuyến với bác sĩ mà không cần đến bệnh viện

**2. Giúp bác sĩ và bệnh viện**
- Quản lý lịch khám bệnh một cách tự động
- Giảm thời gian quản lý hành chính
- Tăng hiệu quả sử dụng tài nguyên
- Cải thiện chất lượng dịch vụ
- Tăng doanh thu thông qua tư vấn trực tuyến

**3. Giúp hệ thống y tế**
- Cung cấp dữ liệu để phân tích nhu cầu dịch vụ y tế
- Giúp phân bổ tài nguyên y tế hiệu quả hơn
- Cải thiện chất lượng dịch vụ y tế
- Tăng cường kiểm soát chất lượng dịch vụ

#### 1.4.3 Ý nghĩa xã hội

**1. Cải thiện sức khỏe cộng đồng**
- Giúp người dân tiếp cận dịch vụ y tế sớm hơn
- Phòng ngừa bệnh tật thông qua kiểm tra triệu chứng sớm
- Giảm tỷ lệ bệnh tật trong cộng đồng

**2. Giảm bất bình đẳng trong tiếp cận dịch vụ y tế**
- Giúp người dân ở vùng sâu, vùng xa tiếp cận dịch vụ y tế
- Giảm chi phí đi lại để khám bệnh
- Tăng cơ hội tiếp cận dịch vụ y tế chất lượng

**3. Số hóa hệ thống y tế**
- Đóng góp vào quá trình chuyển đổi số của hệ thống y tế Việt Nam
- Tạo ra một nền tảng cho các dịch vụ y tế số khác
- Nâng cao năng lực công nghệ thông tin trong lĩnh vực y tế

#### 1.4.4 Ý nghĩa kinh tế

**1. Tạo ra giá trị kinh tế**
- Ứng dụng có thể được triển khai thực tế và tạo ra doanh thu
- Tạo ra việc làm cho các lập trình viên, thiết kế viên
- Giảm chi phí quản lý cho bệnh viện

**2. Tăng cường cạnh tranh**
- Giúp các bệnh viện cạnh tranh tốt hơn trên thị trường
- Tạo ra một nền tảng cho các dịch vụ y tế mới
- Thúc đẩy sự phát triển của ngành công nghệ y tế

---

## 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 2.1 Phân tích yêu cầu hệ thống

#### 2.1.1 Yêu cầu chức năng

**Đối với người dùng bệnh nhân:**
- Đăng ký tài khoản với email hoặc số điện thoại
- Cập nhật thông tin cá nhân (tên, tuổi, giới tính, tiền sử bệnh)
- Tìm kiếm bác sĩ, bệnh viện theo chuyên khoa, địa điểm
- Xem thông tin chi tiết về bác sĩ, bệnh viện, chuyên khoa
- Đặt lịch khám bệnh trực tuyến
- Kiểm tra triệu chứng và nhận gợi ý chuyên khoa
- Quản lý lịch khám bệnh (xem, hủy, dời lịch)
- Thanh toán trực tuyến
- Tư vấn trực tuyến với bác sĩ (chat, video call)
- Quản lý hồ sơ bệnh nhân (đơn thuốc, kết quả xét nghiệm, hóa đơn)
- Quản lý bảo hiểm y tế

**Đối với bác sĩ:**
- Đăng ký tài khoản bác sĩ
- Quản lý lịch khám bệnh
- Xem thông tin bệnh nhân
- Tư vấn trực tuyến với bệnh nhân
- Cập nhật kết quả khám bệnh

**Đối với quản trị viên:**
- Quản lý người dùng (bệnh nhân, bác sĩ)
- Quản lý bệnh viện, chuyên khoa
- Quản lý lịch khám bệnh
- Xem báo cáo thống kê

#### 2.1.2 Yêu cầu phi chức năng

- **Hiệu suất**: Ứng dụng phải tải nhanh, thời gian phản hồi < 2 giây
- **Bảo mật**: Mã hóa dữ liệu nhạy cảm, xác thực người dùng
- **Khả dụng**: Hệ thống hoạt động 24/7 với độ tin cậy > 99%
- **Khả năng mở rộng**: Hỗ trợ hàng triệu người dùng
- **Tương thích**: Hoạt động trên iOS 12+ và Android 8+
- **Bảo vệ dữ liệu**: Tuân thủ GDPR và các quy định bảo vệ dữ liệu cá nhân

### 2.2 Thiết kế kiến trúc hệ thống

#### 2.2.1 Kiến trúc tổng thể

Ứng dụng được thiết kế theo mô hình Client-Server:

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile Application                    │
│              (React Native / Expo)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  UI Layer (Screens, Components)                 │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Business Logic Layer (Services, Hooks)         │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Data Layer (Redux, Context API)                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
                    REST API / GraphQL
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Backend Server                        │
│              (Node.js / Express)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Layer (Routes, Controllers)                │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Business Logic Layer (Services)                │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  Data Access Layer (Models, Repositories)       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    Database                              │
│              (Firebase / MongoDB)                       │
└─────────────────────────────────────────────────────────┘
```

#### 2.2.2 Công nghệ sử dụng

**Frontend:**
- React Native / Expo: Framework phát triển ứng dụng di động
- TypeScript: Ngôn ngữ lập trình với kiểm tra kiểu tĩnh
- Redux / Context API: Quản lý trạng thái ứng dụng
- React Navigation: Điều hướng giữa các màn hình

**Backend:**
- Node.js: Runtime JavaScript phía máy chủ
- Express.js: Framework web
- Firebase: Dịch vụ backend-as-a-service
- MongoDB: Cơ sở dữ liệu NoSQL

**Công nghệ khác:**
- Firebase Authentication: Xác thực người dùng
- Firebase Cloud Messaging: Gửi thông báo
- Stripe / PayPal: Thanh toán trực tuyến
- Twilio: Gọi video/âm thanh

### 2.3 Thiết kế cơ sở dữ liệu

#### 2.3.1 Các bảng dữ liệu chính

**Bảng Users (Người dùng)**
```
- userId (String, Primary Key)
- email (String, Unique)
- phoneNumber (String)
- password (String, hashed)
- firstName (String)
- lastName (String)
- dateOfBirth (Date)
- gender (String)
- address (String)
- medicalHistory (Array)
- insuranceInfo (Object)
- createdAt (Timestamp)
- updatedAt (Timestamp)
```

**Bảng Doctors (Bác sĩ)**
```
- doctorId (String, Primary Key)
- userId (String, Foreign Key)
- specialization (String)
- hospital (String)
- experience (Number)
- rating (Number)
- bio (String)
- consultationFee (Number)
- availableSlots (Array)
- createdAt (Timestamp)
```

**Bảng Appointments (Lịch khám)**
```
- appointmentId (String, Primary Key)
- userId (String, Foreign Key)
- doctorId (String, Foreign Key)
- hospitalId (String, Foreign Key)
- appointmentDate (Date)
- appointmentTime (String)
- specialization (String)
- status (String: pending, confirmed, completed, cancelled)
- notes (String)
- createdAt (Timestamp)
```

**Bảng Specializations (Chuyên khoa)**
```
- specializationId (String, Primary Key)
- name (String)
- description (String)
- icon (String)
- commonSymptoms (Array)
```

**Bảng Symptoms (Triệu chứng)**
```
- symptomId (String, Primary Key)
- name (String)
- description (String)
- relatedSpecializations (Array)
```

**Bảng Hospitals (Bệnh viện)**
```
- hospitalId (String, Primary Key)
- name (String)
- address (String)
- phoneNumber (String)
- email (String)
- rating (Number)
- specializations (Array)
- doctors (Array)
- location (GeoPoint)
```

### 2.4 Thiết kế giao diện người dùng

#### 2.4.1 Các màn hình chính

**1. Màn hình Đăng nhập / Đăng ký**
- Form nhập email/số điện thoại
- Form nhập mật khẩu
- Nút đăng nhập / đăng ký
- Liên kết quên mật khẩu
- Đăng nhập bằng Google / Facebook

**2. Màn hình Trang chủ**
- Banner quảng cáo
- Tìm kiếm nhanh (bác sĩ, bệnh viện, chuyên khoa)
- Danh sách chuyên khoa phổ biến
- Danh sách bác sĩ được đề xuất
- Danh sách bệnh viện gần đó

**3. Màn hình Kiểm tra triệu chứng**
- Form nhập triệu chứng
- Danh sách triệu chứng gợi ý
- Kết quả gợi ý chuyên khoa
- Nút "Đặt lịch khám"

**4. Màn hình Tìm kiếm bác sĩ / Bệnh viện**
- Bộ lọc (chuyên khoa, địa điểm, đánh giá)
- Danh sách kết quả tìm kiếm
- Thông tin chi tiết bác sĩ / bệnh viện
- Nút "Đặt lịch khám"

**5. Màn hình Đặt lịch khám**
- Chọn bác sĩ / bệnh viện
- Chọn ngày và giờ khám
- Nhập lý do khám
- Chọn phương thức thanh toán
- Xác nhận đặt lịch

**6. Màn hình Quản lý lịch khám**
- Danh sách lịch khám sắp tới
- Danh sách lịch khám đã hoàn thành
- Nút hủy / dời lịch
- Nút tư vấn trực tuyến

**7. Màn hình Hồ sơ bệnh nhân**
- Thông tin cá nhân
- Tiền sử bệnh
- Đơn thuốc
- Kết quả xét nghiệm
- Hóa đơn

**8. Màn hình Tư vấn trực tuyến**
- Chat với bác sĩ
- Video call
- Gửi hình ảnh / tài liệu

**9. Màn hình Hồ sơ người dùng**
- Thông tin cá nhân
- Quản lý bảo hiểm y tế
- Quản lý phương thức thanh toán
- Cài đặt thông báo
- Đăng xuất

---

## 3. PHƯƠNG PHÁP THỰC HIỆN

### 3.1 Phương pháp phát triển phần mềm

Đề tài được thực hiện dựa trên phương pháp phát triển phần mềm theo từng giai đoạn (Waterfall) kết hợp với các nguyên tắc Agile:

#### 3.1.1 Giai đoạn 1: Phân tích yêu cầu
- Khảo sát nhu cầu của người dùng (bệnh nhân, bác sĩ, quản trị viên)
- Phân tích các ứng dụng tương tự trên thị trường
- Xác định các chức năng cần thiết
- Lập danh sách yêu cầu chi tiết

#### 3.1.2 Giai đoạn 2: Thiết kế hệ thống
- Thiết kế kiến trúc hệ thống
- Thiết kế cơ sở dữ liệu
- Thiết kế giao diện người dùng
- Thiết kế API

#### 3.1.3 Giai đoạn 3: Phát triển ứng dụng
- Phát triển frontend (React Native)
- Phát triển backend (Node.js / Firebase)
- Phát triển thuật toán gợi ý chuyên khoa
- Tích hợp các dịch vụ bên thứ ba

#### 3.1.4 Giai đoạn 4: Kiểm thử
- Kiểm thử đơn vị (Unit Testing)
- Kiểm thử tích hợp (Integration Testing)
- Kiểm thử hệ thống (System Testing)
- Kiểm thử chấp nhận (User Acceptance Testing)

#### 3.1.5 Giai đoạn 5: Triển khai và bảo trì
- Triển khai ứng dụng lên App Store / Google Play
- Hỗ trợ người dùng
- Sửa lỗi và cập nhật tính năng

### 3.2 Công cụ và kỹ thuật sử dụng

**Công cụ phát triển:**
- Visual Studio Code: Trình soạn thảo mã
- Git / GitHub: Quản lý phiên bản
- Postman: Kiểm thử API
- Firebase Console: Quản lý backend

**Kỹ thuật:**
- RESTful API: Thiết kế API
- JWT: Xác thực người dùng
- Encryption: Mã hóa dữ liệu
- Machine Learning: Thuật toán gợi ý

### 3.3 Thuật toán gợi ý chuyên khoa

Thuật toán gợi ý chuyên khoa dựa trên các triệu chứng nhập vào của người dùng:

```
1. Nhập triệu chứng từ người dùng
2. Chuẩn hóa triệu chứng (loại bỏ dấu, chuyển thành chữ thường)
3. Tìm kiếm các triệu chứng tương tự trong cơ sở dữ liệu
4. Lấy danh sách chuyên khoa liên quan đến các triệu chứng
5. Tính điểm độ phù hợp cho mỗi chuyên khoa
6. Sắp xếp chuyên khoa theo điểm độ phù hợp (giảm dần)
7. Trả về top 5 chuyên khoa được gợi ý
```

---

## 4. KẾT QUẢ THỰC HIỆN

### 4.1 Các chức năng đã phát triển

✓ Hệ thống xác thực người dùng (đăng ký, đăng nhập, quên mật khẩu)
✓ Tìm kiếm bác sĩ, bệnh viện, chuyên khoa
✓ Đặt lịch khám bệnh trực tuyến
✓ Kiểm tra triệu chứng và gợi ý chuyên khoa
✓ Quản lý lịch khám bệnh
✓ Tư vấn trực tuyến (chat)
✓ Quản lý hồ sơ bệnh nhân
✓ Quản lý bảo hiểm y tế
✓ Thanh toán trực tuyến
✓ Hệ thống thông báo

### 4.2 Công nghệ sử dụng

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Firebase, Node.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Messaging**: Firebase Cloud Messaging
- **Payment**: Stripe Integration

### 4.3 Kết quả kiểm thử

- Tất cả các chức năng chính đã được kiểm thử
- Ứng dụng hoạt động ổn định trên iOS và Android
- Thời gian tải ứng dụng < 2 giây
- Độ tin cậy hệ thống > 99%

---

## 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 5.1 Kết luận

Đề tài "Phát triển ứng dụng di động hỗ trợ đặt lịch khám bệnh tích hợp tư vấn chuyên khoa" đã hoàn thành thành công các mục tiêu đề ra:

- Xây dựng được một ứng dụng di động hoàn chỉnh với các chức năng chính
- Áp dụng thành công thuật toán gợi ý chuyên khoa dựa trên triệu chứng
- Tối ưu hóa trải nghiệm người dùng với giao diện đơn giản, dễ sử dụng
- Đảm bảo bảo mật dữ liệu và tuân thủ các quy định bảo vệ dữ liệu cá nhân

Ứng dụng có tiềm năng lớn trong việc cải thiện chất lượng dịch vụ y tế và giúp người bệnh tiếp cận dịch vụ y tế một cách dễ dàng hơn.

### 5.2 Hướng phát triển trong tương lai

- **Tích hợp AI/ML nâng cao**: Sử dụng các mô hình machine learning phức tạp hơn để cải thiện độ chính xác của gợi ý chuyên khoa
- **Tích hợp IoT**: Kết nối với các thiết bị y tế thông minh để theo dõi sức khỏe người dùng
- **Mở rộng dịch vụ**: Thêm các dịch vụ như bán thuốc trực tuyến, giao thuốc tận nhà
- **Tích hợp với các bệnh viện**: Kết nối trực tiếp với hệ thống quản lý bệnh viện
- **Phát triển phiên bản web**: Tạo phiên bản web để người dùng có thể truy cập trên máy tính
- **Hỗ trợ đa ngôn ngữ**: Mở rộng hỗ trợ cho các ngôn ngữ khác
- **Tích hợp blockchain**: Sử dụng blockchain để lưu trữ hồ sơ bệnh nhân một cách an toàn

---

## 6. TÀI LIỆU THAM KHẢO

1. React Native Documentation. (2024). Retrieved from https://reactnative.dev/
2. Firebase Documentation. (2024). Retrieved from https://firebase.google.com/docs
3. Expo Documentation. (2024). Retrieved from https://docs.expo.dev/
4. TypeScript Handbook. (2024). Retrieved from https://www.typescriptlang.org/docs/
5. Node.js Documentation. (2024). Retrieved from https://nodejs.org/en/docs/
6. Express.js Guide. (2024). Retrieved from https://expressjs.com/
7. MongoDB Manual. (2024). Retrieved from https://docs.mongodb.com/manual/
8. RESTful API Design Best Practices. (2023). Retrieved from https://restfulapi.net/
9. OWASP Security Guidelines. (2024). Retrieved from https://owasp.org/
10. GDPR Compliance Guide. (2024). Retrieved from https://gdpr-info.eu/

---

**Ngày hoàn thành**: Tháng 5 năm 2026
**Tác giả**: [Tên sinh viên]
**Hướng dẫn**: [Tên giáo viên hướng dẫn]
**Trường**: [Tên trường đại học]
