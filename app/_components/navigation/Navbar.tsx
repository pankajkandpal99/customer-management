"use client";
// import { ThemeToggle } from "@/components/general/ThemeToggle";
import { NAV_ITEMS } from "./config";
import NavItem from "./NavItem";
import AuthButtons from "../auth/AuthButtons";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 shadow-md z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-extrabold text-3xl">
            PayFlow
          </span>
        </Link>

        <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
          <ul className="flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.path} item={item} isMobile />
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-6">
          {/* <ThemeToggle /> */}

          <Link
            href="/api-docs"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors hover:bg-emerald-100/10 text-emerald-500 hover:text-emerald-400 font-medium"
          >
            <FileText className="h-5 w-5" />
            <span>API Docs</span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <AuthButtons />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
