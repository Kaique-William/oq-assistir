import { useEffect, useState } from "react";
import Image from "next/image";

interface dig_anal {
    id: number;
    nome: string;
    poster: string;
    prioridade: number;
}

export default function Prioridade() {
    const [data, setData] = useState<dig_anal[]>([]);
    const [tipo, setTipo] = useState<string>("series"); // Estado para armazenar o tipo selecionado

    useEffect(() => {
        async function fetchData() {
            const busca = await fetch(`/${tipo}/api`); // Busca com base no tipo selecionado
            const resposta = await busca.json();
            const dados = resposta.data;

            const dadosFiltrados = dados.filter((item: dig_anal) => item.prioridade > 0);
            const dadosOrdenados = dadosFiltrados.sort((a: dig_anal, b: dig_anal) => a.prioridade - b.prioridade);

            setData(dadosOrdenados);
        }
        fetchData();
    }, [tipo]); // Reexecuta o useEffect quando o tipo muda

    return (
        <div className="w-full px-2">
            {/* Botões para selecionar o tipo */}
            <div className="flex justify-center space-x-4 mb-4">
                <button
                    className={`px-4 py-2 rounded ${tipo === "series" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setTipo("series")}
                >
                    Séries
                </button>
                <button
                    className={`px-4 py-2 rounded ${tipo === "filmes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setTipo("filmes")}
                >
                    Filmes
                </button>
                <button
                    className={`px-4 py-2 rounded ${tipo === "animes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                    onClick={() => setTipo("animes")}
                >
                    Animes
                </button>
            </div>

            {/* Lista de itens */}
            <ul className="flex flex-col ml-5 space-y-4">
                {data.map((item: dig_anal) => (
                    <li key={item.id} className="flex items-center space-x-4">
                        <h2>{item.prioridade}</h2>
                        <Image
                            src={`https://image.tmdb.org/t/p/original/${item.poster}`}
                            alt={item.nome}
                            width={80}
                            height={120}
                            className="rounded-lg object-cover"
                        />
                        <h2 className="text-lg font-medium line-clamp-2 text-ellipsis whitespace-normal w-[120px]">{item.nome}</h2>
                    </li>
                ))}
            </ul>
        </div>
    );
}