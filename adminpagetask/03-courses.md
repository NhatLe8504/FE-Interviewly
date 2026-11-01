# Yêu cầu trang /admin/courses

**Route:** `/admin/courses`. **Ưu tiên:** P2. Đây là một nhiệm vụ FE + BE có thể giao cho một agent nhỏ; tách commit FE/BE nếu thay đổi độc lập.

## Hiện trạng cần xác minh

- FE: `src/app/(admin)/admin/courses/AdminCoursesClient.tsx`.
- BE liên quan: `reference_app/app/presentation/api/routers/admin.py`.
- Quan sát từ mã: Trang đã gọi các thao tác tạo/sửa/xóa khóa học, chương và bài học; không tạo lại CRUD trùng lặp.

## Endpoint cần đối chiếu

- **Đối chiếu endpoint hiện có:** `GET/POST /api/v1/admin/courses`.
- **Đối chiếu endpoint hiện có:** `GET/PUT/DELETE /api/v1/admin/courses/{id}`.
- **Cân nhắc bổ sung:** `PATCH /api/v1/admin/courses/{id}/publish`.

Đây là danh sách ban đầu, không khẳng định mọi endpoint đáp ứng đủ yêu cầu. Agent phải xác minh method, payload, response, phân trang, trạng thái và nơi FE đang gọi trước khi chỉnh sửa.

## Yêu cầu API / BE

Xác minh tìm kiếm, lọc, phân trang phía server, trạng thái nháp/xuất bản và ràng buộc xóa. Chỉ thêm thao tác xuất bản, thống kê sử dụng khi thiếu.

**Hợp đồng bàn giao cho FE:** ghi rõ method, URL, kiểu request/response, bộ lọc, phân trang, sắp xếp và lỗi 400/401/403/404/409. Kiểm tra đối tượng liên kết và trạng thái hợp lệ ở BE; không trả thành công giả. Danh sách/chi tiết phải nhất quán sau khi tải lại.

## Yêu cầu giao diện / FE

Tách danh sách khóa học khỏi trình sửa giáo trình; thể hiện trạng thái, số bài và lượt đăng ký. Xác nhận trước khi xóa, cho xem trước bản nháp, bảng/card thích ứng màn hình nhỏ.

**Trạng thái bắt buộc:** skeleton lúc tải, trang rỗng có hướng xử lý, lỗi có nút thử lại, phản hồi sau lưu, bộ lọc/trang có thể mở bằng URL, breadcrumb và đường quay lại, hỗ trợ bàn phím và màn hình nhỏ. Với hành động không thể hoàn tác, cho biết tác động cụ thể trước khi xác nhận.

## Kiểm thử và hoàn thành

Tạo/sửa/xóa cùng quan hệ chương-bài, trạng thái hiển thị công khai, phân trang và lỗi tải video.

Hoàn thành khi FE hiển thị dữ liệu thật và kết quả thao tác còn đúng sau khi tải lại; BE có kiểm tra quyền và test ca thành công/thất bại; giao diện có đủ trạng thái tải/rỗng/lỗi và responsive. Bàn giao danh sách file, hợp đồng API mới, lệnh kiểm tra, kết quả nếu đã được phép chạy và rủi ro còn lại.

## Quy tắc giao việc cho agent

- Chỉ xử lý route này. Đọc component, service FE, router, schema và service BE hiện tại trước khi sửa. Endpoint đã có thì mở rộng hợp đồng thay vì tạo route trùng; không dùng dữ liệu giả trong môi trường thật.
- Các thao tác thay đổi dữ liệu phải kiểm tra quyền admin ở BE, xác thực đầu vào, ghi nhật ký kiểm toán người thực hiện/thời gian/đối tượng. Trang danh sách cần lọc và phân trang phía server; kiểm tra quyền đối với dữ liệu theo ID.
- Giữ ngôn ngữ thiết kế admin hiện tại (sidebar, header, shadcn/Tailwind), cải thiện thứ bậc thông tin, khoảng trắng, kiểu chữ, tương phản, bố cục 360px–desktop, nhãn form, bàn phím và focus. Nút nguy hiểm phải có xác nhận; thao tác đang chạy phải khóa gửi trùng.
- FE/BE là hai repo riêng. Không ghi đè thay đổi của agent khác; cập nhật type/client cùng lúc với hợp đồng API. Theo AGENTS.md, không tự ý build, chạy test hoặc mở UI; ghi lệnh cần chạy để người dùng cho phép. Chỉ commit nguyên tử trên branch/identity được giao khi đã kiểm tra; không sửa code trực tiếp trên VPS.
