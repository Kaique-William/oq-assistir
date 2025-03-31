import { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

interface ModalInfoProps {
  filme: {
    id: number;
  };
  onClose: () => void;
}

export default function ModalInfo({ filme, onClose }: ModalInfoProps) {
  const [dados, setDados] = useState<{
    id: number;
    title: string;
    genres: { id: number; name: string }[];
    release_date: string;
    runtime: number;
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
        Swal.fire({
          title: "Erro ao deletar filme!",
          icon: "error"
        })
                
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
        className="lg:w-[70%] w-[97%] max-h-[80%] mt-3 bg-black border-2 border-white p-4 rounded-lg flex flex-col items-center text-center overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full justify-between p-2">
          <span
            className="text-red-600 font-bold text-3xl hover:cursor-pointer"
            onClick={handleClose}
          >
            &times;
          </span>
          <button
            className="p-2 mr-2 border border-red-600 hover:bg-red-600 text-white rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(filme.id);
            }}
          >
            Deletar
          </button>
        </div>

        <h2 className="text-blue-500 font-bold text-center mb-4 text-3xl">
          {dados.title}
        </h2>
        <Image
          src={imageUrl}
          alt={`poster de ${dados.title}`}
          width={1080}
          height={1920}
          className="w-[80%] lg:w-[60%] rounded-md"
        />
        <p className="text-zinc-300 text-center">
          <span className="font-bold text-lg text-white">Gênero:</span>{" "}
          {dados.genres.map((genre) => genre.name).join(" / ")}
        </p>
        <p className="text-zinc-300">
          <span className="font-bold text-lg text-white">Ano:</span>{" "}
          {dados.release_date.slice(0, 4)}
        </p>
        <p className="text-zinc-300">
          <span className="font-bold text-lg text-white">Duração:</span>{" "}
          {Math.floor(dados.runtime / 60)}h {dados.runtime % 60}m
        </p>
        <p className="text-lg text-center text-zinc-300">{dados.overview}</p>
      </div>
    </div>
  );
}
