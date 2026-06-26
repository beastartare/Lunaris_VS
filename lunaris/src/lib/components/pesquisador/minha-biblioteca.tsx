import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import {
  CloudSun,
  Rocket,
  Star,
  Telescope,
  MapPinned,
  CalendarDays,
  BookOpen,
  Library,
  ChevronLeft,
  ChevronRight,
  FileText,
  Orbit,
} from "lucide-react";

// ──────────── Interfaces ────────────

interface DadoMet {
  iddadometereologico: number;
  idpontoobs: number;
  temperatura: number | null;
  umidade: number | null;
  indiceuv: number | null;
  vel_vento: number | null;
  dir_vento: string | null;
  datahora: string | null;
  pontoobservacao: { nome: string } | null;
}

interface Missao {
  idmissaoespacial: number;
  nome: string;
  status_missao: string | null;
  descricao: string | null;
  agencia: string | null;
  datalancamento: string | null;
}

interface CorpoCeleste {
  idcorpoceleste: number;
  nome: string;
  tipo_corpo_celeste: string | null;
  distancia: number | null;
  descricao: string | null;
  constelacao: { nome: string } | null;
}

interface Constelacao {
  idconstelacao: number;
  nome: string;
  descricao: string | null;
}

interface PontoObservacao {
  idpontoobs: number;
  nome: string;
  descricao: string | null;
  latitude: number;
  longitude: number;
}

interface Evento {
  idevento: number;
  descricao: string;
  datahora: string;
  latitude: number;
  longitude: number;
  imagem: string[] | null;
}

interface Material {
  idmaterialestudo: number;
  titulo: string;
  descricao: string | null;
  autor: string | null;
  tipo_arquivo: string | null;
  data_lancamento: string | null;
}

// ──────────── Helpers ────────────

const byteaHexToBase64 = (hex: string): string => {
  if (!hex) return "";
  const cleanHex = hex.startsWith("\\x") ? hex.slice(2) : hex;
  let result = "";
  for (let i = 0; i < cleanHex.length; i += 2) {
    result += String.fromCharCode(parseInt(cleanHex.substring(i, i + 2), 16));
  }
  return result;
};

const obterSrcImagem = (imgItem: string) =>
  `data:image/jpeg;base64,${byteaHexToBase64(imgItem)}`;

const formatData = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR") : "—";

// ──────────── Componentes de card ────────────

function CardBase({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-purple-700 bg-[#3b1544] overflow-hidden">
      {children}
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-white">{valor ?? "—"}</span>
    </div>
  );
}

// ──────────── Componente principal ────────────

type Aba =
  | "meteorologia"
  | "missoes"
  | "corpos"
  | "constelacoes"
  | "pontos"
  | "eventos"
  | "materiais";

const todasAbas: { id: Aba; nome: string; icon: React.ElementType; tipo: number[] }[] = [
  { id: "meteorologia", nome: "Dados Meteorológicos", icon: CloudSun,     tipo: [2] },
  { id: "missoes",      nome: "Missões Espaciais",    icon: Rocket,       tipo: [1] },
  { id: "corpos",       nome: "Corpos Celestes",      icon: Star,         tipo: [1] },
  { id: "constelacoes", nome: "Constelações",         icon: Orbit,        tipo: [1] },
  { id: "pontos",       nome: "Pontos de Observação", icon: MapPinned,    tipo: [1, 2] },
  { id: "eventos",      nome: "Eventos",              icon: CalendarDays, tipo: [1, 2] },
  { id: "materiais",    nome: "Materiais de Estudo",  icon: BookOpen,     tipo: [1, 2] },
];

export default function MinhaBibliotecaPesquisador() {
  const [abaAtiva, setAbaAtiva] = useState<Aba | null>(null);
  const [idusuario, setIdusuario] = useState<number | null>(null);
  const [tipoAcesso, setTipoAcesso] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Dados por categoria
  const [dadosMet, setDadosMet] = useState<DadoMet[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [corpos, setCorpos] = useState<CorpoCeleste[]>([]);
  const [constelacoes, setConstelacoes] = useState<Constelacao[]>([]);
  const [pontos, setPontos] = useState<PontoObservacao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);

  // Carrossel de imagens de eventos
  const [imagemAtual, setImagemAtual] = useState<Record<number, number>>({});

  const [pesquisa, setPesquisa] = useState("");
  const [pagina, setPagina] = useState(1);
  const porPagina = 9;

  // ── Buscar idusuario ──
  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setErro("Usuário não autenticado.");
          setLoading(false);
          return;
        }

        const { data: usuario, error: usuarioError } = await supabase
          .from("usuario")
          .select("idusuario, tipo_acesso_usuario")
          .eq("id", user.id)
          .single();

        if (usuarioError || !usuario) {
          setErro("Usuário não encontrado.");
          setLoading(false);
          return;
        }

        setIdusuario(usuario.idusuario);
        setTipoAcesso(usuario.tipo_acesso_usuario);
      } catch (err) {
        console.error(err);
        setErro("Erro ao identificar o usuário.");
        setLoading(false);
      }
    };

    init();
  }, []);

  // ── Buscar dados quando idusuario ou aba mudar ──
  useEffect(() => {
    if (idusuario === null) return;
    buscarDados();
  }, [idusuario, abaAtiva]);

  // Calcula as abas visíveis conforme o perfil
  const abas = tipoAcesso !== null
    ? todasAbas.filter((a) => a.tipo.includes(tipoAcesso))
    : [];

  // Define aba inicial ao carregar o perfil
  useEffect(() => {
    if (abas.length > 0 && abaAtiva === null) {
      setAbaAtiva(abas[0].id);
    }
  }, [abas.length]);

  const buscarDados = async () => {
    if (idusuario === null) return;
    setLoading(true);
    setErro(null);
    setPagina(1);
    setPesquisa("");

    try {
      if (abaAtiva === "meteorologia") {
        // dadometereologico não tem idusuario; busca via pontoobservacao do usuário
        const { data: pts } = await supabase
          .from("pontoobservacao")
          .select("idpontoobs")
          .eq("idusuario", idusuario);

        const ids = (pts || []).map((p: { idpontoobs: number }) => p.idpontoobs);

        if (ids.length === 0) {
          setDadosMet([]);
        } else {
          const { data, error } = await supabase
            .from("dadometereologico")
            .select(
              "*, pontoobservacao(nome)",
            )
            .in("idpontoobs", ids)
            .order("datahora", { ascending: false });

          if (error) throw error;
          setDadosMet((data as unknown as DadoMet[]) || []);
        }
      }

      if (abaAtiva === "missoes") {
        const { data, error } = await supabase
          .from("missaoespacial")
          .select("*")
          .eq("idusuario", idusuario)
          .order("datalancamento", { ascending: false });
        if (error) throw error;
        setMissoes(data || []);
      }

      if (abaAtiva === "corpos") {
        const { data, error } = await supabase
          .from("corpoceleste")
          .select("*, constelacao(nome)")
          .eq("idusuario", idusuario)
          .order("nome");
        if (error) throw error;
        setCorpos((data as unknown as CorpoCeleste[]) || []);
      }

      if (abaAtiva === "constelacoes") {
        const { data, error } = await supabase
          .from("constelacao")
          .select("*")
          .eq("idusuario", idusuario)
          .order("nome");
        if (error) throw error;
        setConstelacoes(data || []);
      }

      if (abaAtiva === "pontos") {
        const { data, error } = await supabase
          .from("pontoobservacao")
          .select("*")
          .eq("idusuario", idusuario)
          .order("nome");
        if (error) throw error;
        setPontos(data || []);
      }

      if (abaAtiva === "eventos") {
        const { data, error } = await supabase
          .from("evento")
          .select("*")
          .eq("idusuario", idusuario)
          .order("datahora", { ascending: false });
        if (error) throw error;
        setEventos(data || []);
      }

      if (abaAtiva === "materiais") {
        const { data, error } = await supabase
          .from("materialestudo")
          .select("*")
          .eq("idusuario", idusuario)
          .order("data_lancamento", { ascending: false });
        if (error) throw error;
        setMateriais(data || []);
      }
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const avancarImagem = (id: number, total: number) =>
    setImagemAtual((prev) => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % total }));

  const voltarImagem = (id: number, total: number) =>
    setImagemAtual((prev) => ({ ...prev, [id]: ((prev[id] ?? 0) - 1 + total) % total }));

  // ── Filtragem e paginação ──
  const listaFiltrada = (() => {
    const q = pesquisa.toLowerCase();
    if (abaAtiva === "meteorologia")
      return dadosMet.filter((d) =>
        d.pontoobservacao?.nome.toLowerCase().includes(q) ||
        (d.datahora ?? "").toLowerCase().includes(q),
      );
    if (abaAtiva === "missoes")
      return missoes.filter((m) => m.nome.toLowerCase().includes(q));
    if (abaAtiva === "corpos")
      return corpos.filter((c) => c.nome.toLowerCase().includes(q));
    if (abaAtiva === "constelacoes")
      return constelacoes.filter((c) => c.nome.toLowerCase().includes(q));
    if (abaAtiva === "pontos")
      return pontos.filter((p) => p.nome.toLowerCase().includes(q));
    if (abaAtiva === "eventos")
      return eventos.filter((e) => e.descricao.toLowerCase().includes(q));
    if (abaAtiva === "materiais")
      return materiais.filter((m) => m.titulo.toLowerCase().includes(q));
    return [];
  })();

  const visiveis = listaFiltrada.slice(0, pagina * porPagina);

  // ──────────── Render ────────────
  return (
    <div className="text-white">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Library size={28} className="text-fuchsia-400" />

            <h1 className="text-5xl font-semibold">
              Minha Biblioteca
            </h1>
          </div>
          <p className="mt-3 text-lg text-zinc-400">
            Todos os registros que você cadastrou no sistema.
          </p>
        </div>
      </div>

      {/* ABAS */}
      <div className="mb-6 flex flex-wrap gap-2">
        {abas.map(({ id, nome, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              abaAtiva === id
                ? "bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-900/40"
                : "bg-[#3b1544] text-gray-300 hover:bg-[#4a1b54]"
            }`}
          >
            <Icon size={15} />
            {nome}
          </button>
        ))}
      </div>

      {/* PESQUISA */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder={`Pesquisar em ${abas.find((a) => a.id === abaAtiva)?.nome}...`}
          value={pesquisa}
          onChange={(e) => { setPesquisa(e.target.value); setPagina(1); }}
          className="flex-1 rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />
        <button
          onClick={buscarDados}
          className="rounded-xl bg-purple-700 px-5 py-3 hover:bg-purple-600 transition-colors"
        >
          Atualizar
        </button>
      </div>

      {/* CONTEÚDO */}
      {erro ? (
        <div className="mt-16 text-center text-red-400">{erro}</div>
      ) : loading ? (
        <div className="flex flex-col items-center gap-4 py-24 text-gray-400">
          <Library size={40} className="animate-pulse text-fuchsia-400" />
          <p>Carregando...</p>
        </div>
      ) : listaFiltrada.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-gray-400">
          <Telescope size={48} className="text-fuchsia-800" />
          <p className="text-lg">
            {pesquisa ? "Nenhum resultado encontrado." : "Nenhum registro cadastrado nessa categoria ainda."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-gray-400">
            {listaFiltrada.length} {listaFiltrada.length === 1 ? "registro" : "registros"}
          </p>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* ── DADOS METEOROLÓGICOS ── */}
            {abaAtiva === "meteorologia" &&
              (visiveis as DadoMet[]).map((d) => (
                <CardBase key={d.iddadometereologico}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CloudSun size={16} className="text-fuchsia-400" />
                      <span className="font-semibold">
                        {d.pontoobservacao?.nome ?? "Ponto desconhecido"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Data / Hora" valor={formatData(d.datahora)} />
                      <Campo label="Temperatura" valor={d.temperatura != null ? `${d.temperatura} °C` : null} />
                      <Campo label="Umidade" valor={d.umidade != null ? `${d.umidade} %` : null} />
                      <Campo label="Índice UV" valor={d.indiceuv} />
                      <Campo label="Vel. Vento" valor={d.vel_vento != null ? `${d.vel_vento} km/h` : null} />
                      <Campo label="Dir. Vento" valor={d.dir_vento} />
                    </div>
                  </div>
                </CardBase>
              ))}

            {/* ── MISSÕES ESPACIAIS ── */}
            {abaAtiva === "missoes" &&
              (visiveis as Missao[]).map((m) => (
                <CardBase key={m.idmissaoespacial}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Rocket size={16} className="text-fuchsia-400" />
                      <h2 className="font-bold text-lg leading-tight">{m.nome}</h2>
                    </div>
                    {m.agencia && (
                      <span className="inline-block rounded-full bg-fuchsia-900/50 px-3 py-0.5 text-xs text-fuchsia-300">
                        {m.agencia}
                      </span>
                    )}
                    {m.descricao && (
                      <p className="text-sm text-gray-300 line-clamp-3">{m.descricao}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Status" valor={m.status_missao} />
                      <Campo label="Lançamento" valor={formatData(m.datalancamento)} />
                    </div>
                  </div>
                </CardBase>
              ))}

            {/* ── CORPOS CELESTES ── */}
            {abaAtiva === "corpos" &&
              (visiveis as CorpoCeleste[]).map((c) => (
                <CardBase key={c.idcorpoceleste}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-fuchsia-400" />
                      <h2 className="font-bold text-lg">{c.nome}</h2>
                    </div>
                    {c.tipo_corpo_celeste && (
                      <span className="inline-block rounded-full bg-purple-900/50 px-3 py-0.5 text-xs text-purple-300">
                        {c.tipo_corpo_celeste}
                      </span>
                    )}
                    {c.descricao && (
                      <p className="text-sm text-gray-300 line-clamp-3">{c.descricao}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Distância" valor={c.distancia != null ? `${c.distancia} UA` : null} />
                      <Campo label="Constelação" valor={c.constelacao?.nome} />
                    </div>
                  </div>
                </CardBase>
              ))}

            {/* ── CONSTELAÇÕES ── */}
            {abaAtiva === "constelacoes" &&
              (visiveis as Constelacao[]).map((c) => (
                <CardBase key={c.idconstelacao}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Orbit size={16} className="text-fuchsia-400" />
                      <h2 className="font-bold text-lg">{c.nome}</h2>
                    </div>
                    {c.descricao && (
                      <p className="text-sm text-gray-300 line-clamp-4">{c.descricao}</p>
                    )}
                  </div>
                </CardBase>
              ))}

            {/* ── PONTOS DE OBSERVAÇÃO ── */}
            {abaAtiva === "pontos" &&
              (visiveis as PontoObservacao[]).map((p) => (
                <CardBase key={p.idpontoobs}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPinned size={16} className="text-fuchsia-400" />
                      <h2 className="font-bold text-lg">{p.nome}</h2>
                    </div>
                    {p.descricao && (
                      <p className="text-sm text-gray-300 line-clamp-3">{p.descricao}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Latitude" valor={p.latitude.toFixed(5)} />
                      <Campo label="Longitude" valor={p.longitude.toFixed(5)} />
                    </div>
                  </div>
                </CardBase>
              ))}

            {/* ── EVENTOS ── */}
            {abaAtiva === "eventos" &&
              (visiveis as Evento[]).map((ev) => {
                const imgs = Array.isArray(ev.imagem) ? ev.imagem : [];
                const total = imgs.length;
                const idx = imagemAtual[ev.idevento] ?? 0;
                return (
                  <CardBase key={ev.idevento}>
                    {total > 0 ? (
                      <div className="relative">
                        <img
                          src={obterSrcImagem(imgs[idx])}
                          alt={ev.descricao}
                          className="h-40 w-full object-cover"
                        />
                        {total > 1 && (
                          <>
                            <button
                              onClick={() => voltarImagem(ev.idevento, total)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                            >
                              <ChevronLeft size={15} />
                            </button>
                            <button
                              onClick={() => avancarImagem(ev.idevento, total)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                            >
                              <ChevronRight size={15} />
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs">
                              {idx + 1} / {total}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-[#2a102f]/60">
                        <CalendarDays size={32} className="text-fuchsia-800/50" />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-fuchsia-400 shrink-0" />
                        <h2 className="font-bold leading-tight">{ev.descricao}</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Campo label="Data / Hora" valor={formatData(ev.datahora)} />
                        <Campo label="Imagens" valor={`${total} foto${total !== 1 ? "s" : ""}`} />
                        <Campo label="Latitude" valor={ev.latitude} />
                        <Campo label="Longitude" valor={ev.longitude} />
                      </div>
                    </div>
                  </CardBase>
                );
              })}

            {/* ── MATERIAIS DE ESTUDO ── */}
            {abaAtiva === "materiais" &&
              (visiveis as Material[]).map((m) => (
                <CardBase key={m.idmaterialestudo}>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-fuchsia-400" />
                      <h2 className="font-bold text-lg leading-tight">{m.titulo}</h2>
                    </div>
                    {m.tipo_arquivo && (
                      <span className="inline-block rounded-full bg-purple-900/50 px-3 py-0.5 text-xs text-purple-300 uppercase">
                        {m.tipo_arquivo}
                      </span>
                    )}
                    {m.descricao && (
                      <p className="text-sm text-gray-300 line-clamp-3">{m.descricao}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Autor" valor={m.autor} />
                      <Campo label="Lançamento" valor={formatData(m.data_lancamento)} />
                    </div>
                  </div>
                </CardBase>
              ))}
          </div>

          {/* Carregar mais */}
          {listaFiltrada.length > visiveis.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPagina((p) => p + 1)}
                className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600 transition-colors"
              >
                Carregar Mais
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
