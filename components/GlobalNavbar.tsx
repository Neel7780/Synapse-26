"use client";

import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { useNavigationState } from "@/lib/useNavigationState";

import { usePathname } from "next/navigation";

export default function GlobalNavbar() {
    const { isNavbarVisible } = useNavigationState();
    const pathname = usePathname();

    if (pathname?.startsWith("/admin") || pathname?.startsWith("/auth")) return null;

    return (
        <Navbar visible={isNavbarVisible}>
            <NavigationPanel />
        </Navbar>
    );
}
