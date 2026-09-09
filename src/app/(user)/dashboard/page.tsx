import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Interviewly",
  description: "Overview of scores, recent sessions, and next steps.",
};

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Overview of scores, recent sessions, and next steps.</p>
    </main>
  );
}
