import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
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
} from "lucide-react";
import { getDashboardData, type DashboardData, type QuickStat, type RecentRegistration } from "@/lib/adminData";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

// Loading skeleton components
function StatCardSkeleton() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="h-10 w-10 rounded-xl bg-secondary animate-pulse" />
          <div className="h-5 w-12 rounded bg-secondary animate-pulse" />
        </div>
        <div className="h-8 w-16 rounded bg-secondary animate-pulse mb-1" />
        <div className="h-4 w-24 rounded bg-secondary animate-pulse" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
          <div className="h-4 flex-1 rounded bg-secondary animate-pulse" />
          <div className="h-4 w-16 rounded bg-secondary animate-pulse" />
          <div className="h-4 w-12 rounded bg-secondary animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Helper to get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Server Component: Dashboard Content
async function DashboardContent() {
  const data: DashboardData = await getDashboardData();
  const { stats, revenue, recentRegistrations, quickStats } = data;

  const greeting = getGreeting();
  const revenueChangePositive = revenue.today.change >= 0;

  return (
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
                <h2 className="text-2xl font-bold mb-2">{greeting}, Admin!</h2>
                <p className="text-muted-foreground max-w-lg">
                  Your festival is performing well. You have{" "}
                  <span className="text-foreground font-medium">
                    {stats.totalRegistrations.toLocaleString()} registrations
                  </span>{" "}
                  across{" "}
                  <span className="text-foreground font-medium">
                    {stats.totalEvents} events
                  </span>
                  .
                </p>
              </div>
              <img
                src="/Synapse Logo.png"
                alt="Synapse"
                className="h-16 w-16 opacity-20 hidden lg:block"
              />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
              {quickStats.map((stat: QuickStat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p
                    className={`text-xs font-medium mt-1 ${
                      stat.positive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stat.change} today
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
              Revenue Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">
                  ₹{revenue.today.net.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  {revenueChangePositive ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-400" />
                  )}
                  <span
                    className={`font-medium ${
                      revenueChangePositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {revenueChangePositive ? "+" : ""}
                    {revenue.today.change}%
                  </span>
                  vs yesterday
                </p>
              </div>
              <div className="h-px bg-border/60" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Gross</p>
                  <p className="font-semibold">
                    ₹{revenue.today.gross.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fees</p>
                  <p className="font-semibold text-red-400">
                    -₹{revenue.today.gatewayCharges.toLocaleString()}
                  </p>
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
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400 border-0 text-xs"
              >
                {stats.activeEvents} active
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
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400 border-0 text-xs"
              >
                Live
              </Badge>
            </div>
            <p className="text-2xl font-bold">
              {stats.totalRegistrations.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Registrations</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 group hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400 border-0 text-xs"
              >
                Active
              </Badge>
            </div>
            <p className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 group hover:border-primary/30 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-400" />
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400 border-0 text-xs"
              >
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
              <CardDescription>Latest paid registration activities</CardDescription>
            </div>
            <Link href="/admin/registrations">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 hover:bg-primary/5"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentRegistrations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">
                      User
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Event
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Amount
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRegistrations.map((reg: RecentRegistration) => (
                    <TableRow
                      key={reg.id}
                      className="border-border/40 hover:bg-secondary/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                            {reg.userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium">{reg.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {reg.event}
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{reg.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {reg.status === "done" ? (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="text-sm">Paid</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-sm">Pending</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent registrations</p>
              </div>
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
  );
}

// Loading fallback component
function DashboardLoading() {
  return (
    <>
      {/* Welcome Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardContent className="p-6">
            <div className="h-6 w-24 rounded bg-secondary animate-pulse mb-4" />
            <div className="h-8 w-64 rounded bg-secondary animate-pulse mb-2" />
            <div className="h-4 w-96 rounded bg-secondary animate-pulse" />
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-16 mx-auto rounded bg-secondary animate-pulse mb-2" />
                  <div className="h-4 w-20 mx-auto rounded bg-secondary animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-6">
            <div className="h-6 w-32 rounded bg-secondary animate-pulse mb-4" />
            <div className="h-10 w-24 rounded bg-secondary animate-pulse mb-2" />
            <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader>
            <div className="h-6 w-40 rounded bg-secondary animate-pulse" />
          </CardHeader>
          <TableSkeleton />
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <div className="h-6 w-32 rounded bg-secondary animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Main page component (Server Component)
export default function AdminDashboard() {
  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview"
        actions={
          <div className="flex gap-3">
            <Link href="/admin/events/new">
              <Button
                variant="outline"
                className="border-border/60 hover:bg-secondary/80"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
          </div>
        }
      />

      {/* Dashboard Content with Suspense */}
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
