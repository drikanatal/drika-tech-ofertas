import { NextResponse, type NextRequest } from "next/server";
import { extrairProduto } from "@/lib/extracao";
import { lerAdmin } from "@/lib/painel";

// POST { url } → dados sugeridos do produto. Só para a admin logada.
export async function POST(request: NextRequest) {
  const admin = await lerAdmin();
  if (admin === "sem-sessao") return NextResponse.json({ sucesso: false, erro: "Faça login" }, { status: 401 });
  if (admin === "sem-acesso") return NextResponse.json({ sucesso: false, erro: "Acesso não disponível" }, { status: 403 });

  let url = "";
  try {
    const corpo = (await request.json()) as { url?: unknown };
    url = typeof corpo.url === "string" ? corpo.url : "";
  } catch {
    // corpo inválido: cai na validação abaixo
  }
  if (!url) return NextResponse.json({ sucesso: false, erro: "Informe o link do produto" }, { status: 400 });

  return NextResponse.json(await extrairProduto(url));
}
