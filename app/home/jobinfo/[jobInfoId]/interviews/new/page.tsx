import { getJobInfo } from "@/features/jobInfo/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { Loader2Icon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { fetchAccessToken } from "hume";
import { VoiceProvider } from "@humeai/voice-react";
import { StartCall } from "@/services/hume/StartCall";
import { canCreateInterview } from "@/features/interviews/permissions";

export default async function NewInterviewPage({
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
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });
  if (userId == null || user == null) return redirectToSignIn();

  if (!(await canCreateInterview())) return redirect("/home/upgrade");

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  const accessToken = await fetchAccessToken({
    apiKey: String(process.env.HUME_API_KEY),
    secretKey: String(process.env.HUME_SECRET_KEY),
  });

  return (
    <VoiceProvider>
      <StartCall
        jobInfo={jobInfo}
        user={user.rows[0]}
        accessToken={accessToken}
      />
    </VoiceProvider>
  );
}
