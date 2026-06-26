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
  EventosPorPesquisador,
} from "./typesStatistics";

type DashboardData = {
  stats: Stats;
  usuariosPorTipo: UsuarioTipo[];
  eventosCategoria: EventoCategoria[];
  constelacoesFavoritas: ConstelacaoFavorita[];
  materiaisFavoritos: MaterialFavorito[];
  rankingFavoritos: RankingFavoritos[];
  eventosAstroCategoria: EventoAstroCategoria[];
  eventosPorPesquisador: EventosPorPesquisador[];
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
    eventosPorPesquisador: [],
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