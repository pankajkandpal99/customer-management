"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, PlusCircle } from "lucide-react";
import PaymentForm from "./forms/PaymentForm";
import { useSearchParams } from "next/navigation";
import { PaymentFormValues } from "@/app/lib/zodSchema";
import { getPayments, updatePaymentStatus } from "@/services/paymentService";
import { getSingleCustomer } from "@/services/customerService";

const Payments = () => {
  const searchParams = useSearchParams();
  const customerId = searchParams?.get("customerId");
  const [loading, setLoading] = useState<boolean>(false);
  const [payments, setPayments] = useState<PaymentFormValues[]>([]);
  const [customer, setCustomer] = useState<{ name: string; id: string } | null>(
    null
  );
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(
    null
  );

  const filteredPayments = payments.filter((payment) => {
    return (
      (filter === "all" || payment.status === filter) &&
      (search === "" ||
        payment.customer.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const handleAddOrUpdatePayment = (data: PaymentFormValues) => {
    setPayments((prev) => {
      const existingPaymentIndex = prev.findIndex(
        (payment) => payment.id === data.id
      );

      if (existingPaymentIndex !== -1) {
        const updatedPayments = [...prev];
        updatedPayments[existingPaymentIndex] = data;
        return updatedPayments;
      } else {
        return [...prev, data];
      }
    });

    setIsFormVisible(false);
  };

  const fetchCustomerDetails = useCallback(async () => {
    try {
      if (customerId) {
        const data = await getSingleCustomer(customerId);
        setCustomer({ name: data.name, id: data.id });
      } else {
        setCustomer(null);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  }, [customerId]);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPayments(customerId || undefined);
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    status: "Paid" | "Pending"
  ) => {
    try {
      setUpdatingPaymentId(paymentId);
      const updatedPayment = await updatePaymentStatus(paymentId, status);
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId ? updatedPayment : payment
        )
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status. Please try again.");
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
    fetchPayments();
  }, [fetchCustomerDetails, fetchPayments]);

  return (
    <div className="p-6 shadow-md rounded-lg max-w-[90rem] mx-auto">
      <h2 className="text-green-600 text-2xl font-semibold mb-4 text-center">
        Payments
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-row gap-6 w-full">
          <Input
            placeholder="Search by customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3"
          />

          <Select onValueChange={setFilter} value={filter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="default"
          className={`${customerId ? "flex items-center gap-2" : "hidden"}`}
          disabled={!customerId}
          onClick={() => setIsFormVisible(true)}
        >
          <PlusCircle className="w-5 h-5" /> Add Payment
        </Button>
      </div>

      {isFormVisible ? (
        <PaymentForm
          onSubmit={handleAddOrUpdatePayment}
          onCancel={() => setIsFormVisible(false)}
          defaultValues={{
            customer: customer?.name || "",
            customerId: customerId || "",
            amount: 0,
            date: "",
            status: "Pending",
          }}
        />
      ) : loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-2 text-green-600 font-medium">
            Loading data...
          </span>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <FileText className="w-12 h-12 text-gray-400" />
          <p className="text-center text-gray-500 mt-2">
            No payment-related data available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-green-100 dark:bg-inherit">
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Customer</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-center">{payment.id}</TableCell>
                  <TableCell className="text-center">
                    {payment.customer}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-bold">
                    ₹{payment.amount}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(payment.date), "PPP")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        payment.status === "Paid" ? "default" : "destructive"
                      }
                      className={
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {payment.status === "Pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() =>
                          handleUpdatePaymentStatus(payment.id!, "Paid")
                        }
                        disabled={updatingPaymentId === payment.id}
                      >
                        {updatingPaymentId === payment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Mark as Paid"
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

export default Payments;

// : (
// <Button
//   variant="outline"
//   size="sm"
//   className="text-red-600 border-red-600 hover:bg-red-50"
//   onClick={() =>
//     handleUpdatePaymentStatus(payment.id!, "Pending")
//   }
//   disabled={updatingPaymentId === payment.id}
// >
//   {updatingPaymentId === payment.id ? (
//     <Loader2 className="w-4 h-4 animate-spin" />
//   ) : (
//     "Mark as Pending"
//   )}
// </Button>
// )
