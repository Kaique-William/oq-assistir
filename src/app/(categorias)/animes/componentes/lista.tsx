"use client";

import { useContext, useState } from "react";
import { Card } from "./card";
import { AnimeContext } from "./contexto";
import ModalInfo from "./modalInfo";
import ModalBusca from "./modalBusca";

interface Props {
  id: number;
  nome: string;
  genero: string;
  ano: number;
  temporadas: number;
  episodios: number;
  status: string;
}

export default function Lista() {
  const [selecionado, setSelecionado] = useState<Props | null>(null);
  const contexto = useContext(AnimeContext);

  if (!contexto) {
    return <div>Carregando...</div>;
  }

  const { filteredData, tmdbResults, setTmdbResults } = contexto;

  // Define o anime selecionado para exibir no modal de informações
  const handleClickInfo = (anime: Props) => {
    setSelecionado(anime);
  };

  // Fecha o modal de informações
  const handleClose = () => {
    setSelecionado(null);
  };

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
                className={` w-[182px] h-[250px] p-1 rounded-lg bg-gradient-to-t ${corBorda} via-black to-black border border-white hover:cursor-pointer hover:scale-105 duration-300`}
                key={anime.id}
              >
                  <Card anime={anime} onClick={() => handleClickInfo(anime)} />
              </li>
            );
          })}
      </ul>
      {selecionado && <ModalInfo anime={selecionado} onClose={handleClose} />}

      {tmdbResults.length > 0 && (
        <ModalBusca animeApi={tmdbResults} onClose={() => setTmdbResults([])} />
      )}
    </div>
  );
}
