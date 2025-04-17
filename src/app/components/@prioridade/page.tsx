"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaEye } from "react-icons/fa";

interface dig_anal {
  id: number;
  nome: string;
  poster: string;
  prioridade: number;
  status: string; // Adicionei o status aqui
}

export default function Prioridade() {
  const [data, setData] = useState<{ [key: string]: dig_anal[] }>({
    animes: [],
    filmes: [],
    series: [],
  });
  const [tipo, setTipo] = useState<string>("");
  const [isClient, setIsClient] = useState<boolean>(false); // Estado para verificar se está no cliente
  const [tempo, setTempo] = useState<NodeJS.Timeout | null>(null);

  const handleStatus = async (item: dig_anal, categoria: string) => {
    let novoStatus = "";
    if (item.status === "pra assistir") {
      novoStatus = "assistindo";
    } else if (item.status === "assistindo") {
      novoStatus = "assistido";
    } else {
      novoStatus = "pra assistir";
    }

    // Atualiza o status localmente
    const novosDados = { ...data };
    const itemIndex = novosDados[categoria].findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      novosDados[categoria][itemIndex].status = novoStatus;
      setData(novosDados);
    }

    if (tempo) {
      clearTimeout(tempo);
    }

    const novoTempo = setTimeout(() => {
      updateStatus(item.id, novoStatus, categoria);
    }, 2000);

    setTempo(novoTempo);
  };

  const updateStatus = async (id: number, novoStatus: string, categoria: string) => {
    try {
      const resposta = await fetch(`/${categoria}/api`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: novoStatus,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error(`Erro ao atualizar status na categoria ${categoria}:`, error);
    }
  };

  useEffect(() => {
    return () => {
      if (tempo) {
        clearTimeout(tempo);
      }
    };
  }, [tempo]);

  useEffect(() => {
    setIsClient(true); // Define como cliente após a montagem do componente

    async function fetchData() {
      const categorias = ["animes", "filmes", "series"];
      const dadosPorCategoria: { [key: string]: dig_anal[] } = {};

      for (const categoria of categorias) {
        try {
          const busca = await fetch(`/${categoria}/api`);
          const resposta = await busca.json();
          const dados = resposta?.data || [];

          const dadosFiltrados = dados.filter(
            (item: dig_anal) => item.prioridade > 0
          );
          const dadosOrdenados = dadosFiltrados.sort(
            (a: dig_anal, b: dig_anal) => a.prioridade - b.prioridade
          );

          dadosPorCategoria[categoria] = dadosOrdenados;
        } catch (error) {
          console.error(`Erro ao buscar dados para a categoria ${categoria}:`, error);
          dadosPorCategoria[categoria] = [];
        }
      }

      setData(dadosPorCategoria);
    }
    fetchData();
  }, []);

  return (
    <div className="w-full mt-5">
      {/* Botões para selecionar o tipo (somente em telas pequenas) */}
      <div className="flex justify-center space-x-4 mb-4 lg:hidden">
        <button
          className={`px-4 py-2 rounded ${
            tipo === "animes" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTipo("animes")}
        >
          Animes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tipo === "filmes" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTipo("filmes")}
        >
          Filmes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tipo === "series" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setTipo("series")}
        >
          Séries
        </button>
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3  ">
        {["animes", "filmes", "series"].map((categoria) => (
          <div
            key={categoria}
            className={`flex flex-col mx-3 p-4 space-y-4 border-2 rounded-md border-white ${
              tipo === categoria || (isClient && window.innerWidth >= 1024)
                ? "block"
                : "hidden"
            }`}
          >
            {/* Nome da categoria (somente em telas grandes) */}
            <h2 className="text-xl font-bold mb-2 text-center hidden lg:block capitalize">
              {categoria}
            </h2>
            <ul>
              {data[categoria]?.map((item: dig_anal) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center space-y-3 "
                >
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
                  <button
                    className={`rounded-full p-2 ${
                      item.status === "pra assistir"
                        ? "bg-zinc-500"
                        : item.status === "assistindo"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatus(item, categoria);
                    }}
                  >
                    <FaEye className="text-white" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
