import { supabase } from "../../../../lib/supabase";
import type {
  Stats,
  UsuarioTipo,
  EventoCategoria,
  RankingFavoritos,
  EventoAstroCategoria,
  EventosPorPesquisador,
  DadosMeteorologicosPorPesquisador,
} from "./typesStatistics";

async function getCount(table: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getStats(): Promise<Stats> {
  const [usuarios, eventos, corposCelestes, missoes] = await Promise.all([
    getCount("usuario"),
    getCount("evento"),
    getCount("corpoceleste"),
    getCount("missaoespacial"),
  ]);
  return { usuarios, eventos, corposCelestes, missoes };
}

export async function getUsuariosPorTipo(): Promise<UsuarioTipo[]> {
  const { data, error } = await supabase
    .from("usuario")
    .select("tipo_acesso_usuario");
  if (error) throw error;

  const contagem = { comum: 0, astronomico: 0, meteorologico: 0 };
  data?.forEach((usuario) => {
    switch (usuario.tipo_acesso_usuario) {
      case 0: contagem.comum++; break;
      case 1: contagem.astronomico++; break;
      case 2: contagem.meteorologico++; break;
    }
  });

  return [
    { name: "Comum", value: contagem.comum },
    { name: "Pesquisador Astronômico", value: contagem.astronomico },
    { name: "Pesquisador Meteorológico", value: contagem.meteorologico },
  ];
}

export async function getEventosCategoria(): Promise<EventoCategoria[]> {
  const [astronomicos, meteorologicos] = await Promise.all([
    getCount("eventoastronomico"),
    getCount("eventometereologico"),
  ]);
  return [
    { categoria: "Astronômico", quantidade: astronomicos },
    { categoria: "Meteorológico", quantidade: meteorologicos },
  ];
}

export async function getRankingFavoritos(): Promise<RankingFavoritos[]> {
  const { data, error } = await supabase.rpc("get_ranking_favoritos");
  if (error) throw error;
  return data ?? [];
}

export async function getEventosAstroCategoria(): Promise<EventoAstroCategoria[]> {
  const { data, error } = await supabase.rpc("get_eventos_astro_categoria");
  if (error) throw error;
  return data ?? [];
}

export async function getEventosPorPesquisador(): Promise<EventosPorPesquisador[]> {
  const { data, error } = await supabase.rpc(
    "get_eventos_por_pesquisador"
  );
  if (error) throw error;
  return data ?? [];
}

export async function getDadosMetPorPesquisador(): Promise<DadosMeteorologicosPorPesquisador[]> {
  const { data, error } = await supabase.rpc(
    "obter_dados_meteorologicos_por_pesquisador"
  );
  if (error) throw error;
  return data ?? [];
}

export async function getDashboardData() {
  const [
    stats,
    usuariosPorTipo,
    eventosCategoria,
    rankingFavoritos,
    eventosAstroCategoria,
    eventosPorPesquisador,
    dadosMetPorPesquisador,
  ] = await Promise.all([
    getStats(),
    getUsuariosPorTipo(),
    getEventosCategoria(),
    getRankingFavoritos(),
    getEventosAstroCategoria(),
    getEventosPorPesquisador(),
    getDadosMetPorPesquisador(),
  ]);

  return {
    stats,
    usuariosPorTipo,
    eventosCategoria,
    rankingFavoritos,
    eventosAstroCategoria,
    eventosPorPesquisador,
    dadosMetPorPesquisador,
  };
}