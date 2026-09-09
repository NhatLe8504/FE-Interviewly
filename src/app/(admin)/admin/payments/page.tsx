import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments | Interviewly",
  description: "Transactions, gateway references, and payment status.",
};

export default function AdminPaymentsPage() {
  return (
    <main>
      <h1>Payment Management</h1>
      <p>Transactions, gateway references, and payment status.</p>
    </main>
  );
}
