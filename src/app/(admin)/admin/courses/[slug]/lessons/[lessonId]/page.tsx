import React from "react";
import AdminLessonEditClient from "./edit/AdminLessonEditClient";

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function AdminLessonDetailPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
  return <AdminLessonEditClient slug={slug} lessonId={lessonId} />;
}
