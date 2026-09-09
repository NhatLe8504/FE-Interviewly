import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Interviewly",
  description: "Account, language, security, and subscription settings.",
};

export default function SettingsPage() {
  return (
    <main>
      <h1>Settings</h1>
      <p>Account, language, security, and subscription settings.</p>
    </main>
  );
}
