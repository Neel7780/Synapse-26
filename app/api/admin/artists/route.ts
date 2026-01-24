import { checkAdmin } from '@/lib/checkAdmin'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { uploadImage, deleteImage } from '@/lib/imageUtil'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('artist')
    .select(`
      *,
      concert (
        concert_name
      )
    `)
    .order('reveal_date', { ascending: true })

  if (error) return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const concert_id = formData.get('concert_id') as string
    const genre = formData.get('genre') as string | null
    const reveal_date = formData.get('reveal_date') as string
    const bio = formData.get('bio') as string | null
    const imageFile = formData.get('image') as File | null

    if (!name || !concert_id || !reveal_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let artist_image_url = null

    // Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImage({
        file: imageFile,
        bucket: 'synapse',
        folder: 'artists'
      })
      artist_image_url = uploadResult.publicUrl
    }

    const { data, error } = await supabase
      .from('artist')
      .insert({
        name,
        concert_id: parseInt(concert_id),
        genre,
        reveal_date,
        bio,
        artist_image_url
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const concert_id = formData.get('concert_id') as string
    const genre = formData.get('genre') as string | null
    const reveal_date = formData.get('reveal_date') as string
    const bio = formData.get('bio') as string | null
    const imageFile = formData.get('image') as File | null

    if (!id || !name || !concert_id || !reveal_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the existing artist to check for old image
    const { data: existingArtist } = await supabase
      .from('artist')
      .select('artist_image_url')
      .eq('id', Number(id))
      .single()

    let artist_image_url = existingArtist?.artist_image_url

    // Handle image upload/update
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (existingArtist?.artist_image_url) {
        try {
          const url = new URL(existingArtist.artist_image_url)
          const pathParts = url.pathname.split('/storage/v1/object/public/synapse/')
          if (pathParts.length > 1) {
            const filePath = pathParts[1]
            await deleteImage({
              bucket: 'synapse',
              filePath
            })
          }
        } catch (imgError) {
          console.error('Failed to delete old image:', imgError)
        }
      }

      // Upload new image
      const uploadResult = await uploadImage({
        file: imageFile,
        bucket: 'synapse',
        folder: 'artists'
      })
      artist_image_url = uploadResult.publicUrl
    }

    const { data, error } = await supabase
      .from('artist')
      .update({
        name,
        concert_id: parseInt(concert_id),
        genre,
        reveal_date,
        bio,
        artist_image_url
      })
      .eq('id', Number(id))
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  if (!(await checkAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    // Get the artist to retrieve the image path
    const { data: artist } = await supabase
      .from('artist')
      .select('artist_image_url')
      .eq('id', id)
      .single()

    // Delete the artist from database
    const { error } = await supabase
      .from('artist')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Delete the image from storage if it exists
    if (artist?.artist_image_url) {
      try {
        const url = new URL(artist.artist_image_url)
        const pathParts = url.pathname.split('/storage/v1/object/public/synapse/')
        if (pathParts.length > 1) {
          const filePath = pathParts[1]
          await deleteImage({
            bucket: 'synapse',
            filePath
          })
        }
      } catch (imgError) {
        console.error('Failed to delete artist image:', imgError)
        // Continue even if image deletion fails
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}