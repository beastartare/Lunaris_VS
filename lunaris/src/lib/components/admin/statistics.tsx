import { supabase } from "../../../lib/supabase";
import {
  Database,
  ChartNoAxesCombined,
  Orbit,
  LogOut,
} from "lucide-react";
import fundo from "../../../assets/fundo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

export default function Statistics() {
  const navigate = useNavigate();
  const [constelacoesFavoritas, setConstelacoesFavoritas] = useState([]);
const [materiaisFavoritos, setMateriaisFavoritos] = useState([]);
  async function carregarConstelacoesFavoritas() {
  const { data, error } = await supabase
    .from("favoritoconstelacaousuario")
    .select(`
      idUsuario,
      constelacao:idConstelacao (
        idConstelacao,
        nome
      )
    `);

  if (error) {
    console.error(error);
    return;
  }

  const contador = {};

  data.forEach((item) => {
    const nome = item.constelacao.nome;

    contador[nome] = (contador[nome] || 0) + 1;
  });

  const ranking = Object.entries(contador)
    .map(([nome, favoritos]) => ({
      nome,
      favoritos,
    }))
    .sort((a, b) => b.favoritos - a.favoritos)
    .slice(0, 5);

  setConstelacoesFavoritas(ranking);
}

async function carregarMateriaisFavoritos() {
  const { data, error } = await supabase
    .from("favoritomaterialusuario")
    .select(`
      idUsuario,
      material:idMaterialEstudo (
        idMaterialEstudo,
        titulo
      )
    `);

  if (error) {
    console.error(error);
    return;
  }

  const contador: Record<string, number> = {};

  data.forEach((item: any) => {
    const titulo = item.material?.titulo;

    if (!titulo) return;

    contador[titulo] = (contador[titulo] || 0) + 1;
  });

  const ranking = Object.entries(contador)
    .map(([titulo, favoritos]) => ({
      titulo,
      favoritos,
    }))
    .sort((a, b) => Number(b.favoritos) - Number(a.favoritos))
    .slice(0, 5);

  setMateriaisFavoritos(ranking);
}
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }
  const [stats, setStats] = useState({
  usuarios: 0,
  eventos: 0,
  corposCelestes: 0,
  missoes: 0,
});

const [eventosCategoria, setEventosCategoria] = useState([
  { categoria: "Astronômicos", quantidade: 0 },
  { categoria: "Meteorológicos", quantidade: 0 },
]);

async function carregarEventosCategoria() {
  const [
    astronomicosResult,
    meteorologicosResult,
  ] = await Promise.all([
    supabase
      .from("eventoastronomico")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("eventometereologico")
      .select("*", { count: "exact", head: true }),
  ]);

  setEventosCategoria([
    {
      categoria: "Astronômicos",
      quantidade: astronomicosResult.count || 0,
    },
    {
      categoria: "Meteorológicos",
      quantidade: meteorologicosResult.count || 0,
    },
  ]);
}

const [usuariosPorTipo, setUsuariosPorTipo] = useState([]);

async function carregarEstatisticas() {
  try {
    const [
      usuariosResult,
      eventosResult,
      corposResult,
      missoesResult,
    ] = await Promise.all([
      supabase
        .from("usuario")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("evento")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("corpoceleste")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("missaoespacial")
        .select("*", { count: "exact", head: true }),
    ]);

    setStats({
      usuarios: usuariosResult.count || 0,
      eventos: eventosResult.count || 0,
      corposCelestes: corposResult.count || 0,
      missoes: missoesResult.count || 0,
    });
  } catch (err) {
    console.error(err);
  }
}

async function carregarUsuariosPorTipo() {
  const { data, error } = await supabase
    .from("usuario")
    .select("tipo_acesso_usuario");

  if (error) {
    console.error(error);
    return;
  }

  const comuns = data.filter(
    (u) => u.tipo_acesso_usuario === 0
  ).length;

  const astronomicos = data.filter(
    (u) => u.tipo_acesso_usuario === 1
  ).length;

  const meteorologicos = data.filter(
    (u) => u.tipo_acesso_usuario === 2
  ).length;

  setUsuariosPorTipo([
    { name: "Comum", value: comuns },
    { name: "Astronômico", value: astronomicos },
    { name: "Meteorológico", value: meteorologicos },
  ]);
}
useEffect(() => {
  carregarEstatisticas();
  carregarUsuariosPorTipo();
  carregarEventosCategoria();
  carregarConstelacoesFavoritas();
  carregarMateriaisFavoritos();
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18051f] via-[#2a0d3d] to-[#14031d] text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="fixed top-[-150px] left-[-100px] h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />
      <div className="fixed bottom-[-200px] right-[-100px] h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[180px]" />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="relative w-[280px] overflow-hidden border-r border-white/10">
          {/* Fundo */}
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
          <div className="relative z-10 flex flex-col h-full">
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

            {/* Menu */}
            <nav className="px-4 flex-1">
              <div className="space-y-2">

                <button onClick={() => navigate("/admin")}
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
            {/* Logout */}
            <div className="px-4 pb-6 mt-auto">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-red-300 hover:bg-red-500/10 transition border border-red-400/10"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-10 overflow-auto">
            <div className="mb-10">
                <h2 className="text-4xl font-light tracking-wide">
                Estatísticas Gerais
                </h2>

                <p className="text-zinc-400 mt-2">
                Visão geral da atividade da plataforma.
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-zinc-400 text-sm uppercase tracking-widest">
                    Usuários
                </h3>

                <p className="text-4xl font-light mt-3">{stats.usuarios - 1}</p>
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

            {/* Rankings */}
            <div className="grid xl:grid-cols-2 gap-6">
                {/* Constelações */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl mb-6">
                        Constelações Mais Favoritadas
                    </h3>
                    {constelacoesFavoritas.length === 0 ? (
                        <div className="h-[320px] flex items-center justify-center text-zinc-500">
                        Sem informações
                        </div>
                    ) : (
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={constelacoesFavoritas}
                        >
                            <XAxis type="number" hide />

                            <YAxis
                            dataKey="nome"
                            type="category"
                            width={120}
                            />

                            <Tooltip cursor={false} />

                            <Bar
                            dataKey="favoritos"
                            fill="#ec4899"
                            radius={[0, 8, 8, 0]}
                            activeBar={false}
                            />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>)}
                    </div>

                {/* Materiais */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl mb-6">
                    Materiais Mais Favoritados
                </h3>
                    {materiaisFavoritos.length === 0 ? (
                        <div className="h-[320px] flex items-center justify-center text-zinc-500">
                        Sem informações
                        </div>
                    ) : (
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={materiaisFavoritos}
                        >
                            <XAxis type="number" hide />

                            <YAxis
                            dataKey="nome"
                            type="category"
                            width={120}
                            />

                            <Tooltip cursor={false} />

                            <Bar
                            dataKey="favoritos"
                            fill="#ec4899"
                            radius={[0, 8, 8, 0]}
                            activeBar={false}
                            />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>)}
                </div>

            </div>
            <div className="h-px bg-white/10 my-12" />

            { /* Gráfico usuarios */ }
            <div className="grid xl:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl mb-6">
                        Distribuição de Usuários
                    </h3>

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
                            <Cell fill="#ec4899" />
                            <Cell fill="#a855f7" />
                            <Cell fill="#6366f1" />
                        </Pie>

                        <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl mb-6">
                        Crescimento dos Eventos
                    </h3>

                    <div className="h-[320px] flex items-center justify-center text-zinc-500">
                        Gráfico de Linha
                    </div>
                </div>
            </div>

            { /* Gráfico eventos */ }
            <div className="grid xl:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl mb-6">
                    Eventos por Categoria
                </h3>
                    <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={eventosCategoria}>
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip   cursor={false}/>
                        <Bar
                            dataKey="quantidade"
                            radius={[8, 8, 0, 0]}                        >
                            <Cell fill="#a855f7" />
                            <Cell fill="#6366f1"/>
                         </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl mb-6">
                        Top Pesquisadores
                    </h3>

                    <table className="w-full">
                        <thead>
                        <tr className="text-left text-zinc-400 border-b border-white/10">
                            <th className="pb-3">Nome</th>
                            <th className="pb-3">Tipo</th>
                            <th className="pb-3 text-right">Eventos</th>
                        </tr>
                        </thead>

                        <tbody>
                        <tr className="border-b border-white/5">
                            <td className="py-3">João</td>
                            <td>Astronômico</td>
                            <td className="text-right">84</td>
                        </tr>

                        <tr className="border-b border-white/5">
                            <td className="py-3">Maria</td>
                            <td>Meteorológico</td>
                            <td className="text-right">72</td>
                        </tr>

                        <tr>
                            <td className="py-3">Pedro</td>
                            <td>Astronômico</td>
                            <td className="text-right">65</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            </main>
      </div>
    </div>
  );
}