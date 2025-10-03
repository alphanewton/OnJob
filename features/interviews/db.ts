"use server";
import { tablesDB } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getJobInfoIdTag } from "../jobInfo/dbCache";
import { getInterviewIdTag, getInterviewJobInfoTag } from "./dbCache";
import { getJobInfo } from "../jobInfo/db";
import { PLAN_LIMIT_MESSAGE } from "@/components/InterviewErrorToast";
import { canCreateInterview } from "./permissions";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const INTERVIEW_TABLE_ID = "interviewtable";

export async function getInterviews(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getInterviewJobInfoTag(jobInfoId));
  cacheTag(getJobInfoIdTag(jobInfoId));

  const res = await tablesDB.listRows(DATABASE_ID, INTERVIEW_TABLE_ID, [
    Query.equal("jobInfo", jobInfoId),
    Query.isNotNull("humeChatId"),
    Query.orderDesc("$updatedAt"),
  ]);

  return res.rows;
}

export async function getInterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));
  const res = await tablesDB.getRow(DATABASE_ID, INTERVIEW_TABLE_ID, id);

  if (res == null) return null;

  cacheTag(getJobInfoIdTag(res.jobInfo.$id));

  if (res.jobInfo != userId) return res;
}

export async function createInterview(
  jobInfoId: string
): Promise<{ error: true; message?: string } | { error: false; id?: string }> {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be logged in to create a job info",
    };
  }

  // Permissions
  if (!(await canCreateInterview())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    };
  }

  //Job Info Access
  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return {
      error: true,
      message:
        "You are not authorized to create an interview for this job info",
    };
  }

  const interview = await tablesDB.createRow(
    DATABASE_ID,
    INTERVIEW_TABLE_ID,
    ID.unique(),
    {
      jobInfo: jobInfoId,
      duration: "00:00:00",
      userTable: userId,
    }
  );

  return { error: false, id: interview.$id };
}

export async function updateInterview(
  id: string,
  {
    humeChatId,
    duration,
    feedback,
  }: {
    humeChatId?: string;
    duration?: string;
    feedback?: string;
  }
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be logged in to create a job info",
    };
  }

  const interview = await getInterview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You are not authorized to update this interview",
    };
  }

  const updatePayload: Record<string, any> = {};
  if (humeChatId !== undefined) updatePayload.humeChatId = humeChatId;
  if (duration !== undefined) updatePayload.duration = duration;
  if (feedback !== undefined) updatePayload.feedback = feedback;

  if (Object.keys(updatePayload).length === 0) {
    return { error: true, message: "No fields to update" };
  }

  const res = await tablesDB.updateRow(
    DATABASE_ID,
    INTERVIEW_TABLE_ID,
    id,
    updatePayload
  );

  return { error: false, res };
}

export async function generateInterviewFeedback(interviewId: string) {
  const { userId, user } = await getCurrentUser({ allData: true });
  if (userId == null || user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    userName: user.rows[0].name,
  });

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    };
  }

  await updateInterview(interviewId, { feedback });

  return { error: false };
}
