import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/imageUtil';

async function checkAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

// GET - Fetch all merchandise products
export async function GET() {
  try {
    const supabase = (await createClient()) as any;

    const { data: products, error } = await supabase
      .from("merchandise_management")
      .select("*")
      .order("product_id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { products, count: products?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;

    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();

    const product_name = formData.get('product_name') as string;
    const price = formData.get('price') as string;
    const available_sizes = formData.get('available_sizes') as string | null;
    const description = formData.get('description') as string | null;
    const is_available = formData.get('is_available') as string | null;
    const imageFiles = formData.getAll('image') as File[];

    if (!product_name || price === null) {
      return NextResponse.json(
        { error: "product_name and price are required" },
        { status: 400 }
      );
    }

    const product_images: string[] = [];

    // Upload all images if provided
    if (imageFiles && imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        if (imageFile && imageFile.size > 0) {
          const uploadResult = await uploadImage({
            file: imageFile,
            bucket: 'synapse',
            folder: 'merchandise'
          });
          product_images.push(uploadResult.publicUrl);
        }
      }
    }

    const { data: product, error } = await supabase
      .from("merchandise_management")
      .insert({
        product_name,
        price: Number(price),
        available_sizes: available_sizes ? JSON.parse(available_sizes) : null,
        product_image: product_images.length > 0 ? product_images : null,
        description: description || null,
        is_available: is_available !== null ? is_available === 'true' : true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
