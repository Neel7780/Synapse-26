"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Ticket, User, DollarSign, CreditCard, Loader2, AlertCircle } from "lucide-react";

type Registration = {
  user: {
    name: string;
    email: string;
    phone: string;
    college: string;
  };
  event: {
    event_name: string;
    category: string;
    participation_type: string;
    team_size: number;
    registration_date: string;
  };
  payment: {
    method: string;
    status: string;
  };
  financials: {
    transaction_id: string;
    gross_amount: number;
    gateway_charge: number;
    net_amount: number;
  };
};

export default function RegistrationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/admin/registrations/${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setRegistration(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistration();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg text-muted-foreground">Error: {error || "Registration not found"}</p>
        <Link href="/admin/registrations">
          <Button variant="outline">Back to Registrations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <AdminPageHeader
        title="Registration Details"
        subtitle={`#${id}`}
        actions={
          <Link href="/admin/registrations">
            <Button variant="outline" className="border-border/50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info */}
        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Participant</CardTitle>
                <CardDescription>User details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{registration.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{registration.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{registration.user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">College</span>
              <span className="font-medium">{registration.user.college}</span>
            </div>
          </CardContent>
        </Card>

        {/* Event Info */}
        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <CardTitle>Event</CardTitle>
                <CardDescription>Registration details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event</span>
              <Badge className="bg-primary/10 text-primary border-0">{registration.event.event_name}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{registration.event.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participation</span>
              <span className="font-medium">{registration.event.participation_type} ({registration.event.team_size})</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Payment details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">{registration.payment.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={registration.payment.status === "done" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}>
                {registration.payment.status === "done" ? "Paid" : "Pending"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-sm">{registration.financials.transaction_id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card className="border-border/40">
          <CardHeader className="border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Financials</CardTitle>
                <CardDescription>Amount breakdown</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Amount</span>
              <span className="font-medium">₹{registration.financials.gross_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gateway Charge</span>
              <span className="text-red-400">-₹{registration.financials.gateway_charge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/50">
              <span className="font-semibold">Net Amount</span>
              <span className="font-bold text-emerald-400">₹{registration.financials.net_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
