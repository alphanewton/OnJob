import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type UserInfo = {
  name: string;
  imageUrl: string;
};

function UserAvatar({
  userInfo,
  ...props
}: { userInfo: UserInfo } & React.ComponentProps<typeof Avatar>) {
  const initials =
    userInfo?.name
      ?.split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("") || "NA";

  return (
    <Avatar {...props}>
      <AvatarImage src={userInfo.imageUrl} alt={userInfo.name} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
