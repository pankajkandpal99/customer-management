"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentFormValues, paymentSchema } from "@/app/lib/zodSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addPayment } from "@/services/paymentService";
import { useState } from "react";

interface PaymentFormProps {
  onSubmit: SubmitHandler<PaymentFormValues>;
  onCancel: () => void;
  defaultValues?: PaymentFormValues;
}

const PaymentForm = ({
  onSubmit,
  onCancel,
  defaultValues,
}: PaymentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          // id: defaultValues.id?.toString(),
          // date: defaultValues.date ? defaultValues.date.toString() : "",
        }
      : {
          customer: "",
          customerId: "",
          amount: 0,
          date: "",
          status: "Pending",
        },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit: SubmitHandler<PaymentFormValues> = async (
    data: PaymentFormValues
  ) => {
    setIsLoading(true);
    try {
      let response;
      if (defaultValues?.id) {
        // response = await updatePayment(defaultValues.id, data);
      } else {
        response = await addPayment(data);
      }
      onSubmit(response);
    } catch (error) {
      console.error("Error in Payment Form : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="p-6 rounded-lg space-y-6"
      noValidate
    >
      <h2 className="text-2xl font-bold text-green-600 mb-4">
        {/* {defaultValues ? "Edit Payment" : "Add Payment"} */}
        {"Add Payment"}
      </h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <Input
          placeholder="Enter customer name"
          {...register("customer")}
          readOnly // read-only
        />
        {errors.customer && (
          <p className="text-red-500 text-sm mt-1">{errors.customer.message}</p>
        )}
      </div>

      <div className="space-y-2 hidden">
        <label className="block text-sm font-medium text-gray-700">
          Customer ID
        </label>
        <Input
          placeholder="Enter customer ID"
          {...register("customerId")}
          readOnly
        />
        {errors.customerId && (
          <p className="text-red-500 text-sm mt-1">
            {errors.customerId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <Input
          type="number"
          placeholder="Enter amount"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <Input type="date" {...register("date")} />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Status
        </label>
        <Select
          onValueChange={(value) =>
            setValue("status", value as "Paid" | "Pending")
          }
          defaultValue={defaultValues?.status || "Pending"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="text-green-600 border-green-600 hover:bg-green-50 dark:bg-inherit"
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
