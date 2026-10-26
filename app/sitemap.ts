import type { MetadataRoute } from "next";

// Só a vitrine: /dt-studio e /acesso ficam de fora
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://drikatech.com.br/", changeFrequency: "daily", priority: 1 }];
}
