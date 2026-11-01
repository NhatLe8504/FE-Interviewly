# Yêu cầu trang /admin/interviews

**Route:** `/admin/interviews`. **Ưu tiên:** P1. Đây là một nhiệm vụ FE + BE có thể giao cho một agent nhỏ; tách commit FE/BE nếu thay đổi độc lập.

## Hiện trạng cần xác minh

- FE: `src/app/(admin)/admin/interviews/AdminInterviewsClient.tsx`.
- BE liên quan: `reference_app/app/presentation/api/routers/admin.py`.
- Quan sát từ mã: Đã có danh sách và trang chi tiết phiên; phiên là bằng chứng người dùng, không áp dụng CRUD/xóa tùy ý.

## Endpoint cần đối chiếu

- **Đối chiếu endpoint hiện có:** `GET /api/v1/admin/interviews?status&mode&user_id&from&to&page`.
- **Đối chiếu endpoint hiện có:** `GET /api/v1/admin/interviews/{id}`.

Đây là danh sách ban đầu, không khẳng định mọi endpoint đáp ứng đủ yêu cầu. Agent phải xác minh method, payload, response, phân trang, trạng thái và nơi FE đang gọi trước khi chỉnh sửa.

## Yêu cầu API / BE

Lọc phía server theo trạng thái, hình thức, vai trò, người dùng và thời gian; phân trang và thống kê nhất quán. Chỉ thêm lưu trữ/xuất/đánh dấu bỏ dở sau khi có quy tắc và nhật ký kiểm toán.

**Hợp đồng bàn giao cho FE:** ghi rõ method, URL, kiểu request/response, bộ lọc, phân trang, sắp xếp và lỗi 400/401/403/404/409. Kiểm tra đối tượng liên kết và trạng thái hợp lệ ở BE; không trả thành công giả. Danh sách/chi tiết phải nhất quán sau khi tải lại.

## Yêu cầu giao diện / FE

Bảng có ứng viên, vai trò, trạng thái, thời lượng, điểm, hoạt động gần nhất và trạng thái chấm; tìm kiếm, lọc trên URL, trạng thái rỗng/lỗi rõ ràng.

**Trạng thái bắt buộc:** skeleton lúc tải, trang rỗng có hướng xử lý, lỗi có nút thử lại, phản hồi sau lưu, bộ lọc/trang có thể mở bằng URL, breadcrumb và đường quay lại, hỗ trợ bàn phím và màn hình nhỏ. Với hành động không thể hoàn tác, cho biết tác động cụ thể trước khi xác nhận.

## Kiểm thử và hoàn thành

403 cho người không phải admin, phân trang, phiên chưa hoàn thành, điểm rỗng và liên kết báo cáo.

Hoàn thành khi FE hiển thị dữ liệu thật và kết quả thao tác còn đúng sau khi tải lại; BE có kiểm tra quyền và test ca thành công/thất bại; giao diện có đủ trạng thái tải/rỗng/lỗi và responsive. Bàn giao danh sách file, hợp đồng API mới, lệnh kiểm tra, kết quả nếu đã được phép chạy và rủi ro còn lại.

## Quy tắc giao việc cho agent

- Chỉ xử lý route này. Đọc component, service FE, router, schema và service BE hiện tại trước khi sửa. Endpoint đã có thì mở rộng hợp đồng thay vì tạo route trùng; không dùng dữ liệu giả trong môi trường thật.
- Các thao tác thay đổi dữ liệu phải kiểm tra quyền admin ở BE, xác thực đầu vào, ghi audit người thực hiện/thời gian/đối tượng. Trang danh sách cần lọc và phân trang phía server; kiểm tra quyền đối với dữ liệu theo ID.
- Giữ ngôn ngữ thiết kế admin hiện tại (sidebar, header, shadcn/Tailwind), cải thiện thứ bậc thông tin, khoảng trắng, kiểu chữ, tương phản, bố cục 360px–desktop, nhãn form, bàn phím và focus. Nút nguy hiểm phải có xác nhận; thao tác đang chạy phải khóa gửi trùng.
- FE/BE là hai repo riêng. Không ghi đè thay đổi của agent khác; cập nhật type/client cùng lúc với hợp đồng API. Theo AGENTS.md, không tự ý build, chạy test hoặc mở UI; ghi lệnh cần chạy để người dùng cho phép. Chỉ commit nguyên tử trên branch/identity được giao khi đã kiểm tra; không sửa code trực tiếp trên VPS.
