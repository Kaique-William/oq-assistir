// import "@/app/styles/globals.css";
import Image from "next/image";

const key = process.env.NEXT_PUBLIC_API_KEY;

interface item {
  id: number;
  name: string;
  title: string;
  poster_path: string;
}

export default async function Tendencia() {
  const responce = await fetch(
    `https://api.themoviedb.org/3/trending/all/week?language=pt-BR&api_key=${key}`
  );
  const tendencia = await responce.json();

  // console.log(tendencia);

  return (
    <div className="w-full">
      <ul className="flex overflow-x-auto space-x-4 scrollbar-hide">
        {tendencia.results.map((item: item) => (
          <li key={item.id} className="flex-shrink-0">
            <Image
              src={`https://image.tmdb.org/t/p/original/${item.poster_path}`}
              alt={item.name || item.title}
              width={1080}
              height={1920}
              className="rounded-lg object-cover w-[180px] h-[250px]"
            />
            <h2 className="text-center line-clamp-2 text-ellipsis whitespace-normal w-[180px]">{item.title || item.name}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
}
