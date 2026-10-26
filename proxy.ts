import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DESTINO_PAINEL, DESTINO_SEM_ACESSO, emailAutorizado } from "@/lib/auth";
import { supabaseEnv } from "@/lib/supabase/env";

// Protege /dt-studio/*: exige sessão válida E e-mail em usuarios_autorizados.
// A RLS do banco repete a checagem, então isto não é a única barreira.
export async function proxy(request: NextRequest) {
  const { url, anonKey } = supabaseEnv();
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar) {
        cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  // getUser valida o token no Supabase (não confia só no cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naTelaDeLogin = request.nextUrl.pathname === "/dt-studio";
  const autorizado = user !== null && (await emailAutorizado(supabase, user.email));

  if (naTelaDeLogin) {
    return autorizado ? redirecionar(request, resposta, DESTINO_PAINEL) : resposta;
  }
  if (!user) return redirecionar(request, resposta, "/dt-studio");
  if (!autorizado) return redirecionar(request, resposta, DESTINO_SEM_ACESSO);
  return resposta;
}

// Redireciona mantendo os cookies de sessão renovados
function redirecionar(request: NextRequest, resposta: NextResponse, destino: string) {
  const redirect = NextResponse.redirect(new URL(destino, request.url));
  resposta.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/dt-studio", "/dt-studio/:path*"],
};
