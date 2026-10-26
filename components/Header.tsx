type Props = {
  busca: string;
  onBusca: (valor: string) => void;
  totalFavoritos: number;
  onAbrirFavoritos: () => void;
};

// Links com "#" por enquanto (decisão da Drika: destinos definidos depois)
export function Header({ busca, onBusca, totalFavoritos, onAbrirFavoritos }: Props) {
  return (
    <header>
      <div className="header-inner">
        <a href="#" className="logo">
          <span className="logo-icon">💡</span>Drika Tech <span>Ofertas</span>
        </a>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar produtos em oferta…"
            aria-label="Buscar produtos"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
          />
        </div>
        <nav className="header-nav">
          <a href="#">Categorias</a>
          <a href="#">Lojas</a>
          <a href="#">Sobre</a>
          <a href="#">Contato</a>
        </nav>
        <div className="header-social">
          <a href="#" aria-label="YouTube">
            <svg viewBox="0 0 24 24">
              <path
                fill="#FF0000"
                d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.529A2.994 2.994 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.994 2.994 0 0 0 2.112 2.112c1.881.529 9.386.529 9.386.529s7.505 0 9.386-.529a2.994 2.994 0 0 0 2.112-2.112C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z"
              />
            </svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 48 48">
              <defs>
                <linearGradient id="ig-gradient" x1="0" y1="48" x2="48" y2="0">
                  <stop offset="0%" stopColor="#FEDA75" />
                  <stop offset="25%" stopColor="#FA7E1E" />
                  <stop offset="50%" stopColor="#D62976" />
                  <stop offset="75%" stopColor="#962FBF" />
                  <stop offset="100%" stopColor="#4F5BD5" />
                </linearGradient>
              </defs>
              <rect width="48" height="48" rx="13" fill="url(#ig-gradient)" />
              <rect x="13" y="13" width="22" height="22" rx="6" fill="none" stroke="#fff" strokeWidth="2.5" />
              <circle cx="24" cy="24" r="6" fill="none" stroke="#fff" strokeWidth="2.5" />
              <circle cx="32.5" cy="15.5" r="1.8" fill="#fff" />
            </svg>
          </a>
          <a href="#" aria-label="TikTok">
            <svg viewBox="0 0 24 24">
              <path
                fill="#000"
                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"
              />
            </svg>
          </a>
          <a
            href="#"
            role="button"
            className="header-fav"
            aria-label={`Favoritos (${totalFavoritos})`}
            onClick={(e) => {
              e.preventDefault();
              onAbrirFavoritos();
            }}
          >
            🤍
            {totalFavoritos > 0 && <span className="header-fav-count">{totalFavoritos}</span>}
          </a>
        </div>
      </div>
    </header>
  );
}
