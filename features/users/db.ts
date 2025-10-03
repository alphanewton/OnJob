"use server";
import { tablesDB } from "@/lib/appwrite";
import { userTable } from "@/types/appwrite_schema";
import { Query } from "node-appwrite";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getUserIdTag, revalidateUserCache } from "./dbCache";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const USER_TABLE_ID = "usertable";

export async function upsertUser(user: userTable) {
  const email = user.email!;

  const existing = await tablesDB.listRows(DATABASE_ID, USER_TABLE_ID, [
    Query.equal("email", email),
  ]);

  let doc;
  const imageUrl = user.imageUrl;
  const name = user.name;
  const jobInfo = user.jobInfo;
  const id = user.$id!;
  if (existing.rows.length > 0) {
    const userId = existing.rows[0].$id;
    doc = await tablesDB.upsertRow(DATABASE_ID, USER_TABLE_ID, userId, {
      name,
      imageUrl,
      jobInfo,
    });
  } else {
    doc = await tablesDB.createRow(DATABASE_ID, USER_TABLE_ID, id, {
      name,
      email,
      imageUrl,
      jobInfo,
    });
  }

  revalidateUserCache(user.$id!);
}

export async function deleteUser(id: string) {
  await tablesDB.deleteRow(DATABASE_ID, USER_TABLE_ID, id);

  revalidateUserCache(id);
}

export async function getUser(userId: string) {
  "use cache";
  cacheTag(getUserIdTag(userId));

  //restrict to getting just name and imageUrl
  const res = await tablesDB.listRows(DATABASE_ID, USER_TABLE_ID, [
    Query.equal("$id", userId),
    Query.select(["name", "imageUrl"]),
  ]);
  return res;
}
