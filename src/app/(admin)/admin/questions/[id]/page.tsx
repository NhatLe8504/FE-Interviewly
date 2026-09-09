import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question Detail | Interviewly",
  description: "View a bank question and its status.",
};

export default async function AdminQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Question Detail</h1>
      <p>View a bank question and its status.</p>
    </main>
  );
}

