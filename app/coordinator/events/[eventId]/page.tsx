"use client";

import { useEffect, useState, use } from "react";
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
  Building2,
  DollarSign,
  Users,
  Calendar,
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

  useEffect(() => {
    fetchRegistrations();
  }, [eventIdParam]);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, searchTerm, statusFilter]);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch(`/api/coordinator/registrations/${eventIdParam}`);
      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        console.log("Setting registrations:", data.registrations);
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
  };

  const filterRegistrations = () => {
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
      if (statusFilter === "verified") {
        filtered = filtered.filter((reg) => reg.coordinator_status === "verified");
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((reg) => reg.coordinator_status === "pending" || reg.coordinator_status === null);
      }
    }

    setFilteredRegistrations(filtered);
  };

  const handleVerify = async (registration: Registration) => {
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
        }),
      });

      if (response.ok) {
        // Update local state
        setRegistrations((prev) =>
          prev.map((reg) =>
            reg.registration_id === registration.registration_id
              ? { ...reg, coordinator_status: "verified" }
              : reg
          )
        );
      } else {
        const data = await response.json();
        alert(`Failed to verify: ${data.error}`);
      }
    } catch (error) {
      console.error("Error verifying registration:", error);
      alert("Failed to verify registration");
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "verified") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
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
    verified: registrations.filter((r) => r.coordinator_status === "verified").length,
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
              Verified
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.verified}</div>
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
                <SelectItem value="verified" className="text-white">Verified</SelectItem>
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
                          {!registration.coordinator_status || registration.coordinator_status === "pending" ? (
                            <Button
                              size="sm"
                              onClick={() => handleVerify(registration)}
                              disabled={verifying === registration.registration_id}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {verifying === registration.registration_id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Verify
                                </>
                              )}
                            </Button>
                          ) : null}
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
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Registration ID: #{selectedRegistration?.registration_id}
            </DialogDescription>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6">
              {/* Participant Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Participant Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium">
                        {selectedRegistration.users.user_name || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">
                        {selectedRegistration.users.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">
                        {selectedRegistration.users.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">College</p>
                      <p className="text-sm font-medium">
                        {selectedRegistration.users.college || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event & Payment Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Event & Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Participation Type</p>
                    <p className="text-sm font-medium">
                      {selectedRegistration.fee?.participation_type || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fee Price</p>
                    <p className="text-sm font-medium">
                      ₹{selectedRegistration.fee?.price || selectedRegistration.gross_amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <div className="mt-1">
                      {getPaymentStatusBadge(selectedRegistration.payment_status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Verification Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedRegistration.coordinator_status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-sm font-medium">
                      {selectedRegistration.transaction_id || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Registration Date</p>
                    <p className="text-sm font-medium">
                      {new Date(
                        selectedRegistration.registration_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Screenshot */}
              {selectedRegistration.payment_screenshot_url && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Payment Screenshot
                  </h3>
                  <img
                    src={selectedRegistration.payment_screenshot_url}
                    alt="Payment Screenshot"
                    className="rounded-lg border border-zinc-700 max-w-full h-auto"
                  />
                </div>
              )}

              {/* Action Button */}
              {!selectedRegistration.coordinator_status || selectedRegistration.coordinator_status === "pending" ? (
                <div className="pt-4 border-t border-zinc-800">
                  <Button
                    onClick={() => {
                      handleVerify(selectedRegistration);
                      setSelectedRegistration(null);
                    }}
                    disabled={verifying === selectedRegistration.registration_id}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {verifying === selectedRegistration.registration_id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Verify Registration
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
