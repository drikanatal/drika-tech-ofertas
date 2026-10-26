"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const CHAVE_FECHADO = "drika-aviso-instalacao-fechado";
const semAssinatura = () => () => {};

// iPhone/iPad no Safari, ainda fora do app instalado
function precisaDoAviso(): boolean {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalado =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  let fechado = false;
  try {
    fechado = localStorage.getItem(CHAVE_FECHADO) === "1";
  } catch {
    // armazenamento bloqueado: mostra o aviso mesmo assim
  }
  return ios && !instalado && !fechado;
}

export function AvisoInstalacao() {
  const mostrar = useSyncExternalStore(semAssinatura, precisaDoAviso, () => false);
  const [fechado, setFechado] = useState(false);

  // Service worker mínimo (sem cache): deixa o painel instalável como app
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/dt-studio/" }).catch(() => {});
    }
  }, []);

  if (!mostrar || fechado) return null;

  function fechar() {
    setFechado(true);
    try {
      localStorage.setItem(CHAVE_FECHADO, "1");
    } catch {
      // sem armazenamento: o aviso volta na próxima visita
    }
  }

  return (
    <div className="aviso-instalacao" role="note">
      <span className="aviso-instalacao-icone" aria-hidden="true">
        📲
      </span>
      <p>
        Instale o app: toque em <strong>Compartilhar</strong> <span aria-hidden="true">⬆️</span> e depois em{" "}
        <strong>Adicionar à Tela de Início</strong>.
      </p>
      <button type="button" aria-label="Fechar aviso" onClick={fechar}>
        ×
      </button>
    </div>
  );
}
