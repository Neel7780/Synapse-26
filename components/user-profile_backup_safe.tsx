"use client";

import { useEffect, useRef } from "react";
import { Roboto } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* font  */

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const pClass = roboto.className;

/*  static data  */

const userDetails = {
  firstName: "Alex",
  lastName: "Johnson",
  phone: "+01 123-456-7890",
  dateOfBirth: "March 15, 1998",
  gender: "Male",
  university: "DAIICT",
  email: "202601111@dau.ac.in",
};

const registeredEvents = [
  {
    id: 1,
    name: "Tech Summit 2024",
    category: "Business",
    status: "Registered",
  },
  {
    id: 2,
    name: "AI & Machine Learning Conference",
    category: "Technology",
    status: "Form Incomplete",
  },
  {
    id: 3,
    name: "User-experience Workshop",
    category: "Design",
    status: "Registered",
  },
];

const hasAccommodation = true;

/*  component  */

export default function UserProfile() {
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileRef.current) return;

    const leftColumn = profileRef.current.querySelector(".left-column");
    const rightColumn = profileRef.current.querySelector(".right-column");
    const detailItems = profileRef.current.querySelectorAll(".detail-item");
    const eventCards = profileRef.current.querySelectorAll(".event-card");
    const accommodationSection = profileRef.current.querySelector(
      ".accommodation-section"
    );

    gsap.fromTo(
      leftColumn,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1, delay: 0.2 }
    );
    gsap.fromTo(
      rightColumn,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 1, delay: 0.4 }
    );

    detailItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, delay: 0.8 + i * 0.1 }
      );
    });

    eventCards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, delay: 1.2 + i * 0.1 }
      );
    });

    if (accommodationSection) {
      gsap.fromTo(
        accommodationSection,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, delay: 1.8 }
      );
    }
  }, []);

  return (
    <div ref={profileRef} className="min-h-[100dvh] bg-background py-12 px-4 md:py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <button className="group relative -left-4 inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-all-ml-5">
          <ArrowLeft className="w-13 h-13 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="left-column">
          <h2 className="text-4xl font-bold mb-6">Profile</h2>

          <div className="space-y-4">
            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="detail-item p-3 border border-white">
                <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                  First Name
                </p>
                <p className={`text-base font-semibold ${pClass}`}>
                  {userDetails.firstName}
                </p>
              </div>
              <div className="detail-item p-3 border border-white">
                <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                  Last Name
                </p>
                <p className={`text-base font-semibold ${pClass}`}>
                  {userDetails.lastName}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="detail-item p-3 border border-white">
              <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                Phone Number
              </p>
              <p className={`text-base font-semibold ${pClass}`}>
                {userDetails.phone}
              </p>
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="detail-item p-3 border border-white">
                <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                  Date of Birth
                </p>
                <p className={`text-base font-semibold ${pClass}`}>
                  {userDetails.dateOfBirth}
                </p>
              </div>
              <div className="detail-item p-3 border border-white">
                <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                  Gender
                </p>
                <p className={`text-base font-semibold ${pClass}`}>
                  {userDetails.gender}
                </p>
              </div>
            </div>

            {/* University */}
            <div className="detail-item p-3 border border-white">
              <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                College
              </p>
              <p className={`text-base font-semibold ${pClass}`}>
                {userDetails.university}
              </p>
            </div>

            {/* Email */}
            <div className="detail-item p-3 border border-white">
              <p className={`text-xs text-muted-foreground mb-1 ${pClass}`}>
                Email Address
              </p>
              <p className={`text-base font-semibold break-all ${pClass}`}>
                {userDetails.email}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column space-y-8">
          {/* events */}
          <div>
            <h2 className="text-4xl font-bold mb-6">Registered Events</h2>
            <div className="space-y-4">
              {registeredEvents.map((event) => (
                <div
                  key={event.id}
                  className="event-card p-4 border border-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold leading-tight">
                      {event.name}
                    </h3>

                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                        event.status === "Registered"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-orange-500/20 text-orange-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <p className={`mt-2 text-sm ${pClass}`}>{event.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* accommodation */}
          <div className="accommodation-section">
            <h2 className="text-4xl font-bold mb-6">Accommodation</h2>

            <div className="p-4 border border-white flex items-center justify-between gap-4">
              <p className={`text-base font-semibold ${pClass}`}>
                2 days accommodation
              </p>

              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  hasAccommodation
                    ? "bg-green-500/20 text-green-400"
                    : "bg-orange-500/20 text-orange-400"
                }`}
              >
                {hasAccommodation ? "Registered" : "Unregistered"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useRef, useState, useEffect, useCallback } from "react";
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { useGSAP } from '@gsap/react';

// gsap.registerPlugin(ScrollTrigger);

// export default function HallOfFame() {
//     const hallContainerRef = useRef<HTMLDivElement>(null);
//     const [scaleFactorsX, setscaleFactorsX] = useState({ mobile: 5, tablet: 6, desktop: 2 });
//     const [scaleFactorsY, setscaleFactorsY] = useState({ mobile: 5, tablet: 6, desktop: 2 });
//     const hallRef = useRef<Array<HTMLDivElement | null>>([]);
//     const scrollIndicatorRef = useRef(null);
//     const fontIndicatorRef = useRef(null);
//     const gridItemsRef = useRef<(HTMLDivElement | null)[]>([]);

//     useEffect(() => {
//         const calculateScaleFactors = () => {
//             const width = window.innerWidth;
//             const height = window.innerHeight;

//             if (width < 768) {
//                 const cellWidth = (width - 16) / 3;
//                 const cellHeight = (height - 16) / 3;

//                 const scaleX = width / cellWidth;
//                 const scaleY = height / cellHeight;

//                 setscaleFactorsX(prev => {
//                     const next = { ...prev, mobile: scaleX };
//                     return next;
//                 });
//                 setscaleFactorsY(prev => {
//                     const next = { ...prev, mobile: scaleY };
//                     return next;
//                 });
//             }
//             else if (width < 1024) {
//                 const cellWidth = (width - 24) / 5;
//                 const cellHeight = (height - 24) / 4;

//                 const heroWidth = cellWidth * 3;
//                 const heroHeight = cellHeight * 2;

//                 const scaleX = width / heroWidth;
//                 const scaleY = height / heroHeight;

//                 setscaleFactorsX(prev => ({ ...prev, tablet: scaleX }));
//                 setscaleFactorsY(prev => ({ ...prev, tablet: scaleY }));
//             }
//             else {
//                 const cellWidth = (width - 32) / 6;
//                 const cellHeight = (height - 32) / 4;

//                 const heroWidth = cellWidth * 2;
//                 const heroHeight = cellHeight * 2;

//                 const scaleX = width / heroWidth;
//                 const scaleY = height / heroHeight;

//                 setscaleFactorsX(prev => ({ ...prev, desktop: scaleX }));
//                 setscaleFactorsY(prev => ({ ...prev, desktop: scaleY }));
//             }
//         };

//         calculateScaleFactors();
//         window.addEventListener('resize', calculateScaleFactors);

//         return () => {
//             window.removeEventListener('resize', calculateScaleFactors);
//         };
//     }, []);

//     useEffect(() => {
//         console.log("UPDATED scaleFactorsX:", scaleFactorsX);
//     }, [scaleFactorsX]);

//     useEffect(() => {
//         console.log("UPDATED scaleFactorsY:", scaleFactorsY);
//     }, [scaleFactorsY]);

//     const setGridItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
//         gridItemsRef.current[index] = el;
//     }, []);

//     const gridImages = [
//         // Row 1 (Top)
//         {
//             src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
//             alt: 'Concert crowd',
//             gridPosition: { col: 0, row: 0 },
//             colSpan: 2,
//             rowSpan: 1,
//             startX: -500,
//             startY: -400,
//             delay: 0.05,
//             mobileCol: 0,
//             mobileRow: 0,
//             mobileColSpan: 2,
//             tabletCol: 0,
//             tabletRow: 0,
//             tabletColSpan: 2,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
//             alt: 'Festival crowd energy',
//             gridPosition: { col: 2, row: 0 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 0,
//             startY: -450,
//             delay: 0.07,
//             mobileHidden: true,
//             tabletCol: 2,
//             tabletRow: 0,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400',
//             alt: 'Festival vibes',
//             gridPosition: { col: 3, row: 0 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 100,
//             startY: -450,
//             delay: 0.09,
//             mobileHidden: true,
//             tabletCol: 3,
//             tabletRow: 0,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
//             alt: 'Festival friends',
//             gridPosition: { col: 4, row: 0 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 200,
//             startY: -400,
//             delay: 0.1,
//             mobileCol: 2,
//             mobileRow: 0,
//             mobileColSpan: 1,
//             tabletCol: 4,
//             tabletRow: 0,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=400',
//             alt: 'Concert energy',
//             gridPosition: { col: 5, row: 0 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 600,
//             startY: -400,
//             delay: 0.11,
//             mobileHidden: true,
//             tabletHidden: true,
//         },

//         // Row 2
//         {
//             src: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
//             alt: 'Dancers',
//             gridPosition: { col: 0, row: 1 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: -600,
//             startY: -50,
//             delay: 0.12,
//             mobileCol: 0,
//             mobileRow: 1,
//             mobileColSpan: 1,
//             tabletCol: 0,
//             tabletRow: 1,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
//             alt: 'Concert lights',
//             gridPosition: { col: 5, row: 1 },
//             colSpan: 1,
//             rowSpan: 2,
//             startX: 600,
//             startY: 0,
//             delay: 0.14,
//             mobileCol: 2,
//             mobileRow: 1,
//             mobileColSpan: 1,
//             tabletCol: 4,
//             tabletRow: 1,
//             tabletRowSpan: 2,
//         },

//         // Row 3
//         {
//             src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
//             alt: 'Stage show',
//             gridPosition: { col: 0, row: 2 },
//             colSpan: 1,
//             startX: -600,
//             startY: 50,
//             delay: 0.16,
//             mobileCol: 0,
//             mobileRow: 2,
//             mobileColSpan: 1,
//             tabletCol: 0,
//             tabletRow: 2,
//             tabletRowSpan: 2,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400',
//             alt: 'Fireworks',
//             gridPosition: { col: 1, row: 1 },
//             colSpan: 1,
//             rowSpan: 2,
//             startX: -400,
//             startY: 100,
//             delay: 0.17,
//             mobileHidden: true,
//             tabletCol: 1,
//             tabletRow: 2,
//             tabletHidden: true,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
//             alt: 'Festival food',
//             gridPosition: { col: 4, row: 1 },
//             colSpan: 1,
//             rowSpan: 2,
//             startX: 400,
//             startY: 100,
//             delay: 0.18,
//             mobileHidden: true,
//             tabletCol: 3,
//             tabletRow: 1,
//             tabletHidden: true,
//         },

//         // Row 4 (Bottom)
//         {
//             src: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
//             alt: 'Festival lights',
//             gridPosition: { col: 0, row: 3 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: -600,
//             startY: 400,
//             delay: 0.19,
//             mobileHidden: true,
//             tabletHidden: true,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400',
//             alt: 'Festival art',
//             gridPosition: { col: 1, row: 3 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: -400,
//             startY: 400,
//             delay: 0.2,
//             mobileCol: 1,
//             mobileRow: 2,
//             mobileColSpan: 1,
//             tabletCol: 1,
//             tabletRow: 3,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
//             alt: 'Art gallery',
//             gridPosition: { col: 2, row: 3 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: -200,
//             startY: 450,
//             delay: 0.22,
//             mobileHidden: true,
//             tabletCol: 2,
//             tabletRow: 3,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=400',
//             alt: 'Live music',
//             gridPosition: { col: 3, row: 3 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 200,
//             startY: 450,
//             delay: 0.24,
//             mobileHidden: true,
//             tabletCol: 3,
//             tabletRow: 3,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
//             alt: 'Festival stage',
//             gridPosition: { col: 4, row: 3 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 400,
//             startY: 400,
//             delay: 0.25,
//             mobileHidden: true,
//             tabletCol: 4,
//             tabletRow: 3,
//         },
//         {
//             src: 'https://images.unsplash.com/photo-1549451371-64aa98a6f660?w=400',
//             alt: 'Festival sunset',
//             gridPosition: { col: 5, row: 3 },
//             colSpan: 1,
//             rowSpan: 1,
//             startX: 600,
//             startY: 400,
//             delay: 0.26,
//             mobileCol: 2,
//             mobileRow: 2,
//             mobileColSpan: 1,
//             tabletHidden: true,
//         },
//     ];
//     // HERO — force start state

//     hallRef.current.forEach(el => {
//         if (!el) return;
//         gsap.set(el, {
//             scaleX: window.innerWidth < 768 ? scaleFactorsX.mobile :
//                 window.innerWidth < 1024 ? scaleFactorsX.tablet :
//                     scaleFactorsX.desktop,
//             scaleY: window.innerWidth < 768 ? scaleFactorsY.mobile :
//                 window.innerWidth < 1024 ? scaleFactorsY.tablet :
//                     scaleFactorsY.desktop,
//             borderRadius: 0,
//         });
//     });

//     useGSAP(() => {
//         if (!hallContainerRef.current) return;

//         // Set up ScrollTrigger
//         ScrollTrigger.create({
//             trigger: hallContainerRef.current,
//             start: "top top",
//             end: "+=100%",       // EXACTLY 3 viewports
//             scrub: true,
//             pin: true,
//             pinSpacing: true,
//             anticipatePin: 1,
//             onUpdate: (self) => {
//                 const progress = self.progress;

//                 if (hallRef.current) {
//                     const width = window.innerWidth;
//                     let scaleX = 1;
//                     let scaleY = 1;
//                     let borderRadius = 0;
//                     const t = gsap.utils.clamp(0, 1, progress / 0.6);
//                     const eased = gsap.parseEase("power2.out")(t);

//                     if (width < 768) {
//                         scaleX = gsap.utils.interpolate(scaleFactorsX.mobile, 1, eased);
//                         scaleY = gsap.utils.interpolate(scaleFactorsY.mobile, 1, eased);
//                         borderRadius = gsap.utils.interpolate(0, 16, Math.min(progress * 2, 1));
//                     } else if (width < 1024) {
//                         scaleX = gsap.utils.interpolate(scaleFactorsX.tablet, 1, eased);
//                         scaleY = gsap.utils.interpolate(scaleFactorsY.tablet, 1, eased);
//                         borderRadius = gsap.utils.interpolate(0, 16, Math.min(progress * 2, 1));
//                     } else {
//                         scaleX = gsap.utils.interpolate(scaleFactorsX.desktop, 1, eased);
//                         scaleY = gsap.utils.interpolate(scaleFactorsY.desktop, 1, eased);
//                         borderRadius = gsap.utils.interpolate(0, 16, Math.min(progress * 2, 1));
//                     }

//                     gsap.set(hallRef.current, {
//                         scaleX: scaleX,
//                         scaleY: scaleY,
//                         borderRadius: borderRadius + 'px'
//                     });
//                 }

//                 // Scroll indicator opacity
//                 if (scrollIndicatorRef.current) {
//                     const opacity = gsap.utils.clamp(0, 1, 1 - (progress / 0.15));
//                     gsap.set(scrollIndicatorRef.current, { opacity: opacity });
//                 }

//                 // Font indicator opacity
//                 if (fontIndicatorRef.current) {
//                     const opacity = gsap.utils.clamp(0, 1, 1 - (progress / 0.4));
//                     gsap.set(fontIndicatorRef.current, { opacity: opacity });
//                 }

//                 // Grid items animation
//                 gridItemsRef.current.forEach((item, index) => {
//                     if (!item) return;

//                     const image = gridImages[index];
//                     if (!image) return;

//                     const startProgress = image.delay;
//                     const moveEndProgress = startProgress + 0.55;
//                     const opacityEndProgress = startProgress + 0.25;
//                     const scaleEndProgress = startProgress + 0.45;

//                     if (progress >= startProgress) {
//                         // Position animation
//                         const moveProgress = gsap.utils.clamp(0, 1, (progress - startProgress) / 0.55);
//                         const x = gsap.utils.interpolate(image.startX, 0, moveProgress);
//                         const y = gsap.utils.interpolate(image.startY, 0, moveProgress);

//                         // Opacity animation
//                         const opacityProgress = gsap.utils.clamp(0, 1, (progress - startProgress) / 0.25);
//                         const opacity = gsap.utils.interpolate(0, 1, opacityProgress);

//                         // Scale animation
//                         const scaleProgress = gsap.utils.clamp(0, 1, (progress - startProgress) / 0.45);
//                         const scale = gsap.utils.interpolate(0.4, 1, scaleProgress);

//                         gsap.set(item, {
//                             x: x,
//                             y: y,
//                             opacity: opacity,
//                             scale: scale
//                         });
//                     } else {
//                         gsap.set(item, {
//                             x: image.startX,
//                             y: image.startY,
//                             opacity: 0,
//                             scale: 0.4
//                         });
//                     }
//                 });
//             }
//         });
//         // INDICATORS

//         // Initialize grid items in starting position
//         gridImages.forEach((image, index) => {
//             const item = gridItemsRef.current[index];
//             if (item) {
//                 gsap.set(item, {
//                     x: image.startX,
//                     y: image.startY,
//                     opacity: 0,
//                     scale: 0.4
//                 });
//             }
//         });

//     }, { scope: hallContainerRef });

//     return (
//         <div className="relative w-full bg-black">
//             <div ref={hallContainerRef} className="relative">
//                 <div className="h-[100dvh] w-full bg-black">
//                     {/* Mobile Grid (3x3) */}
//                     <div className="md:hidden absolute inset-0 flex items-center justify-center p-2">
//                         <div
//                             className="relative w-full h-full grid gap-1"
//                             style={{
//                                 gridTemplateColumns: 'repeat(3, 1fr)',
//                                 gridTemplateRows: 'repeat(3, 1fr)',
//                             }}
//                         >
//                             {gridImages.map((image, index) => {
//                                 if (image.mobileHidden) return null;

//                                 return (
//                                     <div
//                                         key={`mobile-${index}`}
//                                         ref={setGridItemRef(index)}
//                                         className="rounded-lg overflow-hidden shadow-2xl"
//                                         style={{
//                                             gridColumn: `${(image.mobileCol ?? image.gridPosition.col) + 1} / span ${image.mobileColSpan ?? 1}`,
//                                             gridRow: `${(image.mobileRow ?? image.gridPosition.row) + 1} / span 1`,
//                                         }}
//                                     >
//                                         <img
//                                             src={image.src}
//                                             alt={image.alt}
//                                             className="w-full h-full object-cover"
//                                         />
//                                     </div>
//                                 );
//                             })}

//                             {/* Mobile Hero */}
//                             <div ref={(el) => { hallRef.current[0] = el; }}
//                                 className="overflow-hidden will-change-transform shadow-2xl z-10 rounded-lg"
//                                 style={{
//                                     gridColumn: '2 / 3',
//                                     gridRow: '2 / 3',
//                                     transformOrigin: 'center center',
//                                 }}
//                             >
//                                 <img
//                                     src="/images_home/HallOfFame.png"
//                                     alt="Hall of Fame"
//                                     className="w-full h-full object-cover"
//                                 />
//                                 <span ref={fontIndicatorRef} className="absolute bottom-5 text-xl text-center w-full z-5 font-white font-joker">hall of fame</span>
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Tablet Grid (5x4) */}
//                     <div className="hidden md:flex lg:hidden absolute inset-0 items-center justify-center p-3">
//                         <div
//                             className="relative grid gap-2 w-full h-full"
//                             style={{
//                                 gridTemplateColumns: 'repeat(5, 1fr)',
//                                 gridTemplateRows: 'repeat(4, 1fr)',
//                             }}
//                         >
//                             {gridImages.map((image, index) => {
//                                 if (image.tabletHidden) return null;

//                                 return (
//                                     <div
//                                         key={`tablet-${index}`}
//                                         ref={setGridItemRef(index)}
//                                         className="rounded-xl overflow-hidden shadow-2xl"
//                                         style={{
//                                             gridColumn: `${(image.tabletCol ?? image.gridPosition.col) + 1} / span ${image.tabletColSpan ?? image.colSpan ?? 1}`,
//                                             gridRow: `${(image.tabletRow ?? image.gridPosition.row) + 1} / span ${image.tabletRowSpan ?? image.rowSpan ?? 1}`,
//                                         }}
//                                     >
//                                         <img
//                                             src={image.src}
//                                             alt={image.alt}
//                                             className="w-full h-full object-cover"
//                                         />
//                                     </div>
//                                 );
//                             })}

//                             {/* Tablet Hero - Spans 2x2 center */}
//                             <div ref={(el) => { hallRef.current[1] = el; }}
//                                 className="overflow-hidden will-change-transform shadow-2xl z-10 rounded-xl"
//                                 style={{
//                                     gridColumn: '2 / 5',
//                                     gridRow: '2 / 4',
//                                     transformOrigin: 'center center',
//                                 }}
//                             >
//                                 <img
//                                     src="/images_home/HallOfFame.png"
//                                     alt="Hall of Fame"
//                                     className="w-full h-full object-cover"
//                                 />
//                                 <span ref={fontIndicatorRef} className="absolute bottom-5 text-5xl text-center w-full z-5 font-white font-joker">hall of fame</span>
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Desktop Grid (6x4) */}
//                     <div className="hidden lg:flex absolute inset-0 items-center justify-center p-4">
//                         <div
//                             className="relative grid gap-3 w-full h-full"
//                             style={{
//                                 gridTemplateColumns: 'repeat(6, 1fr)',
//                                 gridTemplateRows: 'repeat(4, 1fr)',
//                             }}
//                         >
//                             {gridImages.map((image, index) => {
//                                 return (
//                                     <div
//                                         key={`desktop-${index}`}
//                                         ref={setGridItemRef(index)}
//                                         className="rounded-xl overflow-hidden shadow-2xl"
//                                         style={{
//                                             gridColumn: `${image.gridPosition.col + 1} / span ${image.colSpan ?? 1}`,
//                                             gridRow: `${image.gridPosition.row + 1} / span ${image.rowSpan ?? 1}`,
//                                         }}
//                                     >
//                                         <img
//                                             src={image.src}
//                                             alt={image.alt}
//                                             className="w-full h-full object-cover"
//                                         />
//                                     </div>
//                                 );
//                             })}

//                             {/* Desktop Hero - Spans 2x2 center */}
//                             <div ref={(el) => { hallRef.current[2] = el; }}
//                                 className="overflow-hidden relative will-change-transform shadow-2xl z-10 rounded-xl"
//                                 style={{
//                                     gridColumn: '3 / 5',
//                                     gridRow: '2 / 4',
//                                     transformOrigin: 'center center',
//                                 }}
//                             >
//                                 <img
//                                     src="/images_home/HallOfFame.png"
//                                     alt="Hall of Fame"
//                                     className="w-full h-full object-cover"
//                                 />
//                                 <span ref={fontIndicatorRef} className="absolute bottom-5 text-5xl text-center w-full z-5 font-white font-joker">hall of fame</span>
//                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Scroll indicator */}
//                     <div
//                         ref={scrollIndicatorRef}
//                         className="absolute top-30 right-2 sm:right-10 flex flex-col items-center gap-2 text-white z-20"
//                     >
//                         <span className="text-xl md:text-3xl tracking-widest uppercase font-jqka">Scroll to explore</span>
//                     </div>
//                 </div>
//             </div>
//             <div className="relative w-full overflow-hidden py-5 mb-5 bg-black">
//                 <div className="flex w-max animate-marquee">
//                     <span className="font-jqka uppercase text-3xl whitespace-nowrap">
//                         Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm •
//                     </span>
//                     <span className="font-jqka uppercase text-3xl whitespace-nowrap">
//                         Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm •
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }
