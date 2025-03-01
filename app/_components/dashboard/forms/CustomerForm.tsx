"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerFormValues, customerSchema } from "@/app/lib/zodSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addCustomer, updateCustomer } from "@/services/customerService";
import { useState } from "react";

interface CustomerFormProps {
  onSubmit: SubmitHandler<CustomerFormValues>;
  onCancel: () => void;
  defaultValues?: CustomerFormValues;
}

const CustomerForm = ({
  onSubmit,
  onCancel,
  defaultValues,
}: CustomerFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues
      ? { ...defaultValues, id: defaultValues.id?.toString() }
      : {
          name: "",
          phoneNumber: "",
          email: "",
          outstandingPayment: 0,
          paymentDueDate: "",
          paymentStatus: "Pending",
        },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    setIsLoading(true);
    try {
      let response;
      if (defaultValues?.id) {
        response = await updateCustomer(defaultValues.id, data);
      } else {
        response = await addCustomer(data);
      }
      // console.log("response : ", response);
      onSubmit(response);
    } catch (error) {
      console.error("Error in Customer Form : ", error);
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
        {defaultValues ? "Edit Customer" : "Add Customer"}
      </h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input placeholder="Enter name" {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <Input placeholder="Enter phone number" {...register("phoneNumber")} />
        {errors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <Input placeholder="Enter email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Outstanding Payment
        </label>
        <Input
          type="number"
          placeholder="Enter outstanding payment"
          {...register("outstandingPayment", { valueAsNumber: true })}
        />
        {errors.outstandingPayment && (
          <p className="text-red-500 text-sm mt-1">
            {errors.outstandingPayment.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Due Date
        </label>
        <Input type="date" {...register("paymentDueDate")} />
        {errors.paymentDueDate && (
          <p className="text-red-500 text-sm mt-1">
            {errors.paymentDueDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Status
        </label>
        <Select
          onValueChange={(value) =>
            setValue("paymentStatus", value as "Paid" | "Pending")
          }
          defaultValue={defaultValues?.paymentStatus || "Pending"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        {errors.paymentStatus && (
          <p className="text-red-500 text-sm mt-1">
            {errors.paymentStatus.message}
          </p>
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

export default CustomerForm;
