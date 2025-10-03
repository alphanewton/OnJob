"use server";
import { tablesDB } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getJobInfoIdTag } from "../jobInfo/dbCache";
import { getJobInfo } from "../jobInfo/db";
import { PLAN_LIMIT_MESSAGE } from "@/components/InterviewErrorToast";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";
import {
  getQuestionIdTag,
  getQuestionJobInfoTag,
  revalidateQuestionCache,
} from "./dbCache";
import { QuestionTable } from "@/types/appwrite_schema";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const QUESTION_TABLE_ID = "questiontable";

export async function getQuestions(jobInfoId: string) {
  "use cache";
  cacheTag(getQuestionJobInfoTag(jobInfoId));

  const res = await tablesDB.listRows(DATABASE_ID, QUESTION_TABLE_ID, [
    Query.equal("jobInfo", jobInfoId),
    Query.orderAsc("$createdAt"),
  ]);

  return res.rows;
}

export async function insertQuestion(question: QuestionTable) {
  const res = await tablesDB.createRow(
    DATABASE_ID,
    QUESTION_TABLE_ID,
    ID.unique(),
    question
  );

  revalidateQuestionCache(res.$id, question.jobInfo!);

  return res.$id;
}

export async function getQuestion(id: string, userId: string) {
  "use cache";
  cacheTag(getQuestionIdTag(id));
  const res = await tablesDB.getRow(DATABASE_ID, QUESTION_TABLE_ID, id);

  if (res == null) return null;

  cacheTag(getJobInfoIdTag(res.jobInfo.$id));

  if (res.userTable !== userId) return null;
  return res;
}
