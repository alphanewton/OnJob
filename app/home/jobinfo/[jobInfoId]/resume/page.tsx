import { BackLink } from "@/components/BackLink";
import { ResumePageClient } from "@/components/ResumePageClient";
import { canRunResumeAnalysis } from "@/features/resume/permissions";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
export default async function ResumePage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <BackLink href={`/home/jobinfo/${jobInfoId}`}>Back to job</BackLink>
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  if (!(await canRunResumeAnalysis())) return redirect("/home/upgrade");

  return <ResumePageClient jobInfoId={jobInfoId} />;
}
