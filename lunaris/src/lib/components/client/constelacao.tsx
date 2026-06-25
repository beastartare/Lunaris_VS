import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Star, Sparkles } from "lucide-react";

interface Constelacao {
  idconstelacao: number;
  idusuario: number;
  nome: string;
  descricao: string;
}

export default function Constelacoes() {
  const [constelacoes, setConstelacoes] = useState<Constelacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Record<number, boolean>>({});

  const [pesquisa, setPesquisa] = useState("");
  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 6;

  const buscarConstelacoes = async () => {
    try {
      setLoading(true);

      let query = supabase.from("constelacao").select("*").order("nome");

      if (pesquisa.trim()) {
        query = query.ilike("nome", `%${pesquisa}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setConstelacoes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarConstelacoes();
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
          .from("favoritoconstelacaousuario")
          .select("idconstelacao")
          .eq("idusuario", usuario.idusuario);

        const favoritosMap: Record<number, boolean> = {};

        favoritosBanco?.forEach((favorito) => {
          favoritosMap[favorito.idconstelacao] = true;
        });

        setFavoritos(favoritosMap);
      } catch (err) {
        console.error(err);
      }
    };

    carregarFavoritos();
  }, []);

  const toggleFavorito = async (idconstelacao: number) => {
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

      const favoritoAtual = favoritos[idconstelacao];

      if (favoritoAtual) {
        const { error } = await supabase
          .from("favoritoconstelacaousuario")
          .delete()
          .eq("idconstelacao", idconstelacao)
          .eq("idusuario", usuario.idusuario);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favoritoconstelacaousuario")
          .insert({
            idconstelacao,
            idusuario: usuario.idusuario,
          });

        if (error) throw error;
      }

      setFavoritos((prev) => ({
        ...prev,
        [idconstelacao]: !prev[idconstelacao],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const constelacoesVisiveis = constelacoes.slice(
    0,
    pagina * registrosPorPagina,
  );

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Constelações</h1>

        <p className="mt-2 text-gray-300">
          Explore as principais constelações observadas no céu.
        </p>
      </div>

      {/* PESQUISA */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar constelação..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />
      </div>

      <button
        onClick={buscarConstelacoes}
        className="mb-8 rounded-xl bg-purple-700 px-5 py-3"
      >
        Pesquisar
      </button>

      {/* LISTAGEM */}
      {loading ? (
        <div>Carregando...</div>
      ) : constelacoesVisiveis.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          Nenhuma constelação encontrada.
        </div>
      ) : (
        <div className="space-y-6">
          {constelacoesVisiveis.map((constelacao) => (
            <div
              key={constelacao.idconstelacao}
              className="relative overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544]"
            >
              <button
                onClick={() => toggleFavorito(constelacao.idconstelacao)}
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10"
              >
                <Star
                  size={18}
                  className={
                    favoritos[constelacao.idconstelacao]
                      ? "fill-pink-500 text-pink-500"
                      : "text-gray-400"
                  }
                />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} />

                  <h2 className="text-2xl font-bold">{constelacao.nome}</h2>
                </div>

                {constelacao.descricao && (
                  <p className="mt-4 text-gray-300">{constelacao.descricao}</p>
                )}
              </div>
            </div>
          ))}

          {constelacoes.length > constelacoesVisiveis.length && (
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
