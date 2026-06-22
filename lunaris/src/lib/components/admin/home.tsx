import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  Database,
  BarChart3,
  Sheet,
  ChartNoAxesCombined,
  Orbit,
  LogOut,
} from "lucide-react";
import fundo from "../../../assets/fundo.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [bancoVazio, setBancoVazio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    status: "Verificando...",
    tabelas: 0,
    registros: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    carregarEstatisticas();
    verificarBanco();
  }, []);

  async function verificarBanco() {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "banco_esta_vazio"
    );

    if (!error) {
      setBancoVazio(data);
    }

    setLoading(false);
  }

  async function inicializarBanco() {
    try {
      await supabase.rpc("criar_banco");
      await supabase.rpc("popular_banco");

      alert("Banco inicializado com sucesso!");

      verificarBanco();
      await carregarEstatisticas();
    } catch {
      alert("Erro ao inicializar banco.");
    }
  }

  async function apagarBanco() {
    const confirmar = window.confirm(
      "Deseja realmente apagar todas as tabelas?"
    );

    if (!confirmar) return;

    try {
      const { data, error } = await supabase.rpc(
      "apagar_banco"
      );
      console.log(data)
      console.log(error)

      alert("Banco apagado com sucesso!");

      verificarBanco();
      await carregarEstatisticas();
    } catch {
      alert("Erro ao apagar banco.");
    }
  }

  async function carregarEstatisticas() {
    try {
      const { data, error } = await supabase.rpc(
        "obter_estatisticas_banco"
      );

      if (error) throw error;

      setStats(data);
    } catch (err) {
      console.error(err);

      setStats({
        status: "Offline",
        tabelas: 0,
        registros: 0,
      });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

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
              backgroundSize: "100vw 100vh",
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

                <button className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-pink-500/20 border border-pink-400/20 text-pink-200">
                  <Database size={20} />
                  <span>Banco de Dados</span>
                </button>

                <button onClick={() => navigate("/admin/statistics")}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-zinc-300 hover:bg-white/5 transition"
                >
                  <ChartNoAxesCombined size={20} />
                  <span>Estatísticas</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 p-12">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h2 className="text-5xl font-semibold">
                Banco de Dados
              </h2>

              <p className="text-zinc-400 mt-3 text-lg">
                Gerenciamento do sistema Lunaris
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

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Status */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm mb-3">
                    Status do Banco
                  </p>

                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        stats.status === "Online"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    />

                    <span
                      className={`text-2xl font-medium ${
                        stats.status === "Online"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stats.status === "Online"
                        ? "Conectado"
                        : "Offline"}
                    </span>
                  </div>

                  <p className="text-zinc-500 text-sm">
                    PostgreSQL
                  </p>
                </div>

                <div className="h-16 w-16 rounded-2xl bg-pink-500/10 border border-pink-400/20 flex items-center justify-center">
                  <Database className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            {/* Tabelas */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm mb-3">
                    Tabelas
                  </p>

                  <h3 className="text-4xl font-semibold">
                    {stats.tabelas}
                  </h3>

                  <p className="text-zinc-500 text-sm mt-2">
                    Tabelas no banco
                  </p>
                </div>

                <div className="h-16 w-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/20 flex items-center justify-center">
                  <Sheet className="w-8 h-8 text-fuchsia-400" />
                </div>
              </div>
            </div>

            {/* Registros */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm mb-3">
                    Registros
                  </p>

                  <h3 className="text-4xl font-semibold">
                    {stats.registros.toLocaleString("pt-BR")}
                  </h3>

                  <p className="text-zinc-500 text-sm mt-2">
                    Registros totais
                  </p>
                </div>

                <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inicializar */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
              <div className="mb-6">
                <h3 className="text-3xl font-semibold">
                  Inicializar Banco
                </h3>

                <p className="text-zinc-400 mt-2">
                  Cria todas as tabelas e insere os dados
                  iniciais.
                </p>
              </div>

              <div className="bg-pink-500/10 border border-pink-400/20 rounded-2xl p-4 mb-6">
                Inicializa as tabelas a partir de um banco vazio.
              </div>

              <button
                onClick={inicializarBanco}
                disabled={!bancoVazio || loading}
                className={`
                  w-full py-4 rounded-2xl font-semibold text-lg transition-all
                  ${
                    bancoVazio
                      ? "bg-pink-500 hover:bg-pink-600 text-white"
                      : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  }
                `}
              >
                {loading
                  ? "Verificando..."
                  : bancoVazio
                  ? "Inicializar Banco"
                  : "Banco já inicializado"}
              </button>
            </div>

            {/* Limpar */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8">
              <div className="mb-6">
                <h3 className="text-3xl font-semibold">
                  Limpar Banco
                </h3>

                <p className="text-zinc-400 mt-2">
                  Remove todas as tabelas e registros.
                </p>
              </div>

              <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-4 mb-6">
                Esta ação não pode ser desfeita.
              </div>

              <button
                onClick={apagarBanco}
                disabled={loading || bancoVazio}
                className={`
                  w-full py-4 rounded-2xl font-semibold text-lg transition-all
                  ${
                    !bancoVazio
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  }
                `}
              >
                Limpar Banco
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}