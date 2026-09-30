import React from "react";
import AdminCourseManageClient from "./AdminCourseManageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminCourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <AdminCourseManageClient slug={slug} />;
}
