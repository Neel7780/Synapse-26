"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/app/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
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
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  Search,
  Eye,
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  IndianRupee,
  Users,
  Calendar,
  Download,
} from "lucide-react";

interface Registration {
  registration_id: number;
  event_id: number;
  fee_id: number | null;
  registered_by_user_id: string;
  registration_date: string;
  payment_status: string;
  coordinator_status: string | null;
  gross_amount: number;
  transaction_id: string | null;
  payment_screenshot_url: string | null;
  created_at: string;
  users: {
    user_id: string;
    user_name: string | null;
    email: string;
    phone: string | null;
    college: string | null;
  };
  fee: {
    participation_type: string;
    min_members: number;
    max_members: number;
    price: number;
  } | null;
  team_members?: Array<{
    user_id: string;
    user_name: string | null;
    email: string;
    phone: string | null;
    college: string | null;
  }>;
}

export default function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const { eventId: eventIdParam } = use(params);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    registration: Registration;
    action: "accepted" | "rejected";
  } | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      const response = await fetch(`/api/coordinator/registrations/${eventIdParam}`);
      const data = await response.json();

      if (response.ok) {
        setEventName(data.event.event_name);
        setRegistrations(data.registrations);
      } else {
        console.error("Failed to fetch registrations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  }, [eventIdParam]);

  const filterRegistrations = useCallback(() => {
    let filtered = [...registrations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.users.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "accepted") {
        filtered = filtered.filter((reg) => reg.coordinator_status === "accepted");
      } else if (statusFilter === "rejected") {
        filtered = filtered.filter((reg) => reg.coordinator_status === "rejected");
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((reg) => reg.coordinator_status === "pending" || reg.coordinator_status === null);
      }
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, statusFilter]);

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.append("eventId", eventIdParam);
      if (searchTerm) params.append("searchParams", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("t", Date.now().toString()); // Cache busting

      const res = await fetch(`/api/coordinator/registrations/export?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Export failed" }));
        throw new Error(errorData.error || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `${eventName.replace(/\s+/g, "_")}_registrations_${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Export error:", err);
      alert(err?.message ?? "Export failed");
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    filterRegistrations();
  }, [filterRegistrations]);

  const handleStatusUpdate = async (registration: Registration, newStatus: "accepted" | "rejected" | "pending") => {
    setVerifying(registration.registration_id);
    try {
      const response = await fetch("/api/coordinator/registrations/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_id: registration.registration_id,
          event_id: registration.event_id,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.registration_id === registration.registration_id
              ? { ...reg, coordinator_status: newStatus }
              : reg
          )
        );
      } else {
        const data = await response.json();
        console.error("Failed to update status:", data.error);
      }
    } catch (error) {
      console.error("Error updating registration status:", error);
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "accepted") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-600 hover:bg-red-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-600 hover:bg-yellow-700">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      done: { color: "bg-green-600 hover:bg-green-700", text: "Paid" },
      pending: { color: "bg-yellow-600 hover:bg-yellow-700", text: "Pending" },
      failed: { color: "bg-red-600 hover:bg-red-700", text: "Failed" },
    };

    const config = statusMap[status] || statusMap.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const stats = {
    total: registrations.length,
    accepted: registrations.filter((r) => r.coordinator_status === "accepted").length,
    rejected: registrations.filter((r) => r.coordinator_status === "rejected").length,
    pending: registrations.filter((r) => r.coordinator_status === "pending" || r.coordinator_status === null).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/coordinator")}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">{eventName}</h1>
          <p className="text-gray-400 mt-2">Manage event registrations</p>
        </div>
        <Button
          onClick={downloadCSV}
          className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border-0"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Accepted
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.accepted}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Rejected
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Registrations</CardTitle>
          <CardDescription className="text-gray-400">
            View and verify event registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-black border-zinc-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="pending" className="text-white">Pending</SelectItem>
                <SelectItem value="accepted" className="text-white">Accepted</SelectItem>
                <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No registrations found</p>
            </div>
          ) : (
            <div className="rounded-md border border-zinc-800 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableHead className="text-gray-400">ID</TableHead>
                    <TableHead className="text-gray-400">Participant</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Payment</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow
                      key={registration.registration_id}
                      className="border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <TableCell className="font-medium text-white">
                        #{registration.registration_id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {registration.users.user_name || "N/A"}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {registration.users.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {registration.fee?.participation_type || "N/A"}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        ₹{registration.gross_amount}
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(registration.payment_status)}
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.coordinator_status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedRegistration(registration)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {registration.coordinator_status === "pending" || registration.coordinator_status === null ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => setConfirmAction({ registration, action: "accepted" })}
                                disabled={verifying === registration.registration_id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {verifying === registration.registration_id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setConfirmAction({ registration, action: "rejected" })}
                                disabled={verifying === registration.registration_id}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {verifying === registration.registration_id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedRegistration}
        onOpenChange={() => setSelectedRegistration(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-4xl w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Registration ID: #{selectedRegistration?.registration_id}
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="overflow-y-auto overflow-x-hidden px-6 pb-6 flex-1">
              {/* Participant Info & Payment Details */}
              <div className="space-y-6">
                {/* Participant Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Participant Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-medium break-words">
                          {selectedRegistration.users.user_name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium break-words">
                          {selectedRegistration.users.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium break-words">
                          {selectedRegistration.users.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">College</p>
                        <p className="text-sm font-medium break-words">
                          {selectedRegistration.users.college || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members (if any) */}
                {selectedRegistration.team_members && selectedRegistration.team_members.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                      Team Members
                    </h3>
                    <div className="space-y-3">
                      {selectedRegistration.team_members.map((member) => (
                        <div key={member.user_id} className="grid grid-cols-2 gap-4">
                          <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Name</p>
                              <p className="text-sm font-medium break-words">
                                {member.user_name || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm font-medium break-words">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event & Payment Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Event & Payment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Participation Type</p>
                      <p className="text-sm font-medium break-words">
                        {selectedRegistration.fee?.participation_type || "N/A"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Amount Paid</p>
                      <p className="text-sm font-medium">
                        ₹{selectedRegistration.gross_amount}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Payment Status</p>
                      <div className="mt-1">
                        {getPaymentStatusBadge(selectedRegistration.payment_status)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Verification Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedRegistration.coordinator_status)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Transaction ID</p>
                      <p className="text-sm font-medium break-all">
                        {selectedRegistration.transaction_id || "N/A"}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Registration Date</p>
                      <p className="text-sm font-medium">
                        {new Date(
                          selectedRegistration.registration_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedRegistration.coordinator_status === "pending" || selectedRegistration.coordinator_status === null ? (
                  <div className="pt-6 border-t border-zinc-800 space-y-2">
                    <Button
                      onClick={() => setConfirmAction({ registration: selectedRegistration, action: "accepted" })}
                      disabled={verifying === selectedRegistration.registration_id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {verifying === selectedRegistration.registration_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept Registration
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setConfirmAction({ registration: selectedRegistration, action: "rejected" })}
                      disabled={verifying === selectedRegistration.registration_id}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {verifying === selectedRegistration.registration_id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reject Registration
                        </>
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* Payment Screenshot */}
              {selectedRegistration.payment_screenshot_url && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Payment Proof
                  </h3>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Screenshot URL</p>
                    <a
                      href={selectedRegistration.payment_screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 underline break-all block"
                    >
                      {selectedRegistration.payment_screenshot_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "accepted" ? "Accept Registration" : "Reject Registration"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {confirmAction ? (
                <>Registration ID: #{confirmAction.registration.registration_id}</>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-300">
            {confirmAction?.action === "accepted"
              ? "Are you sure you want to accept this registration? This action cannot be undone."
              : "Are you sure you want to reject this registration? This action cannot be undone."}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setConfirmAction(null)}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmAction) {
                  handleStatusUpdate(confirmAction.registration, confirmAction.action);
                  if (
                    selectedRegistration &&
                    selectedRegistration.registration_id === confirmAction.registration.registration_id
                  ) {
                    setSelectedRegistration(null);
                  }
                  setConfirmAction(null);
                }
              }}
              disabled={verifying === confirmAction?.registration.registration_id}
              className={
                confirmAction?.action === "accepted"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {verifying === confirmAction?.registration.registration_id
                ? "Processing..."
                : confirmAction?.action === "accepted"
                ? "Confirm Accept"
                : "Confirm Reject"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
