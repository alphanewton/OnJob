"use server";
import { tablesDB } from "@/lib/appwrite";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/hasPermission";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const QUESTIONS_TABLE_ID = "questiontable";

export async function canCreateQuestion() {
  const res = await Promise.any([
    hasPermission("unlimited_questions").then(
      (bool) => bool || Promise.reject()
    ),
    Promise.all([hasPermission("33_questions"), getUserQuestionCount()]).then(
      ([has, c]) => {
        if (has && c < 33) return true;
        return Promise.reject();
      }
    ),
  ]).catch(() => false);
  const res1 = await hasPermission("unlimited_interviews");

  return res;
}

async function getUserQuestionCount() {
  const { userId } = await getCurrentUser();
  if (userId == null) return 0;

  return getQuestionCount(userId);
}

export async function getQuestionCount(userId: string) {
  const interviews = await tablesDB.listRows(DATABASE_ID, QUESTIONS_TABLE_ID, [
    Query.equal("userTable", userId),
    Query.orderDesc("$updatedAt"),
  ]);
  return interviews.total;
}
