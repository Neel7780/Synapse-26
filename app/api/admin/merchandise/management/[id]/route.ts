import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, editImage, deleteImage } from '@/lib/imageUtil';

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = (await createClient()) as any;
    const { id } = await params;

    const { data: product, error } = await supabase
      .from("merchandise_management")
      .select("*")
      .eq("product_id", Number(id))
      .single();

    if (error) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = (await createClient()) as any;
    const { id } = await params;
    const formData = await request.formData();

    const product_name = formData.get('product_name') as string | null;
    const price = formData.get('price') as string | null;
    const available_sizes = formData.get('available_sizes') as string | null;
    const description = formData.get('description') as string | null;
    const is_available = formData.get('is_available') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Check existence and get current product
    const { data: existing, error: fetchError } = await supabase
      .from('merchandise_management')
      .select('*')
      .eq('product_id', Number(id))
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (product_name !== null) updateData.product_name = product_name;
    if (price !== null) updateData.price = Number(price);
    if (available_sizes !== null) updateData.available_sizes = JSON.parse(available_sizes);
    if (description !== null) updateData.description = description;
    if (is_available !== null) updateData.is_available = is_available === 'true';

    // Handle image update if provided
    if (imageFile && imageFile.size > 0) {
      let newImageUrl = null;

      if (existing.product_image) {
        // Extract old file path and replace image
        try {
          const url = new URL(existing.product_image);
          const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');

          if (pathParts.length > 1) {
            const oldFilePath = pathParts[1];
            const uploadResult = await editImage({
              file: imageFile,
              bucket: 'synapse',
              oldFilePath,
              folder: 'merchandise'
            });
            newImageUrl = uploadResult.publicUrl;
          }
        } catch (error) {
          console.error('Failed to replace image:', error);
          // If parsing fails, just upload new image
          const uploadResult = await uploadImage({
            file: imageFile,
            bucket: 'synapse',
            folder: 'merchandise'
          });
          newImageUrl = uploadResult.publicUrl;
        }
      } else {
        // No existing image, just upload new one
        const uploadResult = await uploadImage({
          file: imageFile,
          bucket: 'synapse',
          folder: 'merchandise'
        });
        newImageUrl = uploadResult.publicUrl;
      }

      updateData.product_image = newImageUrl;
    }

    const { data: product, error } = await supabase
      .from("merchandise_management")
      .update(updateData)
      .eq("product_id", Number(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { product, message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = (await createClient()) as any;
    const { id } = await params;

    // Get product to retrieve image path
    const { data: existing, error: fetchError } = await supabase
      .from('merchandise_management')
      .select('product_id, product_image')
      .eq('product_id', Number(id))
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the product from database
    const { error } = await supabase
      .from("merchandise_management")
      .delete()
      .eq("product_id", Number(id));

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    // Delete the image from storage if it exists
    if (existing.product_image) {
      try {
        const url = new URL(existing.product_image);
        const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');
        if (pathParts.length > 1) {
          const filePath = pathParts[1];
          await deleteImage({
            bucket: 'synapse',
            filePath
          });
        }
      } catch (imgError) {
        console.error('Failed to delete product image:', imgError);
        // Continue even if image deletion fails
      }
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
