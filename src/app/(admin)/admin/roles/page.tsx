import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Roles | Interviewly",
  description: "Manage job roles by domain.",
};

export default function AdminRolesPage() {
  return (
    <main>
      <h1>Job Roles</h1>
      <p>Manage job roles by domain.</p>
    </main>
  );
}
