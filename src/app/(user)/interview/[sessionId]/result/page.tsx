import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Result | Interviewly",
  description: "Overall score, rubric breakdown, feedback, and PDF download.",
};

export default async function InterviewResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Interview Result</h1>
      <p>Overall score, rubric breakdown, feedback, and PDF download.</p>
    </main>
  );
}

