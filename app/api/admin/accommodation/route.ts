import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/checkAdmin";
import { uploadImage } from "@/lib/imageUtil";

// GET - Fetch all accommodation packages
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    const { data: packages, error } = await supabase
      .from("accommodation_type")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      { packages, count: packages?.length || 0 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new accommodation package
export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const package_name = formData.get("package_name") as string;
    const price = formData.get("price") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const description = formData.get("description") as string;
    const is_available = formData.get("is_available") as string;
    const qr_code_file = formData.get("qr_code") as File | null;

    // Validate required fields - only package_name is required (id is auto-generated)
    if (!package_name) {
      return NextResponse.json(
        { error: "Package name is required" },
        { status: 400 }
      );
    }

    // Validate package_name is not empty
    if (package_name.trim() === "") {
      return NextResponse.json(
        { error: "Package name cannot be empty" },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (price) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 }
        );
      }
    }

    // Validate dates if provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }

      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date format. Use YYYY-MM-DD" },
          { status: 400 }
        );
      }

      if (endDate < startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Upload QR code if provided
    let qr_code_url = null;
    if (qr_code_file && qr_code_file.size > 0) {
      try {
        const { publicUrl } = await uploadImage({
          file: qr_code_file,
          bucket: "qr-code",
          folder: "accommodation",
        });
        qr_code_url = publicUrl;
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to upload QR code image" },
          { status: 500 }
        );
      }
    }

    const { data: package_data, error } = await supabase
      .from("accommodation_type")
      .insert({
        package_name,
        price: price ? Number(price) : null,
        start_date: start_date || null,
        end_date: end_date || null,
        description: description || null,
        is_available: is_available === "true",
        qr_code: qr_code_url,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    return NextResponse.json(
      {
        package: package_data,
        message: "Accommodation package created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
