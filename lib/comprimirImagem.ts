// Reduz a foto no próprio celular antes do envio: no máximo 1600 px no maior lado, em WEBP
// (ou JPEG, se o navegador não gerar WEBP). Uma foto de 3–8 MB vira algo como 150–400 KB.
const LADO_MAXIMO = 1600;

function gerarArquivo(canvas: HTMLCanvasElement, tipo: string, qualidade: number): Promise<Blob | null> {
  return new Promise((resolver) => canvas.toBlob(resolver, tipo, qualidade));
}

export async function comprimirImagem(arquivo: File): Promise<Blob> {
  const imagem = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagem.width * escala);
  canvas.height = Math.round(imagem.height * escala);
  canvas.getContext("2d")!.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  imagem.close();

  // Navegadores sem WEBP devolvem PNG em vez de recusar; nesse caso, JPEG fica menor
  const webp = await gerarArquivo(canvas, "image/webp", 0.82);
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await gerarArquivo(canvas, "image/jpeg", 0.85);
  if (!jpeg) throw new Error("Não foi possível processar a foto.");
  return jpeg;
}
