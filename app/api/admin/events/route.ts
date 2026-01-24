// eg api call
// {
//   "event_name": "Hackathon 2025",
//   "category_id": 1,
//   "event_date": "2025-12-20T09:00:00.000Z",
//   "is_registration_open": true,
//   "is_dau_free": true,
//   "fees": [
//     {
//       "type": "solo",
//       "price": 100,
//       "min": 1,
//       "max": 1
//     },
//     {
//       "type": "duet",
//       "price": 200,
//       "min": 2,
//       "max": 2
//     }
//   ]
// }


import { checkAdminFromRequest } from '@/lib/checkAdmin'
import { corsHeaders, handleCorsResponse, addCorsHeaders } from '@/lib/cors'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { uploadImage, deleteImage } from '@/lib/imageUtil'

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
    .from("event")
    .select(
      `
      *,
      event_category ( category_name ),
      event_fee (
        fee ( fee_id, participation_type, price, min_members, max_members, qr_code )
      )
    `
    )
    .order("event_date", { ascending: true });

  if (error) {
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }

  const response = NextResponse.json({ events: data });
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

    const event_name = formData.get('event_name') as string
    const category_id = formData.get('category_id') as string
    const event_date = formData.get('event_date') as string
    const event_time = formData.get('event_time') as string | null
    const rulebook = formData.get('rulebook') as string | null
    const description = formData.get('description') as string | null
    const coordinator_email = formData.get('coordinator_email') as string | null
    const venue = formData.get('venue') as string | null
    const is_registration_open = formData.get('is_registration_open') === 'true'
    const is_dau_free = formData.get('is_dau_free') === 'true'
    const imageFile = formData.get('image') as File | null
    const feesJson = formData.get('fees') as string | null
    const qrCodeSolo = formData.get('qr_code_solo') as File | null
    const qrCodeDuet = formData.get('qr_code_duet') as File | null
    const qrCodeGroup = formData.get('qr_code_group') as File | null

    // Combine event_date and event_time into a timestamp
    let eventTimestamp = event_date;
    if (event_date && event_time) {
      // Assuming event_date is in format YYYY-MM-DD and event_time is in format HH:MM
      eventTimestamp = `${event_date}T${event_time}:00.000Z`;
    }

    let event_picture = null

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImage({
        file: imageFile,
        bucket: 'synapse',
        folder: 'events'
      })
      event_picture = uploadResult.publicUrl
    }

    // A. Create the Event
    const { data: eventData, error: eventError } = await supabase
      .from("event")
      .insert({
        event_name,
        category_id: Number(category_id),
        event_date: eventTimestamp,
        event_picture,
        rulebook: rulebook || null,
        description: description || null,
        coordinator_email: coordinator_email || null,
        venue: venue || null,
        is_registration_open,
        is_dau_free
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Parse fees from JSON string
    const fees = feesJson ? JSON.parse(feesJson) : []

    if (fees && Array.isArray(fees) && fees.length > 0) {
      // Upload QR codes and map to participation types
      const qrCodeMap: Record<string, string | null> = {
        solo: null,
        duet: null,
        group: null
      }

      // Upload QR code for solo if provided
      if (qrCodeSolo && qrCodeSolo.size > 0) {
        const uploadResult = await uploadImage({
          file: qrCodeSolo,
          bucket: 'qr-code',
          folder: 'events'
        })
        qrCodeMap.solo = uploadResult.publicUrl
      }

      // Upload QR code for duet if provided
      if (qrCodeDuet && qrCodeDuet.size > 0) {
        const uploadResult = await uploadImage({
          file: qrCodeDuet,
          bucket: 'qr-code',
          folder: 'events'
        })
        qrCodeMap.duet = uploadResult.publicUrl
      }

      // Upload QR code for group if provided
      if (qrCodeGroup && qrCodeGroup.size > 0) {
        const uploadResult = await uploadImage({
          file: qrCodeGroup,
          bucket: 'qr-code',
          folder: 'events'
        })
        qrCodeMap.group = uploadResult.publicUrl
      }

      const feeInserts = fees.map((f: any) => ({
        participation_type: f.type,
        price: Number(f.price),
        min_members: Number(f.min || 1),
        max_members: Number(f.max || 1),
        qr_code: qrCodeMap[f.type] || null,
      }));

      const { data: feeData, error: feeError } = await supabase
        .from("fee")
        .insert(feeInserts)
        .select();

      if (feeError) throw feeError;

      const eventFeeLinks = feeData.map((f: any) => ({
        event_id: eventData.event_id,
        fee_id: f.fee_id,
      }));

      const { error: linkError } = await supabase
        .from("event_fee")
        .insert(eventFeeLinks);

      if (linkError) throw linkError;
    }

    const response = NextResponse.json(
      { success: true, event: eventData },
      { status: 201 }
    );
    return addCorsHeaders(response, origin);
  } catch (error: unknown) {
    console.error("Create Error:", error);
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}

export async function PUT(request: Request) {
  const origin = request.headers.get("origin");
  const supabase = (await createClient()) as any;

  if (!(await checkAdmin(supabase))) {
    const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return addCorsHeaders(response, origin);
  }

  try {
    const formData = await request.formData();

    const event_id = formData.get('event_id') as string;
    const event_name = formData.get('event_name') as string;
    const category_name = formData.get('category_name') as string;
    const event_date = formData.get('event_date') as string;
    const event_time = formData.get('event_time') as string;
    const rulebook = formData.get('rulebook') as string | null;
    const description = formData.get('description') as string | null;
    const is_registration_open = formData.get('is_registration_open') === 'true';
    const is_dau_free = formData.get('is_dau_free') === 'true';
    const coordinator_email = formData.get('coordinator_email') as string | null;
    const venue = formData.get('venue') as string | null;
    const imageFile = formData.get('image') as File | null;
    const feesJson = formData.get('fees') as string | null;
    const qrCodeSolo = formData.get('qr_code_solo') as File | null;
    const qrCodeDuet = formData.get('qr_code_duet') as File | null;
    const qrCodeGroup = formData.get('qr_code_group') as File | null;

    if (!event_id) {
      const response = NextResponse.json(
        { error: "Event ID required" },
        { status: 400 }
      );
      return addCorsHeaders(response, origin);
    }

    // Combine event_date and event_time into a timestamp
    let eventTimestamp = event_date;
    if (event_date && event_time) {
      // Assuming event_date is in format YYYY-MM-DD and event_time is in format HH:MM
      eventTimestamp = `${event_date}T${event_time}:00.000Z`;
    }

    // Get category_id from category_name
    let category_id = null;
    if (category_name) {
      const { data: categoryData } = await supabase
        .from('event_category')
        .select('category_id')
        .eq('category_name', category_name)
        .single();

      if (categoryData) {
        category_id = categoryData.category_id;
      }
    }

    // Get the existing event to check for old image
    const { data: existingEvent } = await supabase
      .from('event')
      .select('event_picture')
      .eq('event_id', Number(event_id))
      .single();

    let event_picture = existingEvent?.event_picture;

    // Handle image upload/update
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (existingEvent?.event_picture) {
        try {
          const url = new URL(existingEvent.event_picture);
          const pathParts = url.pathname.split('/storage/v1/object/public/synapse/');
          if (pathParts.length > 1) {
            const filePath = pathParts[1];
            await deleteImage({
              bucket: 'synapse',
              filePath
            });
          }
        } catch (imgError) {
          console.error('Failed to delete old image:', imgError);
        }
      }

      // Upload new image
      const uploadResult = await uploadImage({
        file: imageFile,
        bucket: 'synapse',
        folder: 'events'
      });
      event_picture = uploadResult.publicUrl;
    }

    // Build updates object
    const updates: any = {
      event_name,
      event_date: eventTimestamp,
      is_registration_open,
      is_dau_free,
    };

    if (category_id) updates.category_id = category_id;
    if (event_picture) updates.event_picture = event_picture;
    if (rulebook) updates.rulebook = rulebook;
    if (description) updates.description = description;
    if (coordinator_email) updates.coordinator_email = coordinator_email;
    if (venue) updates.venue = venue;

    // Update the event
    const { data: eventData, error: eventError } = await supabase
      .from("event")
      .update(updates)
      .eq("event_id", Number(event_id))
      .select()
      .single();

    if (eventError) throw eventError;

    // Handle fees update
    const fees = feesJson ? JSON.parse(feesJson) : null;

    if (fees && Array.isArray(fees)) {
      // 1. Find old fees linked to this event and get their QR codes
      const { data: oldLinks } = await supabase
        .from("event_fee")
        .select("fee_id, fee(qr_code, participation_type)")
        .eq("event_id", Number(event_id));

      const oldFeeIds = oldLinks?.map((link: any) => link.fee_id) || [];

      // Store old QR codes for deletion
      const oldQrCodes: Array<{ url: string, type: string }> = [];
      oldLinks?.forEach((link: any) => {
        if (link.fee?.qr_code) {
          oldQrCodes.push({
            url: link.fee.qr_code,
            type: link.fee.participation_type
          });
        }
      });

      // 2. Delete old fees
      if (oldFeeIds.length > 0) {
        await supabase.from("fee").delete().in("fee_id", oldFeeIds);
      }

      // 3. Create NEW fees from the form data
      if (fees.length > 0) {
        // Upload QR codes and map to participation types
        const qrCodeMap: Record<string, string | null> = {
          solo: null,
          duet: null,
          group: null
        };

        // Helper function to delete old QR code and upload new one
        const handleQrCodeUpdate = async (
          newFile: File | null,
          type: string
        ): Promise<string | null> => {
          // Find and delete old QR code for this type
          const oldQr = oldQrCodes.find(qr => qr.type.toLowerCase() === type);
          if (oldQr) {
            try {
              const url = new URL(oldQr.url);
              const pathParts = url.pathname.split('/storage/v1/object/public/qr-code/');
              if (pathParts.length > 1) {
                const filePath = pathParts[1];
                await deleteImage({
                  bucket: 'qr-code',
                  filePath
                });
              }
            } catch (error) {
              console.error(`Failed to delete old QR code for ${type}:`, error);
            }
          }

          // Upload new QR code if provided
          if (newFile && newFile.size > 0) {
            const uploadResult = await uploadImage({
              file: newFile,
              bucket: 'qr-code',
              folder: 'events'
            });
            return uploadResult.publicUrl;
          }

          return null;
        };

        // Handle QR code updates for each type
        qrCodeMap.solo = await handleQrCodeUpdate(qrCodeSolo, 'solo');
        qrCodeMap.duet = await handleQrCodeUpdate(qrCodeDuet, 'duet');
        qrCodeMap.group = await handleQrCodeUpdate(qrCodeGroup, 'group');

        const feeInserts = fees.map((f: any) => ({
          participation_type: f.type,
          price: Number(f.price),
          min_members: Number(f.min || 1),
          max_members: Number(f.max || 1),
          qr_code: qrCodeMap[f.type] || null,
        }));

        const { data: newFees, error: newFeeError } = await supabase
          .from("fee")
          .insert(feeInserts)
          .select();

        if (newFeeError) throw newFeeError;

        const newLinks = newFees.map((f: any) => ({
          event_id: Number(event_id),
          fee_id: f.fee_id,
        }));

        await supabase.from("event_fee").insert(newLinks);
      } else {
        // If no fees provided, delete all old QR codes
        for (const oldQr of oldQrCodes) {
          try {
            const url = new URL(oldQr.url);
            const pathParts = url.pathname.split('/storage/v1/object/public/qr-code/');
            if (pathParts.length > 1) {
              const filePath = pathParts[1];
              await deleteImage({
                bucket: 'qr-code',
                filePath
              });
            }
          } catch (error) {
            console.error('Failed to delete QR code:', error);
          }
        }
      }
    }

    const response = NextResponse.json({ success: true, event: eventData });
    return addCorsHeaders(response, origin);
  } catch (error: unknown) {
    console.error("Update Error:", error);
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, origin);
  }
}

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

    // Get the event to retrieve the image path and associated fees
    const { data: event } = await supabase
      .from('event')
      .select('event_picture')
      .eq('event_id', Number(id))
      .single()

    // Get all fees associated with this event to delete their QR codes
    const { data: eventFees } = await supabase
      .from('event_fee')
      .select('fee_id, fee(qr_code)')
      .eq('event_id', Number(id))

    // Delete the event from database (cascade will delete event_fee links)
    const { error } = await supabase
      .from('event')
      .delete()
      .eq('event_id', Number(id))

    if (error) throw error

    // Delete the event image from storage if it exists
    if (event?.event_picture) {
      try {
        // Extract the file path from the public URL
        const url = new URL(event.event_picture)
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

    // Delete all QR codes associated with the event fees
    if (eventFees && eventFees.length > 0) {
      for (const eventFee of eventFees) {
        if (eventFee.fee?.qr_code) {
          try {
            const url = new URL(eventFee.fee.qr_code)
            const pathParts = url.pathname.split('/storage/v1/object/public/qr-code/')
            if (pathParts.length > 1) {
              const filePath = pathParts[1]
              await deleteImage({
                bucket: 'qr-code',
                filePath
              })
            }
          } catch (qrError) {
            console.error('Failed to delete QR code:', qrError)
            // Continue even if QR code deletion fails
          }
        }
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
