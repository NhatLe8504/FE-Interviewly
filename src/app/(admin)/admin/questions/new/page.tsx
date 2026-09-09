import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Question | Interviewly",
  description: "Add a question with domain, role, level, language, and STAR template.",
};

export default function AdminQuestionCreatePage() {
  return (
    <main>
      <h1>Create Question</h1>
      <p>Add a question with domain, role, level, language, and STAR template.</p>
    </main>
  );
}
