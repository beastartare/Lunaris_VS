import { useState } from "react";
import { supabase } from "../../../supabase";

export default function FormMissao() {
  const [nome, setNome] = useState("");

  const [agencia, setAgencia] = useState("");

  const [statusMissao, setStatusMissao] = useState("");

  const [descricao, setDescricao] = useState("");

  const [dataLancamento, setDataLancamento] = useState("");

  const salvarMissao = async () => {
    try {
      const { error } = await supabase.from("missaoespacial").insert({
        idusuario: 2,

        nome,

        agencia,

        status_missao: statusMissao,

        descricao,

        datalancamento: dataLancamento || null,
      });

      if (error) throw error;

      alert("Missão espacial cadastrada com sucesso!");

      setNome("");
      setAgencia("");
      setStatusMissao("");
      setDescricao("");
      setDataLancamento("");
    } catch (err) {
      console.error(err);

      alert("Erro ao cadastrar missão espacial.");
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Missão Espacial</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome da Missão"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="text"
          placeholder="Agência Espacial"
          value={agencia}
          onChange={(e) => setAgencia(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <select
          value={statusMissao}
          onChange={(e) => setStatusMissao(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        >
          <option value="">Selecione o Status</option>

          <option value="Planejada">Planejada</option>

          <option value="Em andamento">Em andamento</option>

          <option value="Concluída">Concluída</option>

          <option value="Cancelada">Cancelada</option>

          <option value="Falhou">Falhou</option>
        </select>

        <input
          type="date"
          value={dataLancamento}
          onChange={(e) => setDataLancamento(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <textarea
          placeholder="Descrição da missão"
          rows={5}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <button
          onClick={salvarMissao}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold hover:bg-fuchsia-600"
        >
          Salvar Missão
        </button>
      </div>
    </div>
  );
}
