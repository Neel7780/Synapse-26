"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/* types */

interface Event {
  name: string
  time: string
  venue: string
}

interface DaySchedule {
  day: number
  events: Event[]
}

/* data */

const schedule: DaySchedule[] = [
  {
    day: 1,
    events: [
      { name: "Battledrome", time: "9:00 AM - 10:30 AM", venue: "Main Hall A" },
      { name: "Workshop: Introduction to GSAP", time: "11:00 AM - 12:30 PM", venue: "Room 203" },
      { name: "Lunch Break", time: "12:30 PM - 2:00 PM", venue: "Cafeteria" },
    ],
  },
  {
    day: 2,
    events: [
      { name: "Battledrome", time: "7:00 AM - 8:00 AM", venue: "Rooftop Garden" },
      { name: "Technical Deep Dive", time: "9:00 AM - 11:00 AM", venue: "Lab 101" },
      { name: "Innovation Showcase", time: "11:30 AM - 1:00 PM", venue: "Exhibition Hall" },
    ],
  },
  {
    day: 3,
    events: [
      { name: "Battledrome", time: "8:00 AM - 9:00 AM", venue: "Café Lounge" },
      { name: "Advanced Workshop", time: "9:30 AM - 11:30 AM", venue: "Studio 5" },
      { name: "Q&A Session", time: "12:00 PM - 1:00 PM", venue: "Auditorium" },
    ],
  },
]

/* component */

export default function TimelineContent() {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // 1️⃣ Kill any existing triggers (important on route change)
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // 2️⃣ Let the browser finish layout + images
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {

        sectionsRef.current.forEach((section) => {
          if (!section) return;

          gsap.fromTo(
            section,
            { opacity: 0, y: 120 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 90%",
                scrub: 1,
              },
            }
          );
        });

        // 3️⃣ Force GSAP to recalc everything
        ScrollTrigger.refresh();
      });
    });

    // 4️⃣ Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images_timeline/bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* header */}
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-32 text-center">
          <h1
            className={`text-4xl md:text-9xl mb-4 tracking-wide text-white font-joker`}>
            timeline
          </h1>
        </div>

        {/* timeline */}
        <div className="space-y-40 pb-32">
          {schedule.map((daySchedule, index) => (
            <div
              key={daySchedule.day}
              ref={(el) => {
                sectionsRef.current[index] = el
              }}
              className="max-w-7xl mx-auto px-4 space-y-12"
            >
              {/* Day heading (Joker) */}
              <h2
                className={`text-[72px] md:text-[100px] lg:text-[120px] 
                            font-normal text-center leading-none tracking-wide 
                            text-red-600 font-joker`}
              >
                day {daySchedule.day}
              </h2>

              {/* Table (Roboto) */}
              <table
                className={`w-full table-fixed bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden font-roboto`}
              >
                <thead>
                  <tr>
                    <th className="text-center py-4 px-4 md:px-8 text-sm font-semibold uppercase tracking-wide text-white/70">
                      Event
                    </th>
                    <th className="text-center py-4 px-4 md:px-8 text-sm font-semibold uppercase tracking-wide text-white/70">
                      Time
                    </th>
                    <th className="text-center py-4 px-4 md:px-8 text-sm font-semibold uppercase tracking-wide text-white/70">
                      Venue
                    </th>
                  </tr>
                </thead>

                <tbody className="text-lg">
                  {daySchedule.events.map((event, i) => (
                    <tr
                      key={i}
                      className="hover:bg-white/10 transition-colors"
                    >
                      <td className="py-5 px-4 md:px-8 text-2xl text-center font-medium text-white">
                        {event.name}
                      </td>
                      <td className="py-5 px-4 md:px-8 text-2xl text-center text-white/80">
                        {event.time}
                      </td>
                      <td className="py-5 px-4 md:px-8 text-2xl text-center text-white/80">
                        {event.venue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
