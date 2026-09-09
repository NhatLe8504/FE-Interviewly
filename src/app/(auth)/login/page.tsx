import type { Metadata } from "next";
import AuthPanel from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Sign in | Interviewly",
  description: "Sign in to continue your interview practice with your AI coach.",
};

export default function LoginPage() {
  return <AuthPanel initialMode="login" variant="page" syncUrl />;
}
