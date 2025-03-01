import React from "react";

const Footer = () => {
  return (
    <footer className="border-t mt-20 py-6 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-extrabold text-3xl">
              PayFlow
            </span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-emerald-600">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-emerald-600">
              Contact
            </a>
            <a href="#" className="text-gray-600 hover:text-emerald-600">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-emerald-600">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
