import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Plans | Interviewly",
  description: "Compare plans and manage your subscription.",
};

export default function SubscriptionPlansPage() {
  return (
    <main>
      <h1>Subscription Plans</h1>
      <p>Compare plans and manage your subscription.</p>
    </main>
  );
}
