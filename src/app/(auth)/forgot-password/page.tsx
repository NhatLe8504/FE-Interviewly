import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Interviewly",
  description: "Reset your password via email.",
};

export default function ForgotPasswordPage() {
  return (
    <main>
      <h1>Forgot Password</h1>
      <p>Reset your password via email.</p>
    </main>
  );
}
