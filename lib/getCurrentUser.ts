import { auth } from "@clerk/nextjs/server";
import { tablesDB } from "./appwrite";
import { Query } from "node-appwrite";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getUserIdTag } from "@/features/users/dbCache";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const USER_TABLE_ID = "usertable";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, redirectToSignIn } = await auth();
  return {
    userId,
    redirectToSignIn,
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

async function getUser(userId: string) {
  "use cache";
  cacheTag(getUserIdTag(userId));

  const res = await tablesDB.listRows(DATABASE_ID, USER_TABLE_ID, [
    Query.equal("$id", userId),
    Query.select(["name", "imageUrl"]),
  ]);

  return res;
}
