"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ModalInfoProps {
  filme: {
    id: number;
    nome: string;
    genero: string;
    ano: number;
    duracao: number;
    status: string;
  };
  onClose: () => void;
}

export default function ModalInfo({ filme, onClose }: ModalInfoProps) {
  const [dados, setDados] = useState<{
    poster_path: string;
    overview: string;
  } | null>(null);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("filmes/api", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o filme");
      }

      window.location.reload();
    } catch (error) {
      console.log("Erro ao deletar:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const key = process.env.NEXT_PUBLIC_API_KEY;
      const respostaAPI = await fetch(
        `https://api.themoviedb.org/3/movie/${filme.id}?api_key=${key}&language=pt-BR`
      );
      const data = await respostaAPI.json();
      setDados(data);
    };

    fetchData();
  }, [filme.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  if (!dados) {
    return <div>Carregando...</div>;
  }

  const imageUrl = `https://image.tmdb.org/t/p/original${dados.poster_path}`;

  return (
    <div
      className="w-full h-full fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="lg:w-[70%] w-[98%] max-h-[80%] bg-black border border-white px-1 py-2  rounded-lg flex flex-col items-center text-center space-y-2 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full justify-between m-2">
          <button
            className="text-red-600 font-bold text-3xl hover:cursor-pointer"
            onClick={handleClose}
          >
            &times;
          </button>
          <button
            className="p-2 border border-red-500 hover:bg-red-500 text-white rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(filme.id);
            }}
          >
            Deletar
          </button>
        </div>

        <h2 className="text-purple-400 font-bold text-center text-2xl">{filme.nome}</h2>
        <Image
          src={imageUrl}
          alt={filme.nome}
          width={1080}
          height={1920}
          className="w-[80%] lg:w-[60%] rounded-md"
        />
        <p className="text-zinc-300 text-center">
          <span className="font-bold text-lg text-white">Gênero:</span> {filme.genero}
        </p>
        <p className="text-zinc-300">
          <span className="font-bold text-lg text-white">Ano:</span> {filme.ano}
        </p>
        <p className="text-zinc-300">
          <span className="font-bold text-lg text-white">Duração:</span> {filme.duracao} min
        </p>
        <p className="text-lg text-center text-zinc-300">{dados.overview}</p>
      </div>
    </div>
  );
}
