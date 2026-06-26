import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Telescope, MapPin, ChevronLeft, ChevronRight, CalendarDays, BookMarked } from "lucide-react";

interface Observacao {
  idusuarioeventopo: number;
  idevento: number;
  idpontoobs: number | null;
  evento: {
    descricao: string;
    datahora: string;
    latitude: number;
    longitude: number;
    imagem: string[] | null;
  } | null;
  pontoobservacao: {
    nome: string;
    descricao: string | null;
    latitude: number;
    longitude: number;
  } | null;
}

export default function MinhasBibliotecaCliente() {
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Índice de imagem atual por observação
  const [imagemAtual, setImagemAtual] = useState<Record<number, number>>({});

  const [pesquisa, setPesquisa] = useState("");
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 6;

  const byteaHexToBase64 = (hex: string): string => {
    if (!hex) return "";
    const cleanHex = hex.startsWith("\\x") ? hex.slice(2) : hex;
    let result = "";
    for (let i = 0; i < cleanHex.length; i += 2) {
      result += String.fromCharCode(parseInt(cleanHex.substring(i, i + 2), 16));
    }
    return result;
  };

  const obterSrcImagem = (imgItem: string): string => {
    const base64 = byteaHexToBase64(imgItem);
    return `data:image/jpeg;base64,${base64}`;
  };

  const buscarObservacoes = async () => {
    try {
      setLoading(true);
      setErro(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErro("Usuário não autenticado.");
        return;
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("idusuario")
        .eq("id", user.id)
        .single();

      if (usuarioError || !usuario) {
        setErro("Usuário não encontrado.");
        return;
      }

      const { data, error } = await supabase
        .from("usuarioeventopo")
        .select(
          `
          idusuarioeventopo,
          idevento,
          idpontoobs,
          evento (
            descricao,
            datahora,
            latitude,
            longitude,
            imagem
          ),
          pontoobservacao (
            nome,
            descricao,
            latitude,
            longitude
          )
        `,
        )
        .eq("idusuario", usuario.idusuario)
        .order("idusuarioeventopo", { ascending: false });

      if (error) throw error;

      setObservacoes((data as unknown as Observacao[]) || []);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar as observações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarObservacoes();
  }, []);

  const observacoesFiltradas = observacoes.filter((obs) =>
    obs.evento?.descricao?.toLowerCase().includes(pesquisa.toLowerCase()),
  );

  const observacoesVisiveis = observacoesFiltradas.slice(
    0,
    pagina * registrosPorPagina,
  );

  const avancarImagem = (id: number, total: number) => {
    setImagemAtual((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % total,
    }));
  };

  const voltarImagem = (id: number, total: number) => {
    setImagemAtual((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) - 1 + total) % total,
    }));
  };

  return (
    <div className="text-white">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <BookMarked size={28} className="text-fuchsia-400" />

            <h1 className="text-5xl font-semibold">
              Minha Biblioteca
            </h1>
          </div>

          <p className="mt-3 text-lg text-zinc-400">
            Todas as observações que você registrou no sistema.
          </p>
        </div>
      </div>

      {/* PESQUISA */}
      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Pesquisar por evento..."
          value={pesquisa}
          onChange={(e) => {
            setPesquisa(e.target.value);
            setPagina(1);
          }}
          className="flex-1 rounded-xl border border-purple-700 bg-[#3b1544] p-3"
        />
        <button
          onClick={buscarObservacoes}
          className="rounded-xl bg-purple-700 px-5 py-3 hover:bg-purple-600 transition-colors"
        >
          Pesquisar
        </button>
      </div>

      {/* CONTEÚDO */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Telescope size={40} className="animate-pulse text-fuchsia-400" />
            <p>Carregando suas observações...</p>
          </div>
        </div>
      ) : erro ? (
        <div className="mt-16 text-center text-red-400">{erro}</div>
      ) : observacoesFiltradas.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-gray-400">
          <Telescope size={48} className="text-fuchsia-800" />
          <p className="text-lg">
            {pesquisa
              ? "Nenhuma observação encontrada para essa pesquisa."
              : "Você ainda não registrou nenhuma observação."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm text-gray-400">
            {observacoesFiltradas.length}{" "}
            {observacoesFiltradas.length === 1
              ? "observação encontrada"
              : "observações encontradas"}
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {observacoesVisiveis.map((obs) => {
              const imagens = Array.isArray(obs.evento?.imagem)
                ? obs.evento!.imagem!
                : [];
              const totalImagens = imagens.length;
              const idxAtual = imagemAtual[obs.idusuarioeventopo] ?? 0;

              return (
                <div
                  key={obs.idusuarioeventopo}
                  className="overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544] flex flex-col"
                >
                  {/* Carrossel de imagens */}
                  {totalImagens > 0 ? (
                    <div className="relative">
                      <img
                        src={obterSrcImagem(imagens[idxAtual])}
                        alt={`Observação – imagem ${idxAtual + 1}`}
                        className="h-150 w-full object-cover"
                      />
                      {totalImagens > 1 && (
                        <>
                          <button
                            onClick={() =>
                              voltarImagem(obs.idusuarioeventopo, totalImagens)
                            }
                            aria-label="Imagem anterior"
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() =>
                              avancarImagem(obs.idusuarioeventopo, totalImagens)
                            }
                            aria-label="Próxima imagem"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                          >
                            <ChevronRight size={16} />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs">
                            {idxAtual + 1} / {totalImagens}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-[#2a102f]/60">
                      <Telescope size={36} className="text-fuchsia-800/60" />
                    </div>
                  )}

                  {/* Informações */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    {/* Evento */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Telescope size={15} className="text-fuchsia-400 shrink-0" />
                        <span className="text-xs uppercase tracking-wide text-fuchsia-400 font-medium">
                          Evento
                        </span>
                      </div>
                      <h2 className="font-bold text-lg leading-tight">
                        {obs.evento?.descricao ?? "—"}
                      </h2>
                      {obs.evento?.datahora && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                          <CalendarDays size={12} />
                          {new Date(obs.evento.datahora).toLocaleString("pt-BR")}
                        </div>
                      )}
                    </div>

                    {/* Ponto de Observação */}
                    {obs.pontoobservacao && (
                      <div className="rounded-xl border border-purple-800 bg-[#2a102f]/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={13} className="text-pink-400 shrink-0" />
                          <span className="text-xs uppercase tracking-wide text-pink-400 font-medium">
                            Ponto de Observação
                          </span>
                        </div>
                        <p className="font-semibold text-sm">
                          {obs.pontoobservacao.nome}
                        </p>
                        {obs.pontoobservacao.descricao && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {obs.pontoobservacao.descricao}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {obs.pontoobservacao.latitude.toFixed(5)},{" "}
                          {obs.pontoobservacao.longitude.toFixed(5)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carregar mais */}
          {observacoesFiltradas.length > observacoesVisiveis.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPagina((p) => p + 1)}
                className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600 transition-colors"
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
