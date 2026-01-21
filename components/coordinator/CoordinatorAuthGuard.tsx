"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

const PUBLIC_COORDINATOR_ROUTES = ["/coordinator/login"];

export default function CoordinatorAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isPublic = PUBLIC_COORDINATOR_ROUTES.includes(pathname || "");

      if (isPublic) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          router.replace("/coordinator/login");
          return;
        }

        // Check if user is a coordinator
        const response = await fetch("/api/coordinator/verify", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok || !data.isCoordinator) {
          router.replace("/coordinator/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/coordinator/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state for protected routes
  if (isLoading && !PUBLIC_COORDINATOR_ROUTES.includes(pathname || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying coordinator access...</p>
        </div>
      </div>
    );
  }

  // For public routes or authenticated users, render children
  if (PUBLIC_COORDINATOR_ROUTES.includes(pathname || "") || isAuthenticated) {
    return <>{children}</>;
  }

  // While redirecting, show nothing
  return null;
}
