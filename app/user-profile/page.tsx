"use client";

import gsap from "gsap";
import UserProfile from "@/components/user-profile";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
const normalizeScroll = () => {
  ScrollTrigger.normalizeScroll({
    allowNestedScroll: true,
  });
};
export default function UserProfilePage() {
  useEffect(() => {
    normalizeScroll();
  }, []);
  return (
    <>
      <UserProfile />
    </>
  );
}
