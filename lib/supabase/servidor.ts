import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

// Cliente com a sessão do usuário (cookies), para o login e o painel (Prompt 2 em diante)
export async function criarClienteServidor() {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          cookiesParaGravar.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component: a sessão é renovada pelo proxy.ts
        }
      },
    },
  });
}
