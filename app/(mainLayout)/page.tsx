"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useAuth } from "@/context/AuthContext";
import Loader from "../_components/loader";

const HomePage = () => {
  const { user, login, isLoading } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  const fetchUserDetails = async () => {
    const token = getCookie("jwt") as string;
    if (!token) {
      setLocalLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (!decoded?.userId) throw new Error("Invalid token");

      await axios.get(`/api/auth/user?userId=${decoded.userId}`);
      login(token);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !isLoading) {
      fetchUserDetails();
    } else {
      setLocalLoading(false);
    }
  }, [user, isLoading]);

  if (localLoading || isLoading) {
    return (
      <div className="min-h-[69vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Streamline Your{" "}
              <span className="text-emerald-600">Payment Collections</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Efficiently manage customer payments, track due dates, and send
              automated notifications all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg">
                  Get Started
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              {!user && (
                <Link href="/login">
                  <Button variant="outline" className="px-8 py-6 text-lg">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl mt-20">
          <div className="grid md:grid-cols-3 gap-8 px-4">
            <div className="p-6 rounded-lg border shadow-md shadow-emerald-200/20">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
              <p className="text-muted-foreground text-gray-600">
                Stay informed with instant payment notifications and status
                changes through our WebSocket integration.
              </p>
            </div>

            <div className="p-6 rounded-lg border shadow-md shadow-emerald-200/20">
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Bulk Management</h3>
              <p className="text-muted-foreground text-gray-600">
                Easily import and manage multiple customers through our Excel
                upload feature with validation.
              </p>
            </div>

            <div className="p-6 rounded-lg border shadow-md shadow-emerald-200/20">
              <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <p className="text-muted-foreground text-gray-600">
                Enterprise-grade security with JWT authentication and
                comprehensive error handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 py-20 px-4 mt-20 rounded-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-emerald-900/20 border border-green-100 dark:border-gray-700">
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                99.9%
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Collection Rate
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-emerald-900/20 border border-green-100 dark:border-gray-700">
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                24/7
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Real-time Monitoring
              </p>
            </div>
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-emerald-900/20 border border-green-100 dark:border-gray-700">
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                1000+
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                Happy Customers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
