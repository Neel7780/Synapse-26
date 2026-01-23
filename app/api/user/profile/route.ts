import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/user/profile
 * Gets the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error: unknown) {
    console.error("Error in GET /api/user/profile:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Updates the current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      college,
      dob,
      gender,
    } = body;

    // Build update object - only include provided fields
    const updateData: {
      user_name?: string;
      phone?: string;
      college?: string;
      dob?: string;
      gender?: string;
    } = {};

    // Combine first and last name
    if (firstName !== undefined || lastName !== undefined) {
      const currentName = firstName !== undefined && lastName !== undefined
        ? `${firstName} ${lastName}`.trim()
        : undefined;
      if (currentName) {
        updateData.user_name = currentName;
      }
    }

    if (phone !== undefined) updateData.phone = phone;
    if (college !== undefined) updateData.college = college;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error: unknown) {
    console.error("Error in PUT /api/user/profile:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
