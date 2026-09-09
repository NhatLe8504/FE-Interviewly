import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report Detail | Interviewly",
  description: "View and download a session report.",
};

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main>
      <h1>Report Detail</h1>
      <p>View and download a session report.</p>
    </main>
  );
}

