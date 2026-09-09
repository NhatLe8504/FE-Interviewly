import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Domains | Interviewly",
  description: "Manage job domains and their roles.",
};

export default function AdminDomainsPage() {
  return (
    <main>
      <h1>Job Domains</h1>
      <p>Manage job domains and their roles.</p>
    </main>
  );
}
