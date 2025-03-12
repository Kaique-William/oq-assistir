import { useEffect } from "react";
import Image from "next/image";

interface TMDB {
  id: number;
  title: string;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string;
  release_date: string;
  runtime: number;
}

interface ModalBuscaProps {
  filmesApi: TMDB[];
  onClose: () => void;
}

export default function ModalBusca({ filmesApi, onClose }: ModalBuscaProps) {
  const handleSave = async (filme: TMDB) => {
    const { id, title, genres, release_date, runtime } = filme;

    const filtrarGenero = genres.map((genre) => genre.name);

    const genero = filtrarGenero.join(" / ");

    const ano = parseInt(release_date.slice(0, 4), 10);

    try {
      const response = await fetch("filmes/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          nome: title,
          genero,
          ano,
          duracao: runtime,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o filme");
      }

      onClose();
      window.location.reload();
    } catch (error) {
      console.log("Erro ao salvar:", error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed mt-3 w-full h-full inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
      <div className="lg:w-[70%] w-[97%] max-h-[80%] bg-black border-2 border-white px-1 py-2 rounded-lg overflow-y-auto">
        <span
          className="m-2 fixed text-red-600 font-bold text-3xl hover:cursor-pointer"
          onClick={onClose}
        >
          &times;
        </span>
        <ul className="space-y-4">
          {filmesApi.map((filme, index) => {
            const horas = Math.floor(filme.runtime / 60);
            const restoMinutos = filme.runtime % 60;
            return (
              <li
                key={filme.id}
                className={`flex flex-col items-center p-3 space-y-2 ${index < filmesApi.length - 1 ? "border-b-2 border-gray-400 pb-4" : ""
                  }`}
              >
                <h2 className="text-blue-500 font-bold text-center text-3xl">
                  {filme.title}
                </h2>
                <Image
                  src={`https://image.tmdb.org/t/p/original${filme.poster_path}`}
                  alt={filme.title}
                  width={1080}
                  height={1920}
                  className="w-[80%] lg:w-[60%] rounded-md"
                />
                <p className="text-zinc-300 text-center">
                  <span className="font-bold text-lg text-white">Genero: </span>
                  {filme.genres.map((genre) => genre.name).join(" / ")}
                </p>
                <p className="text-zinc-300">
                  <span className="font-bold text-lg text-white">Ano: </span>
                  {parseInt(filme.release_date.slice(0, 4), 10)}
                </p>
                <p className="text-zinc-300">
                  <span className="font-bold text-lg text-white">
                    Duração:{" "}
                  </span>
                  {horas}h{restoMinutos}min
                </p>
                <p className="text-gray-300 text-center test-lg">
                  {filme.overview}
                </p>
                <button
                  className="mx-2 p-2 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                  onClick={() => handleSave(filme)}
                >
                  Salvar
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
