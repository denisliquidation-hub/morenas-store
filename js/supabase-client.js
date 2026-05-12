/*
 * Cliente Supabase compartilhado — Morenas Store
 * Publishable key é pública por design (proteção real = RLS policies no banco)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export const supabase = createClient(
  'https://ecyipfaayiewxmdztqee.supabase.co',
  'sb_publishable_L3xaALRkrXPiQNQ0zbUB_A_nQSskisX',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'morenas-auth',
    },
  }
);

/* Helpers de redirect com base no estado de sessão */
export async function getSessionAndProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { session: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, nome, telefone, role')
    .eq('id', session.user.id)
    .single();

  return { session, profile };
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/';
}
