import type { Metadata } from "next";
import { AdminRolesClient } from "./AdminRolesClient";

export const metadata: Metadata = {
  title: "Quản lý Vị Trí Tuyển Dụng | Interviewly Admin",
  description: "Quản trị danh mục vị trí việc làm theo từng ngành nghề.",
};

export default function AdminRolesPage() {
  return <AdminRolesClient />;
}
