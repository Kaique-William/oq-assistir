import { useState, useEffect } from "react";
import Image from "next/image";
import { FaEye } from "react-icons/fa"; // Importar o ícone de olho

interface CardProps {
  filme: {
    id: number;
    nome: string;
    genero: string;
    ano: number;
    status: string;
    poster: string;
  };
  onClick: () => void;
}

export function Card({ filme, onClick }: CardProps) {
  const [status, setStatus] = useState(filme.status);
  const [tempo, setTempo] = useState<NodeJS.Timeout | null>(null);

  const handleStatus = async () => {
    let novoStatus = "";
    if (status === "pra assistir") {
      novoStatus = "assistindo";
    } else if (status === "assistindo") {
      novoStatus = "assistido";
    } else {
      novoStatus = "pra assistir";
    }

    setStatus(novoStatus);

    if (tempo) {
      clearTimeout(tempo);
    }

    if (novoStatus !== filme.status) {
      const novoTempo = setTimeout(() => {
        updateStatus(novoStatus);
        window.location.reload();
      }, 2000);

      setTempo(novoTempo);
    }
  };

  const updateStatus = async (novoStatus: string) => {
    const resposta = await fetch("filmes/api", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: filme.id,
        status: novoStatus,
      }),
    });

    if (!resposta.ok) {
      throw new Error("Erro ao atualizar status");
    }
  };

  useEffect(() => {
    return () => {
      if (tempo) {
        clearTimeout(tempo);
      }
    };
  }, [tempo]);

  return (
    <div className="relative w-full h-full">
      <Image
        src={`https://image.tmdb.org/t/p/original${filme.poster}`}
        alt={`Poster do filme ${filme.nome}`}
        width={1080}
        height={1920}
        className="w-[180px] h-[240px] rounded-md"
        onClick={onClick}
      />
      <button
        className={`absolute top-0 right-0 rounded-full p-2 ${status === "pra assistir"
            ? "bg-gray-500"
            : status === "assistindo"
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
        onClick={(e) => {
          e.stopPropagation();
          handleStatus();
        }}
      >
        <FaEye className="text-white" />
      </button>
    </div>
  );
}
