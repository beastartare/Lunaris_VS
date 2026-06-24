import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

interface MaterialEstudo {
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
  const [materiais, setMateriais] = useState<MaterialEstudo[]>([]);
  const [loading, setLoading] = useState(true);

  const [pesquisa, setPesquisa] = useState("");

  const [pagina, setPagina] = useState(1);

  const registrosPorPagina = 6;

  const buscarMateriais = async () => {
    try {
      setLoading(true);

      let query = supabase
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
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      buscarMateriais();
    });
  }, []);

  const materiaisVisiveis = materiais.slice(0, pagina * registrosPorPagina);

  const baixarArquivo = (arquivoHex: string, nomeArquivo: string) => {
    if (!arquivoHex) return;

    const cleanHex = arquivoHex.startsWith("\\x")
      ? arquivoHex.slice(2)
      : arquivoHex;

    const bytes = new Uint8Array(
      cleanHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
    );

    const blob = new Blob([bytes]);

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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
