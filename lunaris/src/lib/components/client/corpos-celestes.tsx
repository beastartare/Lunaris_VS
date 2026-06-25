import { useEffect, useState } from "react";
import {
  Search,
  Star,
  Globe,
  Orbit,
  Cloud,
  Sparkles,
  Circle,
  Satellite,
} from "lucide-react";
import { supabase } from "../../supabase";

interface CorpoCeleste {
  idcorpoceleste: number;
  nome: string;
  descricao: string;
  distancia: number;
  tipo_corpo_celeste: string;
  constelacao?: {
    nome: string;
  };
}

export default function CorposCelestes() {
  const [corpos, setCorpos] = useState<CorpoCeleste[]>([]);

  const [loading, setLoading] = useState(true);

  const [pesquisa, setPesquisa] = useState("");

  const [tipoFiltro, setTipoFiltro] = useState("");

  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 6;

  const [favoritos, setFavoritos] = useState<Record<number, boolean>>({});

  const obterIcone = (tipo: string) => {
    switch (tipo) {
      case "Planeta":
        return Globe;

      case "Estrela":
        return Star;

      case "Galáxia":
        return Orbit;

      case "Nebulosa":
        return Cloud;

      case "Cometa":
        return Sparkles;

      case "Asteroide":
        return Circle;

      case "Satélite":
        return Satellite;

      case "Buraco Negro":
        return Orbit;

      default:
        return Star;
    }
  };

  const obterCorIcone = (tipo: string) => {
    switch (tipo) {
      case "Planeta":
        return "bg-blue-600";

      case "Estrela":
        return "bg-yellow-500";

      case "Galáxia":
        return "bg-purple-600";

      case "Nebulosa":
        return "bg-pink-600";

      case "Cometa":
        return "bg-cyan-600";

      case "Asteroide":
        return "bg-gray-600";

      case "Satélite":
        return "bg-green-600";

      case "Buraco Negro":
        return "bg-black";

      default:
        return "bg-fuchsia-700";
    }
  };

  const buscarCorpos = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("corpoceleste")
        .select(
          `
              *,
              constelacao (
                nome
              )
            `,
        )
        .order("nome");

      if (error) throw error;

      let resultado = data || [];

      if (pesquisa.trim()) {
        resultado = resultado.filter((corpo) =>
          corpo.nome?.toLowerCase().includes(pesquisa.toLowerCase()),
        );
      }

      if (tipoFiltro) {
        resultado = resultado.filter(
          (corpo) => corpo.tipo_corpo_celeste === tipoFiltro,
        );
      }

      setCorpos(resultado);
      setPagina(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarCorpos();
  }, []);

  const toggleFavorito = async (idcorpoceleste: number) => {
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

      const favoritoAtual = favoritos[idcorpoceleste];

      if (favoritoAtual) {
        const { error } = await supabase
          .from("favoritocorpocelesteusuario")
          .delete()
          .eq("idcorpoceleste", idcorpoceleste)
          .eq("idusuario", usuario.idusuario);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favoritocorpocelesteusuario")
          .insert({
            idcorpoceleste,
            idusuario: usuario.idusuario,
          });

        if (error) throw error;
      }

      setFavoritos((prev) => ({
        ...prev,
        [idcorpoceleste]: !prev[idcorpoceleste],
      }));
    } catch (err) {
      console.error(err);
    }
  };

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
          .from("favoritocorpocelesteusuario")
          .select("idcorpoceleste")
          .eq("idusuario", usuario.idusuario);

        const favoritosMap: Record<number, boolean> = {};

        favoritosBanco?.forEach((favorito) => {
          favoritosMap[favorito.idcorpoceleste] = true;
        });

        setFavoritos(favoritosMap);
      } catch (err) {
        console.error(err);
      }
    };

    carregarFavoritos();
  }, []);

  const corposVisiveis = corpos.slice(0, pagina * registrosPorPagina);

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}

      <div className="mb-10">
        <h1 className="text-4xl font-bold">Corpos Celestes</h1>

        <p className="mt-3 text-gray-400">
          Explore os corpos celestes cadastrados no sistema Lunaris.
        </p>
      </div>

      {/* FILTROS */}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-4 text-gray-400" />

          <input
            type="text"
            placeholder="Pesquisar corpo celeste..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full rounded-2xl border border-purple-700 bg-[#35133c] py-3 pl-11 pr-4"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="rounded-2xl border border-purple-700 bg-[#35133c] p-3"
        >
          <option value="">Todos os tipos</option>

          <option value="Planeta">Planeta</option>

          <option value="Estrela">Estrela</option>

          <option value="Galáxia">Galáxia</option>

          <option value="Nebulosa">Nebulosa</option>

          <option value="Cometa">Cometa</option>

          <option value="Asteroide">Asteroide</option>

          <option value="Satélite">Satélite</option>

          <option value="Buraco Negro">Buraco Negro</option>
        </select>
      </div>

      <button
        onClick={buscarCorpos}
        className="mb-10 rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600"
      >
        Pesquisar
      </button>

      {/* LISTAGEM */}

      {loading ? (
        <div>Carregando corpos celestes...</div>
      ) : corpos.length === 0 ? (
        <div>Nenhum corpo celeste encontrado.</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {corposVisiveis.map((corpo) => {
              const Icone = obterIcone(corpo.tipo_corpo_celeste);

              return (
                <div
                  key={corpo.idcorpoceleste}
                  className="relative rounded-3xl border border-purple-700 bg-[#35133c] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <button
                    onClick={() => toggleFavorito(corpo.idcorpoceleste)}
                    aria-label="Favoritar"
                    className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10"
                  >
                    <Star
                      size={18}
                      className={
                        favoritos[corpo.idcorpoceleste]
                          ? "text-pink-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className={`rounded-2xl p-4 ${obterCorIcone(
                        corpo.tipo_corpo_celeste,
                      )}`}
                    >
                      <Icone size={26} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">{corpo.nome}</h2>

                      <p className="text-sm text-gray-400">
                        {corpo.tipo_corpo_celeste}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-gray-400">Constelação</span>

                      <p className="mt-1">
                        {corpo.constelacao?.nome || "Não informada"}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400">Distância</span>

                      <p className="mt-1">{corpo.distancia}</p>
                    </div>

                    <div>
                      <span className="text-gray-400">Descrição</span>

                      <p className="mt-1">{corpo.descricao}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {corpos.length > corposVisiveis.length && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
                className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600"
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
