import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Interviewly",
  description: "Set a new password for your account.",
};

export default function ResetPasswordPage() {
  return (
    <main>
      <h1>Reset Password</h1>
      <p>Set a new password for your account.</p>
    </main>
  );
}
