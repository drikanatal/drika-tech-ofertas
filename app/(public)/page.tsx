import { Hero } from "@/components/Hero";
import { Footer, TrustStrip } from "@/components/Rodape";
import { Vitrine } from "@/components/Vitrine";
import { buscarVitrine } from "@/lib/vitrine";

export default async function Home() {
  const { produtos, categorias } = await buscarVitrine();

  return (
    <Vitrine
      produtos={produtos}
      categorias={categorias}
      hero={<Hero />}
      rodape={
        <>
          <TrustStrip />
          <Footer />
        </>
      }
    />
  );
}
