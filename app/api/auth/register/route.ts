import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      phone, 
      college, 
      gender, 
      dob 
    } = body

    if (!email || !password || !first_name || !last_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const fullName = `${first_name} ${last_name}`.trim()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
       
        data: {
          full_name: fullName,
          phone: phone,
          college: college,
          gender: gender,
          dob: dob // Expecting format "YYYY-MM-DD" from frontend
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please check your email.' 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}