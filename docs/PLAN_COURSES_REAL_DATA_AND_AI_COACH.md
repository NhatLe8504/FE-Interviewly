# Kế hoạch chuyển /courses sang dữ liệu thật và AI Coach

## 1. Mục tiêu và ranh giới

- Trang thư viện, chi tiết và bài học chỉ hiển thị khóa học/bài học có thật, đang được công bố từ Backend; thao tác Admin có thể phản ánh ra trang người dùng.
- Không dùng `COURSES_DATA`, `getCourseCurriculum`, `resolveLesson` hoặc dữ liệu mẫu làm fallback khi API lỗi. Phân biệt rõ: đang tải, không có dữ liệu, 404, lỗi mạng/5xx và nội dung chưa được biên soạn.
- Không công bố rating, review, số học viên, video, transcript, quiz, thành tích, FAQ hay khả năng AI Coach nếu chưa có nguồn dữ liệu/tính năng thật. Placeholder hình ảnh trung tính được phép, nhưng không giả làm nội dung khóa học.
- Giữ trải nghiệm học tốt: URL ổn định, thứ tự chương/bài đúng, trạng thái tải/lỗi có thể thử lại, điều hướng trước/sau, mobile/keyboard và không rò nội dung bài khóa.
- Không tự biến một bài luyện tập thành buổi phỏng vấn 3 chặng: chỉ nối AI khi có câu hỏi thật và luồng luyện phù hợp. Không sửa code VPS; không tạo worktree/clone phụ.
- Tài liệu này là kế hoạch, **chưa triển khai, chưa xác nhận dữ liệu DB runtime, chưa build/test/commit/push**.

## 2. Những gì đã đối chiếu trong code (không chỉ dựa vào báo cáo)

- `FE/src/app/(user)/courses/CourseLibraryClient.tsx` đọc `COURSES_DATA`, lọc/cắt trang tại client, có banner `12+` và rating/enrollment từ dữ liệu tĩnh.
- `FE/src/app/(user)/courses/[slug]/CourseDetailClient.tsx`, `page.tsx` và `FE/src/data/lessonResolver.ts` lấy metadata/curriculum từ mock, có video YouTube mẫu và FAQ/claim không được chứng thực. Resolver trả về khóa đầu hoặc bài đầu khi slug/lesson không khớp: cần bỏ hành vi này.
- `FE/src/app/(user)/courses/[slug]/[...lessonPath]/LessonViewerClient.tsx` dùng bài giả, nội dung guide/quiz/transcript mẫu, `/practice` chung, ghi chú/completion trong `localStorage`.
- `BE/reference_app/app/presentation/api/routers/course.py` đã có list/detail/lesson; list chỉ công khai `is_active=True`. Detail trả cả `LessonOut` (gồm `content_html`, `video_url`, `practice_question`); lesson endpoint chưa kiểm tra `is_active` hay `is_free`/quyền học. **Đây là rủi ro phải giải quyết trước khi quảng bá bài học thật.**
- `BE/reference_app/app/infrastructure/persistence/course_repository.py` hỗ trợ `category`, `level`, `role`, `search`, `limit`, `offset`; chưa lọc `type`. Search chỉ trên title/description, khác hành vi FE cũ. Category DB có thể không trùng ID tab FE (`Engineering` so với `swe`).
- `FE/src/services/admin/courseAdminApi.ts` đã gọi API nhưng `toCourseItem` tự gán rating `5.0`, enrollment `1`, ảnh/skills/highlights mặc định. **Không tái dùng mapper đó cho trang public.**
- `BE/reference_app/app/infrastructure/persistence/models/course.py` chưa có bảng tiến độ/ghi chú, transcript hay quiz riêng; `practice_question` là JSON, chưa có liên kết bắt buộc đến question bank. `BE/reference_app/app/infrastructure/persistence/seed.py` có 2 slug seed và video BigBuckBunny mẫu; “DB hiện có 2 khóa” trong báo cáo là thông tin **chưa kiểm chứng ở môi trường chạy**.
- `BE/reference_app/app/bootstrap.py` dùng `create_all`; việc thêm cột vào bảng cũ vẫn cần migration có kiểm soát, không trông chờ `create_all` tự cập nhật schema.

Quy ước dưới đây: đường dẫn bắt đầu bằng `FE/` hoặc `BE/` tính từ `Interview_Coach_SRC_CODE/`. Mỗi **case** là một đơn vị giao cho agent nhỏ; không giao hai agent sửa cùng file cùng lúc.

## 3. Thứ tự thực hiện và điều kiện chặn

`P0 (khảo sát/chốt hợp đồng)` -> `P1 (BE an toàn + API)` -> `P2 (FE danh sách/chi tiết)` -> `P3 (FE bài học thật)` -> `P4 (tiến độ/ghi chú)` -> `P5 (quiz/AI Coach có dữ liệu)` -> `P6 (rà nội dung/phát hành)`.

- **Gate G0:** Chốt chính sách khóa bài và mapping dữ liệu trước khi thay UI. Không suy đoán gói Pro/subscription từ `is_free`.
- **Gate G1:** Endpoint public không rò nội dung khóa, không trả bài của khóa ẩn. Xong trước C2.3/P3/P5.
- **Gate G2:** Library/detail/bài học không âm thầm chuyển sang mock khi API lỗi hoặc URL sai. Có thể phát hành P2-P3 khi P4-P5 chưa xong nếu tính năng chưa thật được ẩn/ghi rõ.
- **Gate G3:** Chỉ mở CTA quiz/AI khi nội dung đã được biên soạn, quyền truy cập hợp lệ và đường dẫn đích hoạt động.

Mốc phát hành: **MVP học bài = P0 + P1 + P2 + P3 + C6.1a/C6.1c/C6.2a/C6.2b** (thêm C6.1b nếu giữ URL cũ), tạm ẩn quiz/AI/progress chưa thật; P4 và P5 là các lát cắt riêng sau MVP. C6.1a bắt đầu kiểm kê/biên tập ngay từ P0, không chờ đến lúc phát hành P6. Mỗi mốc chỉ mở khi các gate tương ứng đạt và nội dung được duyệt.

## 4. P0 - Khảo sát dữ liệu và quyết định sản phẩm

### C0.1 - Kiểm kê dữ liệu thật (BE, chỉ đọc)
- Phạm vi: DB từng môi trường + `BE/.../seed.py`, model/schema course. Đếm khóa active/inactive, chương, bài, trường `content_html`, `video_url`, `practice_question`; nhận diện video mẫu, chuỗi `...`, ảnh/link chết và slug trùng cũ.
- Đầu ra: bảng kiểm theo `course_id/slug/lesson_id` và danh sách bài đủ điều kiện công bố; kiểm tra riêng 2 slug được báo cáo, không coi seed là nội dung production.
- Xong khi: xác nhận chính xác có bao nhiêu khóa/bài **dùng được**, ai chịu trách nhiệm biên tập phần thiếu; không tự publish 13 khóa mock.

### C0.2 - Chốt hợp đồng và quyền truy cập (BE + product, tài liệu)
- Quyết định: `is_active` có nghĩa công bố hay chỉ bật/tắt; ai được xem bài `is_free=false` (guest, tài khoản, gói nào); trang public có hiển thị mục lục bài bị khóa không; slug có được đổi sau khi chia sẻ không.
- Chốt URL chuẩn `/courses/{slug}/{chapter_id}/{lesson_id}`, xử lý URL mock cũ, dữ liệu tùy chọn (video/quiz/transcript/FAQ), quy tắc category/type/level/search và chính sách cache khi Admin sửa.
- Xong khi: bảng trạng thái 200/403/404/5xx và quyền xem metadata/nội dung được duyệt; thiếu quyết định này **không làm C1.1a/C1.1b/C3.1**.

## 5. P1 - Backend public API và an toàn dữ liệu

### C1.1a - Kiểm tra khóa/bài tồn tại và active (BE)
- Phụ thuộc C0.2. Chỉ sửa `BE/reference_app/app/presentation/api/routers/course.py` và helper nhỏ cần thiết: lesson detail từ chối khóa inactive; lesson ID phải thực sự thuộc đúng course/chapter; khóa/bài không tồn tại trả 404, không tự lấy bài khác.
- Xong khi: đổi slug/ID sang khóa ẩn hoặc bài thuộc khóa khác không lấy được bài; detail khóa inactive vẫn 404. Không thay contract nội dung/entitlement trong case này.

### C1.1b - Quyền bài khóa và response public tối thiểu (BE)
- Phụ thuộc C0.2 + C1.1a. Sửa schema/serializer public và authorization ở service/router: detail chỉ trả metadata chương/bài; không gửi `content_html`, `video_url`, `practice_question` hoặc đáp án cho bài khóa. Lesson detail kiểm tra quyền BE theo chính sách G0, không tin vào trạng thái nút FE.
- Theo chính sách đã chốt: guest/free/paid; bài không có quyền trả 403 hoặc 404 thống nhất, không rò qua detail/lesson. Admin vẫn có endpoint riêng để biên tập bài.
- Xong khi: GET detail public không chứa nội dung bị khóa; truy cập trực tiếp lesson khóa không đọc được; bài free và bài được cấp quyền đọc đúng.

### C1.2 - Đồng bộ lọc, tìm kiếm, phân trang (BE)
- Phụ thuộc C0.2 + C1.1b. Sửa `BE/reference_app/app/infrastructure/persistence/course_repository.py`, service và router public: hỗ trợ `type` nếu FE vẫn hiển thị lọc loại; thống nhất category ID với DB, luật level `all` và cách tìm theo role/skills/companies hoặc thu hẹp UI cho đúng API. Giữ `limit`/`offset` và `total` sau lọc, thứ tự ổn định.
- Xong khi: bộ lọc kết hợp, phân trang cuối, query rỗng, category chưa tồn tại cho `items=[]`/`total=0`; chỉ khóa active; không lặp/mất item giữa hai trang.
- Không chạy song song C1.1b nếu cùng sửa `course.py`/service; tách commit/review theo case.

### C1.3 - Quy tắc nội dung đủ điều kiện công bố (BE/Admin)
- Phụ thuộc C0.1 + C0.2. Quy định tối thiểu cho bài công khai: tên, thứ tự, loại, nội dung hợp lệ theo loại; bài video phải có nguồn video thực; bài practice/quiz phải có nội dung hợp lệ. Admin thấy lỗi thiếu trường trước khi bật active, không tự bổ sung nội dung mẫu.
- Sửa schema/validation Admin hoặc publish flow trong `BE/.../routers/admin.py` sau khi khảo sát dữ liệu cũ; tránh vô hiệu hóa khóa đang active trước khi có kế hoạch dữ liệu C0.1.
- Xong khi: khóa thiếu nội dung có trạng thái rõ và không quảng cáo là học được; dữ liệu cũ được xử lý có kiểm soát.

## 6. P2 - Frontend thư viện và chi tiết thật

### C2.1 - Hợp đồng FE public và mapper không bịa dữ liệu
- Phụ thuộc C1.1b + C1.2. Tạo service/types public riêng trong `FE/src/services/`, `FE/src/types/course.ts` (hoặc file type mới): map chính xác `course_id`, `chapter_id`, `lesson_id`, `is_free`, `is_active`, số bài/thời lượng từ API. Không dùng `any`, không gán rating/review/enrollment/ảnh/skills/highlights tùy tiện.
- Chỉ chia sẻ helper thuần với `courseAdminApi.ts` nếu không kéo fallback giả vào user pages; giữ admin service hoạt động. Chuẩn hóa lỗi 404/403/5xx, query params encode và cancellation.
- Xong khi: mapper không biến `null/0/[]` thành số liệu dương giả, test fixture ở mức thiết kế gồm khóa có/không có chương, ảnh, highlights.

### C2.2 - Trang `/courses` dùng API (FE)
- Phụ thuộc C2.1 + C1.2. Sửa `FE/src/app/(user)/courses/CourseLibraryClient.tsx` + CSS liên quan: gọi `GET /api/v1/courses` với search (debounce), category/level/type, `limit=6`, offset; reset trang khi đổi filter, bỏ qua response cũ khi gõ nhanh, hiển thị loading/error/retry/empty tách biệt.
- Bộ lọc dùng enum/taxonomy khớp BE; category không tồn tại trong DB thì không làm tab “ảo”. Xóa banner `12+`, rating/review/enrollment và các claim “Google/Meta/OpenAI biên soạn” nếu chưa được chứng thực. Chỉ render field có thật.
- Xong khi: Admin thêm/sửa/ẩn một khóa -> thư viện cập nhật theo chính sách cache; reload/deep link vẫn đúng; 2 khóa thật thì hiển thị 2, không trộn 13 khóa mock.

### C2.3 - Chi tiết + SEO metadata (FE)
- Phụ thuộc C2.1 + C1.1b. Sửa `FE/src/app/(user)/courses/[slug]/page.tsx`, `CourseDetailClient.tsx`: lấy cùng nguồn dữ liệu thật cho metadata và UI, xử lý 404 đúng (không tự hiện khóa đầu); lỗi BE tạm thời là trạng thái lỗi, không trả metadata mock. Không dùng client `apiClient` dựa trên `localStorage` cho server metadata; cấu hình base URL/server cache đúng môi trường.
- Thứ tự chương/bài từ `order_index`/ID. Preview chỉ mở khi có video được phép; “Bạn sẽ học được gì” lấy `highlights` thật; FAQ bỏ nếu không có nguồn biên soạn; khóa liên quan từ API thật hoặc ẩn nếu không có. Không khẳng định offer/đánh giá ảo.
- Xong khi: khóa mới từ Admin mở được qua slug, SEO title đúng, slug sai 404, video thiếu thì không hiện nút preview, bài khóa không lộ nội dung trong props/HTML public.

## 7. P3 - Bài học thật, điều hướng an toàn

### C3.1 - Resolve URL từ ID thật (FE)
- Phụ thuộc C2.3 + C1.1b. Sửa `FE/src/app/(user)/courses/[slug]/[...lessonPath]/page.tsx` và service lesson: phân tích `{chapter_id}/{lesson_id}` dạng số, đối chiếu lesson thuộc chapter/slug; lấy course summary + lesson qua BE. URL cũ dạng `m-1/l-1-1` chỉ redirect khi có mapping đã kiểm chứng, còn lại 404/hướng về khóa học, **không nhảy về bài đầu**.
- Metadata bài học dùng bài thật, không phát lộ nội dung bị khóa. Xử lý 403 bằng màn hình quyền truy cập, 404 bằng not-found, 5xx bằng thử lại.
- Xong khi: prev/next chỉ nằm trong course và theo thứ tự thật; refresh hoặc chia sẻ URL mở đúng cùng một bài; đổi ID sang bài khóa khác không bypass.

### C3.2a - An toàn nội dung và URL media (BE)
- Phụ thuộc C1.1b. Ở service/serializer khóa học: sanitize `content_html` bằng allowlist hoặc chuyển sang định dạng render an toàn; quy định URL video/iframe được phép, không cho script/iframe không tin cậy. Bài thiếu video trả `null`, không thay link mẫu.
- Xong khi: HTML có script/event handler và URL không hợp lệ không tới được DOM/video player; nội dung bài hợp lệ vẫn giữ format cần thiết. Không sửa FE trong case này.

### C3.2b - Render guide/video từ BE (FE)
- Phụ thuộc C3.1 + C3.2a. Sửa `LessonViewerClient.tsx` + CSS: render nội dung đã được làm sạch, chọn player theo loại YouTube/embed hoặc MP4 với title/sandbox phù hợp; thiếu media/guide hiện thông báo đúng hoặc ẩn theo C1.3. Bỏ guide 3 bước/takeaways/pitfalls lặp lại và YouTube mẫu.
- Xong khi: bài reading/video có/không nội dung hiển thị đúng; media hỏng báo lỗi, không thay video giả; bài khóa không lộ nội dung.

### C3.3 - Dọn các tab giả lập (FE)
- Phụ thuộc C3.2b. Sửa tiếp `LessonViewerClient.tsx`: tab transcript chỉ hiện khi có transcript thật (schema/biên tập riêng nếu chọn làm); quiz chỉ hiện khi có quiz thật; practice chỉ hiện khi có câu luyện thật được liên kết theo C5.2a. CTA `/practice` chung phải bỏ cho đến C5.2d; trước đó ẩn tab practice thay vì dựng mẫu.
- Nếu P4 chưa triển khai: ghi chú local chỉ hiển thị với nhãn “lưu trên thiết bị này”, không gọi là đã đồng bộ; completion không giả làm tiến độ tài khoản. Không quảng cáo AI chấm bài nếu chưa tích hợp.
- Xong khi: bài chỉ có text không xuất hiện video/quiz/transcript/AI giả; không mất nội dung cá nhân đang lưu khi nâng cấp.

## 8. P4 - Tiến độ và ghi chú đa thiết bị

### C4.1a - Schema và repository tiến độ/ghi chú (BE)
- Phụ thuộc C0.2. Tạo bảng có khóa duy nhất `user_id + lesson_id`, `completed_at`, `note`, timestamps; repository đọc/ghi theo user, giới hạn/khóa ngoại và chính sách retention. Thêm migration idempotent cho DB hiện hữu (`create_all` không ALTER bảng cũ).
- Xong khi: mô hình không tạo record trùng, dữ liệu của user khác không thể truy cập qua repository API; migration không phá dữ liệu khóa/bài cũ. Chưa mở public endpoint.

### C4.1b - Service và API đồng bộ (BE)
- Phụ thuộc C4.1a + C1.1b. Thêm GET tiến độ theo course/user và PATCH/PUT theo lesson; xác thực user từ token, kiểm tra lesson/khóa/quyền, không nhận `user_id` từ body; cập nhật completion idempotent, validate độ dài note.
- Xong khi: hai tài khoản không đọc/sửa note của nhau; hoàn thành lại không tăng đếm; progress tính từ bài thật, không từ ID mock; trả lỗi rõ khi hết quyền/bài bị xóa.

### C4.2 - FE đồng bộ và xử lý dữ liệu cũ
- Phụ thuộc C4.1b + C3.3. Sửa `LessonViewerClient.tsx`, service progress: trạng thái server là nguồn chuẩn khi đăng nhập, optimistic UI có rollback khi lỗi và trạng thái lưu note rõ; guest nếu được cho học miễn phí thì dùng local với nhãn đúng. Không gửi note lên server theo mỗi phím (debounce/Save).
- Xem xét import localStorage một lần **chỉ với lesson ID số còn tồn tại**, xác nhận chính sách trùng dữ liệu trước khi viết; không map tự động `l-1-1` sang bài thật theo thứ tự.
- Xong khi: reload/đổi thiết bị giữ completion/note; API lỗi không báo “đã lưu”; dữ liệu cũ không ghi đè note server.

## 9. P5 - Bài tập thật và AI Coach (tùy chọn, sau MVP học bài)

### C5.1a - Hợp đồng quiz và lưu nội dung (BE)
- Phụ thuộc C0.2 + C1.1b. Chốt quiz tự kiểm tra hay chấm/lưu điểm server. Nếu chấm server: migration/schema câu hỏi, lựa chọn, đáp án, submit và quyền theo lesson; không gửi đáp án/`isCorrect` trong GET public trước khi nộp. Không tái dùng bộ 4 lựa chọn giả của FE.
- Xong khi: quiz thiếu/không hợp lệ không mở được; người chưa có quyền không xem/nộp; nộp một lần hoặc nộp lại theo chính sách đã chốt, không lộ đáp án trước submit.

### C5.1b - API Admin biên tập quiz (BE)
- Phụ thuộc C5.1a. Endpoint thêm/sửa/ẩn câu hỏi, options, đáp án và giải thích theo lesson; validate dữ liệu trước publish, tách API Admin khỏi public.
- Xong khi: Admin tạo được quiz thật, bài không quiz không bị gắn cờ có quiz; dữ liệu thiếu/không hợp lệ không được công bố.

### C5.1c - Giao diện Admin biên tập quiz (FE)
- Phụ thuộc C5.1b. Form Admin tải/lưu quiz qua API thật, có trạng thái lưu lỗi và cảnh báo khi chưa đủ điều kiện công bố; không điền dữ liệu mẫu ngầm.
- Xong khi: có thể thêm/sửa/ẩn quiz và kiểm tra trạng thái hiển thị public theo cache đã chốt.

### C5.1d - Quiz bài học (FE)
- Phụ thuộc C5.1b + C3.3; dùng C5.1c để nhập nội dung. Thay UI quiz giả trong `LessonViewerClient.tsx` bằng dữ liệu/submit thật; chỉ hiện tab khi có quiz hợp lệ; loading/error/retry và giải thích sau submit theo contract.
- Xong khi: không còn 4 đáp án dựng sẵn; bài không có quiz không hiện tab; bài có quiz chấm đúng và không hiện đáp án sớm.

### C5.2a - Liên kết bài học với câu hỏi thật (BE)
- Phụ thuộc C0.1 + C1.1b. Chọn `question_id`/quan hệ lesson -> question bank thay vì suy đoán từ `practice_question` JSON; migration và public response chỉ tiết lộ mapping hợp lệ, kiểm tra câu còn tồn tại, được công bố và người học có quyền. Đối chiếu workspace hiện có `FE/src/app/(user)/questions/practice/` nhận `?q=<question_id>`.
- Xong khi: lesson không mapping trả trạng thái “chưa có bài tập”; câu bị ẩn/xóa hoặc thuộc bài/khóa khác không dùng được; không có link dẫn vào phiên phỏng vấn khác.

### C5.2b - API Admin gắn câu luyện (BE)
- Phụ thuộc C5.2a. Endpoint tìm/chọn/bỏ liên kết câu hỏi đã duyệt trên bài học; validate quyền và trạng thái câu, không map tự động bằng văn bản tương tự.
- Xong khi: mapping chỉ nhận ID câu hỏi hợp lệ; gỡ liên kết thì public không còn CTA luyện.

### C5.2c - Giao diện Admin gắn câu luyện (FE)
- Phụ thuộc C5.2b. Form bài học hiển thị câu hiện tại, tìm/chọn/bỏ liên kết qua Admin API, báo lỗi nếu câu đã ẩn/xóa.
- Xong khi: Admin xác nhận rõ bài nào gắn câu nào; không phát sinh mapping giả trên client.

### C5.2d - CTA luyện đúng một câu (FE)
- Phụ thuộc C5.2a + C3.3; dùng C5.2c để nhập mapping. Nút trong bài dẫn vào workspace luyện đúng `question_id`, mang source `course_id/lesson_id` để quay lại; nếu chưa có mapping thì ẩn CTA. Dùng đánh giá text/voice có sẵn chỉ khi contract tương thích; không link `/practice` chung.
- Xong khi: CTA mở đúng câu đã liên kết, kết quả quay lại đúng bài; câu bị xóa/ẩn/hết quyền có lỗi dễ hiểu, không tự chuyển sang câu khác.

### C5.3a - Chế độ phiên giọng nói một câu (BE, chỉ nếu product yêu cầu)
- Phụ thuộc C5.2a + quyết định sản phẩm. Thiết kế adapter/endpoint tạo session từ lesson/question đã liên kết, kiểm tra quyền, ghi nguồn bài học; rà `StartSessionIn` và state machine 3 chặng hiện có, không tái dùng nguyên xi rồi vô tình hỏi thêm câu khác.
- Xong khi: phiên bắt đầu bằng đúng câu, có điểm dừng và kết quả liên kết lesson; lỗi AI/TTS được phản hồi thật. Nếu chưa đáp ứng, không mở chế độ giọng nói này.

### C5.3b - UI phòng luyện một câu (FE, chỉ nếu C5.3a xong)
- Phụ thuộc C5.3a + C5.2d. Từ bài học vào đúng phiên, xử lý khởi động, đang nói/đang nghe, lỗi giọng, kết thúc và quay về bài. Nếu chưa làm, chỉ dùng workspace text/voice một câu đã kiểm chứng và không quảng bá “phỏng vấn 1-1”.
- Xong khi: không tự chuyển chặng/hỏi câu khác; làm mới trang hoặc thoát giữa chừng có trạng thái đúng, kết quả trở về đúng lesson.
## 10. P6 - Nội dung, nghiệm thu và phát hành

### C6.1a - Biên tập dữ liệu khóa/bài (nội dung + Admin)
- Bắt đầu sau C0.1, phối hợp C1.3; người phụ trách nội dung duyệt nguồn/bản quyền trước khi nhập. Loại ảnh/video placeholder (đặc biệt BigBuckBunny trong seed), điền bài đọc/video thật; không tự sinh 13 khóa hay 132 bài chỉ để giống giao diện cũ. Quiz/câu luyện được giao riêng cho C5.1b-C5.1d/C5.2b-C5.2d; case này chỉ xử lý khóa và bài học.
- Xong khi: mỗi bài dự định public có dữ liệu đủ điều kiện theo loại; bài thiếu không được công bố; nếu chưa có cơ chế ẩn từng bài thì giữ cả khóa inactive, không mượn video/bài mẫu của khóa khác.

### C6.1b - URL bài học cũ (FE, nếu giữ URL cũ)
- Phụ thuộc C0.2 + C3.1 + C6.1a. Lập mapping slug/chapter/lesson từ nội dung đã duyệt; chỉ redirect URL cũ đã match chính xác, còn lại 404 hoặc về trang khóa, không rơi về bài đầu. Người phụ trách nội dung kiểm tra nguồn/bản quyền trước khi nhập dữ liệu cũ.
- Xong khi: deep link cũ mở đúng bài thật; URL giả/không map không tự chuyển sang bài bất kỳ.

### C6.1c - Công bố theo khóa (BE/Admin)
- Phụ thuộc C6.1a + C1.3. Chỉ bật active cho khóa có toàn bộ bài public đã được duyệt; bài chưa đủ nội dung giữ cả khóa inactive nếu chưa có cơ chế ẩn từng bài. Kiểm tra lại thay đổi Admin và cache public.
- Xong khi: Admin sửa/ẩn khóa thì public phản ánh theo cache đã chốt; không có khóa active chứa bài mẫu.
### C6.2a - Ma trận nghiệm thu theo mốc (review, chưa chạy trong lượt lập plan)
- Phụ thuộc C1.1b + C2.2 + C2.3 + C3.3 + C6.1c (và C6.1b nếu giữ URL cũ). Khi được phép kiểm thử: BE unit/API cho active/inactive, free/locked, bài không thuộc khóa, filter/search/page, XSS; FE manual desktop/mobile/keyboard, loading/empty/error/retry, URL cũ/mới, metadata, video hỏng, logout/login, API timeout. Chỉ thêm ma trận tiến độ/quiz/AI khi P4/P5 thực sự triển khai.
- Xong khi: mỗi case có bằng chứng pass/fail và người duyệt; G0-G2 đạt cho MVP, G3 đạt riêng khi bật quiz/AI; không còn số liệu/đánh giá giả trên user course flow.

### C6.2b - Pilot, giám sát và rollback (release)
- Phụ thuộc C6.2a. Pilot 1-2 khóa có nội dung thật; theo dõi 404/403 bất thường, lỗi media/API, URL cũ và tác động sau Admin sửa. Lập cách ẩn module lỗi hoặc rollback deployment/dữ liệu có kiểm soát; tuyệt đối không bật fallback mock.
- Xong khi: khóa pilot mở đúng trên môi trường đích, lỗi có người xử lý và tiêu chí dừng rollout; chỉ mở rộng khi nội dung tiếp theo được duyệt. Không deploy trong lượt lập plan này.

## 11. Quy tắc giao việc cho agent nhỏ

1. Giao **một case hoặc một tiểu case (a/b/c)** cho một agent, ghi rõ repo `FE` hay `BE`, file được sửa, input contract, output/tiêu chí xong và case phụ thuộc. Ví dụ C2.2 chỉ nhận C1.2 + C2.1 đã chốt.
2. Case đụng cùng file phải làm **tuần tự**: C1.1a -> C1.1b -> C1.2 (`course.py`); C3.2b -> C3.3 -> C4.2 (`LessonViewerClient.tsx`); C2.1 xem xét mapper Admin trước khi sửa để không làm hỏng Admin.
3. Agent không tự tạo worktree, switch branch khi cây làm việc bẩn, xóa file/đổi dữ liệu DB, thêm fallback mock, build/test/headless UI, commit/push/deploy khi chưa được yêu cầu/duyệt trong lượt giao cụ thể. Giữ các thay đổi sẵn có ở FE/BE; mỗi case có diff riêng, báo file đã sửa và rủi ro còn lại.
4. Khi bắt đầu triển khai thật, tuân thủ Git flow/commit nhỏ theo AGENTS của dự án sau khi có xác nhận và điều kiện an toàn phù hợp; plan này **không thực hiện** các thao tác Git đó.
5. Mỗi case bàn giao: contract request/response (nếu có), files changed, trạng thái loading/error/empty, kịch bản nghiệm thu, điều kiện rollback; agent tích hợp rà soát trước khi mở case phụ thuộc. Không gọi “xong” nếu dữ liệu chỉ mới hiện nhờ mock hoặc claim chưa có thật.

### Mẫu giao việc ngắn

> Thực hiện case `C?.?` trong `FE`/`BE`. Chỉ sửa `<file/phạm vi>`. Input: `<contract đã chốt>`. Phụ thuộc: `<case>`. Không dùng mock fallback, không đụng thay đổi ngoài case. Bàn giao diff, tiêu chí nghiệm thu và rủi ro; chưa build/test/UI/commit/push trừ khi được chỉ định riêng.
