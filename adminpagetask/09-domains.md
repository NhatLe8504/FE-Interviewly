# Yêu cầu trang /admin/domains

**Route:** `/admin/domains`. **Ưu tiên:** P2. Đây là một nhiệm vụ FE + BE có thể giao cho một agent nhỏ; tách commit FE/BE nếu thay đổi độc lập.

## Hiện trạng cần xác minh

- FE: `src/app/(admin)/admin/domains/AdminDomainsClient.tsx`.
- BE liên quan: `reference_app/app/presentation/api/routers/admin.py`.
- Quan sát từ mã: Đã có tạo/sửa/đổi trạng thái lĩnh vực; trang chi tiết quản lý vai trò.

## Endpoint cần đối chiếu

- **Đối chiếu endpoint hiện có:** `GET/POST /api/v1/admin/domains`.
- **Đối chiếu endpoint hiện có:** `GET/PUT/DELETE /api/v1/admin/domains/{id}`.
- **Đối chiếu endpoint hiện có:** `PATCH /api/v1/admin/domains/{id}/status`.

Đây là danh sách ban đầu, không khẳng định mọi endpoint đáp ứng đủ yêu cầu. Agent phải xác minh method, payload, response, phân trang, trạng thái và nơi FE đang gọi trước khi chỉnh sửa.

## Yêu cầu API / BE

Quy định xóa mềm hoặc 409 khi còn vai trò/câu hỏi liên kết; trả số lượng liên kết, lọc trạng thái và kiểm tra tên trùng.

**Hợp đồng bàn giao cho FE:** ghi rõ method, URL, kiểu request/response, bộ lọc, phân trang, sắp xếp và lỗi 400/401/403/404/409. Kiểm tra đối tượng liên kết và trạng thái hợp lệ ở BE; không trả thành công giả. Danh sách/chi tiết phải nhất quán sau khi tải lại.

## Yêu cầu giao diện / FE

Danh sách có tìm kiếm, số vai trò/câu hỏi, nhãn trạng thái, ngăn chỉnh sửa và hộp xác nhận vô hiệu hóa; dẫn tới trang chi tiết.

**Trạng thái bắt buộc:** skeleton lúc tải, trang rỗng có hướng xử lý, lỗi có nút thử lại, phản hồi sau lưu, bộ lọc/trang có thể mở bằng URL, breadcrumb và đường quay lại, hỗ trợ bàn phím và màn hình nhỏ. Với hành động không thể hoàn tác, cho biết tác động cụ thể trước khi xác nhận.

## Kiểm thử và hoàn thành

Không xóa âm thầm lĩnh vực còn được tham chiếu; tên trùng, lọc và khôi phục.

Hoàn thành khi FE hiển thị dữ liệu thật và kết quả thao tác còn đúng sau khi tải lại; BE có kiểm tra quyền và test ca thành công/thất bại; giao diện có đủ trạng thái tải/rỗng/lỗi và responsive. Bàn giao danh sách file, hợp đồng API mới, lệnh kiểm tra, kết quả nếu đã được phép chạy và rủi ro còn lại.

## Quy tắc giao việc cho agent

- Chỉ xử lý route này. Đọc component, service FE, router, schema và service BE hiện tại trước khi sửa. Endpoint đã có thì mở rộng hợp đồng thay vì tạo route trùng; không dùng dữ liệu giả trong môi trường thật.
- Các thao tác thay đổi dữ liệu phải kiểm tra quyền admin ở BE, xác thực đầu vào, ghi nhật ký kiểm toán người thực hiện/thời gian/đối tượng. Trang danh sách cần lọc và phân trang phía server; kiểm tra quyền đối với dữ liệu theo ID.
- Giữ ngôn ngữ thiết kế admin hiện tại (sidebar, header, shadcn/Tailwind), cải thiện thứ bậc thông tin, khoảng trắng, kiểu chữ, tương phản, bố cục 360px–desktop, nhãn form, bàn phím và focus. Nút nguy hiểm phải có xác nhận; thao tác đang chạy phải khóa gửi trùng.
- FE/BE là hai repo riêng. Không ghi đè thay đổi của agent khác; cập nhật type/client cùng lúc với hợp đồng API. Theo AGENTS.md, không tự ý build, chạy test hoặc mở UI; ghi lệnh cần chạy để người dùng cho phép. Chỉ commit nguyên tử trên branch/identity được giao khi đã kiểm tra; không sửa code trực tiếp trên VPS.
