# Kế hoạch hoàn thiện các trang admin

Đã kiểm kê **29 route trang** trong App Router FE hiện tại. Mỗi trang có một file riêng để giao cho agent nhỏ, nêu hiện trạng, API cần đối chiếu/bổ sung, yêu cầu giao diện, ca kiểm tra và tiêu chí hoàn thành. Đây là **kế hoạch**, không phải xác nhận rằng chức năng đã được triển khai.

| Trang | Mã FE | Router/API BE liên quan |
| --- | --- | --- |
| [`/admin`](01-dashboard.md) | `src/app/(admin)/admin/page.tsx` | `admin.py /stats; analytics.py` |
| [`/admin/audit-logs`](02-audit-logs.md) | `src/app/(admin)/admin/audit-logs/AuditLogsClient.tsx` | `admin.py /audit-logs, /server-logs` |
| [`/admin/courses`](03-courses.md) | `src/app/(admin)/admin/courses/AdminCoursesClient.tsx` | `admin.py /courses, /courses/{id}, chapters, lessons` |
| [`/admin/courses/[slug]`](04-course-detail.md) | `src/app/(admin)/admin/courses/[slug]/AdminCourseManageClient.tsx` | `admin.py /courses/{id}, chapters, lessons` |
| [`/admin/courses/[slug]/lessons/create`](05-lesson-create.md) | `src/app/(admin)/admin/courses/[slug]/lessons/create/AdminLessonCreateClient.tsx` | `admin.py POST /courses/chapters/{id}/lessons; upload.py` |
| [`/admin/courses/[slug]/lessons/[lessonId]`](06-lesson-detail.md) | `src/app/(admin)/admin/courses/[slug]/lessons/[lessonId]/page.tsx` | `course.py /courses/{id}; admin.py /courses/lessons/{id}` |
| [`/admin/courses/[slug]/lessons/[lessonId]/edit`](07-lesson-edit.md) | `src/app/(admin)/admin/courses/[slug]/lessons/[lessonId]/edit/AdminLessonEditClient.tsx` | `admin.py PUT/DELETE /courses/lessons/{id}; upload.py` |
| [`/admin/cv-manager`](08-cv-manager.md) | `src/app/(admin)/admin/cv-manager/AdminCvManagerClient.tsx` | `admin.py /cvs, /cvs/{id}, /ats-rules` |
| [`/admin/domains`](09-domains.md) | `src/app/(admin)/admin/domains/AdminDomainsClient.tsx` | `admin.py /domains CRUD/status` |
| [`/admin/domains/[domainId]`](10-domain-detail.md) | `src/app/(admin)/admin/domains/[domainId]/AdminDomainDetailClient.tsx` | `admin.py /domains/{id}, /roles CRUD/status` |
| [`/admin/interviews`](11-interviews.md) | `src/app/(admin)/admin/interviews/AdminInterviewsClient.tsx` | `admin.py /interviews` |
| [`/admin/interviews/[id]`](12-interview-detail.md) | `src/app/(admin)/admin/interviews/[id]/AdminInterviewDetailClient.tsx` | `admin.py /interviews/{id}, /interviews/{id}/re-evaluate` |
| [`/admin/jobs`](13-jobs.md) | `src/app/(admin)/admin/jobs/AdminJobsClient.tsx` | `admin.py /jobs, /jobs/sources, toggle, crawler/trigger, /jobs/{id}/status` |
| [`/admin/login`](14-login.md) | `src/app/(admin)/admin/login/page.tsx` | `auth.py login; admin guard` |
| [`/admin/moderation`](15-moderation.md) | `src/app/(admin)/admin/moderation/AdminModerationClient.tsx` | `admin.py /moderation GET/POST` |
| [`/admin/onboarding`](16-onboarding.md) | `src/app/(admin)/admin/onboarding/OnboardingAdminClient.tsx` | `admin.py /onboarding/stats; onboarding.py` |
| [`/admin/payments`](17-payments.md) | `src/app/(admin)/admin/payments/page.tsx` | `admin.py /payments, /payments/sync-xgate, /payments/{id}/status` |
| [`/admin/payments/[id]`](18-payment-detail.md) | `src/app/(admin)/admin/payments/[id]/page.tsx` | `admin.py /payments/{id}, PATCH status` |
| [`/admin/questions`](19-questions.md) | `src/app/(admin)/admin/questions/page.tsx` | `admin.py question CRUD, question-set CRUD; catalog.py read` |
| [`/admin/questions/create`](20-question-create-single.md) | `src/app/(admin)/admin/questions/create/page.tsx` | `admin.py POST /questions` |
| [`/admin/questions/new`](21-question-create-batch.md) | `src/app/(admin)/admin/questions/new/page.tsx` | `admin.py POST /questions and AI generation` |
| [`/admin/questions/[id]`](22-question-detail.md) | `src/app/(admin)/admin/questions/[id]/page.tsx` | `admin.py questions detail through catalog.py; PUT/DELETE admin` |
| [`/admin/questions/[id]/edit`](23-question-edit.md) | `src/app/(admin)/admin/questions/[id]/edit/AdminQuestionEditClient.tsx` | `admin.py PUT /questions/{id}, DELETE /questions/{id}` |
| [`/admin/roles`](24-roles.md) | `src/app/(admin)/admin/roles/AdminRolesClient.tsx` | `admin.py /roles CRUD/status` |
| [`/admin/settings`](25-settings.md) | `src/app/(admin)/admin/settings/AdminSettingsClient.tsx` | `admin.py /settings GET/PUT, /settings/health` |
| [`/admin/star-templates`](26-star-templates.md) | `src/app/(admin)/admin/star-templates/AdminStarTemplatesClient.tsx` | `admin.py /star-templates CRUD` |
| [`/admin/subscriptions`](27-subscriptions.md) | `src/app/(admin)/admin/subscriptions/AdminSubscriptionsClient.tsx` | `admin.py /plans CRUD, /user-subscriptions GET/PATCH` |
| [`/admin/users`](28-users.md) | `src/app/(admin)/admin/users/page.tsx` | `admin.py /users GET/POST, status/role, reset-password, verify-email` |
| [`/admin/users/[id]`](29-user-detail.md) | `src/app/(admin)/admin/users/[id]/page.tsx` | `admin.py /users/{id}, status/role/reset/verify` |

## Thứ tự phối hợp

1. Chốt quy ước quyền admin, quyền sở hữu dữ liệu, phân trang, lỗi API và audit. Đối chiếu thêm `case_plan_2.md` trong BE. Nhiều task cùng sửa `admin.py`: phân công đoạn API không chồng lấn hoặc thực hiện tuần tự để tránh xung đột.
2. Ưu tiên dữ liệu nhạy cảm và vận hành: người dùng, thanh toán/gói, phỏng vấn/CV, jobs/crawler, kiểm duyệt, cấu hình. Tiếp theo là CRUD nội dung: lĩnh vực/vai trò/câu hỏi/mẫu STAR/khóa học; cuối cùng là dashboard, onboarding, audit và làm sạch điều hướng.
3. Agent FE nhận các thư mục route riêng; thay đổi component chung/design token cần người phụ trách riêng. Giữ thiết kế admin hiện tại, không thay toàn bộ giao diện cùng lúc.
4. “CRUD đầy đủ” không có nghĩa là xóa/sửa tùy ý bằng chứng phỏng vấn, giao dịch hay audit log. Với dữ liệu này cần tìm kiếm, xem chi tiết, chuyển trạng thái có kiểm soát, lưu trữ và lịch sử thay đổi.
5. Mỗi trang kiểm tra admin, user thường và khách; dữ liệu user A/B; lọc/phân trang; kết quả sau mutation và bàn phím/mobile khi có sự cho phép chạy test/UI theo AGENTS.md.

## Khoảng trống cần chú ý

- Endpoint presence admin/WS và job sync/backfill có nguy cơ thiếu kiểm tra quyền; tham khảo `case_plan_2.md` trước khi hiển thị thêm nút vận hành.
- Service khóa học admin còn đọc dữ liệu từ API công khai và fallback danh sách công khai; phải xác minh bản nháp và phân trang có bị mất.
- Route chi tiết bài học render form sửa; `/admin/questions/create` và `/admin/questions/new` là hai form. Chọn điều hướng chuẩn, tránh chức năng trùng.
- Một số trang đã có CRUD thật: khóa học, lĩnh vực/vai trò, mẫu STAR, gói. Không viết lại phần đang chạy; tập trung lỗ hổng quyền, trạng thái, lỗi, tính nhất quán và khả năng sử dụng.
