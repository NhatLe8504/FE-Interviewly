# NHIỆM VỤ CHI TIẾT DÀNH CHO: LÊ TRUNG HIẾU (2) (Admin Portal, Question Catalog & Profile Lead)

- **Email:** `lhieu20231@gmail.com`
- **Git Branch:** `lhieu20231`
- **Worktree BE:** `D:\DOANNHATLE\Interview_Coach_SRC_CODE\BE-lhieu20231`
- **Worktree FE:** `D:\DOANNHATLE\Interview_Coach_SRC_CODE\FE-lhieu20231`

---

## ⚠️ QUY TẮC BẮT BUỘC TRƯỚC KHI BẮT ĐẦU (GIT IDENTITY & WORKTREE)

1. Mở đúng thư mục worktree Frontend được phân công:
   - Frontend: `D:\DOANNHATLE\Interview_Coach_SRC_CODE\FE-lhieu20231`
2. Kiểm tra branch hiện tại:
   ```bash
   git branch --show-current
   ```
   *Kết quả phải đúng là: `lhieu20231`*
3. Cấu hình danh tính Git chính xác:
   ```bash
   git config user.name "lhieu20231"
   git config user.email "lhieu20231@gmail.com"
   ```
4. **Tuyệt đối KHÔNG commit trực tiếp lên nhánh `main`.** Chỉ push lên `lhieu20231` và tạo PR sang `main`.
5. 🛑 **QUY TẮC COMMIT & HỎI Ý KIẾN USER (BẮT BUỘC):**
   - Mỗi khi hoàn thành xong bất kỳ một task nhỏ hay bước nào (ví dụ: tạo xong component, hoàn thiện 1 trang, kết nối API):
     - **TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT NGAY.**
     - Chạy test / build kiểm tra trước (`npm run build`).
     - Báo cáo ngắn gọn cho User: đã làm được gì, thay đổi những file nào, kết quả ra sao.
     - **Hỏi ý kiến User:** *"Tôi đã hoàn thành task nhỏ này và kiểm tra không có lỗi. Bạn có đồng ý để tôi commit không?"*
     - **CHỈ KHI USER XÁC NHẬN ĐỒNG Ý** mới được thực hiện `git add`, `git commit` và tạo PR!

---

## 🎯 PHẠM VI NHIỆM VỤ CỦA BẠN

Bạn chịu trách nhiệm về **Cổng Quản trị Admin Portal (`/admin/*`), Quản lý Ngân hàng câu hỏi & STAR Templates (`/admin/questions`, `/admin/star-templates`), Quản lý Ngành nghề & Vị trí (`/admin/domains`, `/admin/roles`), Quản lý Người dùng & Phân quyền (`/admin/users`, `/admin/moderation`, `/admin/audit-logs`), và Trang Hồ sơ cá nhân & Cài đặt tài khoản (`/profile`, `/settings`, `/questions`)**.

---

## 📋 DANH MỤC FILE CẦN TRIỂN KHAI TẠI FRONTEND (`FE-lhieu20231`)

```text
src/
├── app/(admin)/
│   ├── layout.tsx                            # Layout Admin: Sidebar điều hướng, header admin
│   └── admin/
│       ├── page.tsx                          # Admin Dashboard: KPI thẻ tổng quan, biểu đồ nhanh
│       ├── domains/page.tsx                  # Quản lý danh mục ngành nghề (CRUD domain)
│       ├── roles/page.tsx                    # Quản lý chức danh nghề nghiệp & gán quyền
│       ├── questions/
│       │   ├── page.tsx                      # Danh sách ngân hàng câu hỏi (lọc domain, role, level)
│       │   ├── [id]/page.tsx                 # Chi tiết câu hỏi phỏng vấn
│       │   ├── [id]/edit/page.tsx            # Form chỉnh sửa câu hỏi
│       │   └── new/page.tsx                  # Form thêm mới câu hỏi
│       ├── star-templates/page.tsx           # Quản lý mẫu hướng dẫn cấu trúc trả lời STAR
│       ├── users/
│       │   ├── page.tsx                      # Danh sách người dùng, trạng thái kích hoạt, tìm kiếm
│       │   └── [id]/page.tsx                 # Chi tiết người dùng, lịch sử hoạt động, chỉnh sửa role
│       ├── moderation/page.tsx               # Kiểm duyệt nội dung câu hỏi & báo cáo vi phạm
│       ├── audit-logs/page.tsx               # Nhật ký hoạt động hệ thống (System Audit Logs)
│       └── settings/page.tsx                 # Cấu hình hệ thống chung cho Admin
├── app/(user)/
│   ├── profile/
│   │   ├── page.tsx                          # Trang xem & chỉnh sửa thông tin cá nhân ứng viên
│   │   └── ProfileClient.tsx                 # Client component form profile, upload avatar
│   ├── settings/page.tsx                     # Đổi mật khẩu, cài đặt thông báo tài khoản
│   └── questions/
│       ├── page.tsx                          # Thư viện câu hỏi phỏng vấn cho ứng viên khám phá
│       └── [id]/page.tsx                     # Chi tiết câu hỏi mẫu và gợi ý STAR
├── services/
│   ├── adminApi.ts                           # API client quản trị: users, moderation, logs, roles
│   ├── catalogApi.ts                         # API client: domains, roles, questions, star templates
│   └── profileApi.ts                         # API client: getProfile, updateProfile, changePassword
└── types/
    ├── admin.ts                              # TypeScript types cho Admin & Audit Logs
    ├── catalog.ts                            # TypeScript types cho Domains, Roles, Questions
    └── profile.ts                            # TypeScript types cho User Profile & Settings
```

---

## 📋 CÁC BƯỚC THỰC HIỆN CHI TIẾT THEO THỨ TỰ ƯU TIÊN

### Bước 1: API Services & Data Types
1. Tạo `src/types/profile.ts`, `catalog.ts`, `admin.ts`:
   - Định nghĩa interface `UserProfile`, `UpdateProfileRequest`, `ChangePasswordRequest`.
   - Định nghĩa interface `DomainItem`, `RoleItem`, `QuestionItem`, `StarTemplateItem`.
   - Định nghĩa interface `AdminUserItem`, `AuditLogItem`, `ModerationItem`.
2. Tạo `src/services/profileApi.ts`:
   - Kết nối `GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/change-password`.
3. Tạo `src/services/catalogApi.ts` & `src/services/adminApi.ts`:
   - Kết nối các endpoint quản trị catalog, câu hỏi, người dùng, audit logs.

### Bước 2: Trang Hồ sơ người dùng & Cài đặt (`/profile`, `/settings`, `/questions`)
1. **Trang Profile (`/profile`):**
   - Hiển thị thông tin cá nhân: Tên, Email, Ảnh đại diện, Ngành nghề quan tâm, Mục tiêu phỏng vấn.
   - Form cập nhật thông tin và toast thông báo thành công.
2. **Trang Cài đặt (`/settings`):**
   - Form đổi mật khẩu với xác thực mật khẩu cũ/mới.
3. **Thư viện câu hỏi (`/questions`):**
   - Giao diện tra cứu câu hỏi theo Role/Level, xem gợi ý STAR chuẩn bị trước khi phỏng vấn.

### Bước 3: Admin Dashboard & Quản lý Catalog (`/admin/*`)
1. **Admin Layout & Dashboard (`/admin/page.tsx`):**
   - Hoàn thiện thẻ thống kê tổng quan: Users, Sessions, Questions, Revenue.
2. **Quản lý Danh mục & Câu hỏi:**
   - Hoàn thiện bảng CRUD tại `/admin/domains`, `/admin/roles`, `/admin/questions`, `/admin/star-templates`.
3. **Quản lý Người dùng & Nhật ký hệ thống:**
   - Danh sách và phân quyền người dùng tại `/admin/users`.
   - Bảng hiển thị lịch sử truy cập và nhật ký thao tác tại `/admin/audit-logs`.

### Bước 4: Kiểm thử & Đảm bảo Build
- Chạy `npm run build` kiểm tra tính hợp lệ của toàn bộ mã nguồn.
- Đảm bảo không dính lỗi TypeScript và render mượt mà.

---

## 🚀 QUY TRÌNH ĐẨY CODE (PULL REQUEST)
```bash
git add .
git commit -m "feat(admin-portal): implement admin management, question catalog and candidate profile"
git push -u origin lhieu20231
gh pr create --base main --head lhieu20231 --title "feat(admin-portal): Admin Dashboard, Question Bank and Profile" --body "Implement admin management modules, question bank catalog, and candidate profile management."
```