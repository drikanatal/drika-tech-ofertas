import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

// Cliente sem sessão, para leituras públicas da vitrine (pode ser usado dentro de "use cache")
export function criarClientePublico() {
  const { url, anonKey } = supabaseEnv();
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
