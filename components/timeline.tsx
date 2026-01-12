"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/* =======================
   TYPES
======================= */

interface Event {
  name: string
  time: string
  venue: string
}

interface DaySchedule {
  day: number
  events: Event[]
}

/* =======================
   DATA
======================= */

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

/* =======================
   COMPONENT
======================= */

export default function TimelineContent() {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    ScrollTrigger.getAll().forEach((t) => t.kill())

    requestAnimationFrame(() => {
      sectionsRef.current.forEach((section) => {
        if (!section) return

        gsap.fromTo(
          section,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              scrub: 1,
            },
          }
        )
      })

      ScrollTrigger.refresh()
    })

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images_timeline/bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 pt-14 md:pt-24 pb-16 md:pb-32 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-9xl tracking-wide text-white font-joker">
            timeline
          </h1>
        </div>

        {/* Timeline */}
        <div className="space-y-20 sm:space-y-24 md:space-y-40 pb-20 md:pb-32">
          {schedule.map((daySchedule, index) => (
            <div
              key={daySchedule.day}
              ref={(el) => {
                sectionsRef.current[index] = el
              }}
              className="max-w-7xl mx-auto px-3 sm:px-4 space-y-6 md:space-y-12"
            >
              {/* Day heading */}
              <h2 className="text-4xl sm:text-5xl md:text-[100px] lg:text-[120px] text-center leading-none tracking-wide text-red-600 font-joker">
                day {daySchedule.day}
              </h2>

              {/* Table */}
              <table className="w-full table-fixed bg-black/30 backdrop-blur-sm rounded-lg font-roboto">
                <thead>
                  <tr>
                    <th className="py-3 px-2 sm:px-4 md:px-6 text-xs sm:text-sm uppercase tracking-wide text-white/70 text-center">
                      Event
                    </th>
                    <th className="py-3 px-2 sm:px-4 md:px-6 text-xs sm:text-sm uppercase tracking-wide text-white/70 text-center">
                      Time
                    </th>
                    <th className="py-3 px-2 sm:px-4 md:px-6 text-xs sm:text-sm uppercase tracking-wide text-white/70 text-center">
                      Venue
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {daySchedule.events.map((event, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <td
                        className="
                          py-3 px-2 sm:px-4 md:px-6
                          text-sm sm:text-base md:text-xl
                          text-white text-center
                          break-words whitespace-normal
                        "
                      >
                        {event.name}
                      </td>

                      <td
                        className="
                          py-3 px-2 sm:px-4 md:px-6
                          text-sm sm:text-base md:text-xl
                          text-white/80 text-center
                          break-words whitespace-normal
                        "
                      >
                        {event.time}
                      </td>

                      <td
                        className="
                          py-3 px-2 sm:px-4 md:px-6
                          text-sm sm:text-base md:text-xl
                          text-white/80 text-center
                          break-words whitespace-normal
                        "
                      >
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
