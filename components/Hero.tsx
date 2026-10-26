export function Hero() {
  return (
    <section className="hero">
      <h1 className="sr-only">Tecnologia que facilita sua vida</h1>
      <p className="sr-only">
        Produtos, ferramentas e dicas reais para o seu dia a dia. Links de lojas seguras pra você acessar de forma
        simples e segura.
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element -- otimização com next/image fica para o Prompt 5 */}
      <img
        className="hero-art"
        src="/images/hero-banner.png"
        alt="Banner Drika Tech: Drika e seu mascote robô, com dicas de tecnologia, produtos, produtividade, inovação e liderança. Links oficiais e seguros; produtos que eu uso ou pesquiso e indico."
        width={1983}
        height={506}
        fetchPriority="high"
      />
    </section>
  );
}
