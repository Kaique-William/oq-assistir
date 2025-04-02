"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface dig_anal {
    id: number;
    nome: string;
    poster: string;
    prioridade: number;
}

export default function Prioridade() {
    const [data, setData] = useState<{ [key: string]: dig_anal[] }>({
        animes: [],
        filmes: [],
        series: [],
    });
    const [tipo, setTipo] = useState<string>("");
    const [isClient, setIsClient] = useState<boolean>(false); // Estado para verificar se está no cliente

    useEffect(() => {
        setIsClient(true); // Define como cliente após a montagem do componente

        async function fetchData() {
            const categorias = ["animes", "filmes", "series"];
            const dadosPorCategoria: { [key: string]: dig_anal[] } = {};

            for (const categoria of categorias) {
                const busca = await fetch(`/${categoria}/api`);
                const resposta = await busca.json();
                const dados = resposta.data;

                const dadosFiltrados = dados.filter((item: dig_anal) => item.prioridade > 0);
                const dadosOrdenados = dadosFiltrados.sort((a: dig_anal, b: dig_anal) => a.prioridade - b.prioridade);

                dadosPorCategoria[categoria] = dadosOrdenados;
            }

            setData(dadosPorCategoria);
        }
        fetchData();
    }, []);

    return (
        <div className="w-full px-2">
            {/* Botões para selecionar o tipo (somente em telas pequenas) */}
            <div className="flex justify-center space-x-4 mb-4 lg:hidden">
                <button
                    className={`px-4 py-2 rounded ${tipo === "animes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setTipo("animes")}
                >
                    Animes
                </button>
                <button
                    className={`px-4 py-2 rounded ${tipo === "filmes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setTipo("filmes")}
                >
                    Filmes
                </button>
                <button
                    className={`px-4 py-2 rounded ${tipo === "series" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setTipo("series")}
                >
                    Séries
                </button>
            </div>

            {/* Listas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {["animes", "filmes", "series"].map((categoria) => (
                    <div
                        key={categoria}
                        className={`flex flex-col ml-5 space-y-4 ${tipo === categoria || (isClient && window.innerWidth >= 1024) ? "block" : "hidden"
                            }`}
                    >
                        {/* Nome da categoria (somente em telas grandes) */}
                        <h2 className="text-xl font-bold mb-2 hidden lg:block capitalize">{categoria}</h2>
                        <ul>
                            {data[categoria]?.map((item: dig_anal) => (
                                <li key={item.id} className="flex items-center space-x-4">
                                    <h2>{item.prioridade}</h2>
                                    <Image
                                        src={`https://image.tmdb.org/t/p/original/${item.poster}`}
                                        alt={item.nome}
                                        width={80}
                                        height={120}
                                        className="rounded-lg object-cover"
                                    />
                                    <h2 className="text-lg font-medium line-clamp-2 text-ellipsis whitespace-normal w-[120px]">
                                        {item.nome}
                                    </h2>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}