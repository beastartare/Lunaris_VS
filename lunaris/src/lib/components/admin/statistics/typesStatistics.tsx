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