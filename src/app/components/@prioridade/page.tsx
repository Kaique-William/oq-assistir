"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaEye } from "react-icons/fa";

interface dig_anal {
  id: number;
  nome: string;
  status: string;
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
  const [status, setStatus] = useState(data.animes[0]?.status || data.filmes[0]?.status || data.series[0]?.status); // Inicializa com o status do primeiro item
  const [tempo, setTempo] = useState<NodeJS.Timeout | null>(null);
  
  const handleStatus = async (item: dig_anal, categoria: string) => {
    let novoStatus = "";
    setStatus(item.status);
    
    if (status === "assistido") {
      novoStatus = "assistido";
    } else if (status === "assistindo") {
      novoStatus = "assistindo";
    } else if (status === "pra assistir") {
      novoStatus = "pra assistir";
    }

    setStatus(novoStatus);

    if (tempo) {
      clearTimeout(tempo);
    }

    if (novoStatus === "assistido") {
      item.prioridade = 0;
    }

    const atualizado = {
      ...item,
      status: novoStatus,
      prioridade: item.prioridade,
    };

    const novaLista = data[categoria].map((el) =>
      el.id === item.id ? atualizado : el
    );

    setData({ ...data, [categoria]: novaLista });

    if (novoStatus !== item.status) {
      const novoTempo = setTimeout(() => {
      updateStatus(item.id, novoStatus, item.prioridade, categoria)
      }, 2000);
      
      setTempo(novoTempo);
    };
  }

  const updateStatus = async (
    id: number,
    novoStatus: string,
    novaPrioridade: number,
    categoria: string
  ) => {
    try {
      const body =
        novoStatus === "assistido"
          ? { id, status: novoStatus, prioridade: novaPrioridade }
          : { id, status: novoStatus };

      const resposta = await fetch(`/${categoria}/api`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resposta.ok) {
        if (resposta.status === 409) {
          const erro = await resposta.json();
          console.error("Conflito de prioridade:", erro);
          alert("Conflito de prioridade. Atualize a página e tente novamente.");
        } else {
          throw new Error("Erro ao atualizar status");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar status. Tente novamente mais tarde.");
    }
  };

  useEffect(() => {
    setIsClient(true); // Define como cliente após a montagem do componente

    async function fetchData() {
      const categorias = ["animes", "filmes", "series"];
      const dadosPorCategoria: { [key: string]: dig_anal[] } = {};

      for (const categoria of categorias) {
        const busca = await fetch(`/${categoria}/api`);
        const resposta = await busca.json();
        const dados = resposta.data;

        const dadosFiltrados = dados.filter(
          (item: dig_anal) => item.prioridade > 0
        );
        const dadosOrdenados = dadosFiltrados.sort(
          (a: dig_anal, b: dig_anal) => a.prioridade - b.prioridade
        );

        dadosPorCategoria[categoria] = dadosOrdenados;
      }

      setData(dadosPorCategoria);

      return () => {
        if (tempo) {
          clearTimeout(tempo);
        }
      }
    }
    fetchData();
  }, [tempo]);

  return (
    <div className="w-full">
      {/* Botões para selecionar o tipo (somente em telas pequenas) */}
      <div className="flex justify-center space-x-4 mt-2 lg:hidden">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 ">
        {["animes", "filmes", "series"].map((categoria) => (
          <div
            key={categoria}
            className={`flex flex-col m-3 border-2 border-gray-200 rounded-lg  ${
              tipo === categoria || (isClient && window.innerWidth >= 1024)
                ? "block"
                : "hidden"
            }`}
          >
            {/* Nome da categoria (somente em telas grandes) */}
            <h2 className="text-xl font-bold text-center hidden lg:block capitalize">
              {categoria}
            </h2>
            <ul>
              {data[categoria]?.map((item: dig_anal) => (
                <li
                  key={item.id}
                  className={`flex items-center justify-between m-4 ${
                    item.prioridade % 2 === 0 ? "bg-gray-800" : "bg-gray-600"
                  } py-2 px-5 rounded-lg`}
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
                    className={` rounded-full p-2 ${
                      item.status === "pra assistir"
                        ? "bg-gray-500"
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
