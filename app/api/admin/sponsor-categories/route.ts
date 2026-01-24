import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/checkAdmin';

// GET - Fetch all sponsor categories
export async function GET() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = (await createClient()) as any;

        const { data: categories, error } = await supabase
            .from("sponsor_category")
            .select("*")
            .order("rank", { ascending: true, nullsFirst: false })
            .order("tier", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
        }

        return NextResponse.json(
            { categories, count: categories?.length || 0 },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Create a new sponsor category
export async function POST(request: NextRequest) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = await createClient() as any;

        // Check admin authentication
        const isAdmin = await checkAdmin(supabase);
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await request.json();
        const { tier, rank } = body;

        // Validate required fields
        if (!tier) {
            return NextResponse.json(
                { error: "Tier is required" },
                { status: 400 }
            );
        }

        // Validate tier is not empty string
        if (tier.trim() === '') {
            return NextResponse.json(
                { error: "Tier cannot be empty" },
                { status: 400 }
            );
        }

        const { data: category, error } = await supabase
            .from("sponsor_category")
            .insert({
                tier,
                rank: rank || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
        }

        return NextResponse.json(
            { category, message: "Category created successfully" },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
