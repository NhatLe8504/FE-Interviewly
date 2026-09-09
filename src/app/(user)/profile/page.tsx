import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Interviewly",
  description: "Personal information, experience, target domain, and avatar.",
};

export default function ProfilePage() {
  return (
    <main>
      <h1>Profile</h1>
      <p>Personal information, experience, target domain, and avatar.</p>
    </main>
  );
}
