import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { fileToBase64 } from "../../../utils/imagem";

interface FormEventoProps {
  tipoFixo?: "astronomico" | "meteorologico";
}

interface CorpoCeleste {
  idcorpoceleste: number;
  nome: string;
}

export default function FormEvento({ tipoFixo }: FormEventoProps = {}) {
  const [tipoEvento, setTipoEvento] = useState<
    "astronomico" | "meteorologico"
  >(tipoFixo ?? "astronomico");

  const [descricao, setDescricao] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [dataHora, setDataHora] = useState("");

  const [categoriaAstro, setCategoriaAstro] = useState("");
  const [declinacao, setDeclinacao] = useState("");
  const [categoriaMet, setCategoriaMet] = useState("");

  const [imagem, setImagem] = useState<File | null>(null);

  const [corposCelestes, setCorposCelestes] = useState<CorpoCeleste[]>([]);
  const [idsCorposCelestes, setIdsCorposCelestes] = useState<number[]>([]);

  const toggleCorpoCeleste = (id: number) => {
    setIdsCorposCelestes((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    const buscarCorposCelestes = async () => {
      const { data, error } = await supabase
        .from("corpoceleste")
        .select("idcorpoceleste, nome")
        .order("nome");

      if (error) console.error(error);
      else setCorposCelestes(data || []);
    };

    buscarCorposCelestes();
  }, []);

  const salvarEvento = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
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

      let imagensArray: string[] = [];

      if (imagem) {
        const imagemBase64 = await fileToBase64(imagem);
        imagensArray = [imagemBase64];
      }

      const { data: eventoData, error: eventoError } = await supabase
        .from("evento")
        .insert({
          idusuario: usuario.idusuario,
          descricao,
          latitude: Number(latitude),
          longitude: Number(longitude),
          datahora: dataHora ? new Date(dataHora).toISOString() : null,
          imagem: imagensArray.length > 0 ? imagensArray : null,
        })
        .select()
        .single();

      if (eventoError) throw eventoError;

      if (tipoEvento === "astronomico") {
        const { error } = await supabase.from("eventoastronomico").insert({
          idevento: eventoData.idevento,
          categoria_evento_astro: categoriaAstro,
          declinacao: Number(declinacao),
        });

        if (error) throw error;

        if (idsCorposCelestes.length > 0) {
          const relacoes = idsCorposCelestes.map((id) => ({
            idcorpoceleste: id,
            idevento: eventoData.idevento,
          }));

          const { error: relError } = await supabase
            .from("corpocelesteevento")
            .insert(relacoes);

          if (relError) throw relError;
        }
      }

      else {
        const { error } = await supabase.from("eventometereologico").insert({
          idevento: eventoData.idevento,
          categoria_evento_met: categoriaMet,
        });

        if (error) throw error;
      }

      alert("Evento cadastrado com sucesso!");

      // reset
      setDescricao("");
      setLatitude("");
      setLongitude("");
      setDataHora("");
      setCategoriaAstro("");
      setCategoriaMet("");
      setDeclinacao("");
      setIdsCorposCelestes([]);
      setImagem(null);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao cadastrar evento: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Evento</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="number"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="number"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        {/* ASTRONÔMICO */}
        {tipoEvento === "astronomico" && (
          <>
            <select
              value={categoriaAstro}
              onChange={(e) => setCategoriaAstro(e.target.value)}
              className="w-full rounded-xl bg-[#3b1544] p-3"
            >
              <option value="">Categoria astronômica</option>
              {[
                "Eclipse Solar",
                "Eclipse Lunar",
                "Chuva de Meteoros",
                "Conjunção Planetária",
                "Outro",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Declinação"
              value={declinacao}
              onChange={(e) => setDeclinacao(e.target.value)}
              className="w-full rounded-xl bg-[#3b1544] p-3"
            />

            {/* MULTI SELEÇÃO */}
            <div className="w-full rounded-xl bg-[#3b1544] p-3 space-y-2">
              <p className="text-sm text-zinc-300">
                Corpos Celestes
              </p>

              {corposCelestes.map((corpo) => (
                <label
                  key={corpo.idcorpoceleste}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={idsCorposCelestes.includes(
                      corpo.idcorpoceleste
                    )}
                    onChange={() =>
                      toggleCorpoCeleste(corpo.idcorpoceleste)
                    }
                  />
                  {corpo.nome}
                </label>
              ))}
            </div>
          </>
        )}

        {/* METEOROLÓGICO */}
        {tipoEvento === "meteorologico" && (
          <select
            value={categoriaMet}
            onChange={(e) => setCategoriaMet(e.target.value)}
            className="w-full rounded-xl bg-[#3b1544] p-3"
          >
            <option value="">Categoria meteorológica</option>
            {[
              "Chuva",
              "Tempestade",
              "Granizo",
              "Nevoeiro",
              "Outro",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagem(e.target.files?.[0] || null)}
          className="w-full"
        />

        <button
          onClick={salvarEvento}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold"
        >
          Salvar Evento
        </button>
      </div>
    </div>
  );
}