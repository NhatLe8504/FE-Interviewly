import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview History | Interviewly",
  description: "Browse all past interview sessions and scores.",
};

export default function InterviewHistoryPage() {
  return (
    <main>
      <h1>Interview History</h1>
      <p>Browse all past interview sessions and scores.</p>
    </main>
  );
}
