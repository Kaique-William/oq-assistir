"use client";

import { useContext, useState } from "react";
import { Card } from "./card";
import { FilmeContext } from "./contexto";
import ModalInfo from "./modalInfo";
import ModalBusca from "./modalBusca";

interface Props {
  id: number;
  nome: string;
  genero: string;
  ano: number;
  duracao: number;
  status: string;
}

export default function Lista() {
  const [selecionado, setSelecionado] = useState<Props | null>(null);
  const contexto = useContext(FilmeContext);

  if (!contexto) {
    return <div>Carregando...</div>;
  }

  const { filteredData, tmdbResults, setTmdbResults } = contexto;

  const handleClickInfo = (filme: Props) => {
    setSelecionado(filme);
  };

  const handleClose = () => {
    setSelecionado(null);
  };

  return (
    <div className="flex flex-col items-center">
      <ul className="flex justify-center flex-wrap gap-2">
        {filteredData
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((filme) => {
            let corBorda = "";

            if (filme.status === "pra assistir") {
              corBorda = "from-zinc-500";
            } else if (filme.status === "assistindo") {
              corBorda = "from-yellow-500";
            } else {
              corBorda = "from-green-500";
            }

            return (
              <li
                className={` w-[182px] h-[250px] p-1 rounded-lg bg-gradient-to-t ${corBorda} via-black to-black border border-white hover:cursor-pointer hover:scale-105 duration-300`}
                key={filme.id}
              >
                <Card filme={filme} onClick={() => handleClickInfo(filme)} />
              </li>
            );
          })}
      </ul>
      {selecionado && <ModalInfo filme={selecionado} onClose={handleClose} />}

      {tmdbResults.length > 0 && (
        <ModalBusca
          filmesApi={tmdbResults}
          onClose={() => setTmdbResults([])}
        />
      )}
    </div>
  );
}
