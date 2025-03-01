/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { CustomerFormValues } from "@/app/lib/zodSchema";
import CustomerForm from "./forms/CustomerForm";
import { deleteCustomer, getCustomers } from "@/services/customerService";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BulkUploadForm from "./forms/BulkUploadForm";

const CustomerTable = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerFormValues[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBulkUploadVisible, setIsBulkUploadVisible] = useState(false);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOrUpdateCustomer = (data: any) => {
    if (!data.id) {
      console.error("Customer ID is missing!", data);
      return;
    }

    setCustomers((prev) =>
      editingCustomer
        ? prev.map((customer) =>
            customer.id === data.id ? { ...customer, ...data } : customer
          )
        : [...prev, { ...data, id: data.id }]
    );
    setIsFormVisible(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer. Please try again.");
    }
  };

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="w-full p-4 shadow-md rounded-lg mt-6 prose dark:prose-invert">
      {isFormVisible ? (
        <CustomerForm
          onSubmit={handleAddOrUpdateCustomer}
          onCancel={() => {
            setIsFormVisible(false);
            setEditingCustomer(null);
          }}
          defaultValues={editingCustomer || undefined}
        />
      ) : isBulkUploadVisible ? (
        <BulkUploadForm onClose={() => setIsBulkUploadVisible(false)} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-green-600 text-xl font-semibold text-center md:text-left">
              Customers
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />

              <Select
                onValueChange={(value) => {
                  if (value === "single") {
                    setIsFormVisible(true);
                  } else if (value === "bulk") {
                    setIsBulkUploadVisible(true);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Upload</SelectItem>
                  <SelectItem value="bulk">Bulk Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                <span className="ml-2 text-green-600 font-medium">
                  Loading customers...
                </span>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="hover:bg-green-50 dark:bg-inherit dark:bg-inherit">
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Phone
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Outstanding Payment
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Due Date
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-green-800 dark:text-green-500">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-green-50 dark:bg-inherit"
                    >
                      <TableCell>{customer.id}</TableCell>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="text-red-500 font-semibold">
                        ₹{customer.outstandingPayment}
                      </TableCell>
                      <TableCell>{customer.paymentDueDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.paymentStatus === "Paid"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            customer.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800 dark:text-red-500"
                          }
                        >
                          {customer.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4 text-center" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCustomer(customer);
                                setIsFormVisible(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCustomer(customer.id!)}
                            >
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/payments?customerId=${customer.id!}`
                                )
                              }
                            >
                              View Payments
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-6">
                No customer data available.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerTable;
