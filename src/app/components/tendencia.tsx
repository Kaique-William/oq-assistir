"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import ModalTendencia from "./modalTendencia";
import Prioridade from "./prioridade";

const key = process.env.NEXT_PUBLIC_API_KEY;

interface item {
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

export default function Tendencia() {
  const [tendencia, setTendencia] = useState<item[]>([]);
  const [selecionado, setSelecionado] = useState<item | null>(null);

  useEffect(() => {
    async function fetchData() {
      const responce = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?language=pt-BR&api_key=${key}`
      );
      const data = await responce.json();
      setTendencia(data.results);
      // console.log(data);
    }
    fetchData();
  }, []);

  const handleClick = (item: item) => {
    setSelecionado(item);
  }

  const handleClose = () => {
    setSelecionado(null);
  }

  return (
    <div className="w-full px-2 pb-3 text-center bg-gradient-to-b from-black to-slate-700 ">
      <h1 className="text-2xl font-bold mb-4">Tendência da Semana</h1>
      <ul className="flex overflow-x-auto space-x-4 scrollbar-hide">
        {tendencia.map((item: item) => (
          <li key={item.id} className="flex-shrink-0" onClick={() => handleClick(item)}>
            <Image
              src={`https://image.tmdb.org/t/p/original/${item.poster_path}`}
              alt={item.name || item.title}
              width={1080}
              height={1920}
              className="rounded-lg object-cover w-[180px] h-[250px]"
            />
            <h2 className="text-center line-clamp-2 text-ellipsis whitespace-normal w-[180px]">
              {item.title || item.name}
            </h2>
          </li>
        ))}
      </ul>

        <br/>
        <h2>Lista de prioridade: </h2>
        <br/>
      <Prioridade />

      {selecionado && (
        <ModalTendencia info={[selecionado]} onClose={handleClose} />
      )}      
    </div>
  );
}
