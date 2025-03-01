import Payments from "@/app/_components/dashboard/Payment";
import React, { Suspense } from "react";

const PaymentPage = () => {
  return (
    <Suspense fallback={<div>Loading Payments...</div>}>
      <Payments />
    </Suspense>
  );
};

export default PaymentPage;
