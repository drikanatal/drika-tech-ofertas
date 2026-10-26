// Lê as variáveis do Supabase. No computador, o .env.local aponta para o Supabase local;
// em produção, a Netlify fornece as do projeto na nuvem.
export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local (veja .env.local.example).",
    );
  }
  return { url, anonKey };
}
