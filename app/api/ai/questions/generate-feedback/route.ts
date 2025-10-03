import { getQuestion } from "@/features/questions/db";
import { getQuestionIdTag } from "@/features/questions/dbCache";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { generateAiQuestionFeedback } from "@/services/ai/questions";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import z from "zod";

const schema = z.object({
  prompt: z.string().min(1),
  questionId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Error generating your feedback", { status: 400 });
  }

  const { prompt: answer, questionId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const question = await getQuestion(questionId, userId);
  if (question == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  const feedback = await generateAiQuestionFeedback({
    question: question.text,
    answer,
  });

  return new Response(JSON.stringify({ feedback }));
}
