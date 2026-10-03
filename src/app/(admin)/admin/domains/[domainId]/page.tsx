import AdminDomainDetailClient from "./AdminDomainDetailClient";

interface PageProps {
  params: Promise<{ domainId: string }>;
}

export default async function AdminDomainDetailPage({ params }: PageProps) {
  const { domainId } = await params;
  return <AdminDomainDetailClient domainId={Number(domainId)} />;
}
