import Prioridade from "./components/@prioridade/page";
import Tendencia from "./components/tendencia";

export default async function Home() {
  return (
    <div>
      <Tendencia />
      <Prioridade />
    </div>
  );
}