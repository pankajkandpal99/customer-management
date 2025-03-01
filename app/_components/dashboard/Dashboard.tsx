/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import {
  Users,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  // ArrowUpRight,
  // Calendar,
  // DollarSign,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getRecentPayments } from "@/services/paymentService";
import pusherClient from "@/lib/pusher-client";
import {
  getCollectionRate,
  getOverduePayments,
  getTotalCollected,
  getTotalCustomers,
} from "@/services/dashboardService";
import Loader from "../loader";

const DashboardCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: any;
  icon: any;
  color: string;
}) => (
  <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <CardTitle
        className={`text-sm font-medium text-${color}-700 flex items-center gap-2`}
      >
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-end">
        <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [overduePayments, setOverduePayments] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [collectionRate, setCollectionRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const [inActive, setIsInActive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [payments, customers, overdue, collected, rate] =
          await Promise.all([
            getRecentPayments(),
            getTotalCustomers(),
            getOverduePayments(),
            getTotalCollected(),
            getCollectionRate(),
          ]);

        setRecentPayments(payments);
        setTotalCustomers(customers);
        setOverduePayments(overdue);
        setTotalCollected(collected);
        setCollectionRate(rate);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // **Pusher for Real-Time Updates**
    const channel = pusherClient.subscribe("dashboard-updates");

    channel.bind("new-payment", (newPayment: any) => {
      setRecentPayments((prev) => [newPayment, ...prev.slice(0, 4)]);
    });

    channel.bind("payment-updated", (updatedPayment: any) => {
      setRecentPayments((prev) =>
        prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  if (!user) {
    return <Loader />;
  }

  if (loading) {
    return <Loader />;
  }

  const handleActiveOrNot = () => {
    setIsInActive((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.username || "User"}!
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleActiveOrNot()}
            className="text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Today
          </Button>

          <Button
            onClick={() => handleActiveOrNot()}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </div>
      </div>

      {inActive && (
        <div className="w-full border rounded-md p-4 text-green-500 border-green-300">
          This is inactive currently
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Customers"
          value={totalCustomers}
          icon={<Users />}
          color="green"
        />
        <DashboardCard
          title="Overdue Payments"
          value={`₹${overduePayments}`}
          icon={<AlertTriangle />}
          color="red"
        />
        <DashboardCard
          title="Total Collected"
          value={`₹${totalCollected}`}
          icon={<CreditCard />}
          color="green"
        />
        <DashboardCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          icon={<TrendingUp />}
          color="green"
        />
      </div>

      <Card className="border-green-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-700 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-green-500" />
              Recent Payments
            </CardTitle>
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2 text-sm">{payment.customer}</td>
                    <td className="py-3 px-2 text-sm font-medium">
                      {payment.amount}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === "Paid"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="border-green-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-700 flex items-center">
              <Bell className="mr-2 h-5 w-5 text-green-500" />
              Recent Notifications
            </CardTitle>
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="py-3 flex items-start gap-3 hover:bg-gray-50 px-2 rounded"
              >
                <div
                  className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${
                    notification.type === "payment"
                      ? "bg-green-100"
                      : notification.type === "overdue"
                      ? "bg-red-100"
                      : notification.type === "customer"
                      ? "bg-emerald-100"
                      : "bg-gray-100"
                  }`}
                >
                  {notification.type === "payment" && (
                    <CreditCard className="h-4 w-4 text-green-600" />
                  )}
                  {notification.type === "overdue" && (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  {notification.type === "customer" && (
                    <Users className="h-4 w-4 text-emerald-600" />
                  )}
                  {notification.type === "system" && (
                    <Bell className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Dashboard;
