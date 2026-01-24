import {
  createClientWithToken,
  getTokenFromRequest,
} from "@/utils/supabase/apiClient";

import { SupabaseClient } from "@supabase/supabase-js";

export async function checkAdmin(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return false;

  if (user.email === process.env.ADMIN_EMAIL) {
    return true;
  }

  return false;
}

export async function checkAdminFromRequest(
  request: Request
): Promise<{ isAdmin: boolean; supabase: SupabaseClient | null }> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return { isAdmin: false, supabase: null };
  }

  const supabase = createClientWithToken(token);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { isAdmin: false, supabase: null };
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  return { isAdmin, supabase };
}
