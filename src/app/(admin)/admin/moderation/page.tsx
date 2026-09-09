import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderation | Interviewly",
  description: "Review queue: approve, remove, or suspend flagged content.",
};

export default function AdminModerationPage() {
  return (
    <main>
      <h1>Moderation</h1>
      <p>Review queue: approve, remove, or suspend flagged content.</p>
    </main>
  );
}
