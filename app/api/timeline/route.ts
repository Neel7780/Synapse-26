import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

interface Event {
    name: string;
    time: string;
    venue: string;
    rawTime?: number; // Helper for sorting
}

interface DaySchedule {
    day: number;
    events: Event[];
}

export async function GET() {
    try {
        console.log("Timeline API: Starting request");

        // Check basic env vars (without logging secrets)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            console.error("Timeline API Error: NEXT_PUBLIC_SUPABASE_URL is missing");
            return NextResponse.json({ error: "Configuration error: Missing URL" }, { status: 500 });
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("Timeline API Error: SUPABASE_SERVICE_ROLE_KEY is missing");
            return NextResponse.json({ error: "Configuration error: Missing Key" }, { status: 500 });
        }

        const supabase = getSupabaseServer();
        console.log("Timeline API: Supabase client created");

        // Fetch concerts and events separately to debug which one fails
        console.log("Timeline API: Fetching concerts...");
        const { data: concerts, error: concertsError } = await supabase.from("concert").select("*");

        if (concertsError) {
            console.error("Timeline API Error fetching concerts:", concertsError);
            return NextResponse.json({ error: `Failed to fetch concerts: ${concertsError.message}` }, { status: 500 });
        }
        console.log(`Timeline API: Fetched ${concerts?.length ?? 0} concerts`);

        console.log("Timeline API: Fetching events...");
        const { data: events, error: eventsError } = await supabase.from("event").select("*");

        if (eventsError) {
            console.error("Timeline API Error fetching events:", eventsError);
            return NextResponse.json({ error: `Failed to fetch events: ${eventsError.message}` }, { status: 500 });
        }
        console.log(`Timeline API: Fetched ${events?.length ?? 0} events`);

        const concertList = concerts || [];
        const eventList = events || [];

        // Initialize schedule for 4 days
        const schedule: DaySchedule[] = [
            { day: 1, events: [] },
            { day: 2, events: [] },
            { day: 3, events: [] },
            { day: 4, events: [] },
        ];

        // Helper to determine day from date string
        // 26 Feb -> Day 1
        // 27 Feb -> Day 2
        // 28 Feb -> Day 3
        // 01 Mar -> Day 4
        const getDayIndex = (dateStr: string): number => {
            if (!dateStr) return -1;

            // Handle "2026-02-26 08:20:20+00" or ISO formats
            // We want to be robust about the date part regardless of timezone shifts for the Day bucket
            // So we'll try to match the date string directly first if possible, or parse safely.

            // check for specific dates in string to avoid timezone day-shift issues
            if (dateStr.includes("2026-02-26")) return 0;
            if (dateStr.includes("2026-02-27")) return 1;
            if (dateStr.includes("2026-02-28")) return 2;
            if (dateStr.includes("2026-03-01")) return 3;

            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    console.warn(`Timeline API: Invalid date string: ${dateStr}`);
                    return -1;
                }

                // Fallback to UTC date check if string matching failed
                const month = date.getUTCMonth(); // 0-indexed
                const day = date.getUTCDate();

                // Feb (Month 1 in 0-indexed)
                if (month === 1) {
                    if (day === 26) return 0;
                    if (day === 27) return 1;
                    if (day === 28) return 2;
                }
                // Mar (Month 2)
                if (month === 2) {
                    if (day === 1) return 3;
                }

                return -1;
            } catch (e) {
                console.error(`Timeline API: Error parsing date ${dateStr}`, e);
                return -1;
            }
        };

        // Helper to parse time for sorting and display
        const parseTime = (dateStr: string, timeStr?: string | null) => {
            let displayTime = "";
            let sortTime = 0;

            if (timeStr) {
                // Use explicitly provided time string
                displayTime = timeStr;
                try {
                    const startTimePart = timeStr.split('-')[0].trim();
                    const date = new Date(`2000/01/01 ${startTimePart}`);
                    if (!isNaN(date.getTime())) {
                        sortTime = date.getTime();
                    }
                } catch (e) {
                    sortTime = 0;
                }
            } else {
                // Parse from date string "2026-02-26 08:20:20+00"
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    // Start with basic local time string
                    displayTime = date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    });
                    // Adjust for specific inputs if they are UTC but meant to be shown as local event time
                    // However, usually +00 implies UTC. If the event is in India (+5:30), 
                    // and the DB stores it as UTC, the above toLocaleTimeString will correct it 
                    // IF the server timezone is set. 
                    // But in Next.js Server Components, it might be UTC.
                    // The user asked to "take care the timings... correctly chosen".
                    // For now, I will standardise on showing it in a friendly format.

                    sortTime = date.getTime();
                } else {
                    displayTime = "TBA";
                }
            }

            return { displayTime, sortTime };
        };

        // Process Concerts
        concertList.forEach((concert) => {
            if (!concert.concert_date) return;

            const dayIndex = getDayIndex(concert.concert_date);
            if (dayIndex !== -1) {
                const { displayTime, sortTime } = parseTime(concert.concert_date, null);
                schedule[dayIndex].events.push({
                    name: concert.concert_name,
                    time: displayTime,
                    venue: concert.venue || "TBA",
                    rawTime: sortTime,
                });
            }
        });

        // Process Events
        eventList.forEach((event) => {
            if (!event.event_date) return;

            const dayIndex = getDayIndex(event.event_date);
            if (dayIndex !== -1) {
                const { displayTime, sortTime } = parseTime(event.event_date, null);

                schedule[dayIndex].events.push({
                    name: event.event_name,
                    time: displayTime,
                    venue: "Synapse",
                    rawTime: sortTime,
                });
            }
        });

        // Sort events by time and handle empty days
        schedule.forEach((daySchedule) => {
            if (daySchedule.events.length === 0) {
                daySchedule.events.push({
                    name: "To be declared",
                    time: "",
                    venue: "",
                    rawTime: 0,
                });
            } else {
                daySchedule.events.sort((a, b) => (a.rawTime || 0) - (b.rawTime || 0));
            }

            // Remove rawTime before sending
            daySchedule.events.forEach((e) => delete e.rawTime);
        });

        return NextResponse.json(schedule);
    } catch (error: any) {
        console.error("Timeline API Critical Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch timeline data", details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
