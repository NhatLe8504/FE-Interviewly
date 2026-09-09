import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Subscription | Interviewly",
  description: "Current plan, entitlements, and billing period.",
};

export default function MySubscriptionPage() {
  return (
    <main>
      <h1>My Subscription</h1>
      <p>Current plan, entitlements, and billing period.</p>
    </main>
  );
}
