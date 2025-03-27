"use client"

import { useContext, useState } from "react";
import { Card } from "./card";
import { AnimeContext } from "./contexto";
import ModalInfo from "./modalInfo";
import ModalBusca from "./modalBusca";

interface Props {
  id: number;
  status: string;
}

export default function Lista() {
  const [selecionado, setSelecionado] = useState<Props | null>(null);
  const contexto = useContext(AnimeContext);

  if (!contexto) {
    return <div>Carregando...</div>;
  }

  const { filteredData, tmdbResults, setTmdbResults, searchQuery } = contexto;

  // Define o anime selecionado para exibir no modal de informações
  const handleClickInfo = (anime: Props) => {
    setSelecionado(anime);
  };

  // Fecha o modal de informações
  const handleClose = () => {
    setSelecionado(null);
  };

  // Realiza a busca no TMDB
  const handleTmdbSearch = async () => {
    const response = await fetch(`/animes/api?q=${searchQuery}&source=tmdb`);
    const data = await response.json();
    setTmdbResults(data.data);
  };

  // ação de atualizar os dados do banco
  // const handleUpdate = async () => {
  //   try {
  //     const response = await fetch("animes/api", {
  //       method: "PUT",
  //     });

  //     if (!response.ok) {
  //       throw new Error("Erro ao atualizar os dados do banco");
  //     }

  //     window.location.reload();
  //   } catch (error) {
  //     console.log("Erro ao atualizar:", error);
  //   }
  // };

  return (
    <div className="flex flex-col items-center">

      <ul className="flex justify-center flex-wrap gap-2">
        {filteredData
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((anime) => {
            let corBorda = "";

            if (anime.status === "pra assistir") {
              corBorda = "from-zinc-500";
            } else if (anime.status === "assistindo") {
              corBorda = "from-yellow-500";
            } else {
              corBorda = "from-green-500";
            }

            return (
              <li
                className={` w-[182px] h-[250px] p-1 mb-1 rounded-lg bg-gradient-to-t ${corBorda} via-black to-black border border-white hover:cursor-pointer hover:scale-105 duration-300`}
                key={anime.id}
              >
                <Card anime={anime} onClick={() => handleClickInfo(anime)} />
              </li>
            );
          })}
      </ul>
      
      {searchQuery && filteredData.length > 0 && (
        <button
          className="mt-4 px-4 py-2 border border-blue-500 text-white rounded-lg hover:bg-blue-700"
          onClick={handleTmdbSearch}
        >
          Mais resultados
        </button>
      )}
      {selecionado && <ModalInfo anime={selecionado} onClose={handleClose} />}

      {tmdbResults.length > 0 && (
        <ModalBusca animeApi={tmdbResults} onClose={() => setTmdbResults([])} />
      )}
    </div>
  );
}
