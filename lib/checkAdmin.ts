

export async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return false

  if (user.email === process.env.ADMIN_EMAIL) {
    return true
  }

  return false
}