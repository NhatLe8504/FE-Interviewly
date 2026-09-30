import React from "react";
import AdminLessonEditClient from "./AdminLessonEditClient";

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function AdminLessonEditPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
  return <AdminLessonEditClient slug={slug} lessonId={lessonId} />;
}
