import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Detail | Interviewly",
  description: "Interview overview, conversation, evaluations, and PDF report.",
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Session Detail</h1>
      <p>Interview overview, conversation, evaluations, and PDF report.</p>
    </main>
  );
}

