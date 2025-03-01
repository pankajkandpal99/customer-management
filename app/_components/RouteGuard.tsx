"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const protectedPaths = ["/dashboard"];
  const authPages = ["/login", "/register"];

  const isProtectedRoute = protectedPaths.some((path) =>
    pathname?.startsWith(path)
  );
  const isAuthPage = authPages.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && isAuthPage) {
      router.replace("/dashboard");
      return;
    }

    if (!isAuthenticated && isProtectedRoute) {
      router.replace(`/login?callbackUrl=${pathname}`);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    isProtectedRoute,
    isAuthPage,
    pathname,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-[69vh] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated && isProtectedRoute) {
    return null;
  }

  return <>{children}</>;
}
