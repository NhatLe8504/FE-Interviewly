import { Suspense } from "react";
import CvSetupClient from "./CvSetupClient";

export const metadata = {
  title: "Chuẩn bị CV theo JD | Interviewly",
  description: "Trả lời câu hỏi theo tin tuyển dụng và chọn mẫu CV trước khi AI biên tập hồ sơ.",
};

export default function CvSetupPage() {
  return (
    <Suspense fallback={<div role="status" className="p-12 text-center">Đang mở trang chuẩn bị CV…</div>}>
      <CvSetupClient />
    </Suspense>
  );
}
