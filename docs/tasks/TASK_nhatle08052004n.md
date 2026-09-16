# NHIỆM VỤ DÀNH CHO: LÊ VĂN NHẬT (Project Manager / Backend Lead / AI Dev)

> **Lưu ý:** Nhiệm vụ chính của bạn tập trung ở **Backend** (`Interview_Coach_SRC_CODE/BE`).  
> Chi tiết toàn bộ task, mã nguồn, kiến trúc và test đã được ghi đầy đủ tại file:  
> 👉 [`Interview_Coach_SRC_CODE/BE/TASK.md`](../BE/TASK.md)

### Tóm tắt trách nhiệm của bạn:
1. **BE Core Engine:**
   - Xây dựng luồng phỏng vấn AI đa lượt SSE streaming (`POST /sessions`, `GET /stream`, `POST /turns`).
   - Xây dựng động cơ chấm điểm Rubric 3 tiêu chí theo Structured JSON output.
   - Xây dựng thuật toán phân tích giọng nói WPM hiệu dụng và phát hiện từ đệm đa ngữ.
2. **Review & Quản lý Git:**
   - Review và duyệt các Pull Request của 4 thành viên khác vào nhánh `main`.
   - Đảm bảo nhánh `main` luôn ở trạng thái pass test kiến trúc (`test_dependency_rule.py`) và test chức năng.
3. **FE Support (nếu cần):**
   - Hỗ trợ Thành viên 3 (Hiếu 1) tích hợp SSE EventSource ở frontend.
   - Hỗ trợ Thành viên 4 (Sơn) map đúng schema dữ liệu trả về từ API Result.

---

### 🛑 QUY TẮC COMMIT & HỎI Ý KIẾN USER (BẮT BUỘC):
- Khi hoàn thành xong bất kỳ task nhỏ hay bước nào:
  - **TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT NGAY.**
  - Chạy test / build kiểm tra trước (`npm run build` hoặc `pytest -q`).
  - Báo cáo kết quả công việc đã làm cho User (file nào tạo/sửa, kết quả ra sao).
  - **Hỏi ý kiến User:** *"Tôi đã hoàn thành task nhỏ này và kiểm tra không có lỗi. Bạn có đồng ý để tôi commit không?"*
  - **CHỈ KHI USER XÁC NHẬN ĐỒNG Ý** mới được thực hiện `git add`, `git commit` và tạo PR!
