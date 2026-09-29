# TÀI LIỆU ĐỀ XUẤT GIẢI PHÁP & THIẾT KẾ KIẾN TRÚC HỆ THỐNG
## DỰ ÁN: INTERVIEWLY - NỀN TẢNG LUYỆN PHỎNG VẤN THÔNG MINH BẰNG GIỌNG NÓI THỜI GIAN THỰC (AI REAL-TIME INTERVIEW COACH)

---

- **Tên dự án:** Interviewly - AI Real-Time Interview Coach Platform
- **Phiên bản tài liệu:** 1.0.0 (Release Candidate)
- **Ngày phát hành:** 19/09/2026
- **Chủ nhiệm dự án & Đội ngũ Kỹ thuật:** Interviewly Engineering Team
- **Đối tượng tiếp nhận:** Ban Giám đốc, Khách hàng Doanh nghiệp, Đối tác Đầu tư & Đội ngũ Kỹ thuật
- **Tình trạng dự án:** Đã hoàn thiện toàn bộ mã nguồn Frontend (Next.js 14+) và Backend (FastAPI Clean Architecture)

---

## MỤC LỤC TỔNG QUAN

1. [PHẦN 1: BÁO CÁO ĐỀ XUẤT DỰ ÁN (PROJECT PROPOSAL)](#phần-1-báo-cáo-đề-xuất-dự-án-project-proposal)
   - 1.1. Bối cảnh thị trường & Vấn đề thực tế (Problem Statement)
   - 1.2. Tầm nhìn, Sứ mệnh & Mục tiêu giải pháp (Vision & Strategic Goals)
   - 1.3. Khách hàng mục tiêu & Chân dung người dùng (Target Audience)
   - 1.4. Đề xuất giá trị vượt trội (Unique Value Proposition - UVP)
   - 1.5. Mô hình kinh doanh & Kế hoạch định giá (Monetization & Pricing Strategy)
   - 1.6. Lộ trình phát triển sản phẩm (Product Roadmap)
2. [PHẦN 2: ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG (FUNCTIONAL SPECIFICATIONS)](#phần-2-đặc-tả-chi-tiết-toàn-bộ-chức-năng-hệ-thống-functional-specifications)
   - 2.1. Phân hệ Ứng viên (Candidate Portal)
   - 2.2. Phân hệ Quản trị viên (Admin Management Console)
3. [PHẦN 3: THIẾT KẾ KIẾN TRÚC HỆ THỐNG & 5 DESIGN PATTERNS (ARCHITECTURE & DESIGN PATTERNS)](#phần-3-thiết-kế-kiến-trúc-hệ-thống--5-design-patterns-architecture--design-patterns)
   - 3.1. Tổng quan kiến trúc tổng thể (High-Level Architecture)
   - 3.2. Pattern 1: Clean Architecture (Hexagonal / Ports & Adapters)
   - 3.3. Pattern 2: Repository & Unit of Work Pattern
   - 3.4. Pattern 3: Strategy Pattern (AI Evaluation & Rubric Engine)
   - 3.5. Pattern 4: Observer / Pub-Sub Pattern (Realtime Voice & Presence Engine)
   - 3.6. Pattern 5: Factory Method / Abstract Factory Pattern (AI Voice Providers & IoC Container)
4. [PHẦN 4: TÀI LIỆU KỸ THUẬT, API & CƠ SỞ DỮ LIỆU (TECHNICAL SPECIFICATIONS & API CONTRACTS)](#phần-4-tài-liệu-kỹ-thuật-api--cơ-sở-dữ-liệu-technical-specifications--api-contracts)
   - 4.1. Ngăn xếp Công nghệ (Full Technology Stack)
   - 4.2. Thiết kế Cơ sở Dữ liệu & Sơ đồ Thực thể Quan hệ (Database Schema & ERD)
   - 4.3. Danh mục API RESTful cốt lõi (Core REST API Endpoints)
   - 4.4. Giao thức WebSocket phòng phỏng vấn thời gian thực (Realtime Voice WS Protocol)
   - 4.5. Hướng dẫn cài đặt & Triển khai (Deployment Guide)
5. [PHẦN 5: TỔNG KẾT & CAM KẾT CHẤT LƯỢNG (CONCLUSION & QUALITY ASSURANCE)](#phần-5-tổng-kết--cam-kết-chất-lượng-conclusion--quality-assurance)

---

# PHẦN 1: BÁO CÁO ĐỀ XUẤT DỰ ÁN (PROJECT PROPOSAL)

### 1.1. Bối cảnh thị trường & Nỗi đau thực tế (Market Context & Pain Points)
Trong thị trường tuyển dụng công nghệ và nhân sự tri thức hiện đại, buổi phỏng vấn là chướng ngại quyết định việc ứng viên có nhận được công việc mơ ước hay không. Tuy nhiên, thực tế thị trường đang tồn tại những rào cản nghiêm trọng:

1. **Áp lực tâm lý và thiếu môi trường cọ xát thực chiến:**
   - Hơn 82% ứng viên trải qua cảm giác lo âu tột độ, mất phản xạ hoặc trả lời lan man khi đối diện với các câu hỏi phỏng vấn hóc búa, đặc biệt là các câu hỏi tình huống hành vi (Behavioral STAR) hoặc thiết kế hệ thống (System Design).
   - Tự luyện tập trước gương hoặc học thuộc lòng tài liệu không mang lại sự tự tin khi bước vào phòng phỏng vấn thật.

2. **Chi phí thuê chuyên gia Mock Interview quá đắt đỏ:**
   - Để có một buổi phỏng vấn thử 45 phút với chuyên gia (Senior Engineer, Tech Lead, HR Director), ứng viên phải chi trả từ **$50 đến $250 / buổi** (1.200.000đ - 6.000.000đ).
   - Chi phí này là gánh nặng tài chính không tưởng đối với sinh viên mới ra trường, fresher hoặc những người đang trong giai đoạn thất nghiệp tìm việc.

3. **Thiếu phản hồi định lượng, có cấu trúc và hành động được (Actionable Feedback):**
   - Khi phỏng vấn thất bại tại các công ty, ứng viên thường chỉ nhận được email từ chối theo mẫu chung ("chúng tôi chọn ứng viên phù hợp hơn"), không hề biết mình yếu ở đâu: thiếu kiến thức chuyên môn, cấu trúc câu trả lời lủng củng, hay giọng điệu thiếu tự tin?
   - Các công cụ AI dạng Text Chat thông thường chỉ trả về những đoạn văn bản dài dòng, thiếu ngữ điệu âm thanh thực tế và không mô phỏng được áp lực thời gian của một buổi phỏng vấn thực.

4. **Tổn thất của nhà tuyển dụng (Employer Resource Drain):**
   - Bộ phận nhân sự và kỹ sư phỏng vấn của doanh nghiệp phải tiêu tốn hàng trăm giờ làm việc để phỏng vấn sơ loại những ứng viên có CV rất đẹp nhưng năng lực giao tiếp và phản xạ thực tế không đạt yêu cầu.

---

### 1.2. Tầm nhìn, Sứ mệnh & Mục tiêu giải pháp (Vision & Strategic Goals)

- **Tầm nhìn chiến lược (Vision):**
  Xây dựng **Interviewly** trở thành nền tảng huấn luyện phỏng vấn AI thông minh đa phương thức số 1, đồng hành cùng hàng triệu ứng viên chinh phục thành công các kỳ phỏng vấn tại các tập đoàn công nghệ hàng đầu toàn cầu (Google, Meta, Amazon, Shopee, VNG, Techcombank,...).

- **Sứ mệnh (Mission):**
  Dân chủ hóa cơ hội tiếp cận môi trường luyện phỏng vấn đỉnh cao. Mọi ứng viên, không phân biệt hoàn cảnh hay điều kiện tài chính, đều có quyền được trang bị một Huấn luyện viên AI cá nhân hóa 24/7 để tối ưu hóa năng lực nghề nghiệp của mình.

- **Mục tiêu kỹ thuật & kinh doanh cụ thể:**
  1. *Độ trễ tương tác siêu thấp (Ultra-Low Latency):* Đạt tốc độ phản hồi âm thanh hai chiều dưới 1.2 giây qua WebSocket, mang lại cảm giác đối thoại mượt mà tự nhiên như nói chuyện với người thật.
  2. *Đánh giá chuẩn quốc tế (Standardized Rubric & STAR):* Chuẩn hóa khung đánh giá 5 chiều kết hợp giải mã cấu trúc STAR (Situation - Task - Action - Result), chỉ ra điểm mạnh, điểm yếu và câu trả lời mẫu tối ưu.
  3. *Cá nhân hóa theo lộ trình (Hyper-Personalized Roadmap):* Khảo sát Onboarding tự động xác định trình độ và mục tiêu nghề nghiệp để tùy biến nội dung câu hỏi cho từng ứng viên.
  4. *Tỷ lệ người dùng đỗ phỏng vấn cao:* Mục tiêu nâng cao tỷ lệ đỗ phỏng vấn của ứng viên sau khi luyện tập trên 5 phiên đạt trên **94%**.

---

### 1.3. Khách hàng mục tiêu & Chân dung người dùng (Target Audience)

Hệ thống được thiết kế hướng tới 4 nhóm khách hàng trọng tâm:
1. **Sinh viên năm cuối & Ứng viên Fresher (Entry-Level Candidates):**
   - *Đặc điểm:* Chưa có nhiều kinh nghiệm thực tế, dễ mất bình tĩnh, cần làm quen với các câu hỏi phỏng vấn cơ bản và rèn luyện phong thái tự tin.
   - *Nhu cầu:* Luyện tập phản xạ không giới hạn với chi phí thấp, nhận feedback cấu trúc câu trả lời dễ hiểu.
2. **Kỹ sư Junior & Middle chuyển việc / thăng cấp (Career Switchers & Up-levelers):**
   - *Đặc điểm:* Đã có từ 1 - 4 năm kinh nghiệm, mục tiêu thi tuyển vào các công ty lớn, công ty đa quốc gia với mức lương cao hơn.
   - *Nhu cầu:* Luyện tập các bộ câu hỏi kỹ thuật chuyên sâu (Technical Deep Dive) và các tình huống xử lý mâu thuẫn dự án theo chuẩn STAR.
3. **Các trường Đại học, Học viện Công nghệ & Bootcamp:**
   - *Đặc điểm:* Cần công cụ hỗ trợ học viên chuẩn bị tốt nghiệp để nâng cao tỷ lệ sinh viên có việc làm ngay sau khi ra trường.
   - *Nhu cầu:* Tích hợp hệ thống luyện phỏng vấn vào chương trình đào tạo kỹ năng mềm.
4. **Bộ phận Tuyển dụng Doanh nghiệp & HR Tech (B2B Enterprise):**
   - *Đặc điểm:* Cần tự động hóa vòng phỏng vấn sơ loại (First-Round Screening) để sàng lọc hàng nghìn hồ sơ ứng tuyển.
   - *Nhu cầu:* Thu thập báo cáo điểm số Rubric và video/audio phỏng vấn mẫu trước khi quyết định gọi ứng viên vào vòng gặp trực tiếp.

---

### 1.4. Đề xuất giá trị vượt trội (Unique Value Proposition - UVP)

| Tiêu chí so sánh | Phỏng vấn thử truyền thống | Chatbot AI thông thường (ChatGPT) | Interviewly Platform |
|---|---|---|---|
| **Phương thức tương tác** | Gặp trực tiếp / Video Call | Gõ bàn phím (Text only) | **Giọng nói thời gian thực hai chiều (Full-Duplex Real-Time Voice)** |
| **Độ trễ & Trải nghiệm** | Tức thời nhưng khó sắp xếp lịch | Chờ đợi sinh văn bản (3-6s) | **Streaming âm thanh tức thì (< 1.2s), không ngắt quãng** |
| **Tính sẵn sàng** | Phụ thuộc lịch chuyên gia | 24/7 nhưng thụ động | **24/7 tức thì mọi lúc mọi nơi, không cần đặt lịch trước** |
| **Cấu trúc phân tích** | Cảm tính, thiếu nhất quán | Nhận xét chung chung, dài dòng | **Chấm điểm Rubric 5 tiêu chí, bóc tách STAR, gợi ý câu mẫu tối ưu** |
| **Chi phí** | 1.200.000đ - 6.000.000đ / buổi | Miễn phí hoặc $20/tháng (chỉ text) | **Miễn phí khởi điểm + Gói Pro chỉ từ 49.000đ/tuần** |
| **Cá nhân hóa** | Theo kinh nghiệm của từng người | Người dùng phải tự viết Prompt | **Khảo sát Onboarding tự động định hình lộ trình sự nghiệp** |

---

### 1.5. Mô hình kinh doanh & Kế hoạch định giá (Monetization & Pricing Strategy)

Interviewly áp dụng mô hình kinh doanh **Freemium kết hợp Subscription đa tầng (Tiered SaaS)**:

1. **Gói Free Candidate (0 VNĐ):**
   - 3 lượt phỏng vấn thử bằng giọng nói mỗi tuần.
   - Khảo sát định hướng nghề nghiệp và lưu trữ hồ sơ năng lực.
   - Báo cáo tổng quan điểm số cơ bản sau mỗi phiên.
2. **Gói VIP Pro Subscription:**
   - **Gói Tuần (Weekly Pass) - 49.000 VNĐ / tuần:** Dành cho ứng viên chuẩn bị phỏng vấn gấp trong vòng 7 ngày.
   - **Gói Tháng (Monthly Pro) - 149.000 VNĐ / tháng:** Tiết kiệm 30%, lựa chọn tối ưu cho giai đoạn tìm việc 1 - 2 tháng.
   - **Gói Năm (Annual Pro) - 990.000 VNĐ / năm:** Tiết kiệm 60%, dành cho người đi làm rèn luyện kỹ năng liên tục.
   - *Quyền lợi VIP:*
     - Luyện tập phỏng vấn không giới hạn số lượng câu hỏi và số phiên.
     - Tùy chỉnh câu hỏi theo công ty mục tiêu (Google L5, Meta, Shopee, Techcombank,...).
     - Phân tích chi tiết từng câu trả lời, nhận diện từ đệm vô nghĩa và gợi ý câu trả lời đạt điểm tối đa.
     - Huy hiệu **VIP Crown Avatar Frame** hoàng gia độc quyền trên toàn bộ giao diện hồ sơ cá nhân.
3. **Cổng thanh toán tự động VietQR & xGate:**
   - Tự động tạo mã VietQR động chứa mã giao dịch duy nhất.
   - Webhook đối soát tự động kích hoạt tài khoản VIP trong vòng **3 giây** ngay khi khách hàng chuyển khoản thành công, đi kèm âm thanh "ting-ting" và hiệu ứng chúc mừng sống động.

---

### 1.6. Lộ trình phát triển sản phẩm (Product Roadmap)

- **Giai đoạn 1 (Nền tảng cốt lõi - Đã hoàn thành):** Xây dựng Authentication đa kênh (Google OAuth + Email OTP), Khảo sát Onboarding định hướng 5 bước, Phòng phỏng vấn giọng nói qua WebSocket, AI Rubric Scoring, Cổng thanh toán VietQR.
- **Giai đoạn 2 (Tối ưu hóa vận hành & Giám sát - Đã hoàn thành):** Nâng cấp kiến trúc Clean Architecture, chuẩn hóa 5 Design Patterns, bổ sung hệ thống Route Audit Logs và Presence Manager giám sát trực tuyến thời gian thực.
- **Giai đoạn 3 (Nâng cao & Mở rộng thị trường - Q4/2026):** Tích hợp Computer Vision phân tích biểu cảm khuôn mặt và ánh mắt (Eye Contact), hỗ trợ phỏng vấn viết Code trực tiếp (Live Coding Sandbox), và cung cấp gói Enterprise ATS cho doanh nghiệp.

# PHẦN 2: ĐẶC TẢ CHI TIẾT TOÀN BỘ CHỨC NĂNG HỆ THỐNG (FUNCTIONAL SPECIFICATIONS)

## 2.1. Phân hệ Ứng viên (Candidate Portal)

### A. Xác thực & Bảo mật đa kênh (Authentication & Security)
- **Đăng nhập / Đăng ký truyền thống với OTP Email:**
  - Hỗ trợ gửi mã OTP 6 chữ số xác thực email chống tài khoản ảo qua `/api/v1/auth/send-otp` và `/api/v1/auth/verify-otp`.
  - Cơ chế đếm ngược 60 giây chống spam mã xác thực.
- **Đăng nhập một chạm với Google OAuth 2.0 (Google Identity Services - GSI):**
  - Tích hợp thư viện bảo mật chính thức của Google (`accounts.google.com/gsi/client`).
  - Nút đăng nhập Google tiêu chuẩn kết hợp nút fallback mượt mà.
- **Cưỡng bức thiết lập mật khẩu bảo mật (Force Password Setup):**
  - Đối với tài khoản Google đăng nhập lần đầu hoặc tài khoản chưa thiết lập mật khẩu, hệ thống tự động phát hiện cờ `needs_password: true`.
  - Hiển thị Popup Modal `SetPasswordModal` với thiết kế kính mờ cao cấp (Glassmorphism), khóa toàn bộ tương tác nền (`canClose={false}`).
  - Bảng checklist thời gian thực kiểm tra độ dài tối thiểu 8 ký tự và xác nhận mật khẩu trùng khớp.
  - Sau khi lưu mật khẩu thành công qua `/api/v1/auth/set-initial-password`, ứng viên được chuyển tiếp mượt mà sang khảo sát Onboarding.

### B. Khảo sát & Định hướng Nghề nghiệp Cá nhân hóa (Onboarding Survey Engine)
- **Luồng khảo sát 5 bước tương tác trực quan (`/onboarding`):**
  - **Bước 1: Ngôn ngữ ưu tiên:** Lựa chọn Tiếng Việt (VI) hoặc Tiếng Anh (EN), tự động cập nhật hệ thống đa ngôn ngữ `I18nContext`.
  - **Bước 2: Nguồn tiếp cận (Acquisition Channel):** Thu thập kênh ứng viên biết đến nền tảng (Facebook, TikTok, YouTube, OpenAI, Google Search, Bạn bè giới thiệu,...).
  - **Bước 3: Lĩnh vực chuyên môn (Career Domain):** Chọn ngành nghề trọng tâm (Công nghệ thông tin - IT, Marketing & Truyền thông, Tài chính - Ngân hàng, Bán hàng & Chăm sóc khách hàng,...).
  - **Bước 4: Kinh nghiệm & Vị trí hiện tại:** Nhập chức danh công việc hiện tại (Current Job Title).
  - **Bước 5: Vị trí & Cấp bậc mục tiêu:** Chọn level (Intern, Fresher, Junior, Middle, Senior, Lead, Director) và chọn/nhập vai trò mục tiêu (Frontend Developer, DevOps Engineer, Product Manager,...).
  - **Bước 6: Chúc mừng & Chuyển hướng:** Hiệu ứng ăn mừng thành công, tự động chuyển về trang chủ và kích hoạt lộ trình phỏng vấn tương ứng.
- **Bảo vệ luồng Onboarding (`UserOnboardingGuard`):** Tự động chặn và chuyển hướng bất kỳ ứng viên nào chưa hoàn thành khảo sát (`is_onboarded === false`) vào trang Onboarding.
- **Chức năng Reset Onboarding Debug:** Cung cấp nút đặt lại khảo sát nhanh chóng qua `/api/v1/onboarding/reset` phục vụ kiểm thử và thay đổi mục tiêu nghề nghiệp.

### C. Thiết lập phiên phỏng vấn (Interview Setup & Configuration)
- Lựa chọn bộ câu hỏi mục tiêu theo các công ty hàng đầu (Google L5 Frontend, Meta Software Engineer, Shopee Backend,...).
- Chọn chế độ phỏng vấn: Phỏng vấn bằng giọng nói (Voice Mode) hoặc Nhập liệu phản hồi (Text Mode).
- Chọn giai đoạn phỏng vấn (Interview Stage): Sơ loại HR, Kỹ thuật chuyên sâu (Technical), Tình huống hành vi (Behavioral STAR).
- Tùy chỉnh số lượng câu hỏi trong phiên (3, 5 hoặc 10 câu) và thời gian giới hạn cho mỗi câu trả lời.

### D. Phòng phỏng vấn giọng nói thời gian thực (Real-time Voice Interview Room)
- **Kết nối WebSocket song công:** Thiết lập kênh truyền dữ liệu âm thanh trực tiếp giữa trình duyệt và máy chủ Backend qua giao thức `ws://host/api/v1/voice/ws/{session_id}`.
- **Nhận diện giọng nói siêu tốc (Speech-to-Text):** Tích hợp công nghệ Whisper / Voice Recognition tự động chuyển giọng nói ứng viên thành văn bản theo luồng (streaming text).
- **Trợ lý phỏng vấn AI giọng nói tự nhiên (Text-to-Speech):** AI phản hồi bằng giọng nói truyền cảm, chuẩn ngữ điệu tiếng Việt và tiếng Anh.
- **Bộ công cụ hỗ trợ STAR Live Drawer:** Ngăn kéo ghi chú trực tiếp theo khung STAR (Tình huống, Nhiệm vụ, Hành động, Kết quả) giúp ứng viên cấu trúc câu trả lời trong lúc phỏng vấn.
- **Chỉ báo âm thanh trực quan (Visual Audio Waveform & Mic Level):** Hiển thị sóng âm thanh động phản ánh chính xác cường độ mic và trạng thái lắng nghe của AI.
- **Điều khiển phiên linh hoạt:** Cho phép Tạm dừng (Pause), Tiếp tục (Resume), Chuyển câu hỏi (Next Question) hoặc Kết thúc phiên sớm (Finish).

### E. Đánh giá, Chấm điểm Rubric & Báo cáo kết quả (Evaluation & Reporting)
- **Thang đo Rubric 5 tiêu chí chuẩn quốc tế:**
  1. *Kỹ năng chuyên môn & Kiến thức nền tảng (Domain Expertise)*
  2. *Cấu trúc câu trả lời theo chuẩn STAR (STAR Methodology)*
  3. *Tư duy phản biện & Giải quyết vấn đề (Critical Thinking)*
  4. *Kỹ năng giao tiếp & Độ lưu loát (Fluency & Communication)*
  5. *Sự tự tin & Tác phong phỏng vấn (Confidence & Tone)*
- **Báo cáo chi tiết từng câu hỏi:** Điểm mạnh, điểm cần khắc phục, phát hiện các từ đệm vô nghĩa (filler words) và cung cấp câu trả lời mẫu tối ưu (Model Answer).
- **Xuất báo cáo kết quả:** Cho phép tải báo cáo phỏng vấn hoàn chỉnh để theo dõi quá trình tiến bộ.

### F. Thư viện câu hỏi phỏng vấn (Question Bank & Catalog)
- Tra cứu hàng nghìn câu hỏi phỏng vấn phân loại theo Domain, Vai trò và Cấp bậc.
- Phân loại rõ ràng giữa câu hỏi Kỹ thuật (Technical) và câu hỏi Tình huống hành vi (Behavioral).
- Tích hợp khung gợi ý trả lời STAR và câu trả lời tham khảo được kiểm duyệt bởi các chuyên gia tuyển dụng.

### G. Hồ sơ cá nhân & Huy hiệu VIP Crown Avatar Frame
- Hiển thị thông tin người dùng, lịch sử tất cả các phiên phỏng vấn, biểu đồ radar kỹ năng.
- **Khung Avatar Hoàng gia (VIP Crown Frame):**
  - Thiết kế độc quyền cho thành viên trả phí gói Pro.
  - Tỉ lệ đồng tâm tuyệt đối (Concentric Alignment) giữa ảnh đại diện và khung vương miện hoàng gia, tự động co giãn sắc nét trên mọi kích thước (sm, md, lg).
  - Tích hợp chấm trạng thái trực tuyến (Realtime Online Status Dot) kết nối với Socket server.

### H. Thanh toán & Nâng cấp VIP (Billing & Checkout)
- Lựa chọn gói cước linh hoạt: Theo tuần, tháng, năm.
- **Tạo mã VietQR động:** Tự động tạo mã QR chứa chính xác số tài khoản ngân hàng, tên chủ tài khoản, số tiền và mã nội dung chuyển khoản độc nhất (`INV...`).
- **Xử lý gạch nợ tức thì qua xGate Webhook:** Hệ thống tự động lắng nghe callback từ ngân hàng, đối soát giao dịch và kích hoạt tài khoản Pro trong vòng vài giây.
- **Hiệu ứng chúc mừng (Celebration Checkout):** Âm thanh "ting-ting" nhận tiền sống động cùng hiệu ứng pháo hoa chúc mừng thăng hạng VIP.

---

## 2.2. Phân hệ Quản trị viên (Admin Management Console)

### A. Dashboard Tổng quan & Phân tích Vận hành
- Bảng điều khiển trung tâm hiển thị: Tổng số người dùng, tỷ lệ người dùng hoạt động hàng ngày (DAU), doanh thu theo thời gian thực, tổng số phiên phỏng vấn đã thực hiện.
- Biểu đồ biến động doanh thu, biểu đồ phân bổ ứng viên theo từng ngành nghề.

### B. Quản lý Ứng viên & Báo cáo Onboarding Analytics (`/admin/onboarding`)
- **Phân tích kênh tiếp thị (Acquisition Channel Analytics):** Báo cáo trực quan tỷ lệ ứng viên đến từ Facebook Ads, TikTok Ads, YouTube, Google SEO, Bạn bè giới thiệu,...
- **Thống kê tỷ lệ chuyển đổi Onboarding:** Số lượng ứng viên hoàn thành khảo sát định hướng, tỷ lệ chuyển đổi từ ứng viên Free sang VIP Pro theo từng kênh.
- **Bảng chi tiết hồ sơ ứng viên:** Tìm kiếm, lọc theo vai trò mục tiêu, level, ngày đăng ký, xem chi tiết mục tiêu nghề nghiệp của từng ứng viên.

### C. Quản lý Giao dịch Thanh toán & Cổng VietQR (`/admin/payments`)
- Danh sách toàn bộ lịch sử giao dịch nạp tiền và mua gói dịch vụ.
- Hiển thị chi tiết ngân hàng gửi, số tài khoản người chuyển, số tiền, trạng thái giao dịch (Pending, Success, Failed).
- Tích hợp ảnh logo ngân hàng người chuyển với fallback avatar tinh tế.
- Công cụ đối soát thủ công (Manual Reconciliation) trong trường hợp giao dịch ngân hàng cần xác minh thêm.

### D. Quản lý Danh mục Nghề nghiệp & Ngân hàng Câu hỏi (`/admin/catalog`)
- Quản lý Domains (Lĩnh vực: IT, Marketing, Finance,...).
- Quản lý Roles (Vị trí công việc chi tiết kèm mô tả nghiệp vụ).
- Quản lý Ngân hàng Câu hỏi: Thêm mới, chỉnh sửa, xóa, gắn nhãn độ khó, thêm câu trả lời mẫu, hỗ trợ nhập/xuất dữ liệu hàng loạt (Bulk Import/Export).

### E. Giám sát Hệ thống, Route Audit Logs & Terminal Console (`/admin/audit-logs`)
- **HTTP Route Logging Middleware:** Tự động ghi nhận mọi truy vấn HTTP vào hệ thống (Method, Path, Status Code, Latency, IP, User Agent).
- **Cơ chế lưu trữ Rolling Memory Buffer 10 phút:** Giữ các bản ghi log trong 10 phút gần nhất, tối ưu hiệu năng không làm phình cơ sở dữ liệu.
- **Terminal Console thời gian thực:** Giao diện mô phỏng cửa sổ dòng lệnh máy chủ trên trình duyệt, hiển thị live stream các sự kiện hệ thống.

### F. Giám sát trạng thái người dùng trực tuyến (Realtime Presence Manager)
- Hệ thống WebSocket Presence theo dõi chính xác số lượng và danh sách người dùng đang online trên hệ thống.
- Cập nhật tức thời trạng thái chấm xanh trên Avatar người dùng tại Header và Dashboard Admin.

# PHẦN 3: THIẾT KẾ KIẾN TRÚC HỆ THỐNG & 5 DESIGN PATTERNS (ARCHITECTURE & DESIGN PATTERNS)

### 3.1. Tổng quan kiến trúc tổng thể (High-Level Architecture)
Hệ thống được thiết kế theo mô hình **Phân tán Hướng Dịch vụ (Distributed Service-Oriented Architecture)**, kết hợp giữa kiến trúc RESTful API và giao thức WebSocket song công thời gian thực:

```
+-----------------------------------------------------------------------------------+
|                                CLIENT APPLICATION                                 |
|         Next.js 14+ (App Router) | React 18 | Redux Toolkit Query | Tailwind CSS   |
+----------------------------------------+------------------------------------------+
                                         |
                       HTTP / HTTPS (REST API) + WSS (WebSocket)
                                         |
+----------------------------------------v------------------------------------------+
|                              API GATEWAY / FASTAPI                                |
|   CORS Middleware | JWT Auth Bearer | Route Audit Logger | Exception Handlers     |
+-----------------------------------------------------------------------------------+
|                              CLEAN ARCHITECTURE CORE                              |
|                                                                                   |
|  [PRESENTATION LAYER]                                                             |
|   - REST Routers: /auth, /onboarding, /interview, /evaluation, /billing, /admin   |
|   - WebSocket Handlers: /voice/ws/{session_id}, /presence/ws                      |
|   - Request/Response Schemas (Pydantic V2)                                        |
|                                                                                   |
|  [APPLICATION LAYER (Use Cases & Ports)]                                          |
|   - Services: AuthService, InterviewService, EvaluationService, BillingService     |
|   - Ports (Interfaces): STTPort, TTSPort, LLMPort, PaymentPort, UserRepoPort      |
|   - Commands & Queries (CQRS-ready DTOs)                                          |
|                                                                                   |
|  [DOMAIN LAYER (Enterprise Business Rules)]                                       |
|   - Entities: User, PracticeSession, Question, RubricScore, PaymentTransaction    |
|   - Value Objects: Email, Role, SubscriptionTier, STARBreakdown                   |
|   - Domain Exceptions & Enums                                                     |
|                                                                                   |
|  [INFRASTRUCTURE LAYER (Adapters & External Integrations)]                        |
|   - Database: SQLAlchemy 2.0 ORM | Connection Pool (PostgreSQL / SQLite)          |
|   - Repositories: UserRepository, SessionRepository, QuestionRepository           |
|   - AI & Speech Adapters: OpenAI GPT-4o, Whisper STT, Azure / Edge-TTS            |
|   - Payment Adapter: xGate VietQR Banking Gateway                                 |
|   - Cache & Logging: Rolling Memory Buffer, Realtime Presence Manager             |
+-----------------------------------------------------------------------------------+
```

---

### 3.2. Pattern 1: Clean Architecture (Hexagonal / Ports & Adapters Architecture)

#### Khái niệm & Mục tiêu:
Clean Architecture (còn gọi là Kiến trúc Lục giác - Ports & Adapters) được áp dụng làm kiến trúc nền tảng cho toàn bộ hệ thống Backend. Quy tắc cốt lõi: **Sự phụ thuộc chỉ được hướng vào trong (The Dependency Rule)**. Tầng Domain nằm ở trung tâm và không phụ thuộc vào bất kỳ framework, thư viện ORM, hay dịch vụ bên ngoài nào.

#### Cấu trúc 4 tầng chi tiết trong mã nguồn:
1. **Domain Layer (`app/domain/`):**
   - Chứa các thực thể cốt lõi (`User`, `PracticeSession`, `QuestionBank`, `OnboardingResponse`) và quy tắc nghiệp vụ bất biến.
   - Định nghĩa các Business Exception chuyên biệt (`AuthError`, `NotFoundError`, `DomainRuleViolation`).
   - Hoàn toàn độc lập với FastAPI, SQLAlchemy hay bất kỳ công nghệ bên ngoài nào.
2. **Application Layer (`app/application/`):**
   - Chứa các Use Cases thực thi quy trình nghiệp vụ: `AuthService`, `InterviewService`, `EvaluationService`, `BillingService`.
   - Định nghĩa các **Ports (Giao diện trừu tượng)**:
     - `GoogleTokenVerifierPort`: Xác thực credential Google.
     - `LLMPort`: Sinh câu hỏi và nhận xét từ mô hình ngôn ngữ lớn.
     - `STTPort` & `TTSPort`: Xử lý chuyển đổi giọng nói và tổng hợp âm thanh.
     - `PaymentGatewayPort`: Giao tiếp với cổng thanh toán ngân hàng.
   - Nhận các `Command` và `Query` làm dữ liệu đầu vào.
3. **Infrastructure Layer (`app/infrastructure/`):**
   - Triển khai cụ thể các Ports (Adapters):
     - `GoogleOAuthAdapter`: Gọi Google TokenInfo API xác thực token.
     - `OpenAILLMAdapter`: Kết nối OpenAI API thực hiện prompt engineering.
     - `WhisperSTTAdapter` & `EdgeTTSAdapter`: Xử lý âm thanh thực tế.
     - `XGatePaymentAdapter`: Sinh mã VietQR động và tiếp nhận webhook.
     - SQLAlchemy ORM Models và Repositories tương tác với cơ sở dữ liệu.
4. **Presentation Layer (`app/presentation/`):**
   - Chứa các FastAPI Router (`routers/auth.py`, `routers/onboarding.py`, `routers/voice_ws.py`).
   - Chuyển đổi dữ liệu HTTP Request thành Command/Query để chuyển vào tầng Application, và trả về Pydantic Response Schemas.

#### Lợi ích vượt trội:
- Dễ dàng thay thế công nghệ (ví dụ chuyển từ SQLite sang PostgreSQL hoặc đổi nhà cung cấp AI từ OpenAI sang Claude) mà không cần chạm vào logic nghiệp vụ.
- Khả năng kiểm thử (Testability) tối đa: Có thể viết Unit Test cho toàn bộ logic nghiệp vụ mà không cần bật cơ sở dữ liệu hay gọi API bên thứ ba.

---

### 3.3. Pattern 2: Repository & Unit of Work Pattern

#### Khái niệm & Mục tiêu:
Repository Pattern đóng vai trò là một tầng trừu tượng nằm giữa tầng Application và tầng lưu trữ dữ liệu (Database). Nó đóng gói toàn bộ các câu lệnh truy vấn SQL phức tạp, biến cơ sở dữ liệu thành một tập hợp collection trong bộ nhớ. Unit of Work quản lý vòng đời transaction, đảm bảo tính nguyên tử (Atomicity - ACID).

#### Triển khai trong mã nguồn:
Hệ thống triển khai các Repository chuyên biệt:
- `UserRepositoryPort` & `SqlAlchemyUserRepository`: Quản lý tìm kiếm người dùng theo email, ID, cập nhật mật khẩu, quyền hạn.
- `SessionRepository`: Quản lý các phiên phỏng vấn, lưu trữ danh sách câu hỏi đã hỏi và câu trả lời của ứng viên.
- `QuestionRepository`: Truy vấn câu hỏi theo domain, role, mức độ khó, hỗ trợ phân trang và tìm kiếm toàn văn.
- `AdminRepository`: Truy vấn báo cáo tổng hợp, thống kê doanh thu và dữ liệu ứng viên.

#### Minh họa mã nguồn (Code Implementation):
```python
# app/application/auth/ports.py - Khai báo Port trừu tượng
class UserRepositoryPort(Protocol):
    def find_by_email(self, session: Any, email: str) -> User | None: ...
    def find_by_id(self, session: Any, user_id: int) -> User | None: ...
    def add(self, session: Any, full_name: str, email: str, password_hash: str) -> User: ...

# app/infrastructure/persistence/user_repository.py - Adapter triển khai cụ thể
class SqlAlchemyUserRepository(UserRepositoryPort):
    def find_by_email(self, session: Session, email: str) -> User | None:
        return session.execute(
            select(User).where(User.email == email.lower().strip())
        ).scalar_one_or_none()

    def add(self, session: Session, full_name: str, email: str, password_hash: str) -> User:
        new_user = User(
            full_name=full_name,
            email=email.lower().strip(),
            password_hash=password_hash,
            role="candidate",
            status="active"
        )
        session.add(new_user)
        session.flush() # Lấy user_id trước khi commit
        return new_user
```

#### Lợi ích:
- Tách bạch hoàn toàn mã nguồn nghiệp vụ khỏi các câu lệnh SQL hay ORM API.
- Đảm bảo an toàn giao dịch: Khi có lỗi phát sinh trong quá trình tạo tài khoản và thiết lập khảo sát, toàn bộ thao tác được tự động `rollback`, không để lại dữ liệu rác.

---

### 3.4. Pattern 3: Strategy Pattern (AI Evaluation & Rubric Engine)

#### Khái niệm & Mục tiêu:
Strategy Pattern định nghĩa một họ các thuật toán đánh giá phỏng vấn, đóng gói từng thuật toán lại và làm cho chúng có thể hoán đổi linh hoạt cho nhau mà không làm thay đổi phía gọi (Client).

#### Ứng dụng trong hệ thống:
Mỗi loại phỏng vấn yêu cầu một tiêu chuẩn và khung đánh giá hoàn toàn khác nhau:
1. **STARScoringStrategy:** Đánh giá các câu hỏi hành vi (Behavioral Interview) dựa trên 4 thành tố: Tình huống (Situation), Nhiệm vụ (Task), Hành động (Action), Kết quả (Result).
2. **TechnicalRubricStrategy:** Đánh giá các câu hỏi kỹ thuật chuyên sâu (System Design, Frontend, Backend) dựa trên: Tính chính xác kiến trúc, Độ tối ưu thuật toán, Khả năng mở rộng (Scalability), Xử lý trường hợp biên (Edge Cases).
3. **GeneralHRStrategy:** Đánh giá sự phù hợp văn hóa (Culture Fit), động lực làm việc, kỹ năng mềm và khả năng gắn bó.

#### Sơ đồ cấu trúc:
```
           +---------------------------------------------+
           |       <<Interface>> EvaluationStrategy      |
           +---------------------------------------------+
           | + evaluate(answer: str, context: dict): Res |
           +---------------------------------------------+
                                  ^
                                  |
        +-------------------------+-------------------------+
        |                                                   |
+-------+--------------------+            +-----------------+------------------+
|    STARScoringStrategy     |            |     TechnicalRubricStrategy        |
+----------------------------+            +------------------------------------+
| - prompt: "Phân tích 4     |            | - prompt: "Đánh giá kiến trúc,     |
|   thành tố S-T-A-R..."     |            |   hiệu năng, scalability..."       |
| + evaluate(...) -> Result  |            | + evaluate(...) -> Result          |
+----------------------------+            +------------------------------------+
```

#### Minh họa mã nguồn:
```python
class EvaluationStrategy(Protocol):
    def evaluate(self, question: str, answer: str, role: str) -> EvaluationReport: ...

class STARScoringStrategy:
    def __init__(self, llm_port: LLMPort):
        self.llm = llm_port

    def evaluate(self, question: str, answer: str, role: str) -> EvaluationReport:
        prompt = f'''
        Đóng vai trò chuyên gia phỏng vấn vị trí {role}.
        Đánh giá câu trả lời sau theo mô hình STAR:
        Câu hỏi: {question}
        Câu trả lời: {answer}
        Yêu cầu trả về JSON gồm: situation_score, task_score, action_score, result_score, feedback, model_answer.
        '''
        return self.llm.generate_structured_evaluation(prompt)

class EvaluationContext:
    def __init__(self, strategy: EvaluationStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: EvaluationStrategy):
        self._strategy = strategy

    def execute_evaluation(self, question: str, answer: str, role: str) -> EvaluationReport:
        return self._strategy.evaluate(question, answer, role)
```

#### Lợi ích:
- Dễ dàng mở rộng thêm các chiến lược đánh giá mới (ví dụ: `CodingInterviewStrategy`, `EnglishFluencyStrategy`) mà không cần chỉnh sửa mã nguồn hiện tại (tuân thủ nguyên lý Open/Closed trong SOLID).

---

### 3.5. Pattern 4: Observer / Pub-Sub Pattern (Realtime Voice & Presence Engine)

#### Khái niệm & Mục tiêu:
Observer Pattern định nghĩa mối phụ thuộc một - nhiều giữa các đối tượng, sao cho khi một đối tượng thay đổi trạng thái, tất cả các đối tượng phụ thuộc của nó sẽ được thông báo và tự động cập nhật.

#### Ứng dụng trong hệ thống:
1. **Realtime Voice Stream Processing:**
   - Trong phòng phỏng vấn giọng nói WebSocket, luồng âm thanh đầu vào của ứng viên được chia nhỏ thành các audio chunks.
   - Khi một chunk âm thanh hoàn chỉnh được ghi nhận, các Observers liên quan sẽ nhận thông báo:
     - `VADObserver` (Voice Activity Detector): Xác định người dùng bắt đầu/ngừng nói.
     - `STTObserver`: Nhận audio chunk và gửi sang engine phiên âm văn bản.
     - `TranscriptStreamObserver`: Đẩy văn bản tức thời lên giao diện ứng viên qua WebSocket.
     - `LLMTriggerObserver`: Khi ứng viên hoàn tất câu trả lời, kích hoạt AI suy nghĩ và sinh phản hồi.
2. **Presence Manager (Trạng thái trực tuyến):**
   - Quản lý tập trung toàn bộ các kết nối WebSocket đang hoạt động.
   - Khi một người dùng kết nối (`UserConnectedEvent`) hoặc ngắt kết nối (`UserDisconnectedEvent`), `PresenceManager` tự động phát sóng (Broadcast) sự kiện tới tất cả các Admin Dashboard đang theo dõi.

#### Minh họa mã nguồn:
```python
# app/infrastructure/websocket/presence_manager.py
class PresenceManager:
    def __init__(self):
        self._active_connections: dict[int, set[WebSocket]] = {}
        self._admin_connections: set[WebSocket] = set()

    async def connect_user(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self._active_connections:
            self._active_connections[user_id] = set()
        self._active_connections[user_id].add(websocket)
        # Thông báo cho các quan sát viên (Admins)
        await self._notify_observers(user_id=user_id, status="online")

    async def disconnect_user(self, user_id: int, websocket: WebSocket):
        if user_id in self._active_connections:
            self._active_connections[user_id].discard(websocket)
            if not self._active_connections[user_id]:
                del self._active_connections[user_id]
                await self._notify_observers(user_id=user_id, status="offline")

    async def _notify_observers(self, user_id: int, status: str):
        message = json.dumps({"event": "presence_change", "user_id": user_id, "status": status})
        for admin_ws in list(self._admin_connections):
            try:
                await admin_ws.send_text(message)
            except Exception:
                self._admin_connections.discard(admin_ws)
```

#### Lợi ích:
- Tách rời hoàn toàn nguồn phát sinh sự kiện (Websocket Audio / User Action) khỏi các thành phần xử lý (AI Engine, Admin Notification).
- Xử lý bất đồng bộ (Asynchronous) không gây tắc nghẽn I/O, đảm bảo độ trễ siêu thấp cho phiên phỏng vấn.

---

### 3.6. Pattern 5: Factory Method / Abstract Factory Pattern (AI Voice Providers & Service Container)

#### Khái niệm & Mục tiêu:
Factory Pattern cung cấp một giao diện để tạo lập các đối tượng liên quan hoặc phụ thuộc lẫn nhau mà không chỉ định rõ lớp cụ thể của chúng tại thời điểm gọi.

#### Ứng dụng trong hệ thống:
1. **Speech Engine Factory (`SpeechEngineFactory`):**
   - Tùy thuộc vào cấu hình môi trường (`.env`), hệ thống tự động khởi tạo engine nhận diện và phát giọng nói phù hợp:
     - Môi trường Development / Local: Sử dụng `WhisperLocalAdapter` và `EdgeTTSAdapter` (hoàn toàn miễn phí, không tốn chi phí API).
     - Môi trường Production / Cloud: Khởi tạo `AzureSpeechSTTAdapter` và `ElevenLabsTTSAdapter` (cho chất lượng giọng nói siêu thực và độ trễ cực thấp).
2. **Service Container (IoC Container / Dependency Injection):**
   - File `bootstrap.py` đóng vai trò là một **Abstract Factory** tối cao, chịu trách nhiệm khởi tạo toàn bộ chuỗi phụ thuộc của ứng dụng và gom vào `ServiceContainer`.

#### Minh họa mã nguồn:
```python
# app/infrastructure/speech/factory.py
class SpeechEngineFactory:
    @staticmethod
    def create_stt_adapter(config: Settings) -> STTPort:
        if config.speech_provider == "azure":
            return AzureSpeechSTTAdapter(api_key=config.azure_speech_key, region=config.azure_region)
        elif config.speech_provider == "openai":
            return OpenAIWhisperAdapter(api_key=config.openai_api_key)
        return LocalWhisperAdapter(model_size="base")

    @staticmethod
    def create_tts_adapter(config: Settings) -> TTSPort:
        if config.tts_provider == "elevenlabs":
            return ElevenLabsTTSAdapter(api_key=config.elevenlabs_key)
        return EdgeTTSAdapter(default_voice="vi-VN-HoaiMyNeural")

# app/bootstrap.py - Khởi tạo Service Container
class ServiceContainer:
    def __init__(
        self,
        auth_service: AuthService,
        interview_service: InterviewService,
        evaluation_service: EvaluationService,
        billing_service: BillingService,
        presence_manager: PresenceManager,
    ):
        self.auth_service = auth_service
        self.interview_service = interview_service
        self.evaluation_service = evaluation_service
        self.billing_service = billing_service
        self.presence_manager = presence_manager

def build_container(settings: Settings) -> ServiceContainer:
    # 1. Khởi tạo Database & Repositories
    db_engine = create_db_engine(settings.database_url)
    user_repo = SqlAlchemyUserRepository()
    
    # 2. Khởi tạo Adapters qua Factory
    stt_adapter = SpeechEngineFactory.create_stt_adapter(settings)
    tts_adapter = SpeechEngineFactory.create_tts_adapter(settings)
    llm_adapter = OpenAILLMAdapter(api_key=settings.openai_api_key)
    payment_adapter = XGatePaymentAdapter(settings.xgate_config)
    
    # 3. Khởi tạo Services
    auth_service = AuthService(users=user_repo, tokens=JwtTokenService(settings.jwt_secret))
    interview_service = InterviewService(stt=stt_adapter, tts=tts_adapter, llm=llm_adapter)
    
    return ServiceContainer(
        auth_service=auth_service,
        interview_service=interview_service,
        evaluation_service=EvaluationService(llm=llm_adapter),
        billing_service=BillingService(payment_gateway=payment_adapter),
        presence_manager=PresenceManager(),
    )
```

#### Lợi ích:
- Mã nguồn độc lập hoàn toàn với nhà cung cấp thứ ba (Vendor-Agnostic), ngăn chặn nguy cơ bị khóa chặt vào một đơn vị cung cấp (Vendor Lock-in).
- Cấu hình linh hoạt theo biến môi trường, dễ dàng chuyển đổi chế độ chạy thử nghiệm và chạy thực tế mà không phải sửa lại code.

# PHẦN 4: TÀI LIỆU KỸ THUẬT, API & CƠ SỞ DỮ LIỆU (TECHNICAL SPECIFICATIONS & API CONTRACTS)

### 4.1. Ngăn xếp Công nghệ (Full Technology Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò kỹ thuật |
|---|---|---|
| **Frontend Core** | Next.js 14+ (App Router), React 18, TypeScript | Giao diện Single Page Application hiện đại, Server-Side Rendering tối ưu SEO |
| **State Management** | Redux Toolkit (RTK) & RTK Query | Quản lý state toàn cục, caching dữ liệu API tự động, modularized slices |
| **Styling & UI** | Tailwind CSS, CSS Modules, Lucide Icons | Giao diện Responsive, hỗ trợ chế độ Dark/Light Mode, glassmorphism cao cấp |
| **Backend Core** | FastAPI (Python 3.11+ / 3.12+), Uvicorn ASGI | API Gateway hiệu năng cao, hỗ trợ Async I/O, tự động sinh tài liệu Swagger |
| **Database & ORM** | PostgreSQL / SQLite, SQLAlchemy 2.0 | Lưu trữ dữ liệu quan hệ, Connection Pooling, Migration dữ liệu an toàn |
| **Realtime Stream** | WebSockets (RFC 6455), Asyncio Event Loop | Truyền phát luồng âm thanh song công (Full-duplex audio stream) và presence |
| **Speech Processing** | OpenAI Whisper, Edge-TTS, PyAudio, Opus | Nhận diện giọng nói (STT) và tổng hợp âm thanh giọng đọc AI tự nhiên (TTS) |
| **Payment Gateway** | VietQR Standard, xGate Banking API | Cổng thanh toán ngân hàng tự động, mã QR động, webhook đối soát thời gian thực |
| **Security & Auth** | JWT (JSON Web Tokens), Google Identity (GSI), BCrypt | Mã hóa mật khẩu an toàn, xác thực phân quyền Role-Based Access Control (RBAC) |

---

### 4.2. Thiết kế Cơ sở Dữ liệu & Sơ đồ Thực thể Quan hệ (Database Schema & ERD)

```
+-------------------+       1:N       +-------------------------+
|      users        |----------------<|   practice_sessions     |
+-------------------+                 +-------------------------+
| user_id (PK)      |                 | session_id (PK)         |
| email (Unique)    |                 | user_id (FK -> users)   |
| password_hash     |                 | role_id (FK -> roles)   |
| full_name         |                 | mode (voice/text)       |
| role (admin/user) |                 | stage (tech/hr/star)    |
| status            |                 | total_score (float)     |
| is_onboarded (bool)                 | status (in_progress/..) |
| created_at        |                 | created_at              |
+-------------------+                 +-------------------------+
        | 1:1                                      | 1:N
        |                                          v
        |                             +-------------------------+
        |                             |    session_answers      |
        |                             +-------------------------+
        |                             | answer_id (PK)          |
        |                             | session_id (FK)         |
        |                             | question_id (FK)        |
        |                             | audio_url (nullable)    |
        |                             | transcript (text)       |
        |                             | ai_feedback (text)      |
        |                             | rubric_scores (JSON)    |
        |                             +-------------------------+
        |
        | 1:1                         +-------------------------+
        +----------------------------<|  onboarding_responses   |
        |                             +-------------------------+
        |                             | response_id (PK)        |
        |                             | user_id (FK -> users)   |
        |                             | preferred_language (vi) |
        |                             | acquisition_channel     |
        |                             | current_domain          |
        |                             | current_role            |
        |                             | target_role             |
        |                             | target_level            |
        |                             | is_completed (bool)     |
        |                             +-------------------------+
        |
        | 1:N                         +-------------------------+
        +----------------------------<|  payment_transactions   |
                                      +-------------------------+
                                      | transaction_id (PK)     |
                                      | user_id (FK -> users)   |
                                      | amount (int)            |
                                      | order_code (unique)     |
                                      | plan_type (week/month)  |
                                      | status (PENDING/PAID)   |
                                      | sender_bank (string)    |
                                      | sender_account (string) |
                                      | paid_at                 |
                                      +-------------------------+
```

---

### 4.3. Danh mục API RESTful cốt lõi (Core REST API Endpoints)

| Phân hệ | Method | Endpoint URL | Mục đích & Mô tả |
|---|---|---|---|
| **Auth** | `POST` | `/api/v1/auth/login` | Đăng nhập tài khoản bằng Email & Mật khẩu, trả về Access Token và trạng thái `needs_password` |
| **Auth** | `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới kèm xác thực mã OTP email |
| **Auth** | `POST` | `/api/v1/auth/google` | Đăng nhập bằng Google Credential, phát hiện tài khoản mới và cờ thiết lập mật khẩu |
| **Auth** | `POST` | `/api/v1/auth/set-initial-password` | Bắt buộc thiết lập mật khẩu cho tài khoản Google trước khi vào Onboarding |
| **Auth** | `GET` | `/api/v1/auth/me` | Lấy thông tin cá nhân của người dùng hiện tại kèm cờ `is_onboarded` |
| **Auth** | `POST` | `/api/v1/auth/send-otp` | Gửi mã OTP xác thực email qua dịch vụ thư điện tử |
| **Onboarding** | `POST` | `/api/v1/onboarding` | Lưu trữ câu trả lời khảo sát định hướng nghề nghiệp 5 bước |
| **Onboarding** | `GET` | `/api/v1/onboarding/status` | Kiểm tra trạng thái hoàn tất Onboarding của ứng viên |
| **Onboarding** | `POST` | `/api/v1/onboarding/reset` | Đặt lại trạng thái Onboarding để ứng viên thực hiện khảo sát lại |
| **Catalog** | `GET` | `/api/v1/catalog/domains` | Lấy danh sách các lĩnh vực nghề nghiệp (IT, Marketing, Sales,...) |
| **Catalog** | `GET` | `/api/v1/catalog/roles` | Lấy danh sách vai trò công việc theo từng lĩnh vực |
| **Catalog** | `GET` | `/api/v1/catalog/questions` | Tra cứu thư viện câu hỏi phỏng vấn theo vai trò và độ khó |
| **Interview** | `POST` | `/api/v1/interview/sessions` | Khởi tạo phiên phỏng vấn mới (chọn mode, stage, số lượng câu) |
| **Interview** | `GET` | `/api/v1/interview/sessions/{id}` | Lấy thông tin chi tiết phiên phỏng vấn và danh sách câu hỏi |
| **Evaluation** | `POST` | `/api/v1/evaluation/answers` | Chấm điểm câu trả lời phỏng vấn theo thang Rubric 5 tiêu chí và STAR |
| **Billing** | `POST` | `/api/v1/billing/checkout` | Tạo đơn hàng nâng cấp VIP và sinh mã VietQR động |
| **Billing** | `POST` | `/api/v1/billing/webhook/xgate` | Tiếp nhận callback xác nhận chuyển khoản tự động từ cổng ngân hàng |
| **Admin** | `GET` | `/api/v1/admin/onboarding/stats` | Thống kê số liệu khảo sát Onboarding và phân tích kênh tiếp thị |
| **Admin** | `GET` | `/api/v1/admin/payments` | Danh sách lịch sử thanh toán VietQR và đối soát giao dịch |
| **Admin** | `GET` | `/api/v1/admin/server-logs` | Truy xuất log hệ thống 10 phút gần nhất từ Rolling Memory Store |

---

### 4.4. Giao thức WebSocket phòng phỏng vấn thời gian thực (Realtime Voice WS Protocol)

- **Endpoint:** `ws://<host>/api/v1/voice/ws/{session_id}`
- **Luồng bản tin Client -> Server:**
  - `{"type": "start_session", "session_id": 123}`: Bắt đầu phiên phỏng vấn.
  - `{"type": "audio_chunk", "data": "<base64_encoded_pcm_or_webm>"}`: Luồng dữ liệu âm thanh người dùng nói.
  - `{"type": "stop_speaking"}`: Người dùng ngắt mic, kích hoạt AI xử lý.
  - `{"type": "next_question"}`: Chuyển tiếp sang câu hỏi tiếp theo.
- **Luồng bản tin Server -> Client:**
  - `{"type": "session_ready", "question": "Chào bạn, hãy giới thiệu về bản thân..."}`: Sẵn sàng phỏng vấn.
  - `{"type": "transcript_stream", "text": "Tôi là kỹ sư Frontend..."}`: Phiên âm tức thì lời nói người dùng.
  - `{"type": "ai_thinking"}`: AI đang phân tích và chuẩn bị câu trả lời.
  - `{"type": "audio_stream", "chunk": "<base64_audio>"}`: Luồng âm thanh giọng đọc của AI trả về loa.
  - `{"type": "question_evaluated", "scores": {"star": 8.5, "fluency": 9.0}}`: Đánh giá ngay sau mỗi câu.

---

### 4.5. Hướng dẫn cài đặt & Triển khai (Deployment Guide)

1. **Yêu cầu môi trường hệ thống:**
   - Node.js version 18+ (khuyên dùng Node 20 LTS).
   - Python version 3.11+ hoặc 3.12+.
   - Cơ sở dữ liệu PostgreSQL 15+ (hoặc SQLite cho môi trường phát triển local).
   - FFmpeg (phục vụ xử lý và nén audio đa định dạng).
2. **Cấu hình biến môi trường (`.env`):**
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/interviewly_db

   # Security & Authentication
   JWT_SECRET=super-secret-key-32-chars-long
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

   # AI & Cloud Speech
   OPENAI_API_KEY=sk-...
   SPEECH_PROVIDER=openai # hoặc azure
   TTS_PROVIDER=edge      # hoặc elevenlabs

   # Banking & VietQR
   XGATE_API_KEY=xgate_live_api_key
   XGATE_MERCHANT_ID=your_merchant_id
   ```
3. **Khởi chạy hệ thống:**
   - **Backend (FastAPI):**
     ```bash
     cd BE
     uvicorn reference_app.app.main:app --host 0.0.0.0 --port 8000 --reload
     ```
   - **Frontend (Next.js):**
     ```bash
     cd FE
     npm install
     npm run dev
     ```

---

# PHẦN 5: TỔNG KẾT & CAM KẾT CHẤT LƯỢNG (CONCLUSION & QUALITY ASSURANCE)

Nền tảng **Interviewly (AI Real-Time Interview Coach)** là sự kết hợp hoàn hảo giữa công nghệ Trí tuệ Nhân tạo hiện đại và chuẩn mực kiến trúc phần mềm quốc tế:
- **Kiến trúc bền vững:** 5 Design Patterns được ứng dụng đồng bộ (Clean Architecture, Repository, Strategy, Observer, Factory) mang lại khả năng mở rộng (Scalability), độ tin cậy cao và tính độc lập công nghệ.
- **Trải nghiệm người dùng đột phá:** Khảo sát Onboarding cá nhân hóa kết hợp phòng phỏng vấn giọng nói độ trễ cực thấp (< 1.2s) tạo ra bước nhảy vọt so với các giải pháp truyền thống trên thị trường.
- **Tính thương mại hóa cao:** Cổng thanh toán VietQR tự động, mô hình gói cước đa dạng và hệ thống quản trị vận hành toàn diện sẵn sàng cho việc tăng trưởng quy mô người dùng lớn.

Tài liệu này cam kết phản ánh chính xác 100% cấu trúc mã nguồn, tính năng và thiết kế kỹ thuật thực tế của hệ thống!

---
*Tài liệu được phát hành và kiểm duyệt bởi Interviewly Engineering Team.*
