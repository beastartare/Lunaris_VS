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
  const [tipoEvento, setTipoEvento] = useState<"astronomico" | "meteorologico">(
    tipoFixo ?? "astronomico",
  );

  const [descricao, setDescricao] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [dataHora, setDataHora] = useState("");

  const [categoriaAstro, setCategoriaAstro] = useState("");

  const [declinacao, setDeclinacao] = useState("");

  const [categoriaMet, setCategoriaMet] = useState("");

  const [imagem, setImagem] = useState<File | null>(null);

  const [corposCelestes, setCorposCelestes] = useState<CorpoCeleste[]>([]);
  const [idCorpoCeleste, setIdCorpoCeleste] = useState("");

  const buscarCorposCelestes = async () => {
    try {
      const { data, error } = await supabase
        .from("corpoceleste")
        .select("idcorpoceleste, nome")
        .order("nome");
      if (error) throw error;
      setCorposCelestes(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    buscarCorposCelestes();
  }, []);

  const salvarEvento = async () => {
    try {
      if (tipoEvento === "astronomico" && !idCorpoCeleste) {
        alert("Por favor, selecione um corpo celeste para o evento astronômico.");
        return;
      }

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
          datahora: new Date(dataHora).toISOString(),
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

        const { error: relError } = await supabase.from("corpocelesteevento").insert({
          idcorpoceleste: Number(idCorpoCeleste),
          idevento: eventoData.idevento,
        });

        if (relError) throw relError;
      } else {
        const { error } = await supabase.from("eventometereologico").insert({
          idevento: eventoData.idevento,
          categoria_evento_met: categoriaMet,
        });

        if (error) throw error;
      }

      alert("Evento cadastrado com sucesso!");

      setDescricao("");
      setLatitude("");
      setLongitude("");
      setDataHora("");
      setCategoriaAstro("");
      setCategoriaMet("");
      setDeclinacao("");
      setIdCorpoCeleste("");
      setImagem(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar evento.");
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Evento </h2>

      {/* Seletor de tipo — oculto se tipoFixo foi definido */}
      {!tipoFixo && (
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setTipoEvento("astronomico")}
            className={`rounded-xl px-5 py-3 ${
              tipoEvento === "astronomico" ? "bg-fuchsia-700" : "bg-[#3b1544]"
            }`}
          >
            Astronômico
          </button>

          <button
            onClick={() => setTipoEvento("meteorologico")}
            className={`rounded-xl px-5 py-3 ${
              tipoEvento === "meteorologico" ? "bg-fuchsia-700" : "bg-[#3b1544]"
            }`}
          >
            Meteorológico
          </button>
        </div>
      )}

      {tipoFixo && (
        <div className="mb-6">
          <span className="inline-block rounded-xl bg-fuchsia-900/50 px-4 py-2 text-sm font-medium text-fuchsia-300">
            Tipo: {tipoFixo === "astronomico" ? "Astronômico" : "Meteorológico"}
          </span>
        </div>
      )}

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

        {tipoEvento === "astronomico" && (
          <>
            <input
              type="text"
              placeholder="Categoria Astronômica"
              value={categoriaAstro}
              onChange={(e) => setCategoriaAstro(e.target.value)}
              className="w-full rounded-xl bg-[#3b1544] p-3"
            />

            <input
              type="number"
              placeholder="Declinação"
              value={declinacao}
              onChange={(e) => setDeclinacao(e.target.value)}
              className="w-full rounded-xl bg-[#3b1544] p-3"
            />

            <select
              value={idCorpoCeleste}
              onChange={(e) => setIdCorpoCeleste(e.target.value)}
              className="w-full rounded-xl bg-[#3b1544] p-3"
            >
              <option value="">Selecione o Corpo Celeste associado</option>
              {corposCelestes.map((corpo) => (
                <option key={corpo.idcorpoceleste} value={corpo.idcorpoceleste}>
                  {corpo.nome}
                </option>
              ))}
            </select>
          </>
        )}

        {tipoEvento === "meteorologico" && (
          <input
            type="text"
            placeholder="Categoria Meteorológica"
            value={categoriaMet}
            onChange={(e) => setCategoriaMet(e.target.value)}
            className="w-full rounded-xl bg-[#3b1544] p-3"
          />
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
