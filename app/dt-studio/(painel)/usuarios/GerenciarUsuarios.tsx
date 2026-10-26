"use client";

import { useActionState, useState, useTransition } from "react";
import type { UsuarioAutorizado } from "@/lib/types";
import { adicionarUsuario, removerUsuario, type EstadoFormulario } from "../acoes";

type Props = { usuarios: UsuarioAutorizado[]; emailLogado: string };

export function GerenciarUsuarios({ usuarios, emailLogado }: Props) {
  const [estado, enviar, salvando] = useActionState<EstadoFormulario, FormData>(adicionarUsuario, {});
  const [pendente, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function remover(email: string) {
    if (!window.confirm(`Remover o acesso de ${email}?`)) return;
    setErro(null);
    iniciar(async () => {
      try {
        await removerUsuario(email);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Algo deu errado.");
      }
    });
  }

  return (
    <div className={pendente ? "pendente" : undefined}>
      <form action={enviar} className="painel-cartao painel-linha-form">
        <label className="painel-campo">
          <span className="painel-rotulo">E-mail (conta Google)</span>
          <input name="email" type="email" placeholder="nome@gmail.com" />
          {estado.erros?.email && <span className="painel-erro">{estado.erros.email}</span>}
        </label>
        <label className="painel-campo">
          <span className="painel-rotulo">Nome (opcional)</span>
          <input name="nome" />
        </label>
        <button type="submit" className="painel-botao" disabled={salvando}>
          {salvando ? "Adicionando…" : "Autorizar"}
        </button>
        {estado.mensagem && <span className="painel-dica">{estado.mensagem}</span>}
      </form>

      {erro && <p className="painel-alerta erro">{erro}</p>}

      <div className="painel-tabela-wrap">
        <table className="painel-tabela">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Nome</th>
              <th>Perfil</th>
              <th aria-label="Ações"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.email}>
                <td>{u.email}</td>
                <td>{u.nome ?? "—"}</td>
                <td>{u.role}</td>
                <td>
                  {u.email === emailLogado ? (
                    <span className="painel-dica">você</span>
                  ) : (
                    <button type="button" className="painel-link perigo" onClick={() => remover(u.email)}>
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
