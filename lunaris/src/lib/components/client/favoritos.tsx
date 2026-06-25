import { useEffect, useRef, useState } from "react";
import {
  Star,
  Globe2,
  Telescope,
  BookOpen,
  Rocket,
  MapPin,
  Calendar,
  User,
  Ruler,
  Building2,
} from "lucide-react";
import { supabase } from "../../supabase";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface CorpoFavorito {
  idcorpoceleste: number;
  nome: string;
  tipo_corpo_celeste: string;
  distancia: number | null;
  descricao: string | null;
}

interface ConstelacaoFavorita {
  idconstelacao: number;
  nome: string;
  descricao: string | null;
}

interface EventoFavorito {
  idevento: number;
  descricao: string;
  datahora: string;
  latitude: number;
  longitude: number;
}

interface MaterialFavorito {
  idmaterialestudo: number;
  titulo: string;
  autor: string | null;
  tipo_arquivo: string | null;
  descricao: string | null;
  data_lancamento: string | null;
}

interface MissaoFavorita {
  idmissaoespacial: number;
  nome: string;
  status_missao: string;
  agencia: string | null;
  descricao: string | null;
  datalancamento: string | null;
}

interface PontoFavorito {
  idpontoobs: number;
  nome: string;
  descricao: string | null;
  latitude: number;
  longitude: number;
}

interface Favoritos {
  corposCelestes: CorpoFavorito[];
  constelacoes: ConstelacaoFavorita[];
  eventos: EventoFavorito[];
  materiais: MaterialFavorito[];
  missoes: MissaoFavorita[];
  pontos: PontoFavorito[];
}

// ── Constantes ────────────────────────────────────────────────────────────────

const SECOES = [
  { id: "corposCelestes", label: "Corpos Celestes", Icon: Globe2 },
  { id: "constelacoes", label: "Constelações", Icon: Star },
  { id: "eventos", label: "Eventos", Icon: Telescope },
  { id: "materiais", label: "Material de Estudos", Icon: BookOpen },
  { id: "missoes", label: "Missões Espaciais", Icon: Rocket },
  { id: "pontos", label: "Pontos de Observação", Icon: MapPin },
] as const;

type SecaoId = (typeof SECOES)[number]["id"];

const STATUS_COLORS: Record<string, string> = {
  Planejada: "bg-blue-700 text-blue-100",
  "Em andamento": "bg-yellow-700 text-yellow-100",
  Concluída: "bg-green-700 text-green-100",
  Cancelada: "bg-gray-600 text-gray-200",
  Falha: "bg-red-800 text-red-100",
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function Favoritos() {
  const [idUsuario, setIdUsuario] = useState<number | null>(null);

  const [favoritos, setFavoritos] = useState<Favoritos>({
    corposCelestes: [],
    constelacoes: [],
    eventos: [],
    materiais: [],
    missoes: [],
    pontos: [],
  });
  const [loading, setLoading] = useState(true);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoId | "Todas">("Todas");

  const refs: Record<SecaoId, React.RefObject<HTMLDivElement>> = {
    corposCelestes: useRef<HTMLDivElement>(null),
    constelacoes: useRef<HTMLDivElement>(null),
    eventos: useRef<HTMLDivElement>(null),
    materiais: useRef<HTMLDivElement>(null),
    missoes: useRef<HTMLDivElement>(null),
    pontos: useRef<HTMLDivElement>(null),
  };

  // ── Auth + busca ───────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.resolve();
      if (!mounted) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: usuarioData } = await supabase
          .from("usuario")
          .select("idusuario")
          .eq("id", user.id)
          .single();

        if (!mounted || !usuarioData) return;

        setIdUsuario(usuarioData.idusuario);
        await buscarFavoritos(usuarioData.idusuario);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const buscarFavoritos = async (uid: number) => {
    try {
      setLoading(true);

      const [
        { data: fCorpos },
        { data: fConstelacoes },
        { data: fEventos },
        { data: fMateriais },
        { data: fMissoes },
        { data: fPontos },
      ] = await Promise.all([
        supabase
          .from("favoritocorpocelesteusuario")
          .select(
            "corpoceleste(idcorpoceleste, nome, tipo_corpo_celeste, distancia, descricao)",
          )
          .eq("idusuario", uid),

        supabase
          .from("favoritoconstelacaousuario")
          .select("constelacao(idconstelacao, nome, descricao)")
          .eq("idusuario", uid),

        supabase
          .from("favoritoeventousuario")
          .select("evento(idevento, descricao, datahora, latitude, longitude)")
          .eq("idusuario", uid),

        supabase
          .from("favoritomaterialusuario")
          .select(
            "materialestudo(idmaterialestudo, titulo, autor, tipo_arquivo, descricao, data_lancamento)",
          )
          .eq("idusuario", uid),

        supabase
          .from("favoritousuariomissao")
          .select(
            "missaoespacial(idmissaoespacial, nome, status_missao, agencia, descricao, datalancamento)",
          )
          .eq("idusuario", uid),

        supabase
          .from("favoritopousuario")
          .select(
            "pontoobservacao(idpontoobs, nome, descricao, latitude, longitude)",
          )
          .eq("idusuario", uid),
      ]);

      setFavoritos({
        corposCelestes: (fCorpos ?? []).map((r: any) => r.corpoceleste),
        constelacoes: (fConstelacoes ?? []).map((r: any) => r.constelacao),
        eventos: (fEventos ?? []).map((r: any) => r.evento),
        materiais: (fMateriais ?? []).map((r: any) => r.materialestudo),
        missoes: (fMissoes ?? []).map((r: any) => r.missaoespacial),
        pontos: (fPontos ?? []).map((r: any) => r.pontoobservacao),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtro / scroll ────────────────────────────────────────────────────────

  const handleFiltro = (id: SecaoId | "Todas") => {
    setSecaoAtiva(id);
    if (id !== "Todas") {
      refs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const deveExibir = (id: SecaoId) =>
    secaoAtiva === "Todas" || secaoAtiva === id;

  // ── Sub-componentes ────────────────────────────────────────────────────────

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
      {children}
    </div>
  );

  const SectionHeader = ({
    id,
    label,
    count,
    Icon,
  }: {
    id: SecaoId;
    label: string;
    count: number;
    Icon: React.ElementType;
  }) => (
    <div ref={refs[id]} className="mb-4 flex items-center gap-3 scroll-mt-6">
      <Icon size={22} className="text-fuchsia-400" />
      <h2 className="text-2xl font-bold">{label}</h2>
      <span className="rounded-full bg-purple-800 px-2 py-0.5 text-sm text-purple-200">
        {count}
      </span>
    </div>
  );

  const MetaItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
  }) => (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={14} className="text-gray-400 shrink-0" />
      <span className="text-gray-400">{label}:</span>
      <span>{value}</span>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favoritos</h1>
          <p className="mt-2 text-gray-300">
            Tudo que você salvou em um único lugar.
          </p>
        </div>
      </div>

      {/* FILTRO DE SEÇÕES */}
      <div className="mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => handleFiltro("Todas")}
          className={`rounded-xl px-4 py-2 font-semibold transition-colors ${
            secaoAtiva === "Todas"
              ? "bg-fuchsia-700"
              : "bg-[#3b1544] hover:bg-purple-800"
          }`}
        >
          Todas
        </button>

        {SECOES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => handleFiltro(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-colors ${
              secaoAtiva === id
                ? "bg-fuchsia-700"
                : "bg-[#3b1544] hover:bg-purple-800"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="text-gray-300">Carregando favoritos...</div>
      ) : (
        <div className="space-y-12">
          {/* CORPOS CELESTES */}
          {deveExibir("corposCelestes") && (
            <section>
              <SectionHeader
                id="corposCelestes"
                label="Corpos Celestes"
                Icon={Globe2}
                count={favoritos.corposCelestes.length}
              />

              {favoritos.corposCelestes.length === 0 ? (
                <p className="text-gray-500">
                  Nenhum corpo celeste favoritado.
                </p>
              ) : (
                <div className="space-y-4">
                  {favoritos.corposCelestes.map((c) => (
                    <Card key={c.idcorpoceleste}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-xl font-bold">{c.nome}</h3>
                        <span className="rounded-full bg-purple-700 px-3 py-1 text-sm">
                          {c.tipo_corpo_celeste}
                        </span>
                      </div>
                      {c.descricao && (
                        <p className="mt-2 text-gray-300">{c.descricao}</p>
                      )}
                      {c.distancia != null && (
                        <div className="mt-3">
                          <MetaItem
                            icon={Ruler}
                            label="Distância"
                            value={`${c.distancia} a.l.`}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* CONSTELAÇÕES */}
          {deveExibir("constelacoes") && (
            <section>
              <SectionHeader
                id="constelacoes"
                label="Constelações"
                Icon={Star}
                count={favoritos.constelacoes.length}
              />

              {favoritos.constelacoes.length === 0 ? (
                <p className="text-gray-500">Nenhuma constelação favoritada.</p>
              ) : (
                <div className="space-y-4">
                  {favoritos.constelacoes.map((c) => (
                    <Card key={c.idconstelacao}>
                      <h3 className="text-xl font-bold">{c.nome}</h3>
                      {c.descricao && (
                        <p className="mt-2 text-gray-300">{c.descricao}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* EVENTOS */}
          {deveExibir("eventos") && (
            <section>
              <SectionHeader
                id="eventos"
                label="Eventos"
                Icon={Telescope}
                count={favoritos.eventos.length}
              />

              {favoritos.eventos.length === 0 ? (
                <p className="text-gray-500">Nenhum evento favoritado.</p>
              ) : (
                <div className="space-y-4">
                  {favoritos.eventos.map((e) => (
                    <Card key={e.idevento}>
                      <h3 className="text-xl font-bold">{e.descricao}</h3>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <MetaItem
                          icon={Calendar}
                          label="Data"
                          value={new Date(e.datahora).toLocaleString("pt-BR")}
                        />
                        <MetaItem
                          icon={MapPin}
                          label="Latitude"
                          value={e.latitude}
                        />
                        <MetaItem
                          icon={MapPin}
                          label="Longitude"
                          value={e.longitude}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MATERIAL DE ESTUDOS */}
          {deveExibir("materiais") && (
            <section>
              <SectionHeader
                id="materiais"
                label="Material de Estudos"
                Icon={BookOpen}
                count={favoritos.materiais.length}
              />

              {favoritos.materiais.length === 0 ? (
                <p className="text-gray-500">
                  Nenhum material de estudos favoritado.
                </p>
              ) : (
                <div className="space-y-4">
                  {favoritos.materiais.map((m) => (
                    <Card key={m.idmaterialestudo}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-xl font-bold">{m.titulo}</h3>
                        {m.tipo_arquivo && (
                          <span className="rounded-full bg-fuchsia-800 px-3 py-1 text-sm">
                            {m.tipo_arquivo}
                          </span>
                        )}
                      </div>
                      {m.descricao && (
                        <p className="mt-2 text-gray-300">{m.descricao}</p>
                      )}
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {m.autor && (
                          <MetaItem icon={User} label="Autor" value={m.autor} />
                        )}
                        {m.data_lancamento && (
                          <MetaItem
                            icon={Calendar}
                            label="Publicado em"
                            value={new Date(
                              m.data_lancamento,
                            ).toLocaleDateString("pt-BR")}
                          />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* MISSÕES ESPACIAIS */}
          {deveExibir("missoes") && (
            <section>
              <SectionHeader
                id="missoes"
                label="Missões Espaciais"
                Icon={Rocket}
                count={favoritos.missoes.length}
              />

              {favoritos.missoes.length === 0 ? (
                <p className="text-gray-500">Nenhuma missão favoritada.</p>
              ) : (
                <div className="space-y-4">
                  {favoritos.missoes.map((m) => (
                    <Card key={m.idmissaoespacial}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="text-xl font-bold">{m.nome}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            STATUS_COLORS[m.status_missao] ??
                            "bg-purple-700 text-purple-100"
                          }`}
                        >
                          {m.status_missao}
                        </span>
                      </div>
                      {m.descricao && (
                        <p className="mt-2 text-gray-300">{m.descricao}</p>
                      )}
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {m.agencia && (
                          <MetaItem
                            icon={Building2}
                            label="Agência"
                            value={m.agencia}
                          />
                        )}
                        {m.datalancamento && (
                          <MetaItem
                            icon={Calendar}
                            label="Lançamento"
                            value={new Date(
                              m.datalancamento,
                            ).toLocaleDateString("pt-BR")}
                          />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* PONTOS DE OBSERVAÇÃO */}
          {deveExibir("pontos") && (
            <section>
              <SectionHeader
                id="pontos"
                label="Pontos de Observação"
                Icon={MapPin}
                count={favoritos.pontos.length}
              />

              {favoritos.pontos.length === 0 ? (
                <p className="text-gray-500">
                  Nenhum ponto de observação favoritado.
                </p>
              ) : (
                <div className="space-y-4">
                  {favoritos.pontos.map((p) => (
                    <Card key={p.idpontoobs}>
                      <h3 className="text-xl font-bold">{p.nome}</h3>
                      {p.descricao && (
                        <p className="mt-2 text-gray-300">{p.descricao}</p>
                      )}
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <MetaItem
                          icon={MapPin}
                          label="Latitude"
                          value={p.latitude}
                        />
                        <MetaItem
                          icon={MapPin}
                          label="Longitude"
                          value={p.longitude}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
