"use client";
import Navbar from "../_components/navigation/Navbar";
import Footer from "../_components/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 w-full max-w-[80rem] mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
