import { PracticeSetupClient } from "./PracticeSetupClient";

export default async function InterviewSetupPage({
  params,
}: {
  params: Promise<{ interviewId: string }>;
}) {
  const { interviewId } = await params;

  return <PracticeSetupClient interviewId={interviewId} />;
}
