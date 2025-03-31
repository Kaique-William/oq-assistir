import { useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

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

interface ModalBuscaProps {
  serieApi: TMDB[];
  onClose: () => void;
}

export default function ModalBusca({ serieApi, onClose }: ModalBuscaProps) {
  // Função para salvar a série no banco de dados
  const handleSave = async (serie: TMDB) => {
    const {
      id,
      name,
      genres,
      first_air_date,
      poster_path
    } = serie;

    // Filtra os gêneros para remover "animação"
    const filtrarGenero = genres.map((genre) => genre.name);

    const genero = filtrarGenero.join(" / ");

    const ano = parseInt(first_air_date.slice(0, 4), 10);

    try {
      // Envia uma requisição POST para salvar a série
      const response = await fetch("series/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          nome: name,
          genero,
          ano,
          poster: poster_path
        }),
      });

      if (!response.ok) {
        Swal.fire({
          title: "Erro ao salvar série!",
          icon: "error"
        })
        
        throw new Error("Erro ao salvar a série");
      }

      onClose();

      // Recarrega a página após salvar
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  useEffect(() => {
    // Impede a rolagem da tela de fundo quando a modal está aberta
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
          {serieApi.map((serie, index) => (
            <li
              key={serie.id}
              className={`flex flex-col items-center p-3 space-y-2 ${index < serieApi.length - 1
                ? "border-b-2 border-gray-400 pb-4"
                : ""
                }`}
            >
              <h2 className="text-teal-300 font-bold text-center text-3xl">{serie.name}</h2>
              <Image
                src={`https://image.tmdb.org/t/p/original${serie.poster_path}`}
                alt={serie.name}
                width={1080}
                height={1920}
                className="w-[80%] lg:w-[60%] rounded-md"
              />
              <p className="text-gray-300 text-center">
                <span className="font-bold text-lg text-white">Gênero: </span>
                {serie.genres
                  .filter((genre) => genre.name.toLowerCase() !== "animação")
                  .map((genero) => genero.name)
                  .join(" / ")}
              </p>
              <p className="text-gray-300">
                <span className="font-bold text-lg text-white">Ano:</span>{" "}
                {parseInt(serie.first_air_date.slice(0, 4), 10)}
              </p>
              <p className="text-gray-300">
                <span className="font-bold text-lg text-white">Temporadas:</span>{" "}
                {serie.number_of_seasons}
              </p>
              <p className="text-gray-300">
                <span className="font-bold text-lg text-white">Episódios:</span>{" "}
                {serie.number_of_episodes}
              </p>
              <p className="text-gray-300 text-center text-lg">{serie.overview}</p>
              <button
                className="mx-2 p-2 mt-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                onClick={() => handleSave(serie)}
              >
                Salvar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
