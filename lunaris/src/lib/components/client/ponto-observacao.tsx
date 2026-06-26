import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Star, MapPin } from "lucide-react";

interface PontoObservacao {
  idpontoobs: number;
  idusuario: number;
  nome: string;
  descricao: string;
  latitude: number;
  longitude: number;
}

export default function PontosObservacao() {
  const [pontos, setPontos] = useState<PontoObservacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Record<number, boolean>>({});

  const [pesquisa, setPesquisa] = useState("");
  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 5;

  const buscarPontos = async () => {
    try {
      setLoading(true);

      let query = supabase.from("pontoobservacao").select("*").order("nome");

      if (pesquisa.trim()) {
        query = query.ilike("nome", `%${pesquisa}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPontos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarPontos();
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
          .from("favoritopousuario")
          .select("idpontoobs")
          .eq("idusuario", usuario.idusuario);

        const favoritosMap: Record<number, boolean> = {};

        favoritosBanco?.forEach((favorito) => {
          favoritosMap[favorito.idpontoobs] = true;
        });

        setFavoritos(favoritosMap);
      } catch (err) {
        console.error(err);
      }
    };

    carregarFavoritos();
  }, []);

  const toggleFavorito = async (idpontoobs: number) => {
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

      const favoritoAtual = favoritos[idpontoobs];

      if (favoritoAtual) {
        const { error } = await supabase
          .from("favoritopousuario")
          .delete()
          .eq("idpontoobs", idpontoobs)
          .eq("idusuario", usuario.idusuario);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("favoritopousuario").insert({
          idpontoobs,
          idusuario: usuario.idusuario,
        });

        if (error) throw error;
      }

      setFavoritos((prev) => ({
        ...prev,
        [idpontoobs]: !prev[idpontoobs],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const pontosVisiveis = pontos.slice(0, pagina * registrosPorPagina);

  return (
    <div className="text-white">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-semibold">Pontos de Observação</h1>

          <p className="mt-2 text-gray-300">
            Locais recomendados para observação astronômica.
          </p>
        </div>
      </div>

      {/* PESQUISA */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pesquisar ponto..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />
      </div>

      <button
        onClick={buscarPontos}
        className="mb-8 rounded-xl bg-purple-700 px-5 py-3"
      >
        Pesquisar
      </button>

      {/* LISTAGEM */}
      {loading ? (
        <div>Carregando...</div>
      ) : pontosVisiveis.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          Nenhum ponto encontrado.
        </div>
      ) : (
        <div className="space-y-6">
          {pontosVisiveis.map((ponto) => (
            <div
              key={ponto.idpontoobs}
              className="relative overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544]"
            >
              <button
                onClick={() => toggleFavorito(ponto.idpontoobs)}
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10"
              >
                <Star
                  size={18}
                  className={
                    favoritos[ponto.idpontoobs]
                      ? "fill-pink-500 text-pink-500"
                      : "text-gray-400"
                  }
                />
              </button>

              <div className="p-6">
                <div className="flex items-center gap-2">
                  <MapPin size={22} />
                  <h2 className="text-2xl font-bold">{ponto.nome}</h2>
                </div>

                {ponto.descricao && (
                  <p className="mt-3 text-gray-300">{ponto.descricao}</p>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-gray-400">Latitude:</span>{" "}
                    {ponto.latitude}
                  </div>

                  <div>
                    <span className="text-gray-400">Longitude:</span>{" "}
                    {ponto.longitude}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pontos.length > pontosVisiveis.length && (
            <div className="text-center">
              <button
                onClick={() => setPagina((p) => p + 1)}
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
