import React from "react";
import Navbar from "../_components/Navbar";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-7xl flex flex-col mx-auto px-4 md:px-6 lg:px-8">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  );
};

export default MainLayout;
