import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | Interviewly",
  description: "Compare subscription plans and choose the right one.",
};

export default function PricingPage() {
  return (
    <main>
      <h1>Pricing</h1>
      <p>Compare subscription plans and choose the right one.</p>
    </main>
  );
}
