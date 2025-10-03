"use client";
import {
  BookOpenIcon,
  Briefcase,
  FileSlidersIcon,
  SpeechIcon,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import UserAvatar from "./UserAvatar";
import { useParams, usePathname } from "next/navigation";
import { Button } from "./ui/button";

const navLinks = [
  { name: "Interviews", href: "interviews", Icon: SpeechIcon },
  { name: "Questions", href: "questions", Icon: BookOpenIcon },
  { name: "Resume", href: "resume", Icon: FileSlidersIcon },
];

export default function Navbar({
  userInfo,
}: {
  userInfo: { name: string; imageUrl: string };
}) {
  const { signOut, openUserProfile } = useClerk();
  const { jobInfoId } = useParams();
  const pathName = usePathname();

  return (
    <nav className="h-header border-b">
      <div className="container flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <Briefcase />
          <Link href="/home">
            <h1 className="text-2xl font-bold">OnJob</h1>
          </Link>
          <h4 className="text-primary">By Newton</h4>
        </div>
        <div className="flex items-center gap-4">
          {typeof jobInfoId === "string" &&
            navLinks.map(({ name, href, Icon }) => {
              const hrefPath = `/home/jobinfo/${jobInfoId}/${href}`;

              return (
                <Button
                  variant={pathName === hrefPath ? "secondary" : "ghost"}
                  key={name}
                  asChild
                  className="cursor-pointer max-sm:hidden"
                >
                  <Link href={hrefPath}>
                    <Icon />
                    {name}
                  </Link>
                </Button>
              );
            })}

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <UserAvatar userInfo={userInfo} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openUserProfile()}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
