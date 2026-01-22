import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/imageUtil';
import { checkAdmin } from '@/lib/checkAdmin';

// GET - Fetch all sponsors
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    const { data: sponsors, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("rank", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { sponsors, count: sponsors?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new sponsor
export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = await createClient() as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const tier = formData.get('tier') as string;
    const website_url = formData.get('website_url') as string | null;
    const rankStr = formData.get('rank') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Parse rank if provided
    let rank: number | null = null;
    if (rankStr && rankStr.trim() !== '') {
      const parsedRank = parseInt(rankStr, 10);
      if (!isNaN(parsedRank) && parsedRank > 0) {
        rank = parsedRank;
      }
    }

    // Validate required fields
    if (!name || !tier) {
      return NextResponse.json(
        { error: "Name and tier are required fields" },
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

    let logo_url = null;

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImage({
        file: imageFile,
        bucket: 'synapse',
        folder: 'sponsors'
      });
      logo_url = uploadResult.publicUrl;
    }

    const { data: sponsor, error } = await supabase
      .from("sponsors")
      .insert({
        name,
        tier,
        website_url: website_url || null,
        logo_url,
        rank,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { sponsor, message: "Sponsor created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
