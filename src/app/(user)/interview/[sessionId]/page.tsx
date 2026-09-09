import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview Room | Interviewly",
  description: "Answer AI questions by text or voice, with STAR guidance.",
};

export default async function InterviewRoomPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Interview Room</h1>
      <p>Answer AI questions by text or voice, with STAR guidance.</p>
    </main>
  );
}

