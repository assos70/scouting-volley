import { EUROPEAN_VOLLEYBALL_TEAMS } from "./data/europeanVolleyball.js";
import { calculateEfficiency } from "./utils/sheetParser.js";

export default function App() {
  const exempluEficienta = calculateEfficiency(12, 2, 25);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "24px" }}>
      <h1>Volei Scouting</h1>
      <p>Eficiență atac exemplu: <strong>{exempluEficienta}%</strong></p>
      <h2>Echipe</h2>
      <ul>
        {EUROPEAN_VOLLEYBALL_TEAMS.map((echipa, index) => (
          <li key={index}>
            {echipa.teamName} ({echipa.league})
          </li>
        ))}
      </ul>
    </main>
  );
}
