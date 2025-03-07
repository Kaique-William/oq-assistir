import Lista from "./componentes/lista";

import  {Metadata}  from "next";

export const metadata: Metadata = {
  title: "Serie"
};

export default function SeriesPage() {
  return (
    <div>
      <Lista />
    </div>
  );
}
