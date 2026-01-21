"use client";

import { useState, useEffect } from "react";
import { useRegistrations, useRegistrationEventList } from "@/hooks/use-admin-data";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Download,
  Search,
  Settings,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Ticket,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function RegistrationsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Real-time debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== debouncedSearch) {
        setDebouncedSearch(searchInput);
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, debouncedSearch]);

  const { data: eventListData } = useRegistrationEventList();
  const { data, loading, error, refetch } = useRegistrations({
    page,
    limit,
    searchParams: debouncedSearch || undefined,
    filter: eventFilter !== "all" ? eventFilter : undefined,
    paymentStatus: paymentStatusFilter !== "all" ? paymentStatusFilter : undefined,
  });

  const registrations = data?.data || [];
  const summary = data?.summary || {
    total_registrations: 0,
    paid: 0,
    gross_revenue: 0,
    gateway_charges: 0,
    net_revenue: 0,
  };
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const showTableOverlay = loading && registrations.length === 0;

  const allEvents = eventListData?.events || [];

  // Download CSV
  const downloadCSV = () => {
    const headers = ["ID", "Name", "Email", "Event", "Amount", "Status", "Transaction ID"];
    const rows = registrations.map((r) => [
      r.registration_id,
      r.user_name,
      "",
      r.event_name,
      r.gross_amount,
      r.payment_status,
      r.transaction_id,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const statsCards = [
    { title: "Total Registrations", value: summary.total_registrations, icon: Users, gradient: "from-red-600 to-rose-700" },
    { title: "Paid", value: summary.paid, icon: CheckCircle2, gradient: "from-emerald-600 to-emerald-700" },
    { title: "Pending", value: summary.total_registrations - summary.paid, icon: Clock, gradient: "from-amber-600 to-amber-700" },
    { title: "Gross Revenue", value: `₹${summary.gross_revenue.toLocaleString()}`, icon: DollarSign, gradient: "from-red-600 to-rose-700" },
    { title: "Gateway Charges", value: `₹${summary.gateway_charges.toFixed(2)}`, icon: CreditCard, gradient: "from-rose-600 to-red-700" },
    { title: "Net Revenue", value: `₹${summary.net_revenue.toFixed(2)}`, icon: TrendingUp, gradient: "from-red-600 to-rose-700" },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">Error: {error}</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Registrations"
        subtitle="Event Management"
        badge={
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            {total} total
          </Badge>
        }
        actions={
          <Button onClick={downloadCSV} className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg shadow-red-500/10`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or transaction ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
            </div>
            <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48 bg-muted/50 border-border/50">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Events</SelectItem>
                {allEvents.map((event) => (
                  <SelectItem key={event} value={event}>{event}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={(v) => { setPaymentStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-40 bg-muted/50 border-border/50">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card className="border-border/50">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>All Registrations</CardTitle>
              <CardDescription>Click on a row to view details</CardDescription>
            </div>
            {loading && (
              <Loader2 className="ml-auto h-5 w-5 animate-spin text-red-500" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 relative">
          {showTableOverlay && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Event</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Transaction</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No registrations found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow
                    key={reg.registration_id}
                    className="border-border/50 cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedRegistration(reg)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{reg.user_name}</p>
                        <p className="text-sm text-muted-foreground">{reg.college}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                        {reg.event_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{reg.participation_type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₹{reg.gross_amount}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          reg.payment_status === "done"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }
                      >
                        {reg.payment_status === "done" ? (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {reg.payment_status === "done" ? "Paid" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {reg.transaction_id}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedRegistration(reg); }} className="hover:bg-muted/50">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="border-border/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Page {page} of {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="border-border/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registration Details Dialog */}
      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="sm:max-w-[800px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Transaction ID: {selectedRegistration?.transaction_id}
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{selectedRegistration.user_name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">College</label>
                    <p className="font-medium">{selectedRegistration.college}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Event</label>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{selectedRegistration.event_name}</Badge>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="font-medium">{selectedRegistration.category}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Participation</label>
                    <p className="font-medium">{selectedRegistration.participation_type} ({selectedRegistration.group_size})</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                    <Badge
                      className={
                        selectedRegistration.payment_status === "done"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }
                    >
                      {selectedRegistration.payment_status === "done" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-4 mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">₹{selectedRegistration.gross_amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gateway Charge</span>
                    <span className="text-red-400">-₹{selectedRegistration.gateway_charge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border/50">
                    <span className="font-semibold">Net Amount</span>
                    <span className="font-bold text-emerald-400">
                      ₹{selectedRegistration.net_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Payment Screenshot</label>
                {selectedRegistration.payment_screenshot_url ? (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-border/50 overflow-hidden bg-muted/30">
                      <img
                        src={selectedRegistration.payment_screenshot_url}
                        alt="Payment screenshot"
                        className="w-full h-full object-contain max-h-48 bg-background"
                        loading="lazy"
                      />
                    </div>
                    <a
                      href={selectedRegistration.payment_screenshot_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Open screenshot in new tab
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not provided</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRegistration(null)} className="border-border/50">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
