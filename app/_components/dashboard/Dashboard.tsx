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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
            className="text-green-600"
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

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-green-700 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-green-500" />
              Recent Payments
            </CardTitle>
            <Button variant="outline" className="text-green-600">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.customer}
                  </TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        payment.status === "Paid" ? "default" : "secondary"
                      }
                      className={
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
                          : "bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-400"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
