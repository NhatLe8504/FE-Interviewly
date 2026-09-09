import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Setup | Interviewly",
  description: "Select domain, role, experience level, language, and mode.",
};

export default function InterviewSetupPage() {
  return (
    <main>
      <h1>Interview Setup</h1>
      <p>Select domain, role, experience level, language, and mode.</p>
    </main>
  );
}
