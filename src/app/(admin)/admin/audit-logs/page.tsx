import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs | Interviewly",
  description: "Who changed what, when: table, record, action, old and new values.",
};

export default function AdminAuditLogsPage() {
  return (
    <main>
      <h1>Audit Logs</h1>
      <p>Who changed what, when: table, record, action, old and new values.</p>
    </main>
  );
}
