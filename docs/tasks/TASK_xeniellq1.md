# NHIỆM VỤ CHI TIẾT DÀNH CHO: LÊ MINH HIẾU (1) (Frontend & Voice Interaction Lead)

- **Mã sinh viên:** 28219045377
- **Email:** `xeniellq1@gmail.com`
- **Git Branch:** `xeniellq1`
- **Worktree BE:** `D:\DOANNHATLE\Interview_Coach_SRC_CODE\BE-xeniellq1`
- **Worktree FE:** `D:\DOANNHATLE\Interview_Coach_SRC_CODE\FE-xeniellq1`

---

## ⚠️ QUY TẮC BẮT BUỘC TRƯỚC KHI BẮT ĐẦU (GIT IDENTITY & WORKTREE)

1. Mở đúng thư mục worktree Frontend được phân công:
   - Frontend: `D:\DOANNHATLE\Interview_Coach_SRC_CODE\FE-xeniellq1`
2. Kiểm tra branch hiện tại:
   ```bash
   git branch --show-current
   ```
   *Kết quả phải đúng là: `xeniellq1`*
3. Cấu hình danh tính Git chính xác:
   ```bash
   git config user.name "xeniellq1"
   git config user.email "xeniellq1@gmail.com"
   ```
4. **Tuyệt đối KHÔNG commit trực tiếp lên nhánh `main`.** Chỉ push lên `xeniellq1` và tạo PR sang `main`.
5. 🛑 **QUY TẮC COMMIT & HỎI Ý KIẾN USER (BẮT BUỘC):**
   - Mỗi khi hoàn thành xong bất kỳ một task nhỏ hay bước nào (ví dụ: viết xong hook, dựng xong component, sửa xong trang):
     - **TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT NGAY.**
     - Chạy test / build kiểm tra trước (`npm run build`).
     - Báo cáo ngắn gọn cho User: đã làm được gì, thay đổi những file nào, kết quả ra sao.
     - **Hỏi ý kiến User:** *"Tôi đã hoàn thành task nhỏ này và kiểm tra không có lỗi. Bạn có đồng ý để tôi commit không?"*
     - **CHỈ KHI USER XÁC NHẬN ĐỒNG Ý** mới được thực hiện `git add`, `git commit` và tạo PR!

---

## 🎯 PHẠM VI NHIỆM VỤ CỦA BẠN

Bạn chịu trách nhiệm chính về **Trang Thiết lập phỏng vấn (`/practice`), Phòng phỏng vấn ảo AI thời gian thực (`/practice/[sessionId]`), Luồng nhận câu hỏi AI dạng Server-Sent Events (SSE), Nhận diện giọng nói Voice-to-Text (STT), Hiệu ứng sóng âm thanh Audio Waveform, và Ngăn trượt hướng dẫn STAR thời gian thực**.

---

## 📋 DANH MỤC FILE CẦN TRIỂN KHAI TẠI FRONTEND (`FE-xeniellq1`)

```text
src/
├── app/(user)/practice/
│   ├── page.tsx                           # Setup wizard kết nối API thật, kiểm tra quota gói
│   └── [sessionId]/
│       ├── page.tsx                       # Phòng phỏng vấn AI thời gian thực (thay thế mock script)
│       └── components/
│           ├── AudioWaveformVisualizer.tsx # Hiệu ứng sóng âm thanh trực quan bằng HTML5 Canvas
│           ├── StarGuidanceDrawer.tsx      # Drawer trượt hướng dẫn khung STAR thời gian thực
│           ├── InterviewHeader.tsx         # Đồng hồ đếm giờ phiên, đếm số câu hỏi, nút kết thúc sớm
│           ├── AiStageAvatar.tsx           # Avatar AI hiển thị trạng thái (Đang nói, Lắng nghe, Suy nghĩ)
│           └── ResponseInputArea.tsx       # Bộ điều khiển nhập Text / Ghi âm Voice
├── hooks/
│   ├── useVoiceRecording.ts               # Hook quản lý MediaRecorder, Web Speech API, bắt lỗi micro
│   ├── useSseStreaming.ts                 # Hook kết nối SSE endpoint nhận câu hỏi AI thời gian thực
│   └── useInterviewSession.ts             # Quản lý state phiên: turn hiện tại, lịch sử câu hỏi
└── services/
    └── interviewApi.ts                    # API client: startSession(), submitTurn(), getSessionStreamUrl()
```

---

## 📋 CÁC BƯỚC THỰC HIỆN CHI TIẾT THEO THỨ TỰ ƯU TIÊN

### Bước 1: Hooks xử lý Âm thanh & Streaming
1. **Hook `src/hooks/useVoiceRecording.ts`:**
   - Sử dụng `navigator.mediaDevices.getUserMedia({ audio: true })`.
   - Bắt lỗi quyền micro (`NotAllowedError`), lỗi không tìm thấy micro (`NotFoundError`).
   - Khởi tạo `AudioContext` và `AnalyserNode` để đo biên độ âm thanh (`volume` từ 0 đến 100) theo thời gian thực để vẽ sóng âm.
   - Sử dụng `webkitSpeechRecognition` / `SpeechRecognition` để bóc băng (Speech-to-Text) trực tiếp trên trình duyệt (hỗ trợ cả `vi-VN` và `en-US`).
   - Đồng thời sử dụng `MediaRecorder` để ghi âm thành file `Blob` (audio `.webm` hoặc `.mp3`) làm dữ liệu nộp lên server.
2. **Hook `src/hooks/useSseStreaming.ts`:**
   - Kết nối với endpoint SSE của Backend (`GET /api/v1/interviews/sessions/{id}/stream`).
   - Xử lý nhận từng token/chunk và tạo hiệu ứng máy đánh chữ (Typewriter effect) mượt mà.
3. **Component `AudioWaveformVisualizer.tsx`:**
   - Dùng thẻ `<canvas>` vẽ các thanh sóng âm thanh hoặc sóng sin chuyển động 60 FPS theo giá trị biên độ nhận từ `useVoiceRecording`.

### Bước 2: Nâng cấp Trang Thiết lập phỏng vấn (`/practice/page.tsx`)
1. Thay thế dữ liệu hardcode bằng cách gọi API Backend:
   - Gọi `GET /api/v1/catalog/domains` để lấy danh sách ngành nghề thực tế.
   - Khi người dùng chọn Domain, gọi `GET /api/v1/catalog/roles?domainId=...` để nạp vị trí tương ứng.
2. Kiểm tra hạn ngạch gói cước:
   - Gọi `GET /api/v1/subscriptions/me`. Nếu tài khoản Free đã dùng hết 3 lượt phỏng vấn trong tháng -> Hiển thị Modal thông báo yêu cầu nâng cấp Pro (kèm link chuyển sang `/pricing`).
3. Khi bấm "Bắt đầu phỏng vấn ngay":
   - Gửi payload lên `POST /api/v1/interviews/sessions` (`domainId`, `roleId`, `level`, `language`, `mode`).
   - Nhận về `sessionId` thực tế từ DB và chuyển hướng: `router.push(/practice/${sessionId})`.

### Bước 3: Nâng cấp Phòng phỏng vấn ảo (`/practice/[sessionId]/page.tsx`)
1. **Xóa bỏ mock data** (`src/mock/practice.ts`), thay bằng dữ liệu phiên thật.
2. **Luồng tương tác đa lượt (Multi-turn Loop):**
   - Khi vào phòng: Lắng nghe SSE nhận câu hỏi đầu tiên của AI -> AI Avatar chuyển trạng thái `speaking` -> Chữ xuất hiện dạng máy đánh chữ -> Kết thúc câu hỏi chuyển sang trạng thái `listening`.
   - **Ứng viên trả lời:**
     - Nếu *Text Mode*: Gõ vào textarea, có đếm số từ và phím tắt `Ctrl + Enter` để gửi.
     - Nếu *Voice Mode*: Bấm nút Mic lớn -> Bắt đầu ghi âm -> Sóng âm thanh nhảy theo giọng nói -> Chữ nhận diện hiển thị thời gian thực vào khung xem trước -> Cho phép ứng viên sửa lỗi chính tả trước khi bấm gửi.
   - **Nộp câu trả lời:**
     - Gọi `interviewApi.submitTurn(sessionId, { answerText, audioBlob, durationSeconds })`.
     - Hiệu ứng UI: Khóa khung nhập, hiển thị "AI đang phân tích câu trả lời của bạn...".
     - Nhận phản hồi từ Backend: Nếu có câu hỏi follow-up tiếp theo -> tiếp tục chu trình; nếu phiên đã hoàn tất -> chuyển hướng sang trang kết quả `/practice/[sessionId]/result`.
3. **STAR Guidance Drawer (`StarGuidanceDrawer.tsx`):**
   - Nút toggle mở bảng trợ giúp STAR bên cạnh màn hình.
   - Hiển thị gợi ý cách trả lời theo 4 chữ S-T-A-R tương ứng với câu hỏi hiện tại.

### Bước 4: Kiểm thử Tương thích Trình duyệt (NFR-03)
- Kiểm tra tính năng ghi âm và nhận diện giọng nói trên Chrome, Microsoft Edge, Firefox, và Safari.
- Đảm bảo giao diện co giãn responsive đẹp mắt trên cả Laptop và Điện thoại.

---

## 🚀 QUY TRÌNH ĐẨY CODE (PULL REQUEST)
```bash
# Tại worktree FE-xeniellq1
git add .
git commit -m "feat(interview-room): real-time sse streaming, voice stt and star guidance"
git push -u origin xeniellq1
gh pr create --base main --head xeniellq1 --title "feat(practice): Real-time AI Interview Room and Voice STT" --body "Implement dynamic practice setup, SSE streaming question receiver, speech-to-text with waveform visualizer, and STAR guidance panel."
```
