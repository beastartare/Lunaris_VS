import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase";
import { Star } from "lucide-react";

interface MaterialEstudoItem {
  idmaterialestudo: number;
  idusuario: number | null;
  data_lancamento: string | null;
  tipo_arquivo: string | null;
  autor: string | null;
  descricao: string | null;
  titulo: string | null;
  arquivo: string | null;
}

export default function MaterialEstudo() {
  const [materiais, setMateriais] = useState<MaterialEstudoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Record<number, boolean>>({});

  const [pesquisa, setPesquisa] = useState("");

  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 6;

  const buscarMateriais = useCallback(async () => {
    try {
      setLoading(true);

      const query = supabase
        .from("materialestudo")
        .select("*")
        .order("data_lancamento", {
          ascending: false,
        });

      const { data, error } = await query;

      if (error) throw error;

      let materiaisFiltrados = data || [];

      if (pesquisa.trim()) {
        const texto = pesquisa.toLowerCase();

        materiaisFiltrados = materiaisFiltrados.filter(
          (material) =>
            material.titulo?.toLowerCase().includes(texto) ||
            material.autor?.toLowerCase().includes(texto) ||
            material.descricao?.toLowerCase().includes(texto),
        );
      }

      setMateriais(materiaisFiltrados);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pesquisa]);

  useEffect(() => {
    Promise.resolve().then(() => {
      buscarMateriais();
    });
  }, [buscarMateriais]);

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
          .from("favoritomaterialusuario")
          .select("idmaterialestudo")
          .eq("idusuario", usuario.idusuario);

        const favoritosMap: Record<number, boolean> = {};

        favoritosBanco?.forEach((favorito) => {
          favoritosMap[favorito.idmaterialestudo] = true;
        });

        setFavoritos(favoritosMap);
      } catch (err) {
        console.error(err);
      }
    };

    carregarFavoritos();
  }, []);

  const toggleFavorito = async (idmaterialestudo: number) => {
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

      const favoritoAtual = favoritos[idmaterialestudo];

      if (favoritoAtual) {
        const { error } = await supabase
          .from("favoritomaterialusuario")
          .delete()
          .eq("idmaterialestudo", idmaterialestudo)
          .eq("idusuario", usuario.idusuario);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favoritomaterialusuario")
          .insert({
            idmaterialestudo,
            idusuario: usuario.idusuario,
          });

        if (error) throw error;
      }

      setFavoritos((prev) => ({
        ...prev,
        [idmaterialestudo]: !prev[idmaterialestudo],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const materiaisVisiveis = materiais.slice(0, pagina * registrosPorPagina);

  const getMimeType = (tipo?: string | null) => {
    if (!tipo) return "application/octet-stream";

    const t = tipo.toLowerCase();

    if (t.includes("/")) return t; // already a mime type

    if (t.includes("pdf")) return "application/pdf";
    if (t.includes("png")) return "image/png";
    if (t.includes("jpg") || t.includes("jpeg")) return "image/jpeg";
    if (t.includes("gif")) return "image/gif";
    if (t.includes("txt")) return "text/plain";
    if (t.includes("mp4")) return "video/mp4";

    return "application/octet-stream";
  };

  const baixarArquivo = (
    arquivoHex: string,
    nomeArquivo: string,
    tipoArquivo?: string | null,
  ) => {
    if (!arquivoHex) return;

    // bytea(hex) -> string base64
    const cleanHex = arquivoHex.startsWith("\\x")
      ? arquivoHex.slice(2)
      : arquivoHex;

    let base64 = "";

    for (let i = 0; i < cleanHex.length; i += 2) {
      base64 += String.fromCharCode(
        parseInt(cleanHex.substring(i, i + 2), 16)
      );
    }

    // base64 -> bytes reais
    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const mime = getMimeType(tipoArquivo);

    const blob = new Blob([bytes], {
      type: mime,
    });

    const url = URL.createObjectURL(blob);

    const extensao =
      tipoArquivo?.replace(".", "") || "pdf";

    const link = document.createElement("a");

    link.href = url;
    link.download = `${nomeArquivo}.${extensao}`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <div className="text-white">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-semibold">Materiais de Estudo</h1>
          <p className="mt-3 text-lg text-zinc-400">
            Biblioteca de conteúdos para aprendizado e pesquisa.
          </p>
        </div>
      </div>

      {/* PESQUISA */}

      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Pesquisar material..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="flex-1 rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />

        <button
          onClick={buscarMateriais}
          className="rounded-xl bg-purple-700 px-6 py-3"
        >
          Buscar
        </button>
      </div>

      {/* LISTAGEM */}

      {loading ? (
        <div>Carregando materiais...</div>
      ) : materiais.length === 0 ? (
        <div>Nenhum material encontrado.</div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {materiaisVisiveis.map((material) => (
              <div
                key={material.idmaterialestudo}
                className="relative rounded-2xl border border-purple-700 bg-[#3b1544] p-6"
              >
                <button
                  onClick={() => toggleFavorito(material.idmaterialestudo)}
                  aria-label="Favoritar"
                  className="absolute right-4 top-4 rounded-full p-2 hover:bg-white/10"
                >
                  <Star
                    size={18}
                    className={
                      favoritos[material.idmaterialestudo]
                        ? "fill-pink-500 text-pink-500"
                        : "text-gray-400"
                    }
                  />
                </button>
                <div className="mb-4">
                  <span className="rounded-lg bg-purple-700 px-3 py-1 text-xs">
                    {material.tipo_arquivo || "Arquivo"}
                  </span>
                </div>

                <h2 className="text-xl font-bold">{material.titulo}</h2>

                <p className="mt-3 text-gray-300">{material.descricao}</p>

                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>Autor: {material.autor || "Não informado"}</p>

                  <p>
                    Publicado em:{" "}
                    {material.data_lancamento
                      ? new Date(material.data_lancamento).toLocaleDateString(
                        "pt-BR",
                      )
                      : "-"}
                  </p>
                </div>

                {material.arquivo && (
                  <button
                    onClick={() =>
                      baixarArquivo(
                        material.arquivo!,
                        material.titulo || "arquivo",
                        material.tipo_arquivo
                      )
                    }
                    className="mt-6 w-full rounded-xl bg-fuchsia-700 px-4 py-3 font-semibold hover:bg-fuchsia-600"
                  >
                    Baixar Material
                  </button>
                )}
              </div>
            ))}
          </div>

          {materiais.length > materiaisVisiveis.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
                className="rounded-xl bg-purple-700 px-6 py-3"
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
