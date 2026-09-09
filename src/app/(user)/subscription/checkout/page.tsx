import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Interviewly",
  description: "Complete payment for your selected plan.",
};

export default function CheckoutPage() {
  return (
    <main>
      <h1>Checkout</h1>
      <p>Complete payment for your selected plan.</p>
    </main>
  );
}
