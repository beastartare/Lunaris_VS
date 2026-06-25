import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Star, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { fileToBase64, obterSrcImagem } from "../../utils/imagem";

interface Evento {
  idevento: number;
  idusuario: number;
  longitude: number;
  latitude: number;
  datahora: string;
  descricao: string;
  imagem: string[] | null;
  eventoastronomico?: {
    corpocelesteevento?: {
      corpoceleste?: {
        nome: string;
      } | null;
    }[];
  }[];
}

interface PontoObservacao {
  idpontoobs: number;
  nome: string;
  latitude: number;
  longitude: number;
  descricao: string;
}

// Etapas do fluxo de cadastro
type Etapa = "selecionar-evento" | "selecionar-ponto" | "adicionar-imagem";

export default function Observacoes() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<Record<number, boolean>>({});

  // Índice da imagem atual por evento
  const [imagemAtual, setImagemAtual] = useState<Record<number, number>>({});

  const [pesquisa, setPesquisa] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [pagina, setPagina] = useState(1);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("selecionar-evento");

  // Dados do fluxo de cadastro
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [pontos, setPontos] = useState<PontoObservacao[]>([]);
  const [pontoSelecionado, setPontoSelecionado] = useState<number | null>(null);
  const [usarLocalizacaoAtual, setUsarLocalizacaoAtual] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<{ latitude: number; longitude: number } | null>(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [nomePontoNovo, setNomePontoNovo] = useState("");
  const [descricaoPontoNovo, setDescricaoPontoNovo] = useState("");
  const [imagem, setImagem] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);

  const registrosPorPagina = 5;

  const buscarEventos = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("evento")
        .select(`
          *,
          eventoastronomico (
            corpocelesteevento (
              corpoceleste (
                nome
              )
            )
          )
        `)
        .order("datahora", { ascending: false });

      if (pesquisa.trim()) {
        query = query.ilike("descricao", `%${pesquisa}%`);
      }

      const { data, error } = await query;
      console.log("EVENTOS:", data);

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

  const buscarPontosObservacao = async () => {
    try {
      const { data, error } = await supabase
        .from("pontoobservacao")
        .select("*")
        .order("nome");

      if (error) throw error;
      setPontos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      await Promise.resolve();
      if (!mounted) return;
      await buscarEventos();
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
          .from("favoritoeventousuario")
          .select("idevento")
          .eq("idusuario", usuario.idusuario);

        const favoritosMap: Record<number, boolean> = {};

        favoritosBanco?.forEach((favorito) => {
          favoritosMap[favorito.idevento] = true;
        });

        setFavoritos(favoritosMap);
      } catch (err) {
        console.error(err);
      }
    };

    carregarFavoritos();
  }, []);



  const obterLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocalização não suportada."));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      setLocalizacaoAtual({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setUsarLocalizacaoAtual(true);
      setPontoSelecionado(null);
    } catch (err) {
      alert("Não foi possível obter sua localização.");
      console.error(err);
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const abrirModal = async () => {
    setEtapa("selecionar-evento");
    setEventoSelecionado(null);
    setPontoSelecionado(null);
    setUsarLocalizacaoAtual(false);
    setLocalizacaoAtual(null);
    setNomePontoNovo("");
    setDescricaoPontoNovo("");
    setImagem(null);
    setModalAberto(true);
    await buscarPontosObservacao();
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEventoSelecionado(null);
    setPontoSelecionado(null);
    setUsarLocalizacaoAtual(false);
    setLocalizacaoAtual(null);
    setNomePontoNovo("");
    setDescricaoPontoNovo("");
    setImagem(null);
  };

  const salvarObservacao = async () => {
    if (!eventoSelecionado) {
      alert("Selecione um evento.");
      return;
    }
    if (!pontoSelecionado && !usarLocalizacaoAtual) {
      alert("Selecione um ponto de observação ou use sua localização atual.");
      return;
    }

    setSalvando(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Usuário não autenticado.");
        return;
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuario")
        .select("idusuario")
        .eq("id", user.id)
        .single();

      if (usuarioError || !usuario) {
        alert("Usuário não encontrado.");
        return;
      }

      // Inserir registro em usuarioeventopo
      let idPontoParaSalvar: number | null = pontoSelecionado;

      if (usarLocalizacaoAtual && localizacaoAtual && !pontoSelecionado) {
        if (!nomePontoNovo.trim()) {
          alert("Informe um nome para o ponto de observação.");
          setSalvando(false);
          return;
        }
        // Cria um novo ponto de observação com a localização atual
        const { data: novoPonto, error: pontError } = await supabase
          .from("pontoobservacao")
          .insert({
            idusuario: usuario.idusuario,
            latitude: localizacaoAtual.latitude,
            longitude: localizacaoAtual.longitude,
            nome: nomePontoNovo.trim(),
            descricao: descricaoPontoNovo.trim() || null,
          })
          .select()
          .single();

        if (pontError) throw pontError;
        idPontoParaSalvar = novoPonto.idpontoobs;
      }

      const { error: uepError } = await supabase.from("usuarioeventopo").insert({
        idevento: eventoSelecionado.idevento,
        idusuario: usuario.idusuario,
        idpontoobs: idPontoParaSalvar,
      });

      if (uepError) throw uepError;

      // Se houver imagem, adiciona ao array de imagens do evento
      if (imagem) {
        const novaBase64 = await fileToBase64(imagem);
        const imagensAtuais: string[] = Array.isArray(eventoSelecionado.imagem)
          ? eventoSelecionado.imagem
          : [];
        const imagensAtualizadas = [...imagensAtuais, novaBase64];

        const { error: imgError } = await supabase
          .from("evento")
          .update({ imagem: imagensAtualizadas })
          .eq("idevento", eventoSelecionado.idevento);

        if (imgError) throw imgError;
      }

      fecharModal();
      await buscarEventos();
      alert("Observação registrada com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Não foi possível registrar a observação.");
    } finally {
      setSalvando(false);
    }
  };

  const toggleFavorito = async (idevento: number) => {
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

      const favoritoAtual = favoritos[idevento];

      if (favoritoAtual) {
        const { error } = await supabase
          .from("favoritoeventousuario")
          .delete()
          .eq("idevento", idevento)
          .eq("idusuario", usuario.idusuario);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("favoritoeventousuario").insert({
          idevento,
          idusuario: usuario.idusuario,
        });

        if (error) throw error;
      }

      setFavoritos((prev) => ({
        ...prev,
        [idevento]: !prev[idevento],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const avancarImagem = (idevento: number, total: number) => {
    setImagemAtual((prev) => ({
      ...prev,
      [idevento]: ((prev[idevento] ?? 0) + 1) % total,
    }));
  };

  const voltarImagem = (idevento: number, total: number) => {
    setImagemAtual((prev) => ({
      ...prev,
      [idevento]: ((prev[idevento] ?? 0) - 1 + total) % total,
    }));
  };

  const eventosVisiveis = eventos.slice(0, pagina * registrosPorPagina);

  return (
    <div className="min-h-screen bg-[#2a102f] p-8 text-white">
      {/* CABEÇALHO */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="mt-2 text-gray-300">
            Histórico de eventos astronômicos e meteorológicos.
          </p>
        </div>

        <button
          onClick={abrirModal}
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
        <div className="grid gap-6 md:grid-cols-3">
          {eventosVisiveis.map((evento) => {
            const imagens = Array.isArray(evento.imagem) ? evento.imagem : [];
            const idxAtual = imagemAtual[evento.idevento] ?? 0;
            const totalImagens = imagens.length;

            return (
              <div
                key={evento.idevento}
                className="relative overflow-hidden rounded-2xl border border-purple-700 bg-[#3b1544]"
              >
                {/* Botão favorito */}
                <button
                  onClick={() => toggleFavorito(evento.idevento)}
                  aria-label="Favoritar"
                  className="absolute right-4 top-4 z-10 rounded-full p-2 hover:bg-white/10"
                >
                  <Star
                    size={18}
                    className={
                      favoritos[evento.idevento]
                        ? "fill-pink-500 text-pink-500"
                        : "text-gray-400"
                    }
                  />
                </button>

                {/* Carrossel de imagens */}
                {totalImagens > 0 && (
                  <div className="relative">
                    <img
                      src={obterSrcImagem(imagens[idxAtual])}
                      alt={`${evento.descricao} – imagem ${idxAtual + 1}`}
                      className="h-150 w-full object-cover"
                    />

                    {totalImagens > 1 && (
                      <>
                        <button
                          onClick={() => voltarImagem(evento.idevento, totalImagens)}
                          aria-label="Imagem anterior"
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                        >
                          <ChevronLeft size={18} />
                        </button>

                        <button
                          onClick={() => avancarImagem(evento.idevento, totalImagens)}
                          aria-label="Próxima imagem"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70"
                        >
                          <ChevronRight size={18} />
                        </button>

                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs">
                          {idxAtual + 1} / {totalImagens}
                        </div>
                      </>
                    )}
                  </div>
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

                    {evento.eventoastronomico && evento.eventoastronomico.length > 0 &&
                      evento.eventoastronomico[0].corpocelesteevento &&
                      evento.eventoastronomico[0].corpocelesteevento.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Corpos Celestes:</span>{" "}
                          {evento.eventoastronomico[0].corpocelesteevento
                            .map((cce) => cce.corpoceleste?.nome)
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}

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

      {/* MODAL – Nova Observação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#3b1544] p-6 max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Nova Observação</h2>
              <button onClick={fecharModal} className="rounded-full p-1 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Indicador de etapas */}
            <div className="mb-6 flex gap-2">
              {(["selecionar-evento", "selecionar-ponto", "adicionar-imagem"] as Etapa[]).map(
                (e, i) => (
                  <div
                    key={e}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${etapa === e
                      ? "bg-fuchsia-500"
                      : i < ["selecionar-evento", "selecionar-ponto", "adicionar-imagem"].indexOf(etapa)
                        ? "bg-fuchsia-800"
                        : "bg-white/20"
                      }`}
                  />
                ),
              )}
            </div>

            {/* ETAPA 1 – Selecionar evento */}
            {etapa === "selecionar-evento" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">
                  Selecione o evento que você observou:
                </p>
                {eventos.length === 0 && (
                  <p className="text-center text-gray-500">Nenhum evento cadastrado.</p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {eventos.map((ev) => (
                    <button
                      key={ev.idevento}
                      onClick={() => setEventoSelecionado(ev)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${eventoSelecionado?.idevento === ev.idevento
                        ? "border-fuchsia-500 bg-fuchsia-900/40"
                        : "border-purple-700 bg-[#2a102f] hover:border-fuchsia-700"
                        }`}
                    >
                      <p className="font-semibold">{ev.descricao}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(ev.datahora).toLocaleString("pt-BR")}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (!eventoSelecionado) {
                        alert("Selecione um evento.");
                        return;
                      }
                      setEtapa("selecionar-ponto");
                    }}
                    className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-50"
                    disabled={!eventoSelecionado}
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 2 – Selecionar ponto de observação */}
            {etapa === "selecionar-ponto" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-4">
                  Onde você observou o evento?
                </p>

                {/* Pontos cadastrados */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {pontos.map((ponto) => (
                    <button
                      key={ponto.idpontoobs}
                      onClick={() => {
                        setPontoSelecionado(ponto.idpontoobs);
                        setUsarLocalizacaoAtual(false);
                        setLocalizacaoAtual(null);
                      }}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${pontoSelecionado === ponto.idpontoobs && !usarLocalizacaoAtual
                        ? "border-fuchsia-500 bg-fuchsia-900/40"
                        : "border-purple-700 bg-[#2a102f] hover:border-fuchsia-700"
                        }`}
                    >
                      <p className="font-semibold">{ponto.nome}</p>
                      {ponto.descricao && (
                        <p className="text-xs text-gray-400 mt-0.5">{ponto.descricao}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ponto.latitude.toFixed(5)}, {ponto.longitude.toFixed(5)}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Opção: usar localização atual */}
                <button
                  onClick={obterLocalizacaoAtual}
                  disabled={buscandoLocalizacao}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${usarLocalizacaoAtual
                    ? "border-fuchsia-500 bg-fuchsia-900/40"
                    : "border-purple-700 bg-[#2a102f] hover:border-fuchsia-700"
                    }`}
                >
                  <MapPin size={18} className="shrink-0 text-fuchsia-400" />
                  <div>
                    <p className="font-semibold">
                      {buscandoLocalizacao ? "Obtendo localização..." : "Usar minha localização atual"}
                    </p>
                    {usarLocalizacaoAtual && localizacaoAtual && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {localizacaoAtual.latitude.toFixed(5)}, {localizacaoAtual.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </button>

                {/* Campos de nome e descrição para o novo ponto */}
                {usarLocalizacaoAtual && (
                  <div className="space-y-2 rounded-xl border border-fuchsia-700/50 bg-fuchsia-950/30 p-4">
                    <p className="text-xs text-fuchsia-300 font-medium mb-2">Defina o novo ponto de observação:</p>
                    <input
                      type="text"
                      placeholder="Nome do ponto *"
                      value={nomePontoNovo}
                      onChange={(e) => setNomePontoNovo(e.target.value)}
                      className="w-full rounded-lg border border-purple-700 bg-[#2a102f] p-2.5 text-sm focus:border-fuchsia-500 focus:outline-none"
                    />
                    <textarea
                      placeholder="Descrição (opcional)"
                      value={descricaoPontoNovo}
                      onChange={(e) => setDescricaoPontoNovo(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-purple-700 bg-[#2a102f] p-2.5 text-sm focus:border-fuchsia-500 focus:outline-none resize-none"
                    />
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setEtapa("selecionar-evento")}
                    className="rounded-xl bg-gray-600 px-5 py-3 hover:bg-gray-500"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      if (!pontoSelecionado && !usarLocalizacaoAtual) {
                        alert("Selecione um ponto ou use sua localização.");
                        return;
                      }
                      setEtapa("adicionar-imagem");
                    }}
                    className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold hover:bg-fuchsia-600"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3 – Adicionar imagem */}
            {etapa === "adicionar-imagem" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Adicione uma foto do evento (opcional):
                </p>

                <div className="rounded-xl border border-purple-700 bg-[#2a102f] p-4">
                  <p className="text-sm font-semibold text-gray-300">Evento selecionado:</p>
                  <p className="mt-1">{eventoSelecionado?.descricao}</p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagem(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-purple-700 bg-[#2a102f] p-3 text-sm"
                />

                {imagem && (
                  <div className="rounded-xl border border-purple-700 bg-[#2a102f] p-3 text-sm text-gray-300">
                    📷 {imagem.name}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setEtapa("selecionar-ponto")}
                    className="rounded-xl bg-gray-600 px-5 py-3 hover:bg-gray-500"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={salvarObservacao}
                    disabled={salvando}
                    className="rounded-xl bg-fuchsia-700 px-5 py-3 font-semibold hover:bg-fuchsia-600 disabled:opacity-50"
                  >
                    {salvando ? "Salvando..." : "Salvar Observação"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
