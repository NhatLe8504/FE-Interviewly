import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question Detail | Interviewly",
  description: "View a question with its STAR template.",
};

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Question Detail</h1>
      <p>View a question with its STAR template.</p>
    </main>
  );
}

