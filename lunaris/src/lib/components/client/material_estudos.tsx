import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../supabase";

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

    const cleanHex = arquivoHex.startsWith("\\x")
      ? arquivoHex.slice(2)
      : arquivoHex;

    const hexPairs = cleanHex.match(/.{1,2}/g) || [];

    const bytes = new Uint8Array(hexPairs.map((byte) => parseInt(byte, 16)));

    const mime = getMimeType(tipoArquivo);

    const blob = new Blob([bytes], { type: mime });

    const url = URL.createObjectURL(blob);

    const filename = nomeArquivo.includes(".")
      ? nomeArquivo
      : `${nomeArquivo}.${(tipoArquivo || "bin").replace(/\./g, "")}`;

    // For PDFs and images, open in new tab to allow preview; otherwise trigger download
    // If the app is being served from file:, force download to avoid cross-origin PDF viewer issues
    const isFileProtocol =
      window.location && window.location.protocol === "file:";

    if (
      !isFileProtocol &&
      (mime === "application/pdf" || mime.startsWith("image/"))
    ) {
      const newWindow = window.open(url, "_blank");

      if (!newWindow) {
        // Fallback to force download if popup blocked
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Keep the URL alive briefly to ensure the browser can access it
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Materiais de Estudo</h1>

        <p className="mt-2 text-gray-300">
          Biblioteca de conteúdos para aprendizado e pesquisa.
        </p>
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
                className="rounded-2xl border border-purple-700 bg-[#3b1544] p-6"
              >
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
                        `${material.titulo}.${material.tipo_arquivo}`,
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
