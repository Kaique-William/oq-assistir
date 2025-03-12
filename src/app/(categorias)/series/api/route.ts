import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

const key = process.env.NEXT_PUBLIC_API_KEY;

export async function GET(req: NextRequest) {
  try {
    // Extrai os parâmetros de busca da URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const source = searchParams.get("source") || "database";

    // Busca no banco de dados por séries que correspondem à query
    const buscaBanco = await sql`
          SELECT id, nome, genero, ano, temporadas, episodios, status FROM series
          WHERE LOWER(nome || genero || ano) LIKE ${
            "%" + query.toLowerCase() + "%"
          }
      `;
    const { rows: series } = buscaBanco;

    // Se não encontrar resultados no banco de dados, busca na API TMDB
    if (series.length === 0 || source === "tmdb") {
      const tmdbResults = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${query}&api_key=${key}`
      );
      const tmdbData = await tmdbResults.json();

      if (tmdbData.results && tmdbData.results.length > 0) {
        // Itera sobre todos os IDs dos resultados e busca detalhes adicionais para cada um
        const resultadoApi = await Promise.all(
          tmdbData.results.map(async (item: { id: number }) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/tv/${item.id}?api_key=${key}&language=pt-BR`
            );
            return response.json();
          })
        );

        // Filtra os resultados para excluir séries com o gênero "animação"
        const resultadoFiltrado = resultadoApi.filter(
          (serie: { genres: { id: number; name: string }[] }) =>
            !serie.genres.some(
              (genero: { name: string }) =>
                genero.name.toLowerCase() === "animação"
            )
        );

        // Retorna os resultados filtrados da API TMDB
        return NextResponse.json({ source: "tmdb", data: resultadoFiltrado });
      } else {
        // Retorna um erro se nenhum dado for encontrado na API TMDB
        return NextResponse.json(
          { error: "Nenhum dado encontrado na API" },
          { status: 404 }
        );
      }
    }

    // Retorna os resultados do banco de dados
    return NextResponse.json({ source: "database", data: series });
  } catch (error) {
    const erro = error as Error;
    if (erro.message.includes('relation " series"does not exist')) {
      await sql`
      CREATE TABLE IF NOT EXISTS series (
        id INT PRIMARY KEY,
        nome VARCHAR(255) TEXT NOT NULL,
        genero VARCHAR(255) TEXT NOT NULL,
        ano INT NOT NULL,
        temporadas INT NOT NULL,
        episodios INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pra assistir' CHECK (status IN ('pra assistir', 'assistindo', 'assistido'))
      )`;
      return NextResponse.json({ message: "Tabela series criada" });
    } else {
      return NextResponse.json(
        { error: "Erro ao acessar a base de dados" },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  const { id, nome, genero, ano, temporadas, episodios } = await req.json();

  try {
    await sql`
      INSERT INTO series (id, nome, genero, ano, temporadas, episodios)
      VALUES (${id}, ${nome}, ${genero}, ${ano}, ${temporadas}, ${episodios})
    `;

    return NextResponse.json(
      { message: "Série adicionada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar série: ", error);
    return NextResponse.json(
      { error: "Erro ao adicionar série" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();

  try {
    await sql`
      UPDATE series
      SET status = ${status}
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: "Status da série atualizado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar status da série: ", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status da série" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    await sql`
      DELETE FROM series
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: "Série deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar série: ", error);
    return NextResponse.json(
      { error: "Erro ao deletar série" },
      { status: 500 }
    );
  }
}
