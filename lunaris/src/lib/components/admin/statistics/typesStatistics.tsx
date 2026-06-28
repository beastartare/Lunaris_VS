export type Stats = {
  usuarios: number;
  eventos: number;
  corposCelestes: number;
  missoes: number;
};

export type UsuarioTipo = {
  name: string;
  value: number;
};

export type EventoCategoria = {
  categoria: string;
  Quantidade: number;
};

export type ConstelacaoFavorita = {
  nome: string;
  favoritos: number;
};

export type MaterialFavorito = {
  titulo: string;
  favoritos: number;
};

export type RankingFavoritos = {
  usuario: string;
  fav_materiais: number;
  fav_constelacoes: number;
  fav_corpos_celestes: number;
  fav_eventos: number;
  fav_pontos_obs: number;
  fav_missoes: number;
  total_favoritos: number;
};

export type EventoAstroCategoria = {
  categoria: string;
  total_eventos: number;
  corpos_celestes_distintos: number;
  pesquisadores_envolvidos: number;
  primeiro_evento: string | null;
  ultimo_evento: string | null;
};

// export type VariacaoTemperatura = {
//   ponto_observacao: string;
//   responsavel: string;
//   temp_minima: number;
//   temp_maxima: number;
//   variacao_temp: number;
//   temp_media: number;
//   total_medicoes: number;
// };