import type { Metadata } from "next";
import AdminDomainsClient from "./AdminDomainsClient";

export const metadata: Metadata = {
  title: "Lĩnh vực nghề nghiệp | Interviewly",
  description: "Quản lý lĩnh vực nghề nghiệp và vai trò tuyển dụng.",
};

export default function AdminDomainsPage() {
  return <AdminDomainsClient />;
}
