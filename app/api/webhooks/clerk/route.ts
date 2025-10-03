import { deleteUser, upsertUser } from "@/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    switch (event.type) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (e) => e.id === clerkData.primary_email_address_id
        )?.email_address;
        if (email === null) {
          return new Response("No primary email found", { status: 400 });
        }
        await upsertUser({
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          email,
          $id: clerkData.id,
          imageUrl: clerkData.image_url,
        });
        break;
      case "user.deleted":
        if (event.data.id == null) {
          return new Response("No user id found", { status: 400 });
        }

        await deleteUser(event.data.id);
        break;
    }
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response("Webhook received", { status: 200 });
}
