import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | Interviewly",
  description: "Sign in to the admin console.",
};

export default function AdminLoginPage() {
  return (
    <main>
      <h1>Admin Login</h1>
      <p>Sign in to the admin console.</p>
    </main>
  );
}
