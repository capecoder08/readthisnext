"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Send a magic link to the user's email
 */
export async function sendMagicLink(
  email: string,
  redirectTo?: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  
  // Get the callback URL
  const callbackUrl = redirectTo 
    ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  return { error: error?.message || null };
}

/**
 * Get the current access token from the Supabase session
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || null;
}

/**
 * Get the full session object
 */
export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return !!user;
}

/**
 * Sign out the current user
 * Note: This function only signs out. Redirect should be handled by the caller.
 */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

