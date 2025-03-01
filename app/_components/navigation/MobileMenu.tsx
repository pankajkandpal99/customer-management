"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AuthButtons from "../auth/AuthButtons";
import NavItem from "./NavItem";
import { NAV_ITEMS } from "./config";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user } = useAuth();

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  const userAvatar = user
    ? `https://ui-avatars.com/api/?name=${
        user.username || user.email
      }&background=random`
    : defaultAvatar;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="border w-[300px] sm:w-[350px] h-screen flex flex-col"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-extrabold text-2xl">
              PayFlow
            </span>
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userAvatar} alt={user?.username || "Guest"} />
            <AvatarFallback>
              {user ? user.username?.charAt(0).toUpperCase() : "G"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="font-medium">{user ? user.username : "Guest User"}</p>
            <p className="text-sm text-muted-foreground">
              {user ? user.email : "guest@mail.com"}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 pl-0 space-y-4 overflow-y-auto">
          <ul className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.path} item={item} isMobile />
            ))}
          </ul>
        </div>

        <div className="flex flex-col space-y-4 p-4 border-t">
          <AuthButtons isMobile />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
