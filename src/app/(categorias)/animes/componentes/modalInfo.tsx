import { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

interface ModalInfoProps {
  anime: {
    id: number;
  };
  onClose: () => void;
}

export default function ModalInfo({ anime, onClose }: ModalInfoProps) {
  const [dados, setDados] = useState<{
    id: number;
    name: string;
    genres: { id: number; name: string }[];
    first_air_date: string;
    number_of_seasons: number;
    number_of_episodes: number;
    poster_path: string;
    overview: string;
  } | null>(null);

  const [showPrioridade, setShowPrioridade] = useState(false);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch("animes/api", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        Swal.fire({
          title: "Erro ao deletar série!",
          icon: "error",
        });

        throw new Error("Erro ao deletar o anime");
      }

      window.location.reload();
    } catch (error) {
      console.log("Erro ao deletar:", error);
    }
  };

  const handlePriorityChange = async (id: number, priority: number) => {
    try {
      const response = await fetch("animes/api", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, prioridade: priority }),
      });

      if (response.status === 409) {
        const data = await response.json();
        const { conflictingAnime } = data;

        const conflictingList = conflictingAnime
          .sort(
            (a: { prioridade: number }, b: { prioridade: number }) =>
              a.prioridade - b.prioridade
          )
          .map(
            (anime: { nome: string; prioridade: number }) =>
              `${anime.prioridade}) <strong>${anime.nome}</strong>`
          )
          .join("\n");

        const result = await Swal.fire({
          title: `Alterar prioridade?`,
          html: `<p>Esta é sua lista de prioridade atual:</p><br><pre>${conflictingList}</pre><br><p>Deseja substituir?</p>`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        });

        if (result.isConfirmed) {
          await fetch("animes/api", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, prioridade: priority, force: true }),
          });

          Swal.fire({
            title: "Prioridade alterada com sucesso!",
            icon: "success",
          });

          window.location.reload();
        }
      } else if (!response.ok) {
        throw new Error("Erro ao alterar a prioridade");
      } else {
        Swal.fire({
          title: "Prioridade alterada com sucesso!",
          icon: "success",
        });

        setShowPrioridade(false);
        window.location.reload();
      }
    } catch (error) {
      Swal.fire({
        title: "Erro ao alterar a prioridade",
        icon: "error",
      });

      console.log("Erro ao alterar prioridade:", error);
    }
  };

  // Busca dados adicionais do anime na API TMDB
  useEffect(() => {
    const fetchData = async () => {
      const key = process.env.NEXT_PUBLIC_API_KEY;
      const respostaAPI = await fetch(
        `https://api.themoviedb.org/3/tv/${anime.id}?api_key=${key}&language=pt-BR`
      );
      const data = await respostaAPI.json();
      setDados(data);
    };

    fetchData();
  }, [anime.id]);

  useEffect(() => {
    // Impede a rolagem da tela de fundo quando a modal está aberta
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

  // Define a URL da imagem do poster
  const imageUrl = `https://image.tmdb.org/t/p/original${dados.poster_path}`;

  return (
    <div
      className="w-full h-full fixed inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="lg:w-[70%] w-[97%] max-h-[80%] mt-3 bg-black border-2 border-white p-4 rounded-lg flex flex-col items-center text-center  overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full justify-between">
          <button
            className="text-red-600 font-bold text-3xl hover:cursor-pointer"
            onClick={handleClose}
          >
            &times;
          </button>
          <button
            className="p-2 ml-6 border border-yellow-600 hover:bg-yellow-600 text-white rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              setShowPrioridade(!showPrioridade);
            }}
          >
            Prioridade
          </button>

          <button
            className="p-2 border border-red-600 hover:bg-red-600 text-white rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(anime.id);
            }}
          >
            Deletar
          </button>
        </div>
        {showPrioridade && (
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((priority) => (
              <button
                key={priority}
                className="p-2 border border-blue-600 hover:bg-blue-600 text-white rounded-xl"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePriorityChange(anime.id, priority);
                }}
              >
                {priority}
              </button>
            ))}
          </div>
        )}

        <h2 className="text-orange-500 font-bold text-center mb-4 text-3xl">
          {dados.name}
        </h2>
        <Image
          src={imageUrl}
          alt={`poster de ${dados.name}`}
          width={1080}
          height={1920}
          className="w-[80%] lg:w-[60%] rounded-md"
        />
        <p className="text-gray-300 text-center">
          <span className="font-bold text-lg text-white">Genero: </span>
          {dados.genres.map((genre) => genre.name).join(" / ")}
        </p>
        <p className="text-gray-300">
          <span className="font-bold text-lg text-white">Ano: </span>
          {dados.first_air_date.slice(0, 4)}
        </p>
        <p className="text-gray-300">
          <span className="font-bold text-lg text-white">Temporadas: </span>
          {dados.number_of_seasons}
        </p>
        <p className="text-gray-300">
          <span className="font-bold text-lg text-white">Episódios: </span>
          {dados.number_of_episodes}
        </p>
        <p className="text-gray-300 text-center text-lg">{dados.overview}</p>
      </div>
    </div>
  );
}
