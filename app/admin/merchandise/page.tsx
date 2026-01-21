"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MerchandisePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to merchandise management page
    router.replace("/admin/merchandise/management");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">Redirecting...</span>
    </div>
  );
}
