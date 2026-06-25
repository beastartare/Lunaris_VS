import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { getIdusuario } from "../../../utils/getIdusuario";

interface CorpoCeleste {
  idcorpoceleste: number;
  nome: string;
}

export default function FormMissao() {
  const [corposCelestes, setCorposCelestes] = useState<CorpoCeleste[]>([]);
  const [idCorpoCeleste, setIdCorpoCeleste] = useState("");
  const [nome, setNome] = useState("");

  const [agencia, setAgencia] = useState("");

  const [statusMissao, setStatusMissao] = useState("");

  const [descricao, setDescricao] = useState("");

  const [dataLancamento, setDataLancamento] = useState("");

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

  const salvarMissao = async () => {
    try {
      if (!idCorpoCeleste) {
        alert("Por favor, selecione um corpo celeste.");
        return;
      }

      const idusuario = await getIdusuario();

      const { data: missao, error } = await supabase
        .from("missaoespacial")
        .insert({
          idusuario,
          nome,
          agencia,
          status_missao: statusMissao,
          descricao,
          datalancamento: dataLancamento || null,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: relError } = await supabase
        .from("missaocorpoceleste")
        .insert({
          idmissaoespacial: missao.idmissaoespacial,
          idcorpoceleste: Number(idCorpoCeleste),
        });

      if (relError) throw relError;

      alert("Missão espacial cadastrada com sucesso!");

      setNome("");
      setAgencia("");
      setStatusMissao("");
      setDescricao("");
      setDataLancamento("");
      setIdCorpoCeleste("");
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

        <select
          value={idCorpoCeleste}
          onChange={(e) => setIdCorpoCeleste(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        >
          <option value="">Selecione o Corpo Celeste</option>
          {corposCelestes.map((corpo) => (
            <option key={corpo.idcorpoceleste} value={corpo.idcorpoceleste}>
              {corpo.nome}
            </option>
          ))}
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
