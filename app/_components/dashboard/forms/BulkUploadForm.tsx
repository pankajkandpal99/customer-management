import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadBulkCustomers } from "@/services/customerService";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import * as xlsx from "xlsx";

const BulkUploadForm = ({ onClose }: { onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: "John Doe",
        phoneNumber: "1234567890",
        email: "john@example.com",
        outstandingPayment: 1000,
        paymentDueDate: "2025-12-31",
        paymentStatus: "Pending",
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(template);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Customers");
    xlsx.writeFile(workbook, "customer_template.xlsx");
  };

  const handleSubmit = useCallback(async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadBulkCustomers(formData);
      toast.success(response.message || "Bulk upload successful!");
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [file, toast, onClose]);

  return (
    <div className="px-2 py-4 rounded-lg">
      <div className="flex flex-col justify-start md:flex-row md:justify-between items-start md:items-center">
        <h2 className="text-lg font-semibold mb-4">Excel Upload Customers</h2>

        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          className="mb-4 text-gray-700 dark:text-primary"
        >
          Download Template
        </Button>
      </div>

      <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
};

export default BulkUploadForm;
