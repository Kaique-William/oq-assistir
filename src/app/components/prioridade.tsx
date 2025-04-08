"use client";

import { useEffect, useState } from "react"
import Image from "next/image";

interface dig_anal {
    id: number,
    nome: string,
    poster: string,
    prioridade: number,
}

export default function Prioridade () {
    const [data, setData] = useState([])

    useEffect(() => {
        async function fetchData() {
            const busca = await fetch(`/series/api`);
            const resposta = await busca.json();
            const dados =  resposta.data

            const dadosFiltrados = dados.filter((item: dig_anal) => item.prioridade > 0); 
            const dadosOrdenados = dadosFiltrados.sort((a: dig_anal, b: dig_anal) => a.prioridade - b.prioridade);
            
            setData(dadosOrdenados);
        }
        fetchData();  
    }, []);

    return(
       <div className="w-full px-2">
            <ul className="flex overflow-x-auto space-x-4 scrollbar-hide">
            {data.map((item: dig_anal) => (
                <li key={item.id} className="flex-shrink-0">
                <Image
                    src={`https://image.tmdb.org/t/p/original/${item.poster}`}
                    alt={item.nome}
                    width={1080}
                    height={1920}
                    className="rounded-lg object-cover w-[180px] h-[250px]"
                />
                <h2 className="text-center line-clamp-2 text-ellipsis whitespace-normal w-[180px]">
                    {item.nome}
                </h2>
                </li>
            ))}
            </ul>
        </div>
    )
}