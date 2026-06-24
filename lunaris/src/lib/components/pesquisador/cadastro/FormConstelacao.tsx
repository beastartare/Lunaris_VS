import { useState } from "react";
import { supabase } from "../../../supabase";

export default function FormConstelacao() {
  const [nome, setNome] = useState("");

  const [descricao, setDescricao] = useState("");

  const salvarConstelacao = async () => {
    try {
      const { error } = await supabase.from("constelacao").insert({
        idusuario: 2,

        nome,

        descricao,
      });

      if (error) throw error;

      alert("Constelação cadastrada com sucesso!");

      setNome("");
      setDescricao("");
    } catch (err) {
      console.error(err);

      alert("Erro ao cadastrar constelação.");
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Constelação</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome da Constelação"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <textarea
          placeholder="Descrição"
          rows={5}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <button
          onClick={salvarConstelacao}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600"
        >
          Salvar Constelação
        </button>
      </div>
    </div>
  );
}
