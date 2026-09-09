import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed | Interviewly",
  description: "Your payment could not be verified. Try again.",
};

export default function PaymentFailedPage() {
  return (
    <main>
      <h1>Payment Failed</h1>
      <p>Your payment could not be verified. Try again.</p>
    </main>
  );
}
