import { useState, useEffect } from "react";

interface CardProps {
    serie: {
        id: number;
        nome: string;
        genero: string;
        ano: number;
        temporadas: number;
        episodios: number;
        status: string;
    };
    onClick: () => void;
}

// Componente Card que exibe informações básicas da série
export function Card({ serie, onClick }: CardProps) {
    const [status, setStatus] = useState(serie.status);
    const [tempo, setTempo] = useState<NodeJS.Timeout | null>(null);

    const handleStatus = async () => {
        let novoStatus = "";
        if (status === "pra assistir") {
            novoStatus = "assistindo";
        } else if (status === "assistindo") {
            novoStatus = "assistido";
        } else {
            novoStatus = "pra assistir";
        }

        setStatus(novoStatus);

        if (tempo) {
            clearTimeout(tempo);
        }

        if (novoStatus !== serie.status) {
            const novoTempo = setTimeout(() => {
                updateStatus(novoStatus);
                window.location.reload();
            }, 2000);

            setTempo(novoTempo);
        }
    };

    const updateStatus = async (novoStatus: string) => {
        const resposta = await fetch("series/api", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: serie.id,
                status: novoStatus,
            }),
        });

        if (!resposta.ok) {
            throw new Error("Erro ao atualizar status");
        }
    };

    useEffect(() => {
        return () => {
            if (tempo) {
                clearTimeout(tempo);
            }
        };
    }, [tempo]);

    return (
        <div
            onClick={onClick} // Chama a função onClick quando o card é clicado
            className="flex flex-col items-center h-full" // Adiciona classes CSS
        >
            <div className="flex flex-col text-center text-white pt-1 space-y-2">
                <h2 className="text-teal-300 font-bold line-clamp-2 overflow-hidden text-ellipsis whitespace-normal">
                    {serie.nome}
                </h2>
                <p className="text-gray-300 text-sm text-center">
                    <span className="font-bold text-white">Genero: </span>
                    {serie.genero}
                </p>
                <p className="text-gray-300 text-sm">
                    <span className="font-bold text-white">Ano: </span>
                    {serie.ano}
                </p>
                <p className="text-gray-300 text-sm">
                    <span className="font-bold text-white">Temporadas:</span> {serie.temporadas}
                </p>
                <p className="text-gray-300 text-sm">
                    <span className="font-bold text-white">Episódios:</span> {serie.episodios}
                </p>
            </div>
            <button
                className="bg-black border border-white hover:bg-gradient-to-t text-slate-300 rounded-md w-32 mt-auto" // Adiciona mt-auto para empurrar o botão para baixo
                onClick={(e) => {
                    e.stopPropagation();
                    handleStatus();
                }}
            >
                {status}
            </button>
        </div>
    );
}
