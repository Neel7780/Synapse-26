// Public API for fetching event categories
// This endpoint does not require authentication

import { addCorsHeaders, handleCorsResponse } from '@/lib/cors'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
    const origin = request.headers.get("origin");
    return handleCorsResponse(origin);
}

export async function GET(request: Request) {
    const origin = request.headers.get("origin");
    const supabase = await createClient();

    try {
        const { data: categories, error } = await supabase
            .from("event_category")
            .select(`
        category_id,
        category_name,
        category_image,
        description
      `)
            .order("category_name", { ascending: true });

        if (error) {
            const response = NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
            return addCorsHeaders(response, origin);
        }

        const response = NextResponse.json({ categories });
        return addCorsHeaders(response, origin);
    } catch (error: unknown) {
        console.error("Categories API Error:", error);
        const response = NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        );
        return addCorsHeaders(response, origin);
    }
}
