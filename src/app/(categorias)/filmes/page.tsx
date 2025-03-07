import Lista from "./componentes/lista";

import  {Metadata}  from "next";

export const metadata: Metadata = {
  title: "Filme"
};

export default function FilmesPage() {
  return (
    <div>
      <Lista />
    </div>
  );
}
