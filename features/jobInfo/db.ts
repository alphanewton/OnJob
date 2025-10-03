"use server";
import { tablesDB } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import {
  getJobInfoIdTag,
  getJobInfoUserTag,
  revalidateJobInfoCache,
} from "./dbCache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { jobInfoSchema } from "@/types/general_schema";
import z from "zod";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { cache } from "react";
import { redirect } from "next/navigation";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const JOB_INFO_TABLE_ID = "jobinfo";

export async function getJobInfos(userId: string) {
  "use cache";
  cacheTag(getJobInfoUserTag(userId));

  const res = await tablesDB.listRows(DATABASE_ID, JOB_INFO_TABLE_ID, [
    Query.equal("userTable", userId),
    Query.orderDesc("$updatedAt"),
  ]);
  return res.rows;
}

export async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  const res = await tablesDB.getRow(DATABASE_ID, JOB_INFO_TABLE_ID, id);
  return res;
}

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be logged in to create a job info",
    };
  }

  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    };
  }

  const jobInfo = await tablesDB.createRow(
    DATABASE_ID,
    JOB_INFO_TABLE_ID,
    ID.unique(),
    {
      ...data,
      userTable: userId,
    }
  );

  revalidateJobInfoCache(jobInfo.$id, jobInfo.userTable.$id);

  redirect(`/home/jobinfo/${jobInfo.$id}`);
}

export async function updateJobInfo(
  id: string,
  jobInfo: Partial<typeof jobInfoSchema>
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be logged in to create a job info",
    };
  }

  const { success, data } = jobInfoSchema.safeParse(jobInfo);
  if (!success) {
    return {
      error: true,
      message: "Invalid job data",
    };
  }

  //Verify if this jobInfo was created by this user
  const existingJobInfo = await getJobInfo(id, userId);
  if (existingJobInfo.userTable != userId) {
    return {
      error: true,
      message: "You are not authorized to update this job info",
    };
  }

  const res = await tablesDB.updateRow(DATABASE_ID, JOB_INFO_TABLE_ID, id, {
    ...jobInfo,
  });

  revalidateJobInfoCache(res.$id, res.userTable.$id);

  redirect(`/home/jobinfo/${res.$id}`);
}
