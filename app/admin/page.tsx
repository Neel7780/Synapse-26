'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Calendar,
  Ticket,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/use-admin-data";

export default function AdminDashboard() {
  const { data: dashboardData, loading: isLoading, error, refetch } = useDashboardStats();

  const stats = {
    totalEvents: dashboardData?.stats?.totalEvents ?? 0,
    totalRegistrations: dashboardData?.stats?.totalRegistrations ?? 0,
    totalUsers: dashboardData?.stats?.totalUsers ?? 0,
    totalSponsors: dashboardData?.stats?.totalSponsors ?? 0,
  };

  const revenueData = {
    grossRevenue: dashboardData?.revenue?.gross ?? 0,
    netRevenue: dashboardData?.revenue?.net ?? 0,
    paidCount: dashboardData?.revenue?.paidCount ?? 0,
  };

  const recentRegistrations = (dashboardData?.recentRegistrations ?? []).map((reg) => ({
    id: reg.id,
    userName: reg.userName ?? "Unknown",
    event: reg.event ?? "Unknown Event",
    status: (reg.status ?? "pending").toLowerCase(),
    coordinatorStatus: reg.coordinatorStatus ?? null,
    amount: reg.amount ?? 0,
  }));

  const quickStats = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), change: "Active", positive: true },
    { label: "Registrations", value: stats.totalRegistrations.toLocaleString(), change: `${revenueData.paidCount} paid`, positive: true },
    {
      label: "Revenue",
      value: revenueData.netRevenue >= 1000 ? `₹${(revenueData.netRevenue / 1000).toFixed(1)}K` : `₹${revenueData.netRevenue.toLocaleString()}`,
      change: "Net amount",
      positive: true,
    },
  ];

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="text-destructive font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Welcome Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <Card className="lg:col-span-2 border-border/40 bg-gradient-to-br from-card via-card to-secondary/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-amber-400">Synapse &apos;26</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{getGreeting()}, Admin!</h2>
                    <p className="text-muted-foreground max-w-lg">
                      Your festival is performing well. You have <span className="text-foreground font-medium">{stats.totalRegistrations} registrations</span> across <span className="text-foreground font-medium">{stats.totalEvents} events</span>.
                    </p>
                  </div>
                  <Image
                    src="/Synapse Logo.png"
                    alt="Synapse Logo"
                    width={64}
                    height={64}
                    className="h-16 w-16 opacity-20 hidden lg:block"
                    priority
                  />
         </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className={`text-xs font-medium mt-1 ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Revenue Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">₹{(revenueData.netRevenue ?? 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Net Revenue</span>
                    </p>
                  </div>
                  <div className="h-px bg-border/60" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Gross</p>
                      <p className="font-semibold">₹{(revenueData.grossRevenue ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border/40 group hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 group hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-amber-400" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                    {revenueData.paidCount} paid
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
                <p className="text-sm text-muted-foreground">Registrations</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 group hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>

            <Card className="border-border/40 group hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-0 text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{stats.totalSponsors}</p>
                <p className="text-sm text-muted-foreground">Sponsors</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Registrations Table */}
            <Card className="lg:col-span-2 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg">Recent Registrations</CardTitle>
                  <CardDescription>Latest registration activities</CardDescription>
                </div>
                <Link href="/admin/registrations">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentRegistrations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Ticket className="h-10 w-10 mb-3 opacity-50" />
                    <p className="font-medium">No registrations yet</p>
                    <p className="text-sm mt-1">Registrations will appear here once users sign up for events</p>
                    <Link href="/admin/registrations" className="mt-4">
                      <Button variant="outline" size="sm">View Registrations</Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40 hover:bg-transparent">
                        <TableHead className="text-muted-foreground font-medium">User</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Event</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentRegistrations.map((reg) => (
                        <TableRow key={reg.id} className="border-border/40 hover:bg-secondary/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                                {(reg.userName || "?")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .filter(Boolean)
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase() || "?"}
                              </div>
                              <span className="font-medium truncate max-w-[120px]">{reg.userName || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground truncate max-w-[150px]">{reg.event || "—"}</TableCell>
                          <TableCell className="font-medium">₹{(reg.amount ?? 0).toLocaleString()}</TableCell>
                          <TableCell>
                            {reg.status === "paid" || reg.status === "success" ? (
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span className="text-sm">Paid</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {/* show Pending only if coordinator hasn't reviewed */}
                                {!reg.coordinatorStatus ? (
                                  <div className="flex items-center gap-1.5 text-amber-400">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-sm capitalize">pending</span>
                                  </div>
                                ) : null}

                                {reg.coordinatorStatus ? (
                                  <div className={`px-3 py-0.5 rounded-full text-sm font-medium ${reg.coordinatorStatus === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' : reg.coordinatorStatus === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-muted/20 text-muted-foreground'}`}>
                                    {String(reg.coordinatorStatus).charAt(0).toUpperCase() + String(reg.coordinatorStatus).slice(1)}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Frequently used actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/events/new" className="block">
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Create Event</p>
                      <p className="text-xs text-muted-foreground">Add a new event</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/registrations" className="block">
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Ticket className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Registrations</p>
                      <p className="text-xs text-muted-foreground">View & export data</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/users" className="block">
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Manage Users</p>
                      <p className="text-xs text-muted-foreground">View participants</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>

                <Link href="/admin/analytics" className="block">
                  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <Eye className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">View Analytics</p>
                      <p className="text-xs text-muted-foreground">Traffic & insights</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
