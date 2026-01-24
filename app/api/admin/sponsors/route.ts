import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/imageUtil';
import { checkAdmin } from '@/lib/checkAdmin';

// GET - Fetch all sponsors with category information
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    const { data: sponsors, error } = await supabase
      .from("sponsors")
      .select(`
        *,
        category:sponsor_category(
          sponsor_category_id,
          tier,
          rank
        )
      `)
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
    const category_id = formData.get('category_id') as string;
    const website_url = formData.get('website_url') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!name || !category_id) {
      return NextResponse.json(
        { error: "Name and category are required fields" },
        { status: 400 }
      );
    }

    // Validate category exists
    const { data: category, error: categoryError } = await supabase
      .from("sponsor_category")
      .select("sponsor_category_id")
      .eq("sponsor_category_id", parseInt(category_id, 10))
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "Invalid category selected" },
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
        category_id: parseInt(category_id, 10),
        website_url: website_url || null,
        logo_url,
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
