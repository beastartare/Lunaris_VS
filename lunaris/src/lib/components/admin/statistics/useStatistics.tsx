import { useEffect, useState } from "react";
import { getDashboardData } from "./statisticsServices";

import type {
  Stats,
  UsuarioTipo,
  EventoCategoria,
  RankingFavoritos,
  EventoAstroCategoria,
  EventosPorPesquisador,
  DadosMeteorologicosPorPesquisador,
} from "./typesStatistics";

type DashboardData = {
  stats: Stats;
  usuariosPorTipo: UsuarioTipo[];
  eventosCategoria: EventoCategoria[];
  rankingFavoritos: RankingFavoritos[];
  eventosAstroCategoria: EventoAstroCategoria[];
  eventosPorPesquisador: EventosPorPesquisador[];
  dadosMetPorPesquisador: DadosMeteorologicosPorPesquisador[]; 
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
    rankingFavoritos: [],
    eventosAstroCategoria: [],
    eventosPorPesquisador: [],
    dadosMetPorPesquisador: [],
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