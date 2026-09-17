import type { Metadata } from "next";
import QuestionExplorerClient from "./QuestionExplorerClient";

export const metadata: Metadata = {
  title: "Ngân hàng câu hỏi tuyển dụng & Khung STAR | Interviewly",
  description:
    "Tra cứu và khám phá kho câu hỏi phỏng vấn thực chiến theo ngành nghề và cấp độ. Hướng dẫn trả lời mẫu theo khung STAR và tiêu chuẩn chấm điểm Rubric.",
};

export default function QuestionBankPage() {
  return <QuestionExplorerClient />;
}
