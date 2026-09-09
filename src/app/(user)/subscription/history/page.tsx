import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment History | Interviewly",
  description: "All past subscription transactions.",
};

export default function PaymentHistoryPage() {
  return (
    <main>
      <h1>Payment History</h1>
      <p>All past subscription transactions.</p>
    </main>
  );
}
