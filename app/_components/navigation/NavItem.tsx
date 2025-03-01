// "use client";
import React, { useEffect, useState } from "react";
import { NavItemConfig } from "./config";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import axios from "axios";
import pusherClient from "@/lib/pusher-client";

interface NavItemProps {
  item: NavItemConfig;
  isMobile?: boolean;
}

const NavItem = ({ item, isMobile = false }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === item.path;
  const Icon = item.icon ? Icons[item.icon] : null;

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/api/dashboard/notifications/unread");
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const channel = pusherClient.subscribe("notifications");

    channel.bind("new-notification", () => {
      fetchUnreadCount();
    });

    channel.bind("notification-updated", () => {
      fetchUnreadCount();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <li className={cn("relative group", !isMobile && "flex items-center")}>
      <Link
        href={item.path}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
          isActive ? "bg-primary/10 text-primary " : "hover:bg-accent/50"
        )}
      >
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        <span>{item.name}</span>

        {item.badge && unreadCount > 0 && (
          <span className="ml-auto bg-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs">
            {/* {unreadCount} */}
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </li>
  );
};

export default NavItem;
