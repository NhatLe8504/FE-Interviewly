import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Detail | Interviewly",
  description: "Profile, subscription, interview history, and account status.",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main>
      <h1>User Detail</h1>
      <p>Profile, subscription, interview history, and account status.</p>
    </main>
  );
}

