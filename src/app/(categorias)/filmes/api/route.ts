import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

const key = process.env.NEXT_PUBLIC_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const source = searchParams.get("source") || "database";

    const buscaBanco = await sql`
          SELECT id, nome, genero, ano, status, poster FROM filmes
          WHERE LOWER(nome || genero || ano) LIKE ${
            "%" + query.toLowerCase() + "%"
          }
      `;
    const { rows: filmes } = buscaBanco;

    if (filmes.length === 0 || source === "tmdb") {
      const tmdbResults = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${key}`
      );
      const tmdbData = await tmdbResults.json();

      if (tmdbData.results && tmdbData.results.length > 0) {
        const resultadoApi = await Promise.all(
          tmdbData.results.map(async (item: { id: number }) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/movie/${item.id}?api_key=${key}&language=pt-BR`
            );
            return response.json();
          })
        );

        return NextResponse.json({ source: "tmdb", data: resultadoApi });
      } else {
        return NextResponse.json(
          { error: "Nenhum dado encontrado na API" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json({ source: "database", data: filmes });
  } catch (error) {
    const erro = error as Error;
    if (erro.message.includes('relation "filmes" does not exist')) {
      await sql`
        CREATE TABLEIF NOT EXISTS filmes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        genero VARCHAR(255) NOT NULL,
        ano INT NOT NULL,
        status VARCHAR(255) NOT NULL DEFAULT 'pra assistir' CHECK (status IN ('pra assistir', 'assistindo', 'assistido'))
        poster VARCHAR(255) NOT NULL
        prioridade INT NOT NULL DEFAULT 6 CHECK (prioridade >= 0 AND prioridade <= 6)
      )`;
      return NextResponse.json({ message: "Tabela criada com sucesso" });
    } else {
      return NextResponse.json(
        { error: "Erro ao acessar a tabela" },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  const { id, nome, genero, ano, poster } = await req.json();

  try {
    await sql`
      INSERT INTO filmes (id, nome, genero, ano, poster)
      VALUES (${id}, ${nome}, ${genero}, ${ano}, ${poster})
      `;
    return NextResponse.json(
      { message: "Filme adicionado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar filme:", error);
    return NextResponse.json(
      { error: "Esse filme já está salvo!" },
      { status: 409}
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { id, status, prioridade, force } = await req.json();

  try {
    if (status === "assistido") {
      const {
        rows: [filme],
      } = await sql`
        SELECT prioridade FROM filmes WHERE id = ${id}
      `;

      if (!filme) {
        return NextResponse.json(
          { error: "Filme não encontrado" },
          { status: 404 }
        );
      }

      const prioridadeAtual = filme.prioridade;

      await sql`
        UPDATE filmes
        SET status = 'assistido', prioridade = 0
        WHERE id = ${id}
      `;

      await sql`
        UPDATE filmes
        SET prioridade = prioridade::INTEGER - 1
        WHERE prioridade::INTEGER >= ${prioridadeAtual}
      `;
    } else if (prioridade !== undefined) {
      const { rows: conflictingMovies } = await sql`
      SELECT id, nome, prioridade FROM filmes WHERE prioridade >= ${prioridade}
    `;

      if (conflictingMovies.length > 0 && !force) {
        return NextResponse.json(
          {
            error: "Conflito de prioridade",
            conflictingMovie: conflictingMovies,
          },
          { status: 409 }
        );
      }

      await sql`
      UPDATE filmes
      SET prioridade = prioridade::INTEGER + 1
      WHERE prioridade::INTEGER >= ${prioridade} AND prioridade::INTEGER < 6
    `;

      await sql`
      UPDATE filmes
      SET prioridade = 0
      WHERE prioridade::INTEGER = 6
    `;

      await sql`
      UPDATE filmes
      SET prioridade = ${prioridade}
      WHERE id = ${id}
    `;
    } else if (status === "assistindo") {
      const {
        rows: [filme],
      } = await sql`
        SELECT prioridade FROM filmes WHERE id = ${id}
      `;
      if (!filme) {
        return NextResponse.json(
          { error: "Filme nao encontrado" },
          { status: 404 }
        );
      }

      const prioridadeAtual = filme.prioridade;
      await sql`
        UPDATE filmes
        SET status = 'assistindo', prioridade = ${prioridadeAtual}
        WHERE id = ${id}
      `;

      await sql`
        UPDATE filmes
       SET status = ${status}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE filmes
        SET status = ${status}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json(
      { message: "Prioridade atualizada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    await sql`
      DELETE FROM filmes
      WHERE id = ${id}
      `;
    return NextResponse.json(
      { message: "Filme deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar filme:", error);
    return NextResponse.json(
      { error: "Erro ao deletar filme" },
      { status: 500 }
    );
  }
}

// atualizar dados do banco quando nescesario
// export async function PUT() {
//   try {
//     const { rows: filmes } = await sql`SELECT id, nome, poster FROM filmes`;

//     for (const filme of filmes) {
//       if (!filme.poster) {
//         const response = await fetch(
//           `https://api.themoviedb.org/3/movie/${filme.id}?api_key=${key}&language=pt-BR`
//         );
//         const data = await response.json();

//         if (data && data.poster_path) {
//           await sql`
//             UPDATE filmes
//             SET poster = ${data.poster_path}
//             WHERE id = ${filme.id}
//           `;
//         }
//       }
//     }

//     return NextResponse.json({ message: "Dados atualizados com sucesso" });
//   } catch (error) {
//     console.error("Erro ao atualizar dados:", error);
//     return NextResponse.json(
//       { error: "Erro ao atualizar dados" },
//       { status: 500 }
//     );
//   }
// }
