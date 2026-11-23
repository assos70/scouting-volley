import { useEffect, useState } from "react";
import { EUROPEAN_VOLLEYBALL_TEAMS } from "./data/europeanVolleyball.js";
import { calculateEfficiency } from "./utils/sheetParser.js";

const STORAGE_KEY = "volei_scouting_loturi_v4";

function normalizeazaJucatoare(j) {
  return {
    id: j.id,
    numar: j.numar ?? "-",
    nume: j.nume ?? "",
    post: j.post ?? "Atacant",
    atkReusit: Number(j.atkReusit) || 0,
    atkEroare: Number(j.atkEroare) || 0,
    atkTotal: Number(j.atkTotal) || 0,
    srvAs: Number(j.srvAs) || 0,
    srvEroare: Number(j.srvEroare) || 0,
    srvTotal: Number(j.srvTotal) || 0,
    recPozitiv: Number(j.recPozitiv) || 0,
    recEroare: Number(j.recEroare) || 0,
    recTotal: Number(j.recTotal) || 0,
    blkPunct: Number(j.blkPunct) || 0,
  };
}

function construiesteLotInitial() {
  const initial = {};
  EUROPEAN_VOLLEYBALL_TEAMS.forEach((echipa) => {
    const listaPredefinita = Array.isArray(echipa.players) ? echipa.players : [];
    initial[echipa.id] = listaPredefinita.map(normalizeazaJucatoare);
  });
  return initial;
}

export default function App() {
  const [loturi, setLoturi] = useState(() => {
    const initial = construiesteLotInitial();
    try {
      const salvat = localStorage.getItem(STORAGE_KEY);
      if (salvat) {
        const parsed = JSON.parse(salvat);
        Object.keys(initial).forEach((echipaId) => {
          if (Array.isArray(parsed[echipaId]) && parsed[echipaId].length > 0) {
            initial[echipaId] = parsed[echipaId].map(normalizeazaJucatoare);
          }
        });
      }
    } catch (_) {}
    return initial;
  });

  const [echipaSelectataId, setEchipaSelectataId] = useState(
    EUROPEAN_VOLLEYBALL_TEAMS[0]?.id || ""
  );
  const [numarTricou, setNumarTricou] = useState("");
  const [numeJucatoare, setNumeJucatoare] = useState("");
  const [postJucatoare, setPostJucatoare] = useState("Atacant");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loturi));
    } catch (_) {}
  }, [loturi]);

  const echipaCurenta =
    EUROPEAN_VOLLEYBALL_TEAMS.find((e) => e.id === echipaSelectataId) ||
    EUROPEAN_VOLLEYBALL_TEAMS[0];

  const jucatoareCurente = loturi[echipaCurenta?.id] || [];
  const exempluEficienta = calculateEfficiency(12, 2, 25);

  const totalEchipa = jucatoareCurente.reduce(
    (acc, j) => {
      acc.atkReusit += j.atkReusit;
      acc.atkEroare += j.atkEroare;
      acc.atkTotal += j.atkTotal;
      acc.srvAs += j.srvAs;
      acc.srvEroare += j.srvEroare;
      acc.srvTotal += j.srvTotal;
      acc.recPozitiv += j.recPozitiv;
      acc.recEroare += j.recEroare;
      acc.recTotal += j.recTotal;
      acc.blkPunct += j.blkPunct;
      return acc;
    },
    {
      atkReusit: 0,
      atkEroare: 0,
      atkTotal: 0,
      srvAs: 0,
      srvEroare: 0,
      srvTotal: 0,
      recPozitiv: 0,
      recEroare: 0,
      recTotal: 0,
      blkPunct: 0,
    }
  );

  const eficientaAtacEchipa = calculateEfficiency(
    totalEchipa.atkReusit,
    totalEchipa.atkEroare,
    totalEchipa.atkTotal
  );

  function adaugaJucatoare(e) {
    e.preventDefault();
    const numeCurat = numeJucatoare.trim();
    if (!numeCurat || !echipaCurenta) return;

    const nouaJucatoare = normalizeazaJucatoare({
      id: Date.now(),
      numar: numarTricou.trim() || "-",
      nume: numeCurat,
      post: postJucatoare,
    });

    setLoturi((prev) => ({
      ...prev,
      [echipaCurenta.id]: [...(prev[echipaCurenta.id] || []), nouaJucatoare],
    }));

    setNumarTricou("");
    setNumeJucatoare("");
  }

  function stergeJucatoare(idJucatoare) {
    if (!echipaCurenta) return;
    setLoturi((prev) => ({
      ...prev,
      [echipaCurenta.id]: (prev[echipaCurenta.id] || []).filter(
        (j) => j.id !== idJucatoare
      ),
    }));
  }

  function inregistreazaActiune(idJucatoare, categorie, tip) {
    if (!echipaCurenta) return;

    setLoturi((prev) => ({
      ...prev,
      [echipaCurenta.id]: (prev[echipaCurenta.id] || []).map((j) => {
        if (j.id !== idJucatoare) return j;

        if (categorie === "atk") {
          if (tip === "reusit") {
            return { ...j, atkReusit: j.atkReusit + 1, atkTotal: j.atkTotal + 1 };
          }
          if (tip === "eroare") {
            return { ...j, atkEroare: j.atkEroare + 1, atkTotal: j.atkTotal + 1 };
          }
          return { ...j, atkTotal: j.atkTotal + 1 };
        }

        if (categorie === "srv") {
          if (tip === "as") {
            return { ...j, srvAs: j.srvAs + 1, srvTotal: j.srvTotal + 1 };
          }
          if (tip === "eroare") {
            return { ...j, srvEroare: j.srvEroare + 1, srvTotal: j.srvTotal + 1 };
          }
          return { ...j, srvTotal: j.srvTotal + 1 };
        }

        if (categorie === "rec") {
          if (tip === "pozitiv") {
            return { ...j, recPozitiv: j.recPozitiv + 1, recTotal: j.recTotal + 1 };
          }
          if (tip === "eroare") {
            return { ...j, recEroare: j.recEroare + 1, recTotal: j.recTotal + 1 };
          }
          return { ...j, recTotal: j.recTotal + 1 };
        }

        if (categorie === "blk") {
          return { ...j, blkPunct: j.blkPunct + 1 };
        }

        return j;
      }),
    }));
  }

  function reseteazaStatisticiEchipa() {
    if (!echipaCurenta) return;
    setLoturi((prev) => ({
      ...prev,
      [echipaCurenta.id]: (prev[echipaCurenta.id] || []).map((j) => ({
        ...j,
        atkReusit: 0,
        atkEroare: 0,
        atkTotal: 0,
        srvAs: 0,
        srvEroare: 0,
        srvTotal: 0,
        recPozitiv: 0,
        recEroare: 0,
        recTotal: 0,
        blkPunct: 0,
      })),
    }));
  }

  function reincarcaLotPredefinit() {
    if (!echipaCurenta) return;
    const echipaDinData = EUROPEAN_VOLLEYBALL_TEAMS.find(
      (e) => e.id === echipaCurenta.id
    );
    const lista = Array.isArray(echipaDinData?.players)
      ? echipaDinData.players.map(normalizeazaJucatoare)
      : [];

    setLoturi((prev) => ({
      ...prev,
      [echipaCurenta.id]: lista,
    }));
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "24px", maxWidth: "1040px" }}>
      <h1>Volei Scouting</h1>
      <p>
        Eficiență atac exemplu: <strong>{exempluEficienta}%</strong> · Echipe în ligă:{" "}
        <strong>{EUROPEAN_VOLLEYBALL_TEAMS.length}</strong>
      </p>

      <section style={{ marginTop: "20px", marginBottom: "24px" }}>
        <label htmlFor="select-echipa" style={{ display: "block", marginBottom: "6px" }}>
          <strong>Alege echipa:</strong>
        </label>
        <select
          id="select-echipa"
          value={echipaSelectataId}
          onChange={(e) => setEchipaSelectataId(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "16px", minWidth: "280px" }}
        >
          {EUROPEAN_VOLLEYBALL_TEAMS.map((echipa) => (
            <option key={echipa.id} value={echipa.id}>
              {echipa.teamName} ({echipa.league})
            </option>
          ))}
        </select>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0 }}>
            Lot & Scouting: {echipaCurenta?.teamName} ({jucatoareCurente.length} jucătoare)
          </h2>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reincarcaLotPredefinit}
              style={{ padding: "6px 12px", cursor: "pointer" }}
            >
              Reîncarcă lotul din fișier
            </button>

            {jucatoareCurente.length > 0 && (
              <button
                type="button"
                onClick={reseteazaStatisticiEchipa}
                style={{ padding: "6px 12px", cursor: "pointer" }}
              >
                Resetează statisticile echipei
              </button>
            )}
          </div>
        </div>

        <p style={{ marginTop: 0, marginBottom: "16px", lineHeight: "1.6" }}>
          <strong>Atac:</strong> +{totalEchipa.atkReusit} / {totalEchipa.atkEroare} er. /{" "}
          {totalEchipa.atkTotal} tot. (<strong>{eficientaAtacEchipa}%</strong>) ·{" "}
          <strong>Serviciu:</strong> {totalEchipa.srvAs} ași / {totalEchipa.srvEroare} er. /{" "}
          {totalEchipa.srvTotal} tot. · <strong>Preluare:</strong> {totalEchipa.recPozitiv}{" "}
          poz. / {totalEchipa.recEroare} er. / {totalEchipa.recTotal} tot. ·{" "}
          <strong>Blocaj:</strong> {totalEchipa.blkPunct} pct.
        </p>

        <form
          onSubmit={adaugaJucatoare}
          style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}
        >
          <input
            type="text"
            placeholder="Nr."
            value={numarTricou}
            onChange={(e) => setNumarTricou(e.target.value)}
            style={{ width: "65px", padding: "8px" }}
          />
          <input
            type="text"
            placeholder="Nume jucătoare"
            value={numeJucatoare}
            onChange={(e) => setNumeJucatoare(e.target.value)}
            style={{ flex: "1", minWidth: "180px", padding: "8px" }}
          />
          <select
            value={postJucatoare}
            onChange={(e) => setPostJucatoare(e.target.value)}
            style={{ padding: "8px" }}
          >
            <option value="Ridicător">Ridicător</option>
            <option value="Atacant">Atacant</option>
            <option value="Centru">Centru</option>
            <option value="Opus">Opus</option>
            <option value="Libero">Libero</option>
          </select>
          <button type="submit" style={{ padding: "8px 14px", cursor: "pointer" }}>
            Adaugă
          </button>
        </form>

        {jucatoareCurente.length === 0 ? (
          <p style={{ color: "#666" }}>
            Nu sunt definite jucătoare pentru această echipă. Poți adăuga mai sus sau poți
            completa lista în <code>src/data/europeanVolleyball.js</code>.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {jucatoareCurente.map((j) => {
              const eficientaAtac = calculateEfficiency(
                j.atkReusit,
                j.atkEroare,
                j.atkTotal
              );

              return (
                <div
                  key={j.id}
                  style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: "6px",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <strong>#{j.numar}</strong> {j.nume} — <em>{j.post}</em>
                    </div>
                    <button
                      type="button"
                      onClick={() => stergeJucatoare(j.id)}
                      style={{ padding: "4px 8px", cursor: "pointer" }}
                    >
                      Șterge
                    </button>
                  </div>

                  <div style={{ fontSize: "14px", marginTop: "6px", lineHeight: "1.5" }}>
                    <strong>Atac:</strong> +{j.atkReusit} / {j.atkEroare} er. / {j.atkTotal}{" "}
                    tot. (<strong>{eficientaAtac}%</strong>) · <strong>Serviciu:</strong>{" "}
                    {j.srvAs} ași / {j.srvEroare} er. / {j.srvTotal} tot. ·{" "}
                    <strong>Preluare:</strong> {j.recPozitiv} poz. / {j.recEroare} er. /{" "}
                    {j.recTotal} tot. · <strong>Blocaj:</strong> {j.blkPunct} pct.
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "atk", "reusit")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Atac +
                    </button>
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "atk", "eroare")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Atac E
                    </button>
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "atk", "neutru")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Atac 0
                    </button>

                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "srv", "as")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Serviciu As
                    </button>
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "srv", "eroare")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Serviciu E
                    </button>
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "srv", "neutru")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Serviciu 0
                    </button>

                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "rec", "pozitiv")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Preluare +
                    </button>
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "rec", "eroare")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Preluare E
                    </button>
                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "rec", "neutru")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Preluare 0
                    </button>

                    <button
                      type="button"
                      onClick={() => inregistreazaActiune(j.id, "blk", "punct")}
                      style={{ padding: "5px 9px", cursor: "pointer" }}
                    >
                      Blocaj +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}