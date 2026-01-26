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
        if (!process.env.SUPABASE_SECRET_KEY) {
            console.error("Timeline API Error: SUPABASE_SECRET_KEY is missing");
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

            try {
                // Force IST interpretation by stripping any existing timezone and appending +05:30
                // This assumes the backend data values (e.g. "12:00") are meant to be IST.
                // e.g. "2026-02-27T00:00:00Z" -> "2026-02-27T00:00:00+05:30"
                const cleanDateStr = dateStr.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '').replace(' ', 'T');
                const normalizedStr = `${cleanDateStr}+05:30`;

                const date = new Date(normalizedStr);
                if (isNaN(date.getTime())) {
                    console.warn(`Timeline API: Invalid date string: ${dateStr}`);
                    return -1;
                }

                // Adjust for 6 AM IST (00:30 UTC) cutoff
                // Any time before 6:00 AM IST (00:30 UTC) belongs to the previous logical day.
                // We shift the time back by 30 minutes.
                // Case 1: 06:00 AM IST -> 00:30 UTC. Minus 30m -> 00:00 UTC (Current Day).
                // Case 2: 05:59 AM IST -> 00:29 UTC. Minus 30m -> 23:59 UTC (Previous Day).
                const adjustedDate = new Date(date.getTime() - 30 * 60 * 1000);

                const month = adjustedDate.getUTCMonth(); // 0-indexed
                const day = adjustedDate.getUTCDate();

                // Feb (Month 1 in 0-indexed)
                if (month === 1) {
                    if (day === 26) return 0; // Day 1: Feb 26
                    if (day === 27) return 1; // Day 2
                    if (day === 28) return 2; // Day 3
                }
                // Mar (Month 2)
                if (month === 2) {
                    if (day === 1) return 3; // Day 4
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

            // Parse base date for formatting
            // Force IST interpretation by stripping any existing timezone and appending +05:30
            const cleanDateStr = dateStr ? dateStr.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '').replace(' ', 'T') : '';
            const normalizedStr = cleanDateStr ? `${cleanDateStr}+05:30` : '';

            const date = new Date(normalizedStr);
            const isValidDate = !isNaN(date.getTime());

            // Format date part: "Feb 26"
            const datePart = isValidDate
                ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" })
                : "";

            if (timeStr) {
                // Use explicitly provided time string, but prepend date
                displayTime = isValidDate ? `${datePart} | ${timeStr}` : timeStr;

                try {
                    const startTimePart = timeStr.split('-')[0].trim();
                    const dummyDate = new Date(`2000/01/01 ${startTimePart}`);
                    if (!isNaN(dummyDate.getTime())) {
                        sortTime = dummyDate.getTime();
                    }
                } catch (e) {
                    sortTime = 0;
                }
            } else {
                if (isValidDate) {
                    // Start with basic local time string
                    const timePart = date.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata"
                    });
                    displayTime = `${datePart} | ${timePart}`;
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
                const { displayTime, sortTime } = parseTime(concert.concert_date, concert.timing);
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
                    venue: event.venue || "TBD",
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
