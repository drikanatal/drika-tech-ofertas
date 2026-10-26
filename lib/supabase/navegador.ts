import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

// Cliente para Client Components (login com Google e painel, a partir do Prompt 2)
export function criarClienteNavegador() {
  const { url, anonKey } = supabaseEnv();
  return createBrowserClient(url, anonKey);
}
