"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  Home,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Download,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ImageIcon,
  ShieldCheck,
  ShieldX,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

type AccommodationOrder = {
  order_id: number;
  booking_id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  order_date: string;
  check_in: string;
  check_out: string;
  nights: number;
  amount: number;
  verification_status: "pending" | "verified" | "rejected";
  payment_screenshot_url: string;
  transaction_reference: string;
  admin_notes: string;
  rejection_reason: string;
  verified_at: string;
  created_at: string;
};

type OrderSummary = {
  total_orders: number;
  pending_verification: number;
  verified: number;
  rejected: number;
  total_revenue: number;
};

export default function AccommodationOrdersPage() {
  const [orders, setOrders] = useState<AccommodationOrder[]>([]);
  const [summary, setSummary] = useState<OrderSummary>({
    total_orders: 0,
    pending_verification: 0,
    verified: 0,
    rejected: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<AccommodationOrder | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showScreenshotDialog, setShowScreenshotDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  // Form states
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const limit = 10;

  const fetchOrders = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await fetch(`/api/admin/accommodation/orders?${params}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setOrders(data.orders || []);
      setSummary(data.summary || {});
      setPage(pageNum);
      setTotalPages(data.total_pages || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, searchTerm]);

  const handleViewScreenshot = (order: AccommodationOrder) => {
    setSelectedOrder(order);
    setShowScreenshotDialog(true);
  };

  const handleViewDetails = (order: AccommodationOrder) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleVerifyClick = (order: AccommodationOrder) => {
    setSelectedOrder(order);
    setAdminNotes("");
    setShowVerifyDialog(true);
  };

  const handleRejectClick = (order: AccommodationOrder) => {
    setSelectedOrder(order);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleVerifyConfirm = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/accommodation/orders/${selectedOrder.order_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verification_status: "verified",
          admin_notes: adminNotes || null,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setShowVerifyDialog(false);
      setSelectedOrder(null);
      await fetchOrders(page);
    } catch (err: unknown) {
      alert("Failed to verify: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedOrder) return;
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/accommodation/orders/${selectedOrder.order_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verification_status: "rejected",
          rejection_reason: rejectionReason,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setShowRejectDialog(false);
      setSelectedOrder(null);
      setRejectionReason("");
      await fetchOrders(page);
    } catch (err: unknown) {
      alert("Failed to reject: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (orderId: number) => {
    setDeletingOrderId(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrderId) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/accommodation/orders/${deletingOrderId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDeleteDialogOpen(false);
      setDeletingOrderId(null);
      await fetchOrders(page);
    } catch (err: unknown) {
      alert("Failed to delete: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Order ID",
      "Name",
      "Email",
      "Phone",
      "Nights",
      "Amount",
      "Status",
      "Check-in",
      "Check-out",
      "Transaction Ref",
      "Date",
    ];
    const rows = orders.map((o) => [
      o.order_id,
      o.user_name,
      o.user_email,
      o.user_phone,
      o.nights,
      o.amount,
      o.verification_status,
      o.check_in,
      o.check_out,
      o.transaction_reference,
      new Date(o.created_at).toLocaleDateString(),
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.map(cell => `"${cell || ""}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accommodation_orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"><ShieldCheck className="w-3 h-3 mr-1" />Verified</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30"><ShieldX className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const statsCards = [
    {
      title: "Total Orders",
      value: summary.total_orders,
      icon: Home,
      gradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Pending Verification",
      value: summary.pending_verification,
      icon: Clock,
      gradient: "from-amber-600 to-amber-700",
      highlight: summary.pending_verification > 0,
    },
    {
      title: "Verified",
      value: summary.verified,
      icon: CheckCircle2,
      gradient: "from-emerald-600 to-emerald-700",
    },
    {
      title: "Rejected",
      value: summary.rejected,
      icon: XCircle,
      gradient: "from-red-600 to-red-700",
    },
    {
      title: "Revenue (Verified)",
      value: `₹${summary.total_revenue.toLocaleString()}`,
      icon: IndianRupee,
      gradient: "from-green-600 to-green-700",
    },
  ];

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">Error: {error}</p>
        <Button onClick={() => fetchOrders(1)} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Accommodation Orders"
        subtitle="Payment Screenshot Verification"
        badge={
          summary.pending_verification > 0 ? (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse">
              {summary.pending_verification} pending verification
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              All verified
            </Badge>
          )
        }
        actions={
          <Button
            onClick={downloadCSV}
            className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className={`border-border/40 ${stat.highlight ? "ring-2 ring-amber-500/50" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Search by name, email, phone, transaction ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending Verification</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle>Payment Screenshots</CardTitle>
              <CardDescription>Review and verify payment screenshots to confirm accommodation slots</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead>User</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Screenshot</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No accommodation orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.order_id} className={`border-border/40 ${order.verification_status === "pending" ? "bg-amber-500/5" : ""}`}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.user_name || "N/A"}</span>
                          <span className="text-xs text-muted-foreground">{order.user_email}</span>
                          <span className="text-xs text-muted-foreground">{order.user_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.nights} night(s)</span>
                          <span className="text-xs text-muted-foreground">₹{order.amount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">₹{order.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {order.payment_screenshot_url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewScreenshot(order)}
                            className="gap-1"
                          >
                            <ImageIcon className="h-4 w-4" />
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No image</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.verification_status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {order.payment_screenshot_url && (
                              <DropdownMenuItem onClick={() => handleViewScreenshot(order)}>
                                <ImageIcon className="mr-2 h-4 w-4" />
                                View Screenshot
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {order.verification_status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleVerifyClick(order)} className="text-emerald-500">
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Verify Payment
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectClick(order)} className="text-red-500">
                                  <ShieldX className="mr-2 h-4 w-4" />
                                  Reject Payment
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(order.order_id)}
                              className="text-red-500"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrders(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrders(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screenshot Preview Dialog */}
      <Dialog open={showScreenshotDialog} onOpenChange={setShowScreenshotDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.order_id} - {selectedOrder?.user_name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-[60vh] bg-black/10 rounded-lg overflow-hidden">
              {selectedOrder?.payment_screenshot_url && (
                <img
                  src={selectedOrder.payment_screenshot_url}
                  alt="Payment Screenshot"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <p><strong>Amount:</strong> ₹{selectedOrder?.amount.toLocaleString()}</p>
                {selectedOrder?.transaction_reference && (
                  <p><strong>Transaction Ref:</strong> {selectedOrder.transaction_reference}</p>
                )}
              </div>
              <a
                href={selectedOrder?.payment_screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
          <DialogFooter className="gap-2">
            {selectedOrder?.verification_status === "pending" && (
              <>
                <Button
                  onClick={() => {
                    setShowScreenshotDialog(false);
                    handleVerifyClick(selectedOrder);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Payment
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowScreenshotDialog(false);
                    handleRejectClick(selectedOrder);
                  }}
                >
                  <ShieldX className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button onClick={() => setShowScreenshotDialog(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Confirmation Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
              Verify Payment
            </DialogTitle>
            <DialogDescription>
              Confirm that the payment screenshot for Order #{selectedOrder?.order_id} is valid.
              This will confirm the user&apos;s accommodation slot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p><strong>User:</strong> {selectedOrder?.user_name}</p>
              <p><strong>Amount:</strong> ₹{selectedOrder?.amount.toLocaleString()}</p>
              <p><strong>Nights:</strong> {selectedOrder?.nights}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                className="mt-1 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowVerifyDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleVerifyConfirm}
              disabled={updating}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Confirm Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <ShieldX className="h-5 w-5" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Reject the payment screenshot for Order #{selectedOrder?.order_id}.
              The user will need to submit a new payment screenshot.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p><strong>User:</strong> {selectedOrder?.user_name}</p>
              <p><strong>Email:</strong> {selectedOrder?.user_email}</p>
              <p><strong>Amount:</strong> ₹{selectedOrder?.amount.toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-red-500">Reason for Rejection *</label>
              <textarea
                value={rejectionReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                placeholder="e.g., Screenshot is unclear, Amount doesn't match, Invalid transaction..."
                className="mt-1 w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRejectDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={updating || !rejectionReason.trim()}
              variant="destructive"
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldX className="mr-2 h-4 w-4" />}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Accommodation Order #{selectedOrder?.order_id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> User Information</h4>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Name:</strong> {selectedOrder.user_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.user_email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.user_phone}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Booking Details</h4>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Nights:</strong> {selectedOrder.nights}</p>
                    <p><strong>Check-in:</strong> {selectedOrder.check_in ? new Date(selectedOrder.check_in).toLocaleDateString() : "-"}</p>
                    <p><strong>Check-out:</strong> {selectedOrder.check_out ? new Date(selectedOrder.check_out).toLocaleDateString() : "-"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Payment</h4>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Amount:</strong> ₹{selectedOrder.amount.toLocaleString()}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedOrder.verification_status)}</p>
                    <p><strong>Transaction Ref:</strong> {selectedOrder.transaction_reference || "-"}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Admin Notes</h4>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
                    <p><strong>Notes:</strong> {selectedOrder.admin_notes || "-"}</p>
                    {selectedOrder.rejection_reason && (
                      <p className="text-red-400"><strong>Rejection Reason:</strong> {selectedOrder.rejection_reason}</p>
                    )}
                    {selectedOrder.verified_at && (
                      <p><strong>Verified At:</strong> {new Date(selectedOrder.verified_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
              {selectedOrder.payment_screenshot_url && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Payment Screenshot</h4>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleViewScreenshot(selectedOrder);
                    }}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    View Screenshot
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this accommodation order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="destructive"
              disabled={updating}
            >
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
