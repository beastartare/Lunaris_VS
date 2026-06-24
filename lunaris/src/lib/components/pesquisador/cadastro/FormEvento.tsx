import { useState } from "react";
import { supabase } from "../../../supabase";

export default function FormEvento() {
  const [tipoEvento, setTipoEvento] = useState<"astronomico" | "meteorologico">(
    "astronomico",
  );

  const [descricao, setDescricao] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [categoriaAstro, setCategoriaAstro] = useState("");

  const [declinacao, setDeclinacao] = useState("");

  const [categoriaMet, setCategoriaMet] = useState("");

  const [imagem, setImagem] = useState<File | null>(null);

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

  const salvarEvento = async () => {
    try {
      let imagemBase64 = null;

      if (imagem) {
        imagemBase64 = await converterParaBase64(imagem);
      }

      const { data: eventoData, error: eventoError } = await supabase
        .from("evento")
        .insert({
          idusuario: 2,
          descricao,
          latitude: Number(latitude),
          longitude: Number(longitude),
          datahora: new Date().toISOString(),
          imagem: imagemBase64,
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
      setCategoriaAstro("");
      setCategoriaMet("");
      setDeclinacao("");
      setImagem(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar evento.");
    }
  };

  return (
    <div className="max-w-3xl">
      {" "}
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Evento </h2>
      ```
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
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
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
