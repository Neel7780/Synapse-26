import { corsHeaders, handleCorsResponse, addCorsHeaders } from "@/lib/cors";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { uploadImage, editImage, deleteImage } from "@/lib/imageUtil";

async function checkAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

// Handle CORS preflight requests
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return handleCorsResponse(origin);
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_category")
    .select("*, event(count)")
    .order("category_id", { ascending: true });

  if (error) {
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }

  const formattedData = data.map((cat: any) => ({
    ...cat,
    event_count: cat.event?.[0]?.count || 0,
  }));

  const response = NextResponse.json({ categories: formattedData });
  return addCorsHeaders(response, origin);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const supabase = (await createClient()) as any;

  if (!(await checkAdmin(supabase))) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return addCorsHeaders(response, origin);
  }

    try {
        const formData = await request.formData()
        const category_name = formData.get('category_name') as string
        const description = formData.get('description') as string | null
        const imageFile = formData.get('image') as File | null

        if (!category_name) {
            const response = NextResponse.json({ error: 'Category Name is required' }, { status: 400 })
            return addCorsHeaders(response, origin)
        }

        let category_image = null

        // Upload image if provided
        if (imageFile && imageFile.size > 0) {
            const uploadResult = await uploadImage({
                file: imageFile,
                bucket: 'synapse',
                folder: 'categories'
            })
            category_image = uploadResult.publicUrl
        }

        const { data, error } = await supabase
            .from('event_category')
            .insert({
                category_name,
                description: description || null,
                category_image
            })
            .select()
            .single()

        if (error) throw error

        const response = NextResponse.json({ success: true, category: data }, { status: 201 })
        return addCorsHeaders(response, origin)

    } catch (error: unknown) {
        const response = NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
        return addCorsHeaders(response, origin)
    }
}

//remove category
export async function DELETE(request: Request) {
  const origin = request.headers.get("origin");
  const supabase = (await createClient()) as any;

  if (!(await checkAdmin(supabase))) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return addCorsHeaders(response, origin);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      const response = NextResponse.json(
        { error: "ID required" },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

        // Get the category to retrieve the image path
        const { data: category } = await supabase
            .from('event_category')
            .select('category_image')
            .eq('category_id', Number(id))
            .single()

        // Delete the category from database
        const { error } = await supabase
            .from('event_category')
            .delete()
            .eq('category_id', Number(id))

        if (error) throw error

        // Delete the image from storage if it exists
        if (category?.category_image) {
            try {
                // Extract the file path from the public URL
                const url = new URL(category.category_image)
                const pathParts = url.pathname.split('/storage/v1/object/public/synapse/')
                if (pathParts.length > 1) {
                    const filePath = pathParts[1]
                    await deleteImage({
                        bucket: 'synapse',
                        filePath
                    })
                }
            } catch (imgError) {
                console.error('Failed to delete image:', imgError)
                // Continue even if image deletion fails
            }
        }

    const response = NextResponse.json({ success: true });
    return addCorsHeaders(response, origin);
  } catch (error: unknown) {
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}

// update category details
export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  const supabase = (await createClient()) as any;

  if (!(await checkAdmin(supabase))) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return addCorsHeaders(response, origin);
  }

    try {
        const formData = await request.formData()
        const category_id = formData.get('category_id') as string
        const category_name = formData.get('category_name') as string | null
        const description = formData.get('description') as string | null
        const imageFile = formData.get('image') as File | null

        if (!category_id) {
            const response = NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
            return addCorsHeaders(response, origin)
        }

        const updates: any = {}

        if (category_name) updates.category_name = category_name
        if (description !== null) updates.description = description

        // Handle image update if provided
        if (imageFile && imageFile.size > 0) {
            // Get the current category to retrieve old image path
            const { data: currentCategory } = await supabase
                .from('event_category')
                .select('category_image')
                .eq('category_id', Number(category_id))
                .single()

            let newImageUrl = null

            if (currentCategory?.category_image) {
                // Extract the old file path from the public URL
                try {
                    const imageUrl = currentCategory.category_image

                    // Try multiple URL patterns
                    let oldFilePath = null

                    // Pattern 1: /storage/v1/object/public/synapse/...
                    if (imageUrl.includes('/storage/v1/object/public/synapse/')) {
                        oldFilePath = imageUrl.split('/storage/v1/object/public/synapse/')[1]
                    }
                    // Pattern 2: Direct bucket path like synapse/categories/...
                    else if (imageUrl.includes('synapse/categories/')) {
                        const parts = imageUrl.split('synapse/')
                        if (parts.length > 1) {
                            oldFilePath = parts[1]
                        }
                    }
                    // Pattern 3: Just the path after the domain
                    else {
                        const url = new URL(imageUrl)
                        const pathMatch = url.pathname.match(/synapse\/(.+)/)
                        if (pathMatch) {
                            oldFilePath = pathMatch[1]
                        }
                    }

                    if (oldFilePath) {
                        // Edit image (delete old, upload new)
                        try {
                            const uploadResult = await editImage({
                                file: imageFile,
                                bucket: 'synapse',
                                oldFilePath,
                                folder: 'categories'
                            })
                            newImageUrl = uploadResult.publicUrl
                        } catch (editError: any) {
                            console.error('Failed to edit image:', editError.message)
                            throw editError
                        }
                    } else {
                        const uploadResult = await uploadImage({
                            file: imageFile,
                            bucket: 'synapse',
                            folder: 'categories'
                        })
                        newImageUrl = uploadResult.publicUrl
                    }
                } catch (error) {
                    console.error('Failed to replace image:', error)
                    // If parsing fails, just upload new image
                    const uploadResult = await uploadImage({
                        file: imageFile,
                        bucket: 'synapse',
                        folder: 'categories'
                    })
                    newImageUrl = uploadResult.publicUrl
                }
            } else {
                // No existing image, just upload new one
                const uploadResult = await uploadImage({
                    file: imageFile,
                    bucket: 'synapse',
                    folder: 'categories'
                })
                newImageUrl = uploadResult.publicUrl
            }

            updates.category_image = newImageUrl
        }

        const { data, error } = await supabase
            .from('event_category')
            .update(updates)
            .eq('category_id', Number(category_id))
            .select()
            .single()

    if (error) throw error;

    const response = NextResponse.json({ success: true, category: data });
    return addCorsHeaders(response, origin);
  } catch (error: unknown) {
    console.error("Update Category Error:", error);
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}
