import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DadoMeteorologico {
  idadometeorologico: number;
  idpontoobs: number;
  umidade: number;
  indiceuv: number;
  temperatura: number;
  datahora: string;
  dir_vento: string;
  vel_vento: number;
}

export default function DashboardMeteorologico() {
  const [dados, setDados] = useState<DadoMeteorologico[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarDados = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("dadometereologico")
        .select("*")
        .order("datahora", { ascending: false });

      console.log("Dados recebidos:", data);
      console.log("Erro:", error);

      if (error) {
        throw error;
      }

      setDados(data || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      buscarDados();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const dadosGrafico = [...dados]
    .reverse()
    .slice(-20)
    .map((item) => ({
      data: new Date(item.datahora).toLocaleDateString("pt-BR"),
      temperatura: item.temperatura,
      umidade: item.umidade,
    }));

  return (
    <div className="text-white">
      <div className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-semibold">
            Dashboard Meteorológico
          </h1>

          <p className="mt-3 text-lg text-zinc-400">
            Monitoramento de dados observacionais.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-lg">Carregando dados...</div>
      ) : dados.length === 0 ? (
        <div className="text-center text-lg">Nenhum dado encontrado.</div>
      ) : (
        <>
          {/* CARDS DE RESUMO */}

          <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
              <p className="text-sm text-gray-300">Temperatura Atual</p>

              <h2 className="mt-2 text-4xl font-bold">
                {dados[0]?.temperatura}°C
              </h2>
            </div>

            <div className="rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
              <p className="text-sm text-gray-300">Umidade Atual</p>

              <h2 className="mt-2 text-4xl font-bold">{dados[0]?.umidade}%</h2>
            </div>

            <div className="rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
              <p className="text-sm text-gray-300">Índice UV</p>

              <h2 className="mt-2 text-4xl font-bold">{dados[0]?.indiceuv}</h2>
            </div>

            <div className="rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
              <p className="text-sm text-gray-300">Velocidade do Vento</p>

              <h2 className="mt-2 text-4xl font-bold">
                {dados[0]?.vel_vento} km/h
              </h2>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Evolução da Temperatura
            </h2>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="data" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#d946ef"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ULTIMA OBSERVAÇÃO */}

          <div className="mb-8 rounded-2xl border border-purple-700 bg-[#3b1544] p-6">
            <h2 className="mb-4 text-xl font-semibold">Última Observação</h2>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-gray-400">Ponto de Observação</p>
                <p className="text-xl font-bold">{dados[0]?.idpontoobs}</p>
              </div>

              <div>
                <p className="text-gray-400">Direção do Vento</p>
                <p className="text-xl font-bold">{dados[0]?.dir_vento}</p>
              </div>

              <div>
                <p className="text-gray-400">Data da Medição</p>
                <p className="text-lg font-semibold">
                  {new Date(dados[0]?.datahora).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </div>

          {/* HISTÓRICO */}

          <div className="rounded-2xl border border-purple-700 bg-[#3b1544]">
            <div className="border-b border-purple-700 p-5">
              <h2 className="text-xl font-semibold">
                Histórico de Observações
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#4a1b55]">
                    <th className="p-4 text-left">Ponto</th>
                    <th className="p-4 text-left">Temp.</th>
                    <th className="p-4 text-left">Umidade</th>
                    <th className="p-4 text-left">UV</th>
                    <th className="p-4 text-left">Direção</th>
                    <th className="p-4 text-left">Velocidade</th>
                    <th className="p-4 text-left">Data/Hora</th>
                  </tr>
                </thead>

                <tbody>
                  {dados.map((item) => (
                    <tr
                      key={item.idadometeorologico}
                      className="border-t border-purple-800 hover:bg-[#4a1b55]"
                    >
                      <td className="p-4">{item.idpontoobs}</td>

                      <td className="p-4">{item.temperatura}°C</td>

                      <td className="p-4">{item.umidade}%</td>

                      <td className="p-4">{item.indiceuv}</td>

                      <td className="p-4">{item.dir_vento}</td>

                      <td className="p-4">{item.vel_vento} km/h</td>

                      <td className="p-4">
                        {new Date(item.datahora).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
