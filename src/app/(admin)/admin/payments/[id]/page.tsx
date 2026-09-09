import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction Detail | Interviewly",
  description: "Gateway, amount, currency, status, and paid time.",
};

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Transaction Detail</h1>
      <p>Gateway, amount, currency, status, and paid time.</p>
    </main>
  );
}

