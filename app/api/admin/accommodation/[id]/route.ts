import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { uploadImage, editImage, deleteImage } from "@/lib/imageUtil";

// GET - Fetch single accommodation package by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { id } = await params;

    const { data: package_data, error } = await supabase
      .from("accommodation_type")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Accommodation package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ package: package_data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update an accommodation package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { id } = await params;

    // First, check if package exists
    const { data: existingPackage, error: fetchError } = await supabase
      .from("accommodation_type")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: "Accommodation package not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const package_name = formData.get("package_name") as string;
    const price = formData.get("price") as string;
    const start_date = formData.get("start_date") as string;
    const end_date = formData.get("end_date") as string;
    const description = formData.get("description") as string;
    const is_available = formData.get("is_available") as string;
    const qr_code_file = formData.get("qr_code") as File | null;

    // Validate package_name if provided
    if (package_name !== undefined && package_name !== null) {
      if (!package_name || package_name.trim() === "") {
        return NextResponse.json(
          { error: "Package name cannot be empty" },
          { status: 400 }
        );
      }
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

    // Validate dates if both are provided
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

    // Handle QR code upload/replacement
    let qr_code_url = existingPackage.qr_code;
    if (qr_code_file && qr_code_file.size > 0) {
      try {
        if (existingPackage.qr_code) {
          // Extract the file path from the existing URL
          const urlParts = existingPackage.qr_code.split("/");
          const bucketIndex = urlParts.findIndex((part: string) => part === "qr-code");
          if (bucketIndex !== -1) {
            const oldFilePath = urlParts.slice(bucketIndex + 1).join("/");
            const { publicUrl } = await editImage({
              file: qr_code_file,
              bucket: "qr-code",
              oldFilePath,
              folder: "accommodation",
            });
            qr_code_url = publicUrl;
          } else {
            // If we can't parse the old path, just upload new and try to delete old
            const { publicUrl } = await uploadImage({
              file: qr_code_file,
              bucket: "qr-code",
              folder: "accommodation",
            });
            qr_code_url = publicUrl;
          }
        } else {
          // No existing QR code, just upload new one
          const { publicUrl } = await uploadImage({
            file: qr_code_file,
            bucket: "qr-code",
            folder: "accommodation",
          });
          qr_code_url = publicUrl;
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to upload QR code image" },
          { status: 500 }
        );
      }
    }

    // Build update object - only include fields that are provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (package_name !== undefined && package_name !== null)
      updateData.package_name = package_name;
    if (price !== undefined && price !== null) updateData.price = Number(price);
    if (start_date !== undefined && start_date !== null) updateData.start_date = start_date;
    if (end_date !== undefined && end_date !== null) updateData.end_date = end_date;
    if (description !== undefined && description !== null)
      updateData.description = description;
    if (is_available !== undefined && is_available !== null)
      updateData.is_available = is_available === "true";
    if (qr_code_url !== existingPackage.qr_code)
      updateData.qr_code = qr_code_url;

    const { data: package_data, error } = await supabase
      .from("accommodation_type")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        package: package_data,
        message: "Accommodation package updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an accommodation package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;
    const { id } = await params;

    // First check if package exists and get QR code path
    const { data: existingPackage, error: fetchError } = await supabase
      .from("accommodation_type")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingPackage) {
      return NextResponse.json(
        { error: "Accommodation package not found" },
        { status: 404 }
      );
    }

    // Delete QR code image if it exists
    if (existingPackage.qr_code) {
      try {
        const urlParts = existingPackage.qr_code.split("/");
        const bucketIndex = urlParts.findIndex((part: string) => part === "qr-code");
        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join("/");
          await deleteImage({
            bucket: "qr-code",
            filePath,
          });
        }
      } catch (error) {
        // Log error but continue with deletion
        console.error("Failed to delete QR code image:", error);
      }
    }

    const { error } = await supabase
      .from("accommodation_type")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Accommodation package deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
