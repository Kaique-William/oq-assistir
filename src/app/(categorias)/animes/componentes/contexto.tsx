"use client";

import { useEffect, useState, createContext, ReactNode } from "react";

// Cria o contexto para compartilhar dados entre componentes
export const AnimeContext = createContext<{
  dados: Anime[];
  searchQuery: string;
  filteredData: Anime[];
  setSearchQuery: (query: string) => void;
  tmdbResults: TMDB[];
  setTmdbResults: (results: TMDB[]) => void;
} | null>(null);

interface Anime {
  id: number;
  nome: string;
  genero: string;
  ano: number;
  status: string;
  poster: string
  respostaApi: {
    overview: string;
    poster_path: string;
  };
}

interface TMDB {
  id: number;
  name: string;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string;
  number_of_episodes: number;
  number_of_seasons: number;
  first_air_date: string;
}

interface AnimeContextProps {
  children: ReactNode;
}

// Provedor do contexto que gerencia o estado dos animes
export function AnimeProvider({ children }: AnimeContextProps) {
  const [dados, setDados] = useState<Anime[]>([]);
  const [tmdbResults, setTmdbResults] = useState<TMDB[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filtra os dados com base na query de busca
  const filteredData =
    dados && dados.length > 0
      ? dados.filter((anime) => {
          return (
            anime.nome ||
            anime.genero ||
            anime.ano &&
            anime.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            anime.genero.toLowerCase().includes(searchQuery.toLowerCase()) ||
            anime.ano.toString().includes(searchQuery)
          );
        })
      : [];

  // Busca os dados quando a query de busca muda
  useEffect(() => {
    async function fetchData() {
      const busca = await fetch(`/animes/api?q=${searchQuery}`);
      const resposta = await busca.json();
      if (resposta.source === "tmdb") {
        setTmdbResults(resposta.data);
      } else {
        setDados(resposta.data);
      }
    }
    fetchData();
  }, [searchQuery]);

  // Retorna o provedor do contexto com os valores atuais
  return (
    <AnimeContext.Provider
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
    </AnimeContext.Provider>
  );
}
