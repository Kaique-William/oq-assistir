"use client";

import { useEffect, useState, createContext, ReactNode } from "react";

// Cria o contexto para compartilhar dados entre componentes
export const SerieContext = createContext<{
    dados: Serie[];
    searchQuery: string;
    filteredData: Serie[];
    setSearchQuery: (query: string) => void;
    tmdbResults: TMDB[];
    setTmdbResults: (results: TMDB[]) => void;
} | null>(null);

interface Serie {
    id: number;
    nome: string;
    genero: string;
    ano: number;
    status: string;
    poster: string;
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

interface SeriesContextProps {
    children: ReactNode;
}

// Provedor do contexto que gerencia o estado das séries
export function SeriesProvider({ children }: SeriesContextProps) {
    const [dados, setDados] = useState<Serie[]>([]);
    const [tmdbResults, setTmdbResults] = useState<TMDB[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Filtra os dados com base na query de busca
    const filteredData =
        dados && dados.length > 0
            ? dados.filter((serie) => {
                return (
                    serie.nome ||
                    serie.genero ||
                    serie.ano &&
                    serie.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    serie.genero.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    serie.ano.toString().includes(searchQuery)
                );
            })
            : [];

    // Busca os dados quando a query de busca muda
    useEffect(() => {
        async function fetchData() {
            const busca = await fetch(`/series/api?q=${searchQuery}`);
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
        <SerieContext.Provider
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
        </SerieContext.Provider>
    );
}
