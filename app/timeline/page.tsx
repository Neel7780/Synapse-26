"use client";

import React from "react";
import Timeline from "@/components/timeline";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";

import { useNavigationState } from "@/lib/useNavigationState";
import { useEffect } from "react";

export default function page() {
  //   const { endTransition } = useNavigationState();
  //   useEffect(() => {
  //     endTransition();
  //   }, []);
  return (
    <div>
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      <div>
        <Timeline />
      </div>
      <Footer />
    </div>
  );
}
