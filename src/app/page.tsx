import Tendencia from "./components/tendencia";
import Prioridade from "./components/prioridade";

export default async function Home() {
  return (
    <div>
      <Tendencia/>
      <Prioridade />
    </div>
  );
}