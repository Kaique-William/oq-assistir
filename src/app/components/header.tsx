"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useState } from "react";
import { AnimeContext } from "../(categorias)/animes/componentes/contexto";
import { FilmeContext } from "../(categorias)/filmes/componentes/contexto";
import { SerieContext } from "../(categorias)/series/componentes/contexto";

const Links = [
  { href: "/animes", label: "Animes" },
  { href: "/filmes", label: "Filmes" },
  { href: "/series", label: "Series" },
];

export default function Header() {
  const pathname = usePathname();
  const animesContext = useContext(AnimeContext);
  const filmesContext = useContext(FilmeContext);
  const seriesContext = useContext(SerieContext);

  const [pesquisa, setPesquisa] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPesquisa(e.target.value);
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pathname.startsWith("/animes")) {
      animesContext?.setSearchQuery(pesquisa);
    } else if (pathname.startsWith("/filmes")) {
      filmesContext?.setSearchQuery(pesquisa);
    } else if (pathname.startsWith("/series")) {
      seriesContext?.setSearchQuery(pesquisa);
    }
    setPesquisa(""); // Limpar a linha de pesquisa após a submissão
  };

  return (
    <div className="bg-black border-b-2 border-white flex justify-between items-center p-1 pb-2 fixed top-0 w-full lg:h-[10%] h-[9%] z-10">
      <div className="text-white ml-3">
        <Link href="/">cine</Link>
      </div>
      <div className="flex-1 text-center mr-10 space-y-2">
        {Links.map((link) => {
          const ativo =
            pathname === link.href ||
            (pathname.startsWith(link.href) && link.href !== "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                ativo
                  ? "text-red-600"
                  : "text-white" + " mx-2 hover:text-red-500"
              }
            >
              {link.label}
            </Link>
          );
        })}
        <form onSubmit={handleSearchSubmit}>
          <input
            className="text-black px-2 w-56 lg:w-[500px] rounded-md"
            type="search"
            name="q"
            placeholder="pesquisa..."
            value={pesquisa}
            onChange={handleSearchChange}
            autoComplete="off" // Desativar sugestões
          />
        </form>
      </div>
    </div>
  );
}
