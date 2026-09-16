# NHIỆM VỤ DÀNH CHO: LÊ ANH VŨ (Backend & Billing Specialist)

> **Lưu ý:** Nhiệm vụ của bạn gồm cả **Backend (VNPay + PDF Generator)** và **Frontend (Pricing + Checkout + Subscription Flow)**.  
> Bản đặc tả chi tiết đã có sẵn tại file:  
> 👉 [`Interview_Coach_SRC_CODE/BE-vule556677/TASK.md`](../BE-vule556677/TASK.md)

### Tóm tắt công việc Frontend tại worktree này (`FE-vule556677`):
1. **Trang Bảng giá (`/pricing`):**
   - Thay thế stub hiện tại bằng bảng giá chuyên nghiệp: Toggle Tháng/Năm, so sánh Free vs Pro, FAQ.
2. **Trang Nâng cấp & Checkout (`/subscription/checkout`):**
   - Nhận mã gói, chọn cổng thanh toán VNPay / MoMo / Stripe, gọi API lấy URL thanh toán.
3. **Trang Kết quả (`/subscription/result/success` và `failed`):**
   - Đọc tham số trả về từ VNPay, hiển thị trạng thái và cập nhật badge Pro.
4. **Trang Lịch sử & Thông tin gói (`/subscription/my`, `/subscription/history`):**
   - Quản lý số lượt phỏng vấn còn lại, ngày hết hạn và danh sách hóa đơn giao dịch.
5. **API Client (`src/services/billingApi.ts`):**
   - Kết nối với Backend endpoint `GET /plans`, `POST /checkout`, `GET /subscriptions/me`.

---

### 🛑 QUY TẮC COMMIT & HỎI Ý KIẾN USER (BẮT BUỘC):
- Khi hoàn thành xong bất kỳ task nhỏ hay bước nào:
  - **TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT NGAY.**
  - Chạy test / build kiểm tra trước (`npm run build` hoặc `pytest -q`).
  - Báo cáo kết quả công việc đã làm cho User (file nào tạo/sửa, kết quả ra sao).
  - **Hỏi ý kiến User:** *"Tôi đã hoàn thành task nhỏ này và kiểm tra không có lỗi. Bạn có đồng ý để tôi commit không?"*
  - **CHỈ KHI USER XÁC NHẬN ĐỒNG Ý** mới được thực hiện `git add`, `git commit` và tạo PR!
