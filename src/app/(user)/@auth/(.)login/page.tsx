import type { Metadata } from "next";
import AuthModal from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Sign in | Interviewly",
};

export default function LoginModalPage() {
  return <AuthModal mode="login" />;
}
