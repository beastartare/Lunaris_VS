import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase";
import { Star, Download, FileText, BookOpen } from "lucide-react";

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
    arquivo: string,
    nomeArquivo: string,
    tipoArquivo?: string | null,
  ) => {
    if (!arquivo) return;

    try {
      let base64: string;

      if (arquivo.startsWith("\\x")) {
        // Formato bytea hex retornado pelo Supabase: \x4a5650...
        const cleanHex = arquivo.slice(2);
        let binStr = "";
        for (let i = 0; i < cleanHex.length; i += 2) {
          binStr += String.fromCharCode(parseInt(cleanHex.substring(i, i + 2), 16));
        }
        // binStr agora É a string base64 original armazenada
        base64 = binStr;
      } else {
        // Já é base64 puro (ou data URL)
        base64 = arquivo.includes(",") ? arquivo.split(",")[1] : arquivo;
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const mime = getMimeType(tipoArquivo);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      const extensao = tipoArquivo?.replace(".", "").toLowerCase() || "pdf";

      const link = document.createElement("a");
      link.href = url;
      link.download = `${nomeArquivo}.${extensao}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Erro ao baixar arquivo:", err);
      alert("Não foi possível baixar o arquivo.");
    }
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
                className="relative flex flex-col rounded-2xl border border-purple-700 bg-[#3b1544] p-6"
              >
                {/* Favorito */}
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

                {/* Ícone + tipo */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900/60 border border-purple-600">
                    {material.tipo_arquivo?.toLowerCase().includes("pdf") ? (
                      <FileText size={18} className="text-pink-400" />
                    ) : (
                      <BookOpen size={18} className="text-fuchsia-400" />
                    )}
                  </div>
                  <span className="rounded-lg bg-purple-700/60 px-3 py-1 text-xs font-medium">
                    {material.tipo_arquivo || "Arquivo"}
                  </span>
                </div>

                <h2 className="pr-8 text-xl font-bold leading-snug">{material.titulo}</h2>

                <p className="mt-3 flex-1 text-sm text-gray-300">{material.descricao}</p>

                <div className="mt-4 space-y-1 text-sm text-gray-400">
                  <p>Autor: {material.autor || "Não informado"}</p>
                  <p>
                    Publicado em:{" "}
                    {material.data_lancamento
                      ? new Date(material.data_lancamento).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>

                {/* Botão de download — sempre visível */}
                <button
                  id={`btn-download-${material.idmaterialestudo}`}
                  onClick={() => {
                    if (material.arquivo) {
                      baixarArquivo(
                        material.arquivo,
                        material.titulo || "arquivo",
                        material.tipo_arquivo,
                      );
                    }
                  }}
                  disabled={!material.arquivo}
                  title={material.arquivo ? "Baixar arquivo" : "Nenhum arquivo anexado"}
                  className={
                    "mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors " +
                    (material.arquivo
                      ? "bg-fuchsia-700 hover:bg-fuchsia-600 text-white"
                      : "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed")
                  }
                >
                  <Download size={16} />
                  {material.arquivo ? "Baixar Material" : "Sem arquivo"}
                </button>
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
