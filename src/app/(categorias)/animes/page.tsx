import Lista from "./componentes/lista";
import  {Metadata}  from "next";

export const metadata: Metadata = {
  title: "Anime"
};

export default function AnimesPage() {
  return (
    <div>
      <Lista />
    </div>
  );
}
