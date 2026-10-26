import type { SupabaseClient } from "@supabase/supabase-js";

// Rota do painel após o login (a tela em si chega no Prompt 3)
export const DESTINO_PAINEL = "/dt-studio/produtos";

// Para onde vai quem não tem acesso: página em branco com mensagem genérica
export const DESTINO_SEM_ACESSO = "/acesso";

// O e-mail está na lista de usuarios_autorizados? (a RLS só deixa cada usuário ver a própria linha)
export async function emailAutorizado(supabase: SupabaseClient, email: string | undefined): Promise<boolean> {
  if (!email) return false;
  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return !error && data !== null;
}
