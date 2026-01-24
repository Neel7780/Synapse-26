"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import CoordinatorAuthGuard from "@/components/coordinator/CoordinatorAuthGuard";
import { createClient } from "@/utils/supabase/client";
import { Home, LogOut, Calendar } from "lucide-react";
import Link from "next/link";

export default function CoordinatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/coordinator/login";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Login page gets minimal layout
  if (isLoginPage) {
    return <CoordinatorAuthGuard>{children}</CoordinatorAuthGuard>;
  }

  // Other coordinator pages get full layout
  return (
    <CoordinatorAuthGuard>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="container flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-red-600" />
              <h1 className="text-xl font-bold text-white">Coordinator Panel</h1>
            </div>
            
            <nav className="ml-auto flex items-center gap-4">
              <Link
                href="/coordinator"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </CoordinatorAuthGuard>
  );
}
