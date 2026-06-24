import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";

interface Constelacao {
  idconstelacao: number;
  nome: string;
}

export default function FormCorpoCeleste() {
  const [constelacoes, setConstelacoes] = useState<Constelacao[]>([]);

  const [nome, setNome] = useState("");

  const [tipo, setTipo] = useState("");

  const [descricao, setDescricao] = useState("");

  const [distancia, setDistancia] = useState("");

  const [idConstelacao, setIdConstelacao] = useState("");

  const buscarConstelacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("constelacao")
        .select("idconstelacao,nome")
        .order("nome");

      if (error) throw error;

      setConstelacoes(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    buscarConstelacoes();
  }, []);

  const salvarCorpoCeleste = async () => {
    try {
      const { error } = await supabase.from("corpoceleste").insert({
        idusuario: 2,

        idconstelacao: Number(idConstelacao),

        nome,

        descricao,

        distancia: Number(distancia),

        tipo_corpo_celeste: tipo,
      });

      if (error) throw error;

      alert("Corpo celeste cadastrado com sucesso!");

      setNome("");
      setTipo("");
      setDescricao("");
      setDistancia("");
      setIdConstelacao("");
    } catch (err) {
      console.error(err);

      alert("Erro ao cadastrar corpo celeste.");
    }
  };

  return (
    <div className="max-w-3xl">
      {" "}
      <h2 className="mb-6 text-3xl font-bold">Cadastro de Corpo Celeste </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        >
          <option value="">Selecione o Tipo</option>

          <option value="Planeta">Planeta</option>

          <option value="Estrela">Estrela</option>

          <option value="Galáxia">Galáxia</option>

          <option value="Nebulosa">Nebulosa</option>

          <option value="Cometa">Cometa</option>

          <option value="Asteroide">Asteroide</option>

          <option value="Satélite">Satélite</option>

          <option value="Buraco Negro">Buraco Negro</option>
        </select>

        <select
          value={idConstelacao}
          onChange={(e) => setIdConstelacao(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        >
          <option value="">Selecione uma Constelação</option>

          {constelacoes.map((constelacao) => (
            <option
              key={constelacao.idconstelacao}
              value={constelacao.idconstelacao}
            >
              {constelacao.nome}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Distância"
          value={distancia}
          onChange={(e) => setDistancia(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <button
          onClick={salvarCorpoCeleste}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold"
        >
          Salvar Corpo Celeste
        </button>
      </div>
    </div>
  );
}
