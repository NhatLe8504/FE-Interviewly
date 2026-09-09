import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Settings | Interviewly",
  description: "General, AI configuration, features, and system status.",
};

export default function AdminSettingsPage() {
  return (
    <main>
      <h1>System Settings</h1>
      <p>General, AI configuration, features, and system status.</p>
    </main>
  );
}
