"use client";

import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
    Eye,
    Users,
    TrendingUp,
    Globe,
    ArrowUp,
    ArrowDown,
    BarChart3,
    Activity,
    Loader2,
    Monitor,
    Smartphone,
    Tablet,
    MousePointerClick,
    UserPlus,
    RefreshCw,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Types for analytics data
interface AnalyticsData {
    websiteAnalytics: {
        available: boolean;
        pageViews: string;
        uniqueVisitors: string;
        pageViewsChange: string;
        visitorsChange: string;
        topPages: Array<{ path: string; views: number; change: string }>;
        referrers: Array<{ name: string; value: number; color: string }>;
        countries: Array<{ name: string; value: number; color: string }>;
        browsers: Array<{ name: string; value: number; color: string }>;
        devices: Array<{ device: string; percentage: number; sessions: string }>;
        dailyData: Array<{ day: string; views: number; visitors: number }>;
    };
    registrationAnalytics: {
        totalRegistrations: string;
        newUsers: string;
        totalUsers: string;
        registrationsChange: string;
        usersChange: string;
        topEvents: Array<{ path: string; views: number; change: string }>;
        registrationsByCategory: Array<{ name: string; value: number; color: string }>;
        hourlyTraffic: Array<{ hour: string; registrations: number }>;
        recentRegistrations: Array<{ page: string; count: number }>;
    };
    dailyData: Array<{ day: string; views: number; visitors: number; registrations: number; newUsers: number }>;
    deviceStats: Array<{ device: string; percentage: number; sessions: string }>;
}

// Enhanced Custom Tooltip with better visibility
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        // Filter out zero values for cleaner display
        const filteredPayload = payload.filter(entry => entry.value > 0);
        if (filteredPayload.length === 0 && payload.length > 0) {
            // If all values are zero, show at least the first one
            filteredPayload.push(payload[0]);
        }
        
        return (
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl p-4 min-w-[200px]">
                <p className="text-sm font-bold mb-3 text-white/90 border-b border-zinc-700 pb-2">{label}</p>
                <div className="space-y-2">
                    {filteredPayload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-zinc-400 font-medium">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold text-white">
                                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

// Enhanced Pie Tooltip
const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl shadow-2xl p-4 min-w-[140px]">
                <div className="flex items-center gap-2 mb-2">
                    <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: data.payload.color }}
                    />
                    <p className="text-sm font-semibold text-white">{data.name}</p>
                </div>
                <p className="text-2xl font-bold text-white">{data.value}%</p>
            </div>
        );
    }
    return null;
};

// Custom Legend with better visibility
const CustomLegend = ({ items }: { items: Array<{ name: string; color: string }> }) => (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-border/50 flex-wrap">
        {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 group cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg hover:bg-secondary/40 transition-colors">
                <div 
                    className="h-3 w-3 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm font-medium text-foreground/80">{item.name}</span>
            </div>
        ))}
    </div>
);

export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchAnalytics = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            
            const response = await fetch("/api/admin/analytics");
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch analytics data");
            }

            const data = await response.json();
            setAnalyticsData(data);
            setError(null);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError(err instanceof Error ? err.message : "Failed to load analytics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        track("admin_page_viewed", { page: "analytics" });
        fetchAnalytics();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchAnalytics(true);
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (value: string) => {
        track("admin_analytics_tab_changed", { tab: value });
    };

    if (loading) {
        return (
            <div className="space-y-8 pb-8">
                <AdminPageHeader
                    title="Analytics Dashboard"
                    subtitle="Analytics"
                    badge={
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-2 px-3 py-1">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="font-medium">Loading...</span>
                        </Badge>
                    }
                />
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error && !analyticsData) {
        return (
            <div className="space-y-8 pb-8">
                <AdminPageHeader
                    title="Analytics Dashboard"
                    subtitle="Analytics"
                    badge={
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-2 px-3 py-1">
                            <span className="font-medium">Error</span>
                        </Badge>
                    }
                />
                <Card className="border-2 border-red-500/50 bg-red-500/5">
                    <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <Activity className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-red-400 mb-2">Failed to load analytics</p>
                                <p className="text-base text-muted-foreground">{error}</p>
                                <button 
                                    onClick={() => fetchAnalytics()}
                                    className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!analyticsData) return null;

    const { websiteAnalytics, registrationAnalytics, dailyData, deviceStats } = analyticsData;

    // Build overview stats
    const overviewStats = [];

    if (websiteAnalytics.available && websiteAnalytics.pageViews !== "N/A") {
        overviewStats.push({
            title: "Page Views",
            value: websiteAnalytics.pageViews,
            change: websiteAnalytics.pageViewsChange,
            up: !websiteAnalytics.pageViewsChange.startsWith("-"),
            icon: Eye,
            category: "website",
            color: "#3b82f6",
            bgColor: "bg-blue-500/15",
        });
        overviewStats.push({
            title: "Unique Visitors",
            value: websiteAnalytics.uniqueVisitors,
            change: websiteAnalytics.visitorsChange,
            up: !websiteAnalytics.visitorsChange.startsWith("-"),
            icon: Users,
            category: "website",
            color: "#8b5cf6",
            bgColor: "bg-violet-500/15",
        });
    }

    overviewStats.push({
        title: "Registrations",
        value: registrationAnalytics.totalRegistrations,
        change: registrationAnalytics.registrationsChange,
        up: !registrationAnalytics.registrationsChange.startsWith("-"),
        icon: MousePointerClick,
        category: "registration",
        color: "#ef4444",
        bgColor: "bg-red-500/15",
    });
    overviewStats.push({
        title: "New Users",
        value: registrationAnalytics.newUsers,
        change: registrationAnalytics.usersChange,
        up: !registrationAnalytics.usersChange.startsWith("-"),
        icon: UserPlus,
        category: "registration",
        color: "#f97316",
        bgColor: "bg-orange-500/15",
    });

    const deviceColors: { [key: string]: string } = {
        "Desktop": "#3b82f6",
        "Mobile": "#8b5cf6", 
        "Tablet": "#22c55e",
        "Total Users": "#3b82f6",
        "This Week": "#22c55e",
        "Last Week": "#f97316",
    };

    const deviceStatsWithIcons = deviceStats.map(stat => ({
        ...stat,
        icon: stat.device === "Desktop" ? Monitor 
            : stat.device === "Mobile" ? Smartphone 
            : stat.device === "Tablet" ? Tablet
            : stat.device === "Total Users" ? Users
            : stat.device === "This Week" ? TrendingUp
            : Users,
        color: deviceColors[stat.device] || "#3b82f6",
    }));

    const totalRecentRegistrations = registrationAnalytics.recentRegistrations.reduce((sum, r) => sum + r.count, 0);

    // Chart legend items
    const chartLegendItems = [
        ...(websiteAnalytics.available ? [
            { name: "Page Views", color: "#3b82f6" },
            { name: "Visitors", color: "#8b5cf6" },
        ] : []),
        { name: "Registrations", color: "#ef4444" },
        { name: "New Users", color: "#f97316" },
    ];

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <AdminPageHeader
                    title="Analytics Dashboard"
                    subtitle="Analytics"
                    badge={
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-2 px-3 py-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-semibold">{websiteAnalytics.available ? "Live Data" : "Registration Data"}</span>
                        </Badge>
                    }
                />
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Auto-refresh 30s</span>
                            <span className="text-muted-foreground/60">•</span>
                            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                        </div>
                    )}
                    <button 
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl font-medium transition-all disabled:opacity-50 border border-border"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Website Analytics Notice */}
            {!websiteAnalytics.available && (
                <Card className="border-2 border-amber-500/40 bg-amber-500/5">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            <Activity className="h-5 w-5 text-amber-500" />
                        </div>
                        <p className="text-base text-amber-300/90">
                            <span className="font-semibold">Website analytics unavailable.</span> Make sure your VERCEL_TOKEN and VERCEL_PROJECT_ID are configured correctly, and that Vercel Web Analytics is enabled.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Overview Stats - Larger cards with better contrast */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {overviewStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card 
                            key={stat.title} 
                            className="border-2 border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group overflow-hidden relative"
                            style={{ 
                                animationDelay: `${index * 100}ms`,
                            }}
                        >
                            {/* Subtle gradient background */}
                            <div 
                                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                                style={{ background: `linear-gradient(135deg, ${stat.color} 0%, transparent 60%)` }}
                            />
                            <CardContent className="p-6 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div 
                                        className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${stat.bgColor}`}
                                    >
                                        <Icon className="h-7 w-7" style={{ color: stat.color }} />
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${
                                        stat.up 
                                            ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30" 
                                            : "text-red-400 bg-red-500/15 border border-red-500/30"
                                    }`}>
                                        {stat.up ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-4xl font-bold text-foreground tracking-tight">{stat.value}</p>
                                <p className="text-base text-muted-foreground mt-2 font-medium">{stat.title}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Traffic Overview Chart */}
                <Card className="xl:col-span-2 border-2 border-border/60">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Traffic Overview</CardTitle>
                                <CardDescription className="text-base mt-1">
                                    {websiteAnalytics.available 
                                        ? "Page views, visitors, registrations & new users"
                                        : "Registrations & new users"} (last 7 days)
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-secondary/80 text-base px-4 py-1.5 font-semibold">Weekly</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="h-[340px] sm:h-[380px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart 
                                    data={dailyData} 
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--border))" 
                                        opacity={0.4}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#ffffff"
                                        fontSize={12}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={12}
                                        tick={{ fill: '#ffffff', textAnchor: 'middle' }}
                                    />
                                    <YAxis
                                        stroke="#ffffff"
                                        fontSize={12}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        width={55}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                                        tick={{ fill: '#ffffff', textAnchor: 'end' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    {websiteAnalytics.available && (
                                        <>
                                            <Area
                                                type="natural"
                                                dataKey="views"
                                                name="Page Views"
                                                stroke="#3b82f6"
                                                strokeWidth={2.5}
                                                fill="url(#colorPageViews)"
                                                dot={false}
                                                activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                            <Area
                                                type="natural"
                                                dataKey="visitors"
                                                name="Visitors"
                                                stroke="#8b5cf6"
                                                strokeWidth={2.5}
                                                fill="url(#colorVisitors)"
                                                dot={false}
                                                activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                            />
                                        </>
                                    )}
                                    <Area
                                        type="natural"
                                        dataKey="registrations"
                                        name="Registrations"
                                        stroke="#ef4444"
                                        strokeWidth={2.5}
                                        fill="url(#colorRegistrations)"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                    <Area
                                        type="natural"
                                        dataKey="newUsers"
                                        name="New Users"
                                        stroke="#f97316"
                                        strokeWidth={2.5}
                                        fill="url(#colorNewUsers)"
                                        dot={false}
                                        activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <CustomLegend items={chartLegendItems} />
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-2 border-border/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-primary" />
                            </div>
                            {websiteAnalytics.available && websiteAnalytics.referrers.length > 0 
                                ? "Traffic Sources" 
                                : "By Category"}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {websiteAnalytics.available && websiteAnalytics.referrers.length > 0 
                                ? "Where visitors come from" 
                                : "Distribution across event categories"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const pieData = websiteAnalytics.available && websiteAnalytics.referrers.length > 0 
                                ? websiteAnalytics.referrers 
                                : registrationAnalytics.registrationsByCategory;
                            
                            // Find the top category
                            const topCategory = pieData.reduce((prev, current) => 
                                (prev.value > current.value) ? prev : current, pieData[0]);
                            
                            return (
                                <>
                                    <div className="h-[220px] sm:h-[240px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={85}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    strokeWidth={0}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={entry.color}
                                                            className="transition-opacity hover:opacity-80"
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<PieTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                            <span className="text-2xl sm:text-3xl font-bold" style={{ color: topCategory.color }}>{topCategory.value}%</span>
                                            <span className="text-xs text-muted-foreground font-medium mt-0.5 max-w-[80px] text-center truncate">{topCategory.name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-4">
                                        {pieData.slice(0, 5).map((source) => (
                                            <div 
                                                key={source.name} 
                                                className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group"
                                            >
                                                <div 
                                                    className="w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-110" 
                                                    style={{ backgroundColor: source.color }}
                                                />
                                                <span className="text-foreground/90 font-medium flex-1 truncate text-sm">{source.name}</span>
                                                <span className="font-bold text-sm tabular-nums" style={{ color: source.color }}>{source.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            {/* Second Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Events/Pages Bar Chart */}
                <Card className="border-2 border-border/60">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-blue-500/15 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-foreground">
                                    {websiteAnalytics.available && websiteAnalytics.topPages.length > 0 
                                        ? "Top Pages" 
                                        : "Top Events"}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    {websiteAnalytics.available && websiteAnalytics.topPages.length > 0 
                                        ? "Most visited pages" 
                                        : "Events with most registrations"}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {(() => {
                            const barData = websiteAnalytics.available && websiteAnalytics.topPages.length > 0 
                                ? websiteAnalytics.topPages 
                                : registrationAnalytics.topEvents;
                            const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f97316', '#ef4444'];
                            
                            return (
                                <div className="h-[300px] sm:h-[340px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={barData.map((page, idx) => ({ 
                                                name: page.path.length > 15 ? page.path.substring(0, 15) + '...' : page.path, 
                                                fullName: page.path,
                                                count: page.views,
                                                fill: colors[idx % colors.length]
                                            }))} 
                                            layout="vertical" 
                                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                            barCategoryGap="20%"
                                        >
                                            <CartesianGrid 
                                                strokeDasharray="3 3" 
                                                stroke="hsl(var(--border))" 
                                                opacity={0.4} 
                                                horizontal={false}
                                            />
                                            <XAxis 
                                                type="number" 
                                                stroke="#ffffff" 
                                                fontSize={12}
                                                fontWeight={600}
                                                tickLine={false} 
                                                axisLine={false}
                                                tickMargin={12}
                                                tick={{ fill: '#ffffff', textAnchor: 'middle' }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke="#ffffff"
                                                fontSize={13}
                                                fontWeight={600}
                                                tickLine={false}
                                                axisLine={false}
                                                width={130}
                                                tickMargin={8}
                                                tick={{ fill: '#ffffff', textAnchor: 'end' }}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.15)' }} />
                                            <Bar
                                                dataKey="count"
                                                name={websiteAnalytics.available && websiteAnalytics.topPages.length > 0 ? "Views" : "Registrations"}
                                                radius={[0, 6, 6, 0]}
                                                maxBarSize={40}
                                            >
                                                {barData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>

                {/* Today's Activity Line Chart */}
                <Card className="border-2 border-border/60">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-foreground">Today&apos;s Activity</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Hourly registration breakdown</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="h-[300px] sm:h-[340px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart 
                                    data={registrationAnalytics.hourlyTraffic} 
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--border))" 
                                        opacity={0.4}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="hour"
                                        stroke="#ffffff"
                                        fontSize={11}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={12}
                                        interval={1}
                                        tick={{ fill: '#ffffff', textAnchor: 'middle' }}
                                    />
                                    <YAxis
                                        stroke="#ffffff"
                                        fontSize={12}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        width={45}
                                        allowDecimals={false}
                                        tick={{ fill: '#ffffff', textAnchor: 'end' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="natural"
                                        dataKey="registrations"
                                        name="Registrations"
                                        stroke="#22c55e"
                                        strokeWidth={2.5}
                                        fill="url(#lineGradient)"
                                        dot={{ fill: '#22c55e', strokeWidth: 2, stroke: '#fff', r: 4 }}
                                        activeDot={{ r: 6, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="events" className="space-y-6" onValueChange={handleTabChange}>
                <TabsList className="bg-secondary/50 border-2 border-border/60 p-1.5 h-auto">
                    {websiteAnalytics.available && (
                        <TabsTrigger value="pages" className="text-base px-5 py-2.5 font-semibold data-[state=active]:bg-background">
                            Top Pages
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="events" className="text-base px-5 py-2.5 font-semibold data-[state=active]:bg-background">
                        Top Events
                    </TabsTrigger>
                    <TabsTrigger value="devices" className="text-base px-5 py-2.5 font-semibold data-[state=active]:bg-background">
                        Devices
                    </TabsTrigger>
                    <TabsTrigger value="recent" className="text-base px-5 py-2.5 font-semibold data-[state=active]:bg-background">
                        Recent Activity
                    </TabsTrigger>
                </TabsList>

                {/* Top Pages */}
                {websiteAnalytics.available && (
                    <TabsContent value="pages">
                        <Card className="border-2 border-border/60">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Top Pages</CardTitle>
                                <CardDescription className="text-base">Most visited pages on your website</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y-2 divide-border/40">
                                    {websiteAnalytics.topPages.map((page, index) => (
                                        <div key={page.path} className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <span className="text-2xl font-bold text-muted-foreground/60 w-8">{index + 1}</span>
                                                <div>
                                                    <p className="font-semibold text-lg">{page.path}</p>
                                                    <p className="text-base text-muted-foreground">{page.views.toLocaleString()} views</p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`text-sm font-bold px-3 py-1.5 ${
                                                    page.change.startsWith("+")
                                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                                        : "bg-red-500/15 text-red-400 border-red-500/30"
                                                }`}
                                            >
                                                {page.change.startsWith("+") ? <ArrowUp className="mr-1.5 h-4 w-4" /> : <ArrowDown className="mr-1.5 h-4 w-4" />}
                                                {page.change}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Top Events */}
                <TabsContent value="events">
                    <Card className="border-2 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Top Events</CardTitle>
                            <CardDescription className="text-base">Events with most registrations</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y-2 divide-border/40">
                                {registrationAnalytics.topEvents.map((event, index) => (
                                    <div key={event.path} className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors">
                                        <div className="flex items-center gap-5">
                                            <span className="text-2xl font-bold text-muted-foreground/60 w-8">{index + 1}</span>
                                            <div>
                                                <p className="font-semibold text-lg">{event.path}</p>
                                                <p className="text-base text-muted-foreground">{event.views.toLocaleString()} registrations</p>
                                            </div>
                                        </div>
                                        <Badge
                                            className={`text-sm font-bold px-3 py-1.5 ${
                                                event.change.startsWith("+")
                                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                                    : "bg-red-500/15 text-red-400 border-red-500/30"
                                            }`}
                                        >
                                            {event.change.startsWith("+") ? <ArrowUp className="mr-1.5 h-4 w-4" /> : <ArrowDown className="mr-1.5 h-4 w-4" />}
                                            {event.change}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Devices */}
                <TabsContent value="devices">
                    <Card className="border-2 border-border/60">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">
                                {websiteAnalytics.available ? "Device Breakdown" : "User Statistics"}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {websiteAnalytics.available 
                                    ? "Traffic distribution by device type" 
                                    : "Overview of user activity"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {deviceStatsWithIcons.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div 
                                            key={stat.device} 
                                            className="p-6 rounded-xl border-2 border-border/40 hover:border-border/80 transition-all bg-secondary/20"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div 
                                                    className="h-14 w-14 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: `${stat.color}20` }}
                                                >
                                                    <Icon className="h-7 w-7" style={{ color: stat.color }} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-foreground">{stat.device}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {stat.sessions} {websiteAnalytics.available ? "sessions" : "users"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">Share</span>
                                                    <span className="text-2xl font-bold" style={{ color: stat.color }}>
                                                        {stat.percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                                        style={{ 
                                                            width: `${stat.percentage}%`,
                                                            backgroundColor: stat.color 
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Recent Activity */}
                <TabsContent value="recent">
                    <Card className="border-2 border-border/60">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Recent Registrations</CardTitle>
                                    <CardDescription className="text-base">Activity in the last hour</CardDescription>
                                </div>
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-2 px-4 py-2 text-base font-bold">
                                    <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                                    {totalRecentRegistrations} recent
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y-2 divide-border/40">
                                {registrationAnalytics.recentRegistrations.map((item) => (
                                    <div key={item.page} className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="font-semibold text-lg">{item.page}</span>
                                        </div>
                                        <Badge className="bg-secondary/80 text-foreground text-base font-bold px-4 py-1.5">
                                            {item.count} registrations
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
