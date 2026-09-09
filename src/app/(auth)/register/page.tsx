import type { Metadata } from "next";
import AuthPanel from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Create account | Interviewly",
  description: "Create your Interviewly account and start your first adaptive session.",
};

export default function RegisterPage() {
  return <AuthPanel initialMode="register" variant="page" syncUrl />;
}
