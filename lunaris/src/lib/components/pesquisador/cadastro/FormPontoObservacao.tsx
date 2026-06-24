import { useState } from "react";
import { supabase } from "../../../supabase";

export default function FormPontoObservacao() {
  const [nome, setNome] = useState("");

  const [descricao, setDescricao] = useState("");

  const [latitude, setLatitude] = useState("");

  const [longitude, setLongitude] = useState("");

  const salvarPontoObservacao = async () => {
    try {
      const { error } = await supabase.from("pontoobservacao").insert({
        idusuario: 2,

        nome,

        descricao,

        latitude: Number(latitude),

        longitude: Number(longitude),
      });

      if (error) throw error;

      alert("Ponto de observação cadastrado com sucesso!");

      setNome("");
      setDescricao("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      console.error(err);

      alert("Erro ao cadastrar ponto de observação.");
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-3xl font-bold">
        Cadastro de Ponto de Observação
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome do ponto"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <textarea
          placeholder="Descrição"
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <button
          onClick={salvarPontoObservacao}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600"
        >
          Salvar Ponto de Observação
        </button>
      </div>
    </div>
  );
}
