import type { Metadata } from "next";
import AuthModal from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Create account | Interviewly",
};

export default function RegisterModalPage() {
  return <AuthModal mode="register" />;
}
