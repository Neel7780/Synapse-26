"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { ArrowLeft, Download, FileSpreadsheet, Loader2 } from "lucide-react";

export default function RegistrationExportPage() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchParams: "",
    filter: "",
    paymentStatus: "",
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/admin/registrations/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Export failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Export Registrations"
        subtitle="Download CSV"
        actions={
          <Link href="/admin/registrations">
            <Button variant="outline" className="border-border/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <Card className="border-border/40 max-w-2xl">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Configure filters for your export</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search (optional)</label>
            <Input
              value={filters.searchParams}
              onChange={(e) => setFilters({ ...filters, searchParams: e.target.value })}
              placeholder="Search by name, email, college, or transaction ID"
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Event Filter (optional)</label>
            <Input
              value={filters.filter}
              onChange={(e) => setFilters({ ...filters, filter: e.target.value })}
              placeholder="Event name"
              className="bg-muted/50 border-border/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select value={filters.paymentStatus} onValueChange={(v) => setFilters({ ...filters, paymentStatus: v === "all" ? "" : v })}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="done">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleExport} disabled={loading} className="w-full bg-primary hover:bg-primary/90 mt-4">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export to CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
