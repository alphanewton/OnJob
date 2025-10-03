import { BackLink } from "@/components/BackLink";
import { JobInfoForm } from "@/components/JobInfoForm";
import { Card, CardContent } from "@/components/ui/card";
import { getJobInfo } from "@/features/jobInfo/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Loader } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function JobInfoEditPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <BackLink href={`/home/jobinfo/${jobInfoId}`}>Back to Job Info</BackLink>

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader className="size-24 mx-auto animate-spin" />}
          >
            <JobInfoForm jobInfo={jobInfo} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
