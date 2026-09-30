import React from "react";
import AdminLessonCreateClient from "./AdminLessonCreateClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ chapterId?: string }>;
}

export default async function AdminLessonCreatePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { chapterId } = await searchParams;
  return <AdminLessonCreateClient slug={slug} initialChapterId={chapterId} />;
}
