import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Interviewly",
  description: "Users, interviews, subscriptions, payments, and moderation summary.",
};

export default function AdminDashboardPage() {
  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Users, interviews, subscriptions, payments, and moderation summary.</p>
    </main>
  );
}
