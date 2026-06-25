import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Star } from "lucide-react";

interface Missao {
  idmissaoespacial: number;
  idusuario: number;
  nome: string;
  status_missao: string;
  descricao: string;
  agencia: string;
  datalancamento: string;
  missaocorpoceleste?: {
    corpoceleste: {
      nome: string;
    } | null;
  }[];
}

const STATUS_OPTIONS = [
  "Todos",
  "Planejada",
  "Em andamento",
  "Concluída",
  "Cancelada",
  "Falha",
];

const STATUS_COLORS: Record<string, string> = {
  Planejada: "bg-blue-700 text-blue-100",
  "Em andamento": "bg-yellow-700 text-yellow-100",
  Concluída: "bg-green-700 text-green-100",
  Cancelada: "bg-gray-600 text-gray-200",
  Falha: "bg-red-800 text-red-100",
};

export default function Missoes() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Record<number, boolean>>({});

  const [pesquisa, setPesquisa] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 5;

  const buscarMissoes = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("missaoespacial")
        .select(`
          *,
          missaocorpoceleste (
            corpoceleste (
              nome
            )
          )
        `)
        .order("datalancamento", { ascending: false });

      if (pesquisa.trim()) {
        query = query.ilike("nome", `%${pesquisa}%`);
      }

      if (statusFiltro !== "Todos") {
        query = query.eq("status_missao", statusFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMissoes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.resolve();
      if (!mounted) return;
      await buscarMissoes();
    })();

    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    const carregarFavoritos = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: usuario } = await supabase
          .from("usuario")
          .select("idusuario")
          .eq("id", user.id)
          .single();

        if (!usuario) return;

        const { data: favoritosBanco } = await supabase
          .from("favoritousuariomissao")
          .select("idmissaoespacial")
          .eq("idusuario", usuario.idusuario);

        const favoritosMap: Record<number, boolean> = {};

        favoritosBanco?.forEach((favorito) => {
          favoritosMap[favorito.idmissaoespacial] = true;
        });

        setFavoritos(favoritosMap);
      } catch (err) {
        console.error(err);
      }
    };

    carregarFavoritos();
  }, []);

  const toggleFavorito = async (idmissaoespacial: number) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Usuário não autenticado");
        return;
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("idusuario")
        .eq("id", user.id)
        .single();

      if (usuarioError || !usuario) {
        console.error("Usuário não encontrado na tabela usuario");
        return;
      }

      const favoritoAtual = favoritos[idmissaoespacial];

      if (favoritoAtual) {
        const { error } = await supabase
          .from("favoritousuariomissao")
          .delete()
          .eq("idmissaoespacial", idmissaoespacial)
          .eq("idusuario", usuario.idusuario);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("favoritousuariomissao").insert({
          idmissaoespacial,
          idusuario: usuario.idusuario,
        });

        if (error) throw error;
      }

      setFavoritos((prev) => ({
        ...prev,
        [idmissaoespacial]: !prev[idmissaoespacial],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const missoesVisiveis = missoes.slice(0, pagina * registrosPorPagina);

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Missões Espaciais</h1>
          <p className="mt-2 text-gray-300">
            Histórico e acompanhamento de missões espaciais.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Pesquisar missão por nome..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />

        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="rounded-xl border border-purple-700 bg-[#3b1544] p-3 text-white"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={buscarMissoes}
        className="mb-8 rounded-xl bg-purple-700 px-5 py-3"
      >
        Pesquisar
      </button>

      {/* LISTAGEM */}
      {loading ? (
        <div>Carregando...</div>
      ) : missoesVisiveis.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          Nenhuma missão encontrada.
        </div>
      ) : (
        <div className="space-y-6">
          {missoesVisiveis.map((missao) => (
            <div
              key={missao.idmissaoespacial}
              className="relative overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544]"
            >
              <button
                onClick={() => toggleFavorito(missao.idmissaoespacial)}
                aria-label="Favoritar"
                className="absolute right-4 bottom-4 z-10 rounded-full p-2 hover:bg-white/10"
              >
                <Star
                  size={18}
                  className={
                    favoritos[missao.idmissaoespacial]
                      ? "fill-pink-500 text-pink-500"
                      : "text-gray-400"
                  }
                />
              </button>
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-2xl font-bold">{missao.nome}</h2>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      STATUS_COLORS[missao.status_missao] ??
                      "bg-purple-700 text-purple-100"
                    }`}
                  >
                    {missao.status_missao}
                  </span>
                </div>

                {missao.descricao && (
                  <p className="mt-3 text-gray-300">{missao.descricao}</p>
                )}

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-gray-400">Agência:</span>{" "}
                    {missao.agencia || "—"}
                  </div>

                  <div>
                    <span className="text-gray-400">Lançamento:</span>{" "}
                    {missao.datalancamento
                      ? new Date(missao.datalancamento).toLocaleDateString(
                          "pt-BR",
                        )
                      : "—"}
                  </div>

                  <div>
                    <span className="text-gray-400">Corpo Celeste:</span>{" "}
                    {missao.missaocorpoceleste && missao.missaocorpoceleste.length > 0
                      ? missao.missaocorpoceleste
                          .map((mc) => mc.corpoceleste?.nome)
                          .filter(Boolean)
                          .join(", ")
                      : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {missoes.length > missoesVisiveis.length && (
            <div className="text-center">
              <button
                onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
                className="rounded-xl bg-fuchsia-700 px-6 py-3"
              >
                Carregar Mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
