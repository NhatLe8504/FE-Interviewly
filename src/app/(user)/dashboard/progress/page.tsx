import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress | Interviewly",
  description: "Track score trends and skill improvement over time.",
};

export default function ProgressPage() {
  return (
    <main>
      <h1>Progress</h1>
      <p>Track score trends and skill improvement over time.</p>
    </main>
  );
}
