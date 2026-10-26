"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Favoritos do visitante, salvos só neste navegador (sem login)
const CHAVE = "drika-favoritos";
const VAZIO = "[]";
const ouvintes = new Set<() => void>();

function ler(): string {
  try {
    return localStorage.getItem(CHAVE) ?? VAZIO;
  } catch {
    return VAZIO;
  }
}

function gravar(ids: string[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(ids));
  } catch {
    // Navegação privada ou armazenamento bloqueado: o favorito vale só até recarregar
  }
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  const aoMudarEmOutraAba = (e: StorageEvent) => e.key === CHAVE && avisar();
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(avisar);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

export function useFavoritos() {
  const bruto = useSyncExternalStore(assinar, ler, () => VAZIO);

  const ids = useMemo(() => {
    try {
      const lista = JSON.parse(bruto);
      return new Set<string>(Array.isArray(lista) ? lista : []);
    } catch {
      return new Set<string>();
    }
  }, [bruto]);

  const alternar = useCallback(
    (id: string) => {
      const proximo = new Set(ids);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      gravar([...proximo]);
    },
    [ids],
  );

  return { ids, alternar };
}
