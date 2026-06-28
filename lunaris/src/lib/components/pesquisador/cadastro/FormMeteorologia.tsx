import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import { getIdusuario } from "../../../utils/getIdusuario";

interface PontoObservacao {
  idpontoobs: number;
  nome: string;
}

export default function FormMeteorologia() {
  const [pontos, setPontos] = useState<PontoObservacao[]>([]);

  const [idPontoObs, setIdPontoObs] = useState("");

  const [temperatura, setTemperatura] = useState("");

  const [umidade, setUmidade] = useState("");

  const [indiceUV, setIndiceUV] = useState("");

  const [dirVento, setDirVento] = useState("");

  const [velVento, setVelVento] = useState("");

  const buscarPontos = async () => {
    try {
      const { data, error } = await supabase
        .from("pontoobservacao")
        .select("idpontoobs,nome")
        .order("nome");

      if (error) throw error;

      setPontos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    buscarPontos();
  }, []);

  const salvarDados = async () => {
    try {
      const idUsuario = await getIdusuario();

      if (!idUsuario) {
        throw new Error("Usuário não autenticado.");
      }

      const { error } = await supabase
        .from("dadometereologico")
        .insert({
          idusuario: idUsuario,

          idpontoobs: Number(idPontoObs),

          temperatura: Number(temperatura),

          umidade: Number(umidade),

          indiceuv: Number(indiceUV),

          dir_vento: dirVento,

          vel_vento: Number(velVento),

          datahora: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Dados meteorológicos cadastrados com sucesso!");

      setIdPontoObs("");
      setTemperatura("");
      setUmidade("");
      setIndiceUV("");
      setDirVento("");
      setVelVento("");
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar dados meteorológicos.");
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-6 text-3xl font-bold">
        Cadastro de Dados Meteorológicos
      </h2>

      <div className="space-y-4">
        <select
          value={idPontoObs}
          onChange={(e) => setIdPontoObs(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        >
          <option value="">Selecione um Ponto de Observação</option>

          {pontos.map((ponto) => (
            <option key={ponto.idpontoobs} value={ponto.idpontoobs}>
              {ponto.nome}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.1"
          placeholder="Temperatura (°C)"
          value={temperatura}
          onChange={(e) => setTemperatura(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="number"
          step="0.1"
          placeholder="Umidade (%)"
          value={umidade}
          onChange={(e) => setUmidade(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <input
          type="number"
          step="0.1"
          placeholder="Índice UV"
          value={indiceUV}
          onChange={(e) => setIndiceUV(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <select
          value={dirVento}
          onChange={(e) => setDirVento(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        >
          <option value="">Direção do Vento</option>

          <option value="N">Norte (N)</option>

          <option value="S">Sul (S)</option>

          <option value="L">Leste (L)</option>

          <option value="O">Oeste (O)</option>

          <option value="NE">Nordeste (NE)</option>

          <option value="NO">Noroeste (NO)</option>

          <option value="SE">Sudeste (SE)</option>

          <option value="SO">Sudoeste (SO)</option>
        </select>

        <input
          type="number"
          step="0.1"
          placeholder="Velocidade do Vento (km/h)"
          value={velVento}
          onChange={(e) => setVelVento(e.target.value)}
          className="w-full rounded-xl bg-[#3b1544] p-3"
        />

        <button
          onClick={salvarDados}
          className="rounded-xl bg-fuchsia-700 px-6 py-3 font-semibold"
        >
          Salvar Dados Meteorológicos
        </button>
      </div>
    </div>
  );
}
