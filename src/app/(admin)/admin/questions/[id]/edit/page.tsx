import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Question | Interviewly",
  description: "Update question content, filters, STAR template, and status.",
};

export default async function AdminQuestionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Edit Question</h1>
      <p>Update question content, filters, STAR template, and status.</p>
    </main>
  );
}

