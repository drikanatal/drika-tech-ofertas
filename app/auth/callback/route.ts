import { NextResponse, type NextRequest } from "next/server";
import { DESTINO_PAINEL, DESTINO_SEM_ACESSO, emailAutorizado } from "@/lib/auth";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Retorno do Google: troca o code pela sessão e confere a lista de e-mails autorizados
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destino = (caminho: string) => NextResponse.redirect(new URL(caminho, request.url));

  if (!code) return destino(DESTINO_SEM_ACESSO);

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return destino(DESTINO_SEM_ACESSO);

  if (await emailAutorizado(supabase, data.user.email)) return destino(DESTINO_PAINEL);

  // Não autorizado: encerra a sessão e volta para a vitrine sem revelar que existe painel
  await supabase.auth.signOut();
  return destino(DESTINO_SEM_ACESSO);
}
