"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/services/notificationService";
import pusherClient from "@/lib/pusher-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Notification {
  id: string;
  type:
    | "PAYMENT_CREATED"
    | "PAYMENT_RECEIVED"
    | "PAYMENT_UPDATED"
    | "PAYMENT_OVERDUE"
    | "NEW_CUSTOMER";
  message: string;
  customerId?: string;
  paymentId?: string;
  timestamp: string;
  read: boolean;
}

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleMarkAsRead = async (id: string) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingIds((prev) => prev.filter((loadingId) => loadingId !== id)); // ✅ Remove loading after process completes
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // lister for real-time notification
  useEffect(() => {
    const channel = pusherClient.subscribe("notifications");
    channel.bind("new-notification", (data: Notification) => {
      if (!data.id) {
        console.error("Received notification without an ID:", data);
        return;
      }

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === data.id);

        if (
          exists &&
          // data.type !== "PAYMENT_UPDATED" &&
          data.type !== "PAYMENT_RECEIVED"
        ) {
          return prev;
        }

        return [data, ...prev];
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="p-6 shadow-md rounded-lg max-w-[90rem] mx-auto">
      <h2 className="text-green-600 text-2xl font-semibold mb-4 text-center">
        Notifications
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading notifications...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-green-100 dark:bg-inherit">
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Message</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Timestamp</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {notifications.length > 0 &&
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="text-center">
                      {notification.id}
                    </TableCell>
                    <TableCell className="text-center">
                      {notification.message}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          notification.type === "PAYMENT_RECEIVED"
                            ? "default"
                            : notification.type === "PAYMENT_OVERDUE"
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          notification.type === "PAYMENT_RECEIVED"
                            ? "bg-green-100 text-green-800"
                            : notification.type === "PAYMENT_OVERDUE"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {notification.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {format(new Date(notification.timestamp), "PPPp")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={notification.read ? "default" : "destructive"}
                        className={
                          notification.read
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {notification.read ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50 dark:bg-inherit"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={loadingIds.includes(notification.id)}
                        >
                          {loadingIds.includes(notification.id) ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Mark as Read"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
