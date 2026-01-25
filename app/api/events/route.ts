// Public API for fetching events data
// This endpoint does not require authentication

import { addCorsHeaders, handleCorsResponse } from '@/lib/cors'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
    const origin = request.headers.get("origin");
    return handleCorsResponse(origin);
}

export async function GET(request: Request) {
    const origin = request.headers.get("origin");
    // Use service role client to ensure we can read all public event data including fees/QR codes
    // This bypasses RLS which might be blocking public access to fee details
    const supabase = getSupabaseServer();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const eventId = searchParams.get("event_id");

    try {
        // Supabase query to fetch events with related data
        // Only selecting columns that exist in the actual database
        const selectQuery = `
            event_id,
            event_name,
            description,
            event_date,
            event_picture,
            rulebook,
            venue,
            is_dau_free,
            is_registration_open,
            category_id,
            coordinator_email,
            event_category (
                category_id,
                category_name,
                category_image,
                description
            ),
            event_fee (
                event_id,
                fee_id,
                fee (
                    fee_id,
                    participation_type,
                    price,
                    min_members,
                    max_members,
                    qr_code
                )
            )
        `;

        // If specific event is requested by ID
        if (eventId) {
            const { data: event, error } = await supabase
                .from("event")
                .select(selectQuery)
                .eq("event_id", Number(eventId))
                .single();

            if (error) {
                console.error("Event fetch error:", error);
                const response = NextResponse.json(
                    { error: error.message },
                    { status: error.code === 'PGRST116' ? 404 : 500 }
                );
                return addCorsHeaders(response, origin);
            }

            const response = NextResponse.json({ event });
            return addCorsHeaders(response, origin);
        }

        // If category filter is provided - fetch events by category_id
        if (categoryId) {
            const { data: events, error } = await supabase
                .from("event")
                .select(selectQuery)
                .eq("category_id", Number(categoryId))
                .order("event_date", { ascending: true });

            if (error) {
                console.error("Events by category fetch error:", error);
                const response = NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
                return addCorsHeaders(response, origin);
            }

            const response = NextResponse.json({ events: events || [] });
            return addCorsHeaders(response, origin);
        }

        // Return all events with their categories and fees
        const { data: events, error } = await supabase
            .from("event")
            .select(selectQuery)
            .order("event_date", { ascending: true });

        if (error) {
            console.error("All events fetch error:", error);
            const response = NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
            return addCorsHeaders(response, origin);
        }

        const response = NextResponse.json({ events: events || [] });
        return addCorsHeaders(response, origin);

    } catch (error: unknown) {
        console.error("Events API Error:", error);
        const response = NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
        return addCorsHeaders(response, origin);
    }
}
