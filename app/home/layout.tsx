import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user == null) return redirect("/onboarding");

  const userInfoRaw = user.rows[0];
  const userInfo = {
    name: userInfoRaw?.name ?? "",
    imageUrl: userInfoRaw?.imageUrl ?? "",
  };

  return (
    <>
      <Navbar userInfo={userInfo} />
      {children}
    </>
  );
}
