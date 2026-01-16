"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/ui/AdminSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
    Eye,
    Users,
    Clock,
    TrendingUp,
    Globe,
    Monitor,
    Smartphone,
    Tablet,
    ArrowUp,
    ArrowDown,
    BarChart3,
    Activity,
    Loader2,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

// Types for analytics data
interface AnalyticsData {
    overview: {
        pageViews: string;
        uniqueVisitors: string;
        avgSession: string;
        bounceRate: string;
        pageViewsChange: string;
        visitorsChange: string;
        sessionChange: string;
        bounceRateChange: string;
    };
    pageViews: Array<{ day: string; views: number; visitors: number }>;
    trafficSources: Array<{ name: string; value: number; color: string }>;
    hourlyTraffic: Array<{ hour: string; visitors: number }>;
    topPages: Array<{ path: string; views: number; change: string }>;
    deviceStats: Array<{ device: string; percentage: number; sessions: string }>;
    realtimeVisitors: Array<{ page: string; visitors: number }>;
}

// Default mock data for fallback
const defaultData: AnalyticsData = {
    overview: {
        pageViews: "0",
        uniqueVisitors: "0",
        avgSession: "0m 0s",
        bounceRate: "0%",
        pageViewsChange: "0%",
        visitorsChange: "0%",
        sessionChange: "0%",
        bounceRateChange: "0%",
    },
    pageViews: [],
    trafficSources: [],
    hourlyTraffic: [],
    topPages: [],
    deviceStats: [],
    realtimeVisitors: [],
};

// Registrations by event category (this could also come from your database)
const registrationsByCategory = [
    { category: "Technical", count: 186, fill: "hsl(var(--primary))" },
    { category: "Cultural", count: 124, fill: "hsl(var(--chart-2))" },
    { category: "Sports", count: 78, fill: "hsl(var(--chart-3))" },
    { category: "Workshop", count: 45, fill: "hsl(var(--chart-4))" },
    { category: "Gaming", count: 23, fill: "hsl(var(--chart-5))" },
];

// Enhanced Custom Tooltip
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-4 min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-200">
                <p className="text-sm font-semibold mb-3 text-foreground border-b border-border/50 pb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-2.5 h-2.5 rounded-full" 
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-muted-foreground font-medium">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: entry.color }}>
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
const PieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-3 animate-in fade-in-0 zoom-in-95 duration-200">
                <p className="text-sm font-semibold mb-1">{data.name}</p>
                <p className="text-lg font-bold text-primary">{data.value}%</p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(defaultData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true);
                const response = await fetch("/api/admin/analytics");
                
                if (!response.ok) {
                    throw new Error("Failed to fetch analytics data");
                }

                const data = await response.json();
                setAnalyticsData(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching analytics:", err);
                setError(err instanceof Error ? err.message : "Failed to load analytics");
                // Use default/fallback data on error
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    // Transform data for display
    const overviewStats = [
        { title: "Page Views", value: analyticsData.overview.pageViews, change: analyticsData.overview.pageViewsChange, up: !analyticsData.overview.pageViewsChange.startsWith("-"), icon: Eye },
        { title: "Unique Visitors", value: analyticsData.overview.uniqueVisitors, change: analyticsData.overview.visitorsChange, up: !analyticsData.overview.visitorsChange.startsWith("-"), icon: Users },
        { title: "Avg. Session", value: analyticsData.overview.avgSession, change: analyticsData.overview.sessionChange, up: !analyticsData.overview.sessionChange.startsWith("-"), icon: Clock },
        { title: "Bounce Rate", value: analyticsData.overview.bounceRate, change: analyticsData.overview.bounceRateChange, up: !analyticsData.overview.bounceRateChange.startsWith("-"), icon: TrendingUp },
    ];

    const pageViewsData = analyticsData.pageViews.length > 0 
        ? analyticsData.pageViews 
        : Array.from({ length: 7 }, (_, i) => ({ day: "Mon", views: 0, visitors: 0 }));

    const trafficSources = analyticsData.trafficSources.length > 0 
        ? analyticsData.trafficSources 
        : [{ name: "No data", value: 100, color: "#666" }];

    const hourlyTraffic = analyticsData.hourlyTraffic.length > 0 
        ? analyticsData.hourlyTraffic 
        : Array.from({ length: 9 }, (_, i) => ({ hour: "0am", visitors: 0 }));

    const topPages = analyticsData.topPages.length > 0 
        ? analyticsData.topPages 
        : [{ path: "No data available", views: 0, change: "0%" }];

    const deviceStats = analyticsData.deviceStats.length > 0 
        ? analyticsData.deviceStats.map(stat => ({
            ...stat,
            icon: stat.device === "Desktop" ? Monitor : stat.device === "Mobile" ? Smartphone : Tablet,
        }))
        : [
            { device: "Desktop", icon: Monitor, percentage: 0, sessions: "0" },
            { device: "Mobile", icon: Smartphone, percentage: 0, sessions: "0" },
            { device: "Tablet", icon: Tablet, percentage: 0, sessions: "0" },
        ];

    const realtimeVisitors = analyticsData.realtimeVisitors.length > 0 
        ? analyticsData.realtimeVisitors 
        : [{ page: "No active visitors", visitors: 0 }];

    const totalRealtimeVisitors = realtimeVisitors.reduce((sum, v) => sum + v.visitors, 0);

    if (loading) {
        return (
            <div className="space-y-6 pb-8">
                <AdminPageHeader
                    title="Website Analytics"
                    subtitle="Analytics"
                    badge={
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-0 flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading...
                        </Badge>
                    }
                />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            <AdminPageHeader
                title="Website Analytics"
                subtitle="Analytics"
                badge={
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-0 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        {error ? "Using Mock Data" : "Live"}
                    </Badge>
                }
            />
            
            {error && (
                <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-400">
                            ⚠️ {error}. Displaying fallback data. Please configure Vercel Analytics API to see real data.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card 
                            key={stat.title} 
                            className="border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group animate-in fade-in slide-in-from-bottom-4"
                            style={{ 
                                animationDelay: `${index * 100}ms`,
                                animationFillMode: 'both'
                            }}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${stat.up ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                                        {stat.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">{stat.value}</p>
                                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Page Views Chart - Large */}
                <Card className="lg:col-span-2 border-border/40">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Traffic Overview</CardTitle>
                                <CardDescription>Page views and unique visitors (last 7 days)</CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-secondary/50">Weekly</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart 
                                    data={pageViewsData} 
                                    margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#dc2626" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#f97316" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--border))" 
                                        opacity={0.3}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="day"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value.toString()}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        name="Page Views"
                                        stroke="#dc2626"
                                        strokeWidth={2.5}
                                        fill="url(#colorViews)"
                                        activeDot={{ r: 5, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
                                        animationDuration={1000}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="visitors"
                                        name="Unique Visitors"
                                        stroke="#f97316"
                                        strokeWidth={2.5}
                                        fill="url(#colorVisitors)"
                                        activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-8 mt-6 text-sm">
                            <div className="flex items-center gap-2.5 group cursor-pointer">
                                <div className="h-3.5 w-3.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 group-hover:scale-125 transition-transform duration-200" />
                                <span className="text-muted-foreground font-medium">Page Views</span>
                            </div>
                            <div className="flex items-center gap-2.5 group cursor-pointer">
                                <div className="h-3.5 w-3.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 group-hover:scale-125 transition-transform duration-200" />
                                <span className="text-muted-foreground font-medium">Unique Visitors</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Traffic Sources Pie Chart */}
                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-4 w-4 text-primary" />
                            Traffic Sources
                        </CardTitle>
                        <CardDescription>Where visitors come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[240px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trafficSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={800}
                                    >
                                        {trafficSources.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color}
                                                stroke="hsl(var(--card))"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {trafficSources.reduce((sum, s) => sum + (s.value || 0), 0) > 0 
                                        ? `${Math.round(trafficSources.reduce((sum, s) => sum + (s.value || 0), 0) / 10)}K`
                                        : '0K'}
                                </span>
                                <span className="text-xs text-muted-foreground font-medium mt-1">Total Visits</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            {trafficSources.map((source, index) => (
                                <div 
                                    key={source.name} 
                                    className="flex items-center gap-2.5 text-sm p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-200 group cursor-pointer"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div 
                                        className="w-3 h-3 rounded-full shadow-sm transition-transform duration-200 group-hover:scale-125" 
                                        style={{ backgroundColor: source.color, boxShadow: `0 0 8px ${source.color}40` }}
                                    />
                                    <span className="text-muted-foreground font-medium flex-1">{source.name}</span>
                                    <span className="font-bold text-foreground">{source.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Registrations by Category */}
                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            Registrations by Category
                        </CardTitle>
                        <CardDescription>Total registrations per event category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={registrationsByCategory} 
                                    layout="vertical" 
                                    margin={{ top: 5, right: 25, left: 5, bottom: 5 }}
                                >
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--border))" 
                                        opacity={0.3} 
                                        horizontal={false}
                                        vertical={false}
                                    />
                                    <XAxis 
                                        type="number" 
                                        stroke="hsl(var(--muted-foreground))" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="category"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={90}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickMargin={10}
                                    />
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        radius={[0, 8, 8, 0]}
                                        animationDuration={1200}
                                        animationBegin={0}
                                    >
                                        {registrationsByCategory.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.fill}
                                                stroke="hsl(var(--card))"
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Hourly Traffic */}
                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Today&apos;s Traffic
                        </CardTitle>
                        <CardDescription>Visitors by hour of day</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart 
                                    data={hourlyTraffic} 
                                    margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke="hsl(var(--border))" 
                                        opacity={0.3}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="hour"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                        tickMargin={10}
                                    />
                                    <Tooltip 
                                        content={<CustomTooltip />}
                                        cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.5 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="visitors"
                                        name="Visitors"
                                        stroke="#22c55e"
                                        strokeWidth={3}
                                        dot={{ 
                                            fill: '#22c55e', 
                                            strokeWidth: 2, 
                                            stroke: '#fff',
                                            r: 4,
                                            className: 'drop-shadow-sm'
                                        }}
                                        activeDot={{ 
                                            r: 6, 
                                            fill: '#22c55e',
                                            strokeWidth: 3,
                                            stroke: '#fff',
                                            className: 'drop-shadow-md'
                                        }}
                                        animationDuration={1000}
                                        animationBegin={0}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="visitors"
                                        stroke="none"
                                        fill="url(#lineGradient)"
                                        animationDuration={1000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="pages" className="space-y-6">
                <TabsList className="bg-secondary/30 border border-border/40">
                    <TabsTrigger value="pages">Top Pages</TabsTrigger>
                    <TabsTrigger value="devices">Devices</TabsTrigger>
                    <TabsTrigger value="realtime">Real-time</TabsTrigger>
                </TabsList>

                {/* Top Pages */}
                <TabsContent value="pages">
                    <Card className="border-border/40">
                        <CardHeader>
                            <CardTitle className="text-lg">Top Pages</CardTitle>
                            <CardDescription>Most visited pages on your website</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/40">
                                {topPages.map((page, index) => (
                                    <div key={page.path} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                                            <div>
                                                <p className="font-medium">{page.path}</p>
                                                <p className="text-sm text-muted-foreground">{page.views.toLocaleString()} views</p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={page.change.startsWith("+")
                                                ? "bg-emerald-500/10 text-emerald-400 border-0"
                                                : "bg-red-500/10 text-red-400 border-0"
                                            }
                                        >
                                            {page.change.startsWith("+") ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                                            {page.change}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Devices */}
                <TabsContent value="devices">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {deviceStats.map((device) => {
                            const Icon = device.icon;
                            return (
                                <Card key={device.device} className="border-border/40">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <span className="text-3xl font-bold">{device.percentage}%</span>
                                        </div>
                                        <h3 className="font-semibold text-lg">{device.device}</h3>
                                        <p className="text-sm text-muted-foreground">{device.sessions} sessions</p>
                                        <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
                                                style={{ width: `${device.percentage}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Real-time */}
                <TabsContent value="realtime">
                    <Card className="border-border/40">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Real-time Visitors</CardTitle>
                                    <CardDescription>Active users on your website right now</CardDescription>
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-0 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    {totalRealtimeVisitors} online
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/40">
                                {realtimeVisitors.map((visitor) => (
                                    <div key={visitor.page} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="font-medium">{visitor.page}</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-secondary/50">
                                            {visitor.visitors} visitors
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
