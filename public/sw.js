// Service worker mínimo do app do painel: só torna o app instalável.
// Não guarda cache nem intercepta requisições, então o painel sempre mostra a versão mais recente.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
