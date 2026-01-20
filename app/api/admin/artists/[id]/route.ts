import { checkAdmin } from '@/lib/checkAdmin';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, editImage, deleteImage } from '@/lib/imageUtil';

// GET - Fetch single artist by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('artist')
      .select(`
        *,
        concert (
          concert_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update an artist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();

    const name = formData.get('name') as string | null;
    const concert_id = formData.get('concert_id') as string | null;
    const genre = formData.get('genre') as string | null;
    const reveal_date = formData.get('reveal_date') as string | null;
    const bio = formData.get('bio') as string | null;
    const imageFile = formData.get('image') as File | null;

    // First, check if artist exists
    const { data: existingArtist, error: fetchError } = await supabase
      .from('artist')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingArtist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};

    if (name !== null) updateData.name = name;
    if (concert_id !== null) updateData.concert_id = parseInt(concert_id);
    if (genre !== null) updateData.genre = genre;
    if (reveal_date !== null) updateData.reveal_date = reveal_date;
    if (bio !== null) updateData.bio = bio;

    // Handle image update if provided
    if (imageFile && imageFile.size > 0) {
      let newImageUrl = null;

      if (existingArtist.artist_image_url) {
        // Extract old file path and replace image
        try {
          const url = new URL(existingArtist.artist_image_url);
          const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');

          if (pathParts.length > 1) {
            const oldFilePath = pathParts[1];
            const uploadResult = await editImage({
              file: imageFile,
              bucket: 'synapse',
              oldFilePath,
              folder: 'artists'
            });
            newImageUrl = uploadResult.publicUrl;
          }
        } catch (err) {
          console.error('Failed to replace image:', err);
          // If parsing fails, just upload new image
          const uploadResult = await uploadImage({
            file: imageFile,
            bucket: 'synapse',
            folder: 'artists'
          });
          newImageUrl = uploadResult.publicUrl;
        }
      } else {
        // No existing image, just upload new one
        const uploadResult = await uploadImage({
          file: imageFile,
          bucket: 'synapse',
          folder: 'artists'
        });
        newImageUrl = uploadResult.publicUrl;
      }

      updateData.artist_image_url = newImageUrl;
    }

    const { data, error } = await supabase
      .from('artist')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an artist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the artist to retrieve the image path
    const { data: artist } = await supabase
      .from('artist')
      .select('artist_image_url')
      .eq('id', id)
      .single();

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Delete the artist from database
    const { error } = await supabase
      .from('artist')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Delete the image from storage if it exists
    if (artist.artist_image_url) {
      try {
        const url = new URL(artist.artist_image_url);
        const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');
        if (pathParts.length > 1) {
          const filePath = pathParts[1];
          await deleteImage({
            bucket: 'synapse',
            filePath
          });
        }
      } catch (imgError) {
        console.error('Failed to delete artist image:', imgError);
        // Continue even if image deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
