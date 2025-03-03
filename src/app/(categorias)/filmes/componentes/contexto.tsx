"use client";

import { useEffect, useState, createContext, ReactNode } from "react";

export const FilmeContext = createContext<{
  dados: Filme[];
  searchQuery: string;
  filteredData: Filme[];
  setSearchQuery: (query: string) => void;
  tmdbResults: TMDB[];
  setTmdbResults: (results: TMDB[]) => void;
} | null>(null);

interface Filme {
  id: number;
  nome: string;
  genero: string;
  ano: number;
  duracao: number;
  status: string;
  respostaApi: {
    overview: string;
    poster_path: string;
  };
}

interface TMDB {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string;
  runtime: number;
  release_date: string;
}

interface FilmesContextProps {
  children: ReactNode;
}

export function FilmesProvider({ children }: FilmesContextProps) {
  const [dados, setDados] = useState<Filme[]>([]);
  const [tmdbResults, setTmdbResults] = useState<TMDB[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredData =
    dados && dados.length > 0
      ? dados.filter((filme) => {
          return (
            filme.nome ||
            filme.genero ||
            filme.ano &&
            filme.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            filme.genero.toLowerCase().includes(searchQuery.toLowerCase()) ||
            filme.ano.toString().includes(searchQuery)
          );
        })
      : [];

  useEffect(() => {
    async function fetchData() {
      const busca = await fetch(`/filmes/api?q=${searchQuery}`);
      const resposta = await busca.json();
      if (resposta.source === "tmdb") {
        setTmdbResults(resposta.data);
      } else {
        setDados(resposta.data);
      }
    }
    fetchData();
  }, [searchQuery]);

  return (
    <FilmeContext.Provider
      value={{
        dados,
        searchQuery,
        filteredData,
        setSearchQuery,
        tmdbResults,
        setTmdbResults,
      }}
    >
      {children}
    </FilmeContext.Provider>
  );
}
