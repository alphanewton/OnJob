"use server";
import { tablesDB } from "@/lib/appwrite";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/hasPermission";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const INTERVIEW_TABLE_ID = "interviewtable";

export async function canCreateInterview() {
  const res = await Promise.any([
    hasPermission("unlimited_interviews").then(
      (bool) => bool || Promise.reject()
    ),
    Promise.all([hasPermission("1_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 1) return true;
        return Promise.reject();
      }
    ),
  ]).catch(() => false);
  const res1 = await hasPermission("unlimited_interviews");

  return res;
}

async function getUserInterviewCount() {
  const { userId } = await getCurrentUser();
  if (userId == null) return 0;

  return getInterviewCount(userId);
}

export async function getInterviewCount(userId: string) {
  const interviews = await tablesDB.listRows(DATABASE_ID, INTERVIEW_TABLE_ID, [
    Query.equal("userTable", userId),
    Query.isNotNull("humeChatId"),
    Query.orderDesc("$updatedAt"),
  ]);
  return interviews.total;
}
