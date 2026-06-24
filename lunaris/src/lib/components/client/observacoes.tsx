import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

interface Evento {
  idevento: number;
  idusuario: number;
  longitude: number;
  latitude: number;
  datahora: string;
  descricao: string;
  imagem: string | null;
}

export default function Observacoes() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const [pesquisa, setPesquisa] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");

  const [pagina, setPagina] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);

  const [descricao, setDescricao] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imagem, setImagem] = useState<File | null>(null);

  const registrosPorPagina = 5;

  const buscarEventos = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("evento")
        .select("*")
        .order("datahora", { ascending: false });

      if (pesquisa.trim()) {
        query = query.ilike("descricao", `%${pesquisa}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let eventosFiltrados = data || [];

      if (dataFiltro) {
        eventosFiltrados = eventosFiltrados.filter((evento) =>
          evento.datahora.startsWith(dataFiltro),
        );
      }

      setEventos(eventosFiltrados);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      // ensure state updates inside buscarEventos run asynchronously (not synchronously in the effect)
      await Promise.resolve();
      if (!mounted) return;
      await buscarEventos();
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const converterParaBase64 = (arquivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(arquivo);

      reader.onload = () => {
        const resultado = reader.result as string;

        resolve(resultado.split(",")[1]);
      };

      reader.onerror = reject;
    });
  };

  const byteaHexToString = (hex: string) => {
    if (!hex) return "";

    const cleanHex = hex.startsWith("\\x") ? hex.slice(2) : hex;

    let result = "";

    for (let i = 0; i < cleanHex.length; i += 2) {
      result += String.fromCharCode(parseInt(cleanHex.substring(i, i + 2), 16));
    }

    return result;
  };

  const obterLocalizacao = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalização não suportada pelo navegador."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      );
    });
  };

  const cadastrarObservacao = async () => {
    try {
      let imagemBase64 = null;

      if (imagem) {
        imagemBase64 = await converterParaBase64(imagem);
      }

      const localizacao = await obterLocalizacao();

      const { error } = await supabase.from("evento").insert({
        idusuario: 2,
        descricao,
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        datahora: new Date().toISOString(),
        imagem: imagemBase64,
      });

      if (error) throw error;

      setDescricao("");
      setImagem(null);

      setLatitude(localizacao.latitude);
      setLongitude(localizacao.longitude);

      setModalAberto(false);

      await buscarEventos();

      alert("Observação cadastrada com sucesso!");
    } catch (err) {
      console.error(err);

      alert("Não foi possível cadastrar a observação.");
    }
  };

  const eventosVisiveis = eventos.slice(0, pagina * registrosPorPagina);
  console.log("Primeira imagem:", eventos[0]?.imagem?.substring(0, 100));

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Observações</h1>

          <p className="mt-2 text-gray-300">
            Histórico de observações astronômicas.
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold hover:bg-fuchsia-600"
        >
          Nova Observação
        </button>
      </div>

      {/* FILTROS */}

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Pesquisar evento..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />

        <input
          type="date"
          value={dataFiltro}
          onChange={(e) => setDataFiltro(e.target.value)}
          className="rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />
      </div>

      <button
        onClick={buscarEventos}
        className="mb-8 rounded-xl bg-purple-700 px-5 py-3"
      >
        Pesquisar
      </button>

      {/* LISTAGEM */}

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="space-y-6">
          {eventosVisiveis.map((evento) => (
            <div
              key={evento.idevento}
              className="overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544]"
            >
              {evento.imagem && (
                <img
                  src={`data:image/jpeg;base64,${byteaHexToString(
                    evento.imagem,
                  )}`}
                  alt={evento.descricao}
                  className="h-72 w-full object-cover"
                />
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold">{evento.descricao}</h2>

                <p className="mt-2 text-gray-300">
                  {new Date(evento.datahora).toLocaleString("pt-BR")}
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-gray-400">Latitude:</span>{" "}
                    {evento.latitude}
                  </div>

                  <div>
                    <span className="text-gray-400">Longitude:</span>{" "}
                    {evento.longitude}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {eventos.length > eventosVisiveis.length && (
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

      {/* MODAL */}

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-[#3b1544] p-6">
            <h2 className="mb-6 text-2xl font-bold">Nova Observação</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-xl border border-purple-700 bg-[#2a102f] p-3"
              />

              <div className="rounded-xl border border-purple-700 bg-[#2a102f] p-4">
                <p className="text-sm text-gray-400">Localização</p>

                <p className="mt-2 text-sm">
                  A localização será obtida automaticamente ao salvar a
                  observação.
                </p>

                {latitude && longitude && (
                  <div className="mt-3 text-xs text-gray-300">
                    Lat: {latitude.toFixed(6)}
                    <br />
                    Long: {longitude.toFixed(6)}
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagem(e.target.files?.[0] || null)}
                className="w-full"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalAberto(false)}
                  className="rounded-xl bg-gray-600 px-5 py-3"
                >
                  Cancelar
                </button>

                <button
                  onClick={cadastrarObservacao}
                  className="rounded-xl bg-fuchsia-700 px-5 py-3"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
