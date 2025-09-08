import { SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center justify-center h-screen">
        <SignInButton />
        <UserButton />
      </div>
    </div>
  );
}
