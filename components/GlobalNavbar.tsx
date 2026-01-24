"use client";

import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { useNavigationState } from "@/lib/useNavigationState";

export default function GlobalNavbar() {
    const { isNavbarVisible } = useNavigationState();

    return (
        <Navbar visible={isNavbarVisible}>
            <NavigationPanel />
        </Navbar>
    );
}
