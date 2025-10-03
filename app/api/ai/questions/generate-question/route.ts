import { PLAN_LIMIT_MESSAGE } from "@/components/InterviewErrorToast";
import { getJobInfo } from "@/features/jobInfo/db";
import { getQuestions, insertQuestion } from "@/features/questions/db";
import { canCreateQuestion } from "@/features/questions/permissions";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { generateAiQuestion } from "@/services/ai/questions";
import { questionDifficulties } from "@/types/general_schema";
import z from "zod";

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Invalid request", { status: 400 });
  }

  const { prompt: difficulty, jobInfoId } = result.data;
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!(await canCreateQuestion())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("Job info not found", { status: 403 });
  }

  const previousQuestions = await getQuestions(jobInfoId);

  const { text: question } = await generateAiQuestion({
    previousQuestions,
    jobInfo,
    difficulty,
  });

  // Save to database
  const questionId = await insertQuestion({
    text: question,
    jobInfo: jobInfoId,
    difficulty,
    userTable: userId,
  });

  return new Response(JSON.stringify({ question, questionId }));
}
