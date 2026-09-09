import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STAR Templates | Interviewly",
  description: "Manage Situation, Task, Action, Result guidance templates.",
};

export default function AdminStarTemplatesPage() {
  return (
    <main>
      <h1>STAR Templates</h1>
      <p>Manage Situation, Task, Action, Result guidance templates.</p>
    </main>
  );
}
