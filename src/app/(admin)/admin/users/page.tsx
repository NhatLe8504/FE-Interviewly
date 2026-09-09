import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Interviewly",
  description: "Search, filter, and manage user accounts.",
};

export default function AdminUsersPage() {
  return (
    <main>
      <h1>User Management</h1>
      <p>Search, filter, and manage user accounts.</p>
    </main>
  );
}
