import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * Supabase Admin Client (Service Role)
 * 
 * This client uses the service role key for admin operations that bypass RLS.
 * It's designed for server-side only use in:
 * - API routes
 * - Server Components
 * - Server Actions
 * 
 * IMPORTANT: Never expose this client or its key to the client-side.
 * 
 * Uses a lazy singleton pattern that works well with:
 * - Serverless functions (Vercel)
 * - Edge runtime
 * - Node.js long-running processes
 */

// Use globalThis for singleton across module reloads in development
const globalForSupabase = globalThis as unknown as {
  supabaseAdmin: SupabaseClient<Database> | undefined;
};

function createSupabaseAdmin(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabaseServiceKey) {
    throw new Error("Missing SUPABASE_SECRET_KEY environment variable");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    // Connection pooling settings for better performance
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-application-name": "synapse-admin",
      },
    },
  });
}

/**
 * Get the Supabase admin client (service role)
 * This bypasses Row Level Security - use with caution
 */
export function getSupabaseServer(): SupabaseClient<Database> {
  if (process.env.NODE_ENV === "production") {
    // In production, always create fresh client for serverless
    return createSupabaseAdmin();
  }

  // In development, reuse singleton across hot reloads
  if (!globalForSupabase.supabaseAdmin) {
    globalForSupabase.supabaseAdmin = createSupabaseAdmin();
  }

  return globalForSupabase.supabaseAdmin;
}

/**
 * Alias for clarity - use this for admin operations
 */
export const getSupabaseAdmin = getSupabaseServer;
