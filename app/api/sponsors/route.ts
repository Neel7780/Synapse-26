
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Fetch categories sorted by rank
        const { data: categories, error: categoryError } = await supabase
            .from("sponsor_category")
            .select("*")
            .order("rank", { ascending: true, nullsFirst: false })
            .order("tier", { ascending: true });

        if (categoryError) {
            throw categoryError;
        }

        // 2. Fetch all sponsors sorted by name
        const { data: sponsors, error: sponsorError } = await supabase
            .from("sponsors")
            .select("*")
            .order("name", { ascending: true });

        if (sponsorError) {
            throw sponsorError;
        }

        // 3. Nest sponsors into categories
        const categoriesWithSponsors = categories.map((cat) => ({
            ...cat,
            sponsors: sponsors.filter((s) => s.category_id === cat.sponsor_category_id)
        }));

        return NextResponse.json(
            { categories: categoriesWithSponsors },
            { status: 200 }
        );
    } catch (error) {
        console.error("Sponsors API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
