import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful | Interviewly",
  description: "Your subscription payment was verified.",
};

export default function PaymentSuccessPage() {
  return (
    <main>
      <h1>Payment Successful</h1>
      <p>Your subscription payment was verified.</p>
    </main>
  );
}
