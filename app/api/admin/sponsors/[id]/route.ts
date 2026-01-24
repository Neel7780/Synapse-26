import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, editImage, deleteImage } from '@/lib/imageUtil';

// GET - Fetch single sponsor by ID with category information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { id } = await params;

    const { data: sponsor, error } = await supabase
      .from("sponsors")
      .select(`
        *,
        category:sponsor_category(
          sponsor_category_id,
          tier,
          rank
        )
      `)
      .eq("sponsor_id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    return NextResponse.json({ sponsor }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a sponsor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const category_id = formData.get('category_id') as string | null;
    const website_url = formData.get('website_url') as string | null;
    const imageFile = formData.get('image') as File | null;

    // First, check if sponsor exists
    const { data: existingSponsor, error: fetchError } = await supabase
      .from("sponsors")
      .select("*")
      .eq("sponsor_id", id)
      .single();

    if (fetchError || !existingSponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    // Build update object - only include fields that are provided
    const updateData: any = {};

    if (name !== null) updateData.name = name;
    if (website_url !== null) updateData.website_url = website_url;

    // Validate category if provided
    if (category_id !== null) {
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
      updateData.category_id = parseInt(category_id, 10);
    }

    // Handle image update if provided
    if (imageFile && imageFile.size > 0) {
      let newLogoUrl = null;

      if (existingSponsor.logo_url) {
        // Extract old file path and replace image
        try {
          const url = new URL(existingSponsor.logo_url);
          const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');

          if (pathParts.length > 1) {
            const oldFilePath = pathParts[1];
            const uploadResult = await editImage({
              file: imageFile,
              bucket: 'synapse',
              oldFilePath,
              folder: 'sponsors'
            });
            newLogoUrl = uploadResult.publicUrl;
          }
        } catch (error) {
          console.error('Failed to replace image:', error);
          // If parsing fails, just upload new image
          const uploadResult = await uploadImage({
            file: imageFile,
            bucket: 'synapse',
            folder: 'sponsors'
          });
          newLogoUrl = uploadResult.publicUrl;
        }
      } else {
        // No existing image, just upload new one
        const uploadResult = await uploadImage({
          file: imageFile,
          bucket: 'synapse',
          folder: 'sponsors'
        });
        newLogoUrl = uploadResult.publicUrl;
      }

      updateData.logo_url = newLogoUrl;
    }

    const { data: sponsor, error } = await supabase
      .from("sponsors")
      .update(updateData)
      .eq("sponsor_id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { sponsor, message: "Sponsor updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a sponsor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { id } = await params;

    // First check if sponsor exists and get logo_url
    const { data: existingSponsor, error: fetchError } = await supabase
      .from('sponsors')
      .select('sponsor_id, logo_url')
      .eq('sponsor_id', id)
      .single();

    if (fetchError || !existingSponsor) {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }

    // Delete the sponsor from database
    const { error } = await supabase
      .from("sponsors")
      .delete()
      .eq("sponsor_id", id);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    // Delete the logo from storage if it exists
    if (existingSponsor.logo_url) {
      try {
        const url = new URL(existingSponsor.logo_url);
        const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');
        if (pathParts.length > 1) {
          const filePath = pathParts[1];
          await deleteImage({
            bucket: 'synapse',
            filePath
          });
        }
      } catch (imgError) {
        console.error('Failed to delete logo:', imgError);
        // Continue even if image deletion fails
      }
    }

    return NextResponse.json(
      { message: "Sponsor deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
