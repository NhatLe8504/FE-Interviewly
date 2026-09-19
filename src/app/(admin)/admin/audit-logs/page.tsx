import type { Metadata } from "next";
import { AuditLogsClient } from "./AuditLogsClient";

export const metadata: Metadata = {
  title: "Nhật ký Hoạt động (Audit Logs) | Quản trị Interviewly",
  description: "Theo dõi toàn bộ lịch sử thao tác dữ liệu, bảo mật và phân quyền hệ thống thời gian thực.",
};

export default function AdminAuditLogsPage() {
  return <AuditLogsClient />;
}