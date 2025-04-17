import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

const key = process.env.NEXT_PUBLIC_API_KEY;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const source = searchParams.get("source") || "database";

    const buscaBanco = await sql`
      SELECT id, nome, genero, ano, status, poster, prioridade FROM series
      WHERE LOWER(nome || genero || ano) LIKE ${"%" + query.toLowerCase() + "%"}
    `;
    const { rows: series } = buscaBanco;

    if (series.length === 0 || source === "tmdb") {
      const tmdbResults = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${query}&api_key=${key}`
      );
      const tmdbData = await tmdbResults.json();

      if (tmdbData.results && tmdbData.results.length > 0) {
        const resultadoApi = await Promise.all(
          tmdbData.results.map(async (item: { id: number }) => {
            const response = await fetch(
              `https://api.themoviedb.org/3/tv/${item.id}?api_key=${key}&language=pt-BR`
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

    return NextResponse.json({ source: "database", data: series });
  } catch (error) {
    const erro = error as Error;
    if (erro.message.includes('relation "series" does not exist')) {
      await sql`
        CREATE TABLE IF NOT EXISTS series (
          id INT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          genero VARCHAR(255) NOT NULL,
          ano INT NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pra assistir' CHECK (status IN ('pra assistir', 'assistindo', 'assistido')),
          poster VARCHAR(255) NOT NULL,
          prioridade INT NOT NULL DEFAULT 0
        )
      `;
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
  const { id, nome, genero, ano, poster } = await req.json();

  try {
    await sql`
      INSERT INTO series (id, nome, genero, ano, poster)
      VALUES (${id}, ${nome}, ${genero}, ${ano}, ${poster})
    `;

    return NextResponse.json(
      { message: "Série adicionada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar série: ", error);
    return NextResponse.json(
      { error: "Esta série já está salva!" },
      { status: 409 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { id, status, prioridade, force } = await req.json();

  try {
    if (status === "assistido") {
      await sql`
        UPDATE series
        SET status = ${status}, prioridade = 0
        WHERE id = ${id}
      `;

      await sql`
        UPDATE series
        SET prioridade = prioridade::INTEGER - 1
        WHERE prioridade::INTEGER > 0
      `;

      return NextResponse.json(
        {
          message: "Status atualizado para 'assistido' e prioridades ajustadas",
        },
        { status: 200 }
      );
    }

    if (prioridade !== undefined) {
      const { rows: conflictingSeries } = await sql`
        SELECT id, nome, prioridade FROM series WHERE prioridade::INTEGER >= ${prioridade}
      `;

      if (conflictingSeries.length > 0 && !force) {
        return NextResponse.json(
          {
            error: "Conflito de prioridade",
            conflictingSerie: conflictingSeries,
          },
          { status: 409 }
        );
      }

      await sql`
        UPDATE series
        SET prioridade = prioridade::INTEGER + 1
        WHERE prioridade::INTEGER >= ${prioridade} AND prioridade::INTEGER < 6
      `;

      await sql`
        UPDATE series
        SET prioridade = 0
        WHERE prioridade::INTEGER = 6
      `;

      await sql`
        UPDATE series
        SET prioridade = ${prioridade}
        WHERE id = ${id}
      `;

      return NextResponse.json(
        { message: "Prioridade atualizada com sucesso" },
        { status: 200 }
      );
    }

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
    console.error("Erro ao atualizar status ou prioridade da série: ", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status ou prioridade da série" },
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

// atualizar dados do banco quando nescesario
// export async function PUT() {
//   try {
//     const { rows: series } = await sql`SELECT id, nome, poster FROM series`;

//     for (const serie of series) {
//       if (!serie.poster) {
//         const response = await fetch(
//           `https://api.themoviedb.org/3/tv/${serie.id}?api_key=${key}&language=pt-BR`
//         );
//         const data = await response.json();

//         if (data && data.poster_path) {
//           await sql`
//             UPDATE series
//             SET poster = ${data.poster_path}
//             WHERE id = ${serie.id}
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
