import { useEffect, useState } from "react";
import { getDashboardData } from "./statisticsServices";

import type {
  Stats,
  UsuarioTipo,
  EventoCategoria,
  ConstelacaoFavorita,
  MaterialFavorito,
  RankingFavoritos,
  EventoAstroCategoria,
  // VariacaoTemperatura,
} from "./typesStatistics";

type DashboardData = {
  stats: Stats;
  usuariosPorTipo: UsuarioTipo[];
  eventosCategoria: EventoCategoria[];
  constelacoesFavoritas: ConstelacaoFavorita[];
  materiaisFavoritos: MaterialFavorito[];
  rankingFavoritos: RankingFavoritos[];
  eventosAstroCategoria: EventoAstroCategoria[];
  // variacaoTemperatura: VariacaoTemperatura[];
};

export function useStatistics() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    stats: {
      usuarios: 0,
      eventos: 0,
      corposCelestes: 0,
      missoes: 0,
    },
    usuariosPorTipo: [],
    eventosCategoria: [],
    constelacoesFavoritas: [],
    materiaisFavoritos: [],
    rankingFavoritos: [],
    eventosAstroCategoria: [],
    // variacaoTemperatura: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardData();
        setDashboard(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { ...dashboard, loading };
}