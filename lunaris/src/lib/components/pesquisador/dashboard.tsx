import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  MapPin,
  CalendarDays,
  Activity,
  CloudSun,
} from "lucide-react";

interface PontoObservacao {
  nome: string;
}

interface DadoMeteorologico {
  iddadometereologico: number;
  idpontoobs: number;
  umidade: number;
  indiceuv: number;
  temperatura: number;
  datahora: string;
  dir_vento: string;
  vel_vento: number;
  pontoobservacao: PontoObservacao;
}

export default function DashboardMeteorologico() {
  const [dadosGlobais, setDadosGlobais] = useState<DadoMeteorologico[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroDias, setFiltroDias] = useState<number>(0); // 7, 30, 0 = Todos
  const [filtroPonto, setFiltroPonto] = useState<number>(0); // 0 = Todos

  const buscarDados = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("dadometereologico")
        .select("*, pontoobservacao(nome)")
        .order("datahora", { ascending: false });

      if (error) {
        throw error;
      }

      setDadosGlobais((data as unknown as DadoMeteorologico[]) || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, []);

  const pontosDisponiveis = useMemo(() => {
    const map = new Map<number, string>();
    dadosGlobais.forEach((d) => {
      if (!map.has(d.idpontoobs) && d.pontoobservacao) {
        map.set(d.idpontoobs, d.pontoobservacao.nome);
      }
    });
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
  }, [dadosGlobais]);

  const dadosFiltrados = useMemo(() => {
    let filtrados = dadosGlobais;
    if (filtroPonto !== 0) {
      filtrados = filtrados.filter((d) => d.idpontoobs === filtroPonto);
    }
    if (filtroDias !== 0) {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - filtroDias);
      filtrados = filtrados.filter((d) => new Date(d.datahora) >= dataLimite);
    }
    return filtrados;
  }, [dadosGlobais, filtroPonto, filtroDias]);

  const kpis = useMemo(() => {
    if (dadosFiltrados.length === 0) return null;

    let sumTemp = 0,
      sumUmi = 0,
      sumUv = 0;
    let maxTemp = -Infinity,
      minTemp = Infinity;
    let maxVento = 0;

    dadosFiltrados.forEach((d) => {
      sumTemp += d.temperatura;
      sumUmi += d.umidade;
      sumUv += d.indiceuv;
      if (d.temperatura > maxTemp) maxTemp = d.temperatura;
      if (d.temperatura < minTemp) minTemp = d.temperatura;
      if (d.vel_vento > maxVento) maxVento = d.vel_vento;
    });

    const count = dadosFiltrados.length;
    const atual = dadosFiltrados[0];

    return {
      atualTemp: atual.temperatura,
      atualUmi: atual.umidade,
      atualUv: atual.indiceuv,
      atualVento: atual.vel_vento,
      medTemp: (sumTemp / count).toFixed(1),
      maxTemp: maxTemp !== -Infinity ? maxTemp.toFixed(1) : "-",
      minTemp: minTemp !== Infinity ? minTemp.toFixed(1) : "-",
      medUmi: (sumUmi / count).toFixed(1),
      medUv: (sumUv / count).toFixed(1),
      maxVento: maxVento.toFixed(1),
      totalMedicoes: count,
    };
  }, [dadosFiltrados]);

  const graficosLinha = useMemo(() => {
    return [...dadosFiltrados].reverse().map((d) => ({
      data: new Date(d.datahora).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      temperatura: d.temperatura,
      umidade: d.umidade,
      uv: d.indiceuv,
      vento: d.vel_vento,
    }));
  }, [dadosFiltrados]);

  const graficoBarras = useMemo(() => {
    const groups: Record<string, { sum: number; count: number }> = {};
    dadosGlobais.forEach((d) => {
      if (filtroDias !== 0) {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - filtroDias);
        if (new Date(d.datahora) < dataLimite) return;
      }
      const nome = d.pontoobservacao?.nome || `Ponto ${d.idpontoobs}`;
      if (!groups[nome]) groups[nome] = { sum: 0, count: 0 };
      groups[nome].sum += d.temperatura;
      groups[nome].count += 1;
    });

    return Object.entries(groups)
      .map(([nome, { sum, count }]) => ({
        nome: nome.length > 15 ? nome.substring(0, 15) + "..." : nome,
        mediaTemp: Number((sum / count).toFixed(1)),
      }))
      .sort((a, b) => b.mediaTemp - a.mediaTemp);
  }, [dadosGlobais, filtroDias]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-purple-500/30 bg-[#2a0d3d]/90 p-4 shadow-xl backdrop-blur-md">
          <p className="mb-2 font-semibold text-fuchsia-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-white"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="text-white">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="h-10 w-10 text-fuchsia-500" />
            <h1 className="text-4xl font-semibold">Análise Meteorológica</h1>
          </div>
          <p className="mt-3 text-lg text-zinc-400">
            Monitoramento avançado, agregações e evolução de dados
            observacionais.
          </p>
        </div>

        {/* CONTROLES DE FILTRO */}
        <div className="flex flex-col sm:flex-row gap-4 bg-[#3b1544] p-4 rounded-2xl border border-purple-700/50 shadow-lg">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-fuchsia-400" />
            <select
              value={filtroDias}
              onChange={(e) => setFiltroDias(Number(e.target.value))}
              className="bg-[#2a0d3d] border border-purple-900/50 rounded-lg p-2 text-sm outline-none focus:border-fuchsia-500 transition-colors"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={0}>Todo o Histórico</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-fuchsia-400" />
            <select
              value={filtroPonto}
              onChange={(e) => setFiltroPonto(Number(e.target.value))}
              className="bg-[#2a0d3d] border border-purple-900/50 rounded-lg p-2 text-sm outline-none focus:border-fuchsia-500 transition-colors max-w-[200px]"
            >
              <option value={0}>Todos os Pontos</option>
              {pontosDisponiveis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center text-fuchsia-400">
          <Activity className="h-10 w-10 animate-pulse" />
          <p className="mt-4 text-lg">Processando análises...</p>
        </div>
      ) : dadosFiltrados.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <CloudSun className="h-16 w-16 text-gray-500 mb-4" />
          <div className="text-xl text-gray-400">
            Nenhuma medição encontrada para este filtro.
          </div>
        </div>
      ) : (
        <>
          {/* CARDS DE KPIs AGREGADOS */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-purple-700/50 bg-linear-to-br from-[#3b1544] to-[#2a0d3d] p-6 shadow-xl transition-all hover:border-fuchsia-500 hover:shadow-fuchsia-900/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">
                  Temperatura Atual
                </p>
                <div className="rounded-xl bg-pink-500/20 p-2 text-pink-400">
                  <Thermometer className="h-5 w-5" />
                </div>
              </div>
              <h2 className="mt-4 text-4xl font-bold">
                {kpis?.atualTemp}
                <span className="text-xl text-gray-500 ml-1">°C</span>
              </h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                <span>
                  Média:{" "}
                  <span className="text-gray-300">{kpis?.medTemp}°C</span>
                </span>
                <span>•</span>
                <span>
                  Máx: <span className="text-gray-300">{kpis?.maxTemp}°C</span>
                </span>
                <span>•</span>
                <span>
                  Mín: <span className="text-gray-300">{kpis?.minTemp}°C</span>
                </span>
              </div>
            </div>

            <div className="group rounded-2xl border border-purple-700/50 bg-linear-to-br from-[#3b1544] to-[#2a0d3d] p-6 shadow-xl transition-all hover:border-fuchsia-500 hover:shadow-fuchsia-900/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">
                  Umidade Atual
                </p>
                <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400">
                  <Droplets className="h-5 w-5" />
                </div>
              </div>
              <h2 className="mt-4 text-4xl font-bold">
                {kpis?.atualUmi}
                <span className="text-xl text-gray-500 ml-1">%</span>
              </h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Média do período:{" "}
                  <span className="text-gray-300">{kpis?.medUmi}%</span>
                </span>
              </div>
            </div>

            <div className="group rounded-2xl border border-purple-700/50 bg-linear-to-br from-[#3b1544] to-[#2a0d3d] p-6 shadow-xl transition-all hover:border-fuchsia-500 hover:shadow-fuchsia-900/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">
                  Índice UV Atual
                </p>
                <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
                  <Sun className="h-5 w-5" />
                </div>
              </div>
              <h2 className="mt-4 text-4xl font-bold">{kpis?.atualUv}</h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Média do período:{" "}
                  <span className="text-gray-300">{kpis?.medUv}</span>
                </span>
              </div>
            </div>

            <div className="group rounded-2xl border border-purple-700/50 bg-linear-to-br from-[#3b1544] to-[#2a0d3d] p-6 shadow-xl transition-all hover:border-fuchsia-500 hover:shadow-fuchsia-900/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">Vento Atual</p>
                <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-400">
                  <Wind className="h-5 w-5" />
                </div>
              </div>
              <h2 className="mt-4 text-4xl font-bold">
                {kpis?.atualVento}
                <span className="text-xl text-gray-500 ml-1">km/h</span>
              </h2>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  Rajada Máx do período:{" "}
                  <span className="text-gray-300">{kpis?.maxVento} km/h</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-400 text-right">
            Exibindo análises baseadas em <b>{kpis?.totalMedicoes}</b> medições.
          </div>

          {/* GRÁFICOS */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Gráfico 1: Evolução Temp x Umidade */}
            <div className="rounded-3xl border border-purple-700/40 bg-[#1c0824]/60 backdrop-blur-xl p-6 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
                <Thermometer className="text-fuchsia-500" size={20} />
                Evolução: Temperatura vs Umidade
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={graficosLinha}
                    margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#4a1b55"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="data"
                      stroke="#8b5cf6"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      minTickGap={30}
                    />

                    <YAxis
                      yAxisId="left"
                      stroke="#ec4899"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#3b82f6"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />

                    <Line
                      yAxisId="left"
                      type="monotone"
                      name="Temperatura (°C)"
                      dataKey="temperatura"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6, fill: "#ec4899", stroke: "#fff" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      name="Umidade (%)"
                      dataKey="umidade"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 2: Evolução Índice UV (Area Chart) */}
            <div className="rounded-3xl border border-purple-700/40 bg-[#1c0824]/60 backdrop-blur-xl p-6 shadow-xl">
              <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
                <Sun className="text-yellow-500" size={20} />
                Variação do Índice UV
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={graficosLinha}
                    margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#a855f7"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#a855f7"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#4a1b55"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="data"
                      stroke="#8b5cf6"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="#a855f7"
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      name="Índice UV"
                      dataKey="uv"
                      stroke="#a855f7"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorUv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico 3: Comparativo por Ponto (Bar Chart) - Apenas se não houver filtro de ponto específico */}
            {filtroPonto === 0 && graficoBarras.length > 0 && (
              <div className="rounded-3xl border border-purple-700/40 bg-[#1c0824]/60 backdrop-blur-xl p-6 shadow-xl lg:col-span-2">
                <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
                  <MapPin className="text-fuchsia-500" size={20} />
                  Ranking: Temperatura Média por Ponto de Observação
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={graficoBarras}
                      margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#4a1b55"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="nome"
                        stroke="#8b5cf6"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#ec4899"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#4a1b55", opacity: 0.4 }}
                        content={<CustomTooltip />}
                      />
                      <Bar
                        name="Média Temp (°C)"
                        dataKey="mediaTemp"
                        fill="#c084fc"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* HISTÓRICO EM TABELA */}
          <div className="rounded-3xl border border-purple-700/40 bg-[#1c0824]/60 backdrop-blur-xl overflow-hidden shadow-xl">
            <div className="border-b border-purple-700/50 p-6 flex items-center gap-3 bg-[#2a0d3d]/50">
              <CalendarDays className="text-fuchsia-400" />
              <h2 className="text-xl font-semibold">Registros Detalhados</h2>
            </div>

            <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#3b1544] text-xs uppercase text-gray-300 sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Ponto de Observação
                    </th>
                    <th className="px-6 py-4 font-semibold">Data / Hora</th>
                    <th className="px-6 py-4 font-semibold">Temp. (°C)</th>
                    <th className="px-6 py-4 font-semibold">Umidade (%)</th>
                    <th className="px-6 py-4 font-semibold">Índice UV</th>
                    <th className="px-6 py-4 font-semibold">Vento</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-purple-900/50">
                  {dadosFiltrados.map((item) => (
                    <tr
                      key={item.iddadometereologico}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-medium text-fuchsia-200">
                        {item.pontoobservacao?.nome ||
                          `Ponto Desconhecido (${item.idpontoobs})`}
                      </td>
                      <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                        {new Date(item.datahora).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 font-semibold text-orange-300">
                        {item.temperatura}
                      </td>
                      <td className="px-6 py-4 text-blue-300">
                        {item.umidade}
                      </td>
                      <td className="px-6 py-4 text-yellow-300">
                        {item.indiceuv}
                      </td>
                      <td className="px-6 py-4 text-teal-300">
                        {item.vel_vento} km/h{" "}
                        <span className="text-gray-500 text-xs ml-1">
                          ({item.dir_vento})
                        </span>
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
