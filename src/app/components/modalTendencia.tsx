import Image from "next/image";
import { useEffect, useState } from "react"; // Adicionar useEffect

interface TMDB {
  id: number;
  name: string;
  title: string;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string;
  number_of_episodes: number;
  number_of_seasons: number;
  runtime: number;
  first_air_date: string;
  release_date: string;
  media_type: string;
}

interface Props {
  info: TMDB[];
  onClose: () => void;
}

const key = process.env.NEXT_PUBLIC_API_KEY;

export default function ModalTendencia({ info, onClose }: Props) {
  const [tendencias] = useState<TMDB[]>(info); // Corrigir o uso de useState
  const [dados, setDados] = useState<TMDB[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const promises = tendencias.map(async (tendencia) => {
        const respostaAPI = await fetch(
          `https://api.themoviedb.org/3/${tendencia.media_type}/${tendencia.id}?api_key=${key}&language=pt-BR`
        );
        const data = await respostaAPI.json();
        return { ...data, media_type: tendencia.media_type }; // Incluir media_type na resposta
      });
      const results = await Promise.all(promises);
      setDados(results);
    };
    fetchData();
  }, [tendencias]);

  return (
    <div className="fixed mt-3 w-full h-full inset-0 bg-black bg-opacity-55 flex items-center justify-center z-50">
      <div className="lg:w-[70%] w-[97%] max-h-[80%] bg-black border-2 border-white px-1 py-2  rounded-lg overflow-y-auto">
        <button
          className="m-2 fixed text-red-600 font-bold text-3xl hover:cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        <ul>
          {dados.map((tendencia) => (
            <li key={tendencia.id}>
              <h2>{tendencia.title || tendencia.name}</h2>
              <Image
                src={`https://image.tmdb.org/t/p/original${tendencia.poster_path}`}
                alt={tendencia.title || tendencia.name || "Poster"}
                width={1080}
                height={1920}
                className="w-[80%] lg:w-[60%] rounded-md"
                onClick={onClose} // Adicionar onClick para fechar a modal
              />
              <p>
                <span>Genero: </span>
                {tendencia.genres
                  ?.filter((genre) => genre.name.toLowerCase() !== "animação")
                  .map((genero) => genero.name)
                  .join(" / ")}
              </p>
              <p>
                <span>Ano: </span>
                {parseInt(
                  tendencia.first_air_date?.slice(0, 4) ||
                  tendencia.release_date?.slice(0, 4)
                )}
              </p>
              {tendencia.media_type === "tv" ? (
                <>
                  <p>
                    <span>Temporadas: </span>
                    {tendencia.number_of_seasons}
                  </p>
                  <p>
                    <span>Episodios: </span>
                    {tendencia.number_of_episodes}
                  </p>
                </>
              ) : (
                <p>
                  <span>Duração: </span>
                  {Math.floor(tendencia.runtime / 60)}h {tendencia.runtime % 60}
                  min
                </p>
              )}
              <p>{tendencia.overview}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
