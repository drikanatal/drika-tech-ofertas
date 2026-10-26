export function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="trust-strip-inner">
        <div className="trust-signature">
          <div className="trust-signature-row">
            <div className="trust-signature-text">
              Obrigada
              <br />
              por estar
              <br />
              aqui!
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- otimização com next/image fica para o Prompt 5 */}
            <img className="trust-signature-avatar" src="/images/drikatech-logo.jpg" alt="@drikatech" />
          </div>
          <div className="trust-signature-heart">♥ Drika</div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-logos">
        <span className="footer-store-chip amazon">🛒 Amazon Afiliados</span>
        <span className="footer-store-chip shopee">🛍️ Shopee Afiliados</span>
        <span className="footer-store-chip ml">🟡 Mercado Livre Afiliados</span>
      </div>
      <p>
        <strong>Drika Tech Ofertas</strong> — Curadoria de ofertas selecionadas
      </p>
      <p style={{ marginTop: 4 }}>
        Ao clicar nos links e efetuar compras, podemos receber comissão sem custo adicional para você.
      </p>
    </footer>
  );
}
