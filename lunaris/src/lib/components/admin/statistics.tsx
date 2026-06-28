import { supabase } from "../../../lib/supabase";
import {
  Database,
  ChartNoAxesCombined,
  Orbit,
  LogOut,
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
    constelacoesFavoritas,
    materiaisFavoritos,
    rankingFavoritos,
    eventosAstroCategoria,
    // variacaoTemperatura,
    loading,
  } = useStatistics();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

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

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-red-300 hover:bg-red-500/10 transition border border-red-400/10"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
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

          {/* Rankings de favoritos e materiais */}
          <div className="grid xl:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl mb-6">Constelações Mais Favoritadas</h3>
              {constelacoesFavoritas.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-zinc-500">
                  Sem informações
                </div>
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={constelacoesFavoritas}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="nome" type="category" width={120} />
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="favoritos"
                        fill="#ec4899"
                        radius={[0, 8, 8, 0]}
                        activeBar={false}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl mb-6">Materiais Mais Favoritados</h3>
              {materiaisFavoritos.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center text-zinc-500">
                  Sem informações
                </div>
              ) : (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={materiaisFavoritos}>
                      <XAxis type="number" hide />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax"]}
                        dataKey="titulo"
                        type="category"
                        width={120}
                      />
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="favoritos"
                        fill="#ec4899"
                        radius={[0, 8, 8, 0]}
                        activeBar={false}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
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
              <h3 className="text-xl mb-6">Eventos por Categoria</h3>
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
                      <Bar dataKey="Quantidade" radius={[8, 8, 0, 0]} isAnimationActive={false}>
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

          <div className="mb-6">
            <h3 className="text-xl mb-1">
              Eventos Astronômicos por Categoria
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Volume de eventos e corpos celestes envolvidos por categoria,
              cadastrados por pesquisadores astronômicos.
            </p>
            {eventosAstroCategoria.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl h-[320px] flex items-center justify-center text-zinc-500">
                Sem informações
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventosAstroCategoria}>
                      <XAxis
                        dataKey="categoria"
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, "dataMax"]}
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      />
                      <Tooltip
                        {...tooltipProps}
                        cursor={false}
                        isAnimationActive={false}
                        formatter={(value, name) => {
                          const labels: Record<string, string> = {
                            total_eventos: "Eventos",
                            corpos_celestes_distintos: "Corpos Celestes",
                            pesquisadores_envolvidos: "Pesquisadores",
                          };
                          const key = String(name);
                          return [value, labels[key] ?? key];
                        }}
                      />
                      <Legend
                        formatter={(value) => {
                          const labels: Record<string, string> = {
                            total_eventos: "Eventos",
                            corpos_celestes_distintos: "Corpos Celestes",
                            pesquisadores_envolvidos: "Pesquisadores",
                          };
                          return labels[value] ?? value;
                        }}
                        wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
                      />
                      <Bar
                        dataKey="total_eventos"
                        fill="#a855f7"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="corpos_celestes_distintos"
                        fill="#ec4899"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={false}
                      />
                      <Bar
                        dataKey="pesquisadores_envolvidos"
                        fill="#6366f1"
                        radius={[8, 8, 0, 0]}
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Variação de Temperatura — desabilitado temporariamente */}
          {/* <div className="h-px bg-white/10 my-12" />

          <div className="mb-10">
            <h3 className="text-xl mb-1">
              Variação de Temperatura por Ponto de Observação
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Amplitude térmica registrada em cada ponto, ordenada da maior
              para a menor variação.
            </p>
            {variacaoTemperatura.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl h-[360px] flex items-center justify-center text-zinc-500">
                Sem informações
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                ...
              </div>
            )}
          </div> */}
        </main>
      </div>
    </div>
  );
}