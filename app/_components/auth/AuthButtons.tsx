import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface AuthButtonsProps {
  isMobile?: boolean;
}

const AuthButtons = ({ isMobile = false }: AuthButtonsProps) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  const userAvatar = user
    ? `https://ui-avatars.com/api/?name=${
        user.username || user.email
      }&background=random`
    : defaultAvatar;

  return (
    <div
      className={cn("flex items-center gap-4", isMobile && "w-full mx-auto")}
    >
      {user ? (
        <>
          <div className="hidden lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent flex flex-row gap-x-1"
                >
                  <Avatar>
                    <AvatarImage
                      src={userAvatar}
                      alt={user?.username || "Guest"}
                    />
                    <AvatarFallback>
                      {user ? user.username?.charAt(0).toUpperCase() : "G"}
                    </AvatarFallback>
                  </Avatar>

                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="ml-2 opacity-60"
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48 mt-2" align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {user ? user.username : "Guest User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user ? user.email : "guest@mail.com"}
                  </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="cursor-pointer"
                >
                  <LogOut size={16} strokeWidth={2} className="opacity-60" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="lg:hidden w-full">
            <Button
              onClick={handleLogout}
              className={cn("text-base", isMobile && "w-full")}
            >
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        <Button
          onClick={() => router.push("/login")}
          className={cn("text-sm", isMobile && "w-full")}
        >
          Sign In
        </Button>
      )}
    </div>
  );
};

export default AuthButtons;
