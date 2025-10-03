import { NewQuestionClientPage } from "@/components/_NewQuestionClientPage";
import { getJobInfo } from "@/features/jobInfo/db";
import { canCreateQuestion } from "@/features/questions/permissions";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Loader2Icon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  if (!(await canCreateQuestion())) return redirect("/home/upgrade");

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <NewQuestionClientPage jobInfo={jobInfo} />;
}
