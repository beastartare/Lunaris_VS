import { supabase } from "../../../../lib/supabase";
import type {
  Stats,
  UsuarioTipo,
  EventoCategoria,
  ConstelacaoFavorita,
  MaterialFavorito,
  RankingFavoritos,
  EventoAstroCategoria,
  VariacaoTemperatura,
} from "./typesStatistics";

type ConstelacaoRow = {
  constelacao: { nome: string }[] | null;
};

type MaterialRow = {
  material: { titulo: string }[] | null;
};

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
    { categoria: "Astronômico", Quantidade: astronomicos },
    { categoria: "Meteorológico", Quantidade: meteorologicos },
  ];
}

export async function getConstelacoesFavoritas(): Promise<ConstelacaoFavorita[]> {
  const { data, error } = await supabase
    .from("favoritoconstelacaousuario")
    .select(`constelacao:idconstelacao ( nome )`);
  if (error) throw error;

  const contador: Record<string, number> = {};
  (data as ConstelacaoRow[])?.forEach((item) => {
    const nome = item.constelacao?.[0]?.nome;
    if (!nome) return;
    contador[nome] = (contador[nome] ?? 0) + 1;
  });

  return Object.entries(contador)
    .map(([nome, favoritos]) => ({ nome, favoritos }))
    .sort((a, b) => b.favoritos - a.favoritos)
    .slice(0, 5);
}

export async function getMateriaisFavoritos(): Promise<MaterialFavorito[]> {
  const { data, error } = await supabase
    .from("favoritomaterialusuario")
    .select(`material:idmaterialestudo ( titulo )`);
  if (error) throw error;

  const contador: Record<string, number> = {};
  (data as MaterialRow[])?.forEach((item) => {
    const titulo = item.material?.[0]?.titulo;
    if (!titulo) return;
    contador[titulo] = (contador[titulo] ?? 0) + 1;
  });

  return Object.entries(contador)
    .map(([titulo, favoritos]) => ({ titulo, favoritos }))
    .sort((a, b) => b.favoritos - a.favoritos)
    .slice(0, 5);
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

export async function getVariacaoTemperatura(): Promise<VariacaoTemperatura[]> {
  const { data, error } = await supabase.rpc("get_variacao_temperatura");
  if (error) throw error;
  return data ?? [];
}

export async function getDashboardData() {
  const [
    stats,
    usuariosPorTipo,
    eventosCategoria,
    constelacoesFavoritas,
    materiaisFavoritos,
    rankingFavoritos,
    eventosAstroCategoria,
    variacaoTemperatura,
  ] = await Promise.all([
    getStats(),
    getUsuariosPorTipo(),
    getEventosCategoria(),
    getConstelacoesFavoritas(),
    getMateriaisFavoritos(),
    getRankingFavoritos(),
    getEventosAstroCategoria(),
    getVariacaoTemperatura(),
  ]);

  return {
    stats,
    usuariosPorTipo,
    eventosCategoria,
    constelacoesFavoritas,
    materiaisFavoritos,
    rankingFavoritos,
    eventosAstroCategoria,
    variacaoTemperatura,
  };
}