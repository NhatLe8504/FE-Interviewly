import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | Interviewly",
  description: "All PDF reports generated from your sessions.",
};

export default function ReportsPage() {
  return (
    <main>
      <h1>Reports</h1>
      <p>All PDF reports generated from your sessions.</p>
    </main>
  );
}
