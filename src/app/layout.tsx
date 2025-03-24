import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/header";
import { AnimeProvider } from "./(categorias)/animes/componentes/contexto";
import { FilmesProvider } from "./(categorias)/filmes/componentes/contexto";
import { SeriesProvider } from "./(categorias)/series/componentes/contexto";

export const metadata: Metadata = {
  title: {
    default: "vamos assistir",
    template: "vamos assistir %s",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`lg:mt-[85px] mt-[82px] bg-black text-white`}>
        <AnimeProvider>
          <FilmesProvider>
            <SeriesProvider>
              <Header />
              {children}
            </SeriesProvider>
          </FilmesProvider>
        </AnimeProvider>
      </body>
    </html>
  );
}
