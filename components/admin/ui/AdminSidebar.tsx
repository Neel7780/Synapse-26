"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Music,
  Mic2,
  ShoppingBag,
  Building2,
  Tag,
  LogOut,
  Settings,
  BarChart3,
  ChevronUp,
  CreditCard,
} from "lucide-react";

// Navigation configuration
const navSections = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Event Management",
    items: [
      { href: "/admin/events", label: "Events", icon: Calendar },
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/registrations", label: "Registrations", icon: Ticket },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/concerts", label: "Concerts", icon: Music },
      { href: "/admin/artists", label: "Artists", icon: Mic2 },
      { href: "/admin/sponsors", label: "Sponsors", icon: Building2 },
    ],
  },
  {
    title: "Commerce",
    items: [
      { href: "/admin/merchandise", label: "Merchandise", icon: ShoppingBag },
      {
        href: "/admin/accommodation",
        label: "Accommodation",
        icon: CreditCard,
      },
    ],
  },
];

function AdminSidebarContent() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminEmail");
      router.push("/admin/login");
      router.refresh();
    }
  };

  // Get admin email from localStorage
  const adminEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("adminEmail") || "admin@synapse.in"
      : "admin@synapse.in";

  return (
    <>
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <img
            src="/Synapse Logo.png"
            alt="Synapse Logo"
            className="h-10 w-10 rounded-xl object-contain"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-sidebar-foreground">
              Synapse
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Admin Panel
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#666 #1a1a1a" }}
      >
        <SidebarContent>
          {navSections.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase tracking-wider text-[10px] font-semibold">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={
                            isActive
                              ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary"
                              : "hover:bg-sidebar-accent/50"
                          }
                        >
                          <Link href={item.href}>
                            <Icon
                              className={isActive ? "text-sidebar-primary" : ""}
                            />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </div>

      {/* Footer with User Menu */}
      <SidebarFooter>
        <Separator className="bg-sidebar-border" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                >
                  <Avatar className="h-8 w-8 rounded-lg bg-sidebar-primary">
                    <AvatarFallback className="bg-sidebar-primary text-white rounded-lg">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">Admin User</span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {adminEmail}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-xl bg-card border-border"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">
                      {adminEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <AdminSidebarContent />
    </Sidebar>
  );
}

// Page header component
interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {subtitle && (
          <p className="text-sm font-semibold uppercase tracking-wide text-primary mb-1">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {title}
          </h1>
          {badge}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

// Header with sidebar trigger
function AdminHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card/50 backdrop-blur px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6 bg-border" />
      <div className="flex-1">
        <h2 className="text-sm font-medium text-muted-foreground">
          Synapse &apos;26 Admin
        </h2>
      </div>
    </header>
  );
}

export { AdminHeader, SidebarProvider, SidebarTrigger };
