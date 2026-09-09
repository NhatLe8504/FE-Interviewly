import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question Bank | Interviewly",
  description: "Browse and search role-specific interview questions.",
};

export default function QuestionBankPage() {
  return (
    <main>
      <h1>Question Bank</h1>
      <p>Browse and search role-specific interview questions.</p>
    </main>
  );
}
