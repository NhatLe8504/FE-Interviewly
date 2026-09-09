import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions | Interviewly",
  description: "Manage plans and user subscriptions.",
};

export default function AdminSubscriptionsPage() {
  return (
    <main>
      <h1>Subscription Management</h1>
      <p>Manage plans and user subscriptions.</p>
    </main>
  );
}
