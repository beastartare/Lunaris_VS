import {
  Database,
  ChartNoAxesCombined,
  Orbit,
} from "lucide-react";
import fundo from "../../../assets/fundo.png";
import { useNavigate } from "react-router-dom";
import UserProfileCard from "../../components/shared/UserProfileCard"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { useStatistics } from "./statistics/useStatistics";

export default function Statistics() {
  const navigate = useNavigate();

  const {
    stats,
    usuariosPorTipo,
    eventosCategoria,
    rankingFavoritos,
    eventosPorPesquisador,
    dadosMetPorPesquisador,
    statsEventosAstro,
    loading,
  } = useStatistics();

  const dadosGrafico = dadosMetPorPesquisador.reduce(
    (acc, item) => {
      let ponto = acc.find(
        p => p.ponto_observacao === item.ponto_observacao
      );

      if (!ponto) {
        ponto = {
          ponto_observacao: item.ponto_observacao,
        };
        acc.push(ponto);
      }

      ponto[item.pesquisador] = item.total_medicoes;

      return acc;
    },
    [] as any[]
  );

  const cores = [
    "#ec4899",
    "#a855f7",
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#06b6d4",
  ];

  const pesquisadores = [
    ...new Set(
      dadosMetPorPesquisador.map((d) => d.pesquisador)
    ),
  ];
  

  const tooltipProps = {
    contentStyle: {
      backgroundColor: "#1f1129",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      color: "white",
    },
    labelStyle: {
      color: "#d4d4d8",
    },
    itemStyle: {
      color: "#48ec87",
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14031d] text-white">
        Carregando estatísticas...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18051f] via-[#2a0d3d] to-[#14031d] text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="fixed top-[-150px] left-[-100px] h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />
      <div className="fixed bottom-[-200px] right-[-100px] h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[180px]" />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="relative w-[280px] overflow-hidden border-r border-white/10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${fundo})`,
              backgroundSize: "cover",
              backgroundPosition: "left center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-[#12051d]/70" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="px-8 py-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-pink-400/30 flex items-center justify-center">
                  <Orbit size={22} className="text-pink-400" />
                </div>
                <div>
                  <h1 className="text-2xl tracking-[0.35rem] font-light">
                    LUNARIS
                  </h1>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">
                    Painel Administrativo
                  </p>
                </div>
              </div>
            </div>

            <nav className="px-4 flex-1">
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-zinc-300 hover:bg-white/5 transition"
                >
                  <Database size={20} />
                  <span>Banco de Dados</span>
                </button>

                <button className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-pink-500/20 border border-pink-400/20 text-pink-200">
                  <ChartNoAxesCombined size={20} />
                  <span>Estatísticas</span>
                </button>
              </div>
            </nav>
            <div className="p-4">
              <UserProfileCard />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-10 overflow-auto">
          <div className="flex items-start justify-between mb-10">
            <div>
              <h2 className="text-4xl font-light tracking-wide">
                Estatísticas Gerais
              </h2>
              <p className="text-zinc-400 mt-2">
                Visão geral da atividade da plataforma.
              </p>
            </div>
          </div>

          {/* Cards de totais */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-zinc-400 text-sm uppercase tracking-widest">
                Usuários
              </h3>
              <p className="text-4xl font-light mt-3">
                {stats.usuarios === 0 ? 0 : stats.usuarios - 1}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-zinc-400 text-sm uppercase tracking-widest">
                Eventos
              </h3>
              <p className="text-4xl font-light mt-3">{stats.eventos}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-zinc-400 text-sm uppercase tracking-widest">
                Corpos Celestes
              </h3>
              <p className="text-4xl font-light mt-3">{stats.corposCelestes}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-zinc-400 text-sm uppercase tracking-widest">
                Missões
              </h3>
              <p className="text-4xl font-light mt-3">{stats.missoes}</p>
            </div>
          </div>

          <div className="h-px bg-white/10 my-12" />

          {/* Distribuição de usuários e eventos por categoria */}
          <div className="grid xl:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl mb-6">Distribuição de Usuários</h3>
              {usuariosPorTipo.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-zinc-500">
                  Sem informações
                </div>
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usuariosPorTipo}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        label
                      >
                        <Legend />
                        <Cell fill="#ec4899" />
                        <Cell fill="#a855f7" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={true}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl mb-6">Quantidade de Eventos Astronômicos e Meteorológicos</h3>
              {eventosCategoria.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-zinc-500">
                  Sem informações
                </div>
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventosCategoria}>
                      <XAxis dataKey="categoria" />
                      <YAxis allowDecimals={false} domain={[0, "dataMax"]} />
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={false}
                      />
                      <Bar dataKey="quantidade" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                        <Cell fill="#a855f7" />
                        <Cell fill="#6366f1" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-white/10 my-12" />

          <div className="mb-6">
            <h3 className="text-xl mb-1">Ranking de Favoritos por Usuário</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Total acumulado de favoritos em todas as categorias, excluindo
              administradores.
            </p>
            {rankingFavoritos.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl h-[320px] flex items-center justify-center text-zinc-500">
                Sem informações
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={rankingFavoritos.slice(0, 8)}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="usuario"
                        type="category"
                        width={130}
                        tick={{ fill: "#a1a1aa", fontSize: 13 }}
                      />
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={false}
                        formatter={(value, name) => {
                          const labels: Record<string, string> = {
                            fav_materiais: "Materiais",
                            fav_constelacoes: "Constelações",
                            fav_corpos_celestes: "Corpos Celestes",
                            fav_eventos: "Eventos",
                            fav_pontos_obs: "Pontos de Obs.",
                            fav_missoes: "Missões",
                          };
                          const key = String(name);
                          return [value, labels[key] ?? key];
                        }}
                      />
                      <Legend
                        formatter={(value) => {
                          const labels: Record<string, string> = {
                            fav_materiais: "Materiais",
                            fav_constelacoes: "Constelações",
                            fav_corpos_celestes: "Corpos Celestes",
                            fav_eventos: "Eventos",
                            fav_pontos_obs: "Pontos de Obs.",
                            fav_missoes: "Missões",
                          };
                          return labels[value] ?? value;
                        }}
                        wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
                      />
                      <Bar dataKey="fav_materiais"      stackId="a" fill="#ec4899" isAnimationActive={false} />
                      <Bar dataKey="fav_constelacoes"   stackId="a" fill="#a855f7" isAnimationActive={false} />
                      <Bar dataKey="fav_corpos_celestes" stackId="a" fill="#6366f1" isAnimationActive={false} />
                      <Bar dataKey="fav_eventos"        stackId="a" fill="#3b82f6" isAnimationActive={false} />
                      <Bar dataKey="fav_pontos_obs"     stackId="a" fill="#06b6d4" isAnimationActive={false} />
                      <Bar dataKey="fav_missoes"        stackId="a" fill="#8b5cf6" radius={[0, 8, 8, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 my-12" />

          <div className="mb-10">
            <h3 className="text-xl mb-1">
              Eventos Registrados por Pesquisador
            </h3>

            <p className="text-zinc-400 text-sm mb-6">
              Quantidade total de eventos cadastrados por cada pesquisador da plataforma.
            </p>

            {eventosPorPesquisador.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl h-[320px] flex items-center justify-center text-zinc-500">
                Sem informações
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={eventosPorPesquisador.slice(0, 8)}>
                      <XAxis type="number" hide/>
                      <YAxis dataKey="pesquisador" type="category" width={140}/>
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={false}
                        formatter={(value, name) => {
                          const labels: Record<string, string> = {
                            total_eventos: "Eventos",
                          };
                          const key = String(name);
                          return [value, labels[key] ?? key];
                        }}
                      />
                      <Bar
                        dataKey="total_eventos"
                        fill="#a855f7"
                        radius={[0, 8, 8, 0]}
                        activeBar={false}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 my-12" />

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
            <h3 className="text-xl mb-6">
              Dados Meteorológicos por Pesquisador e Ponto
            </h3>

            {dadosMetPorPesquisador.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-zinc-500">
                Sem informações
              </div>
            ) : (
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosGrafico}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 60,
                    }}
                  >
                    <XAxis dataKey="ponto_observacao" interval={0} angle={-20} textAnchor="end"/>

                    <YAxis allowDecimals={false} />

                    <Tooltip {...tooltipProps} cursor={false} isAnimationActive={false}/>

                    <Legend />

                    {pesquisadores.map((pesquisador, index) => (
                    <Bar
                      key={pesquisador}
                      dataKey={pesquisador}
                      name={pesquisador}
                      fill={cores[index % cores.length]}
                      stackId="total"
                    />
                  ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="h-px bg-white/10 my-12" />

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
            <h3 className="text-xl mb-6">
              Eventos Astronômicos por  e número de Corpos Celestes relacionados
            </h3>

            {statsEventosAstro.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-zinc-500">
                Sem informações
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statsEventosAstro}
                    barCategoryGap="20%"
                  >
                    <XAxis dataKey="categoria" />
                    <YAxis allowDecimals={false} />
                    <Tooltip {...tooltipProps} cursor={false} isAnimationActive={false}/>
                    <Legend />

                    <Bar dataKey="total_eventos" name="Total de Eventos" fill="#60a5fa"/>

                    <Bar
                      dataKey="corpos_celestes_relacionados"
                      name="Corpos Celestes"
                      fill="#a78bfa"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )};
          </div>
        </main>
      </div>
    </div>
  );
}