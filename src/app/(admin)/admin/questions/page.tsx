import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question Bank | Interviewly",
  description: "Search, filter, and manage interview questions.",
};

export default function AdminQuestionsPage() {
  return (
    <main>
      <h1>Question Bank Management</h1>
      <p>Search, filter, and manage interview questions.</p>
    </main>
  );
}
