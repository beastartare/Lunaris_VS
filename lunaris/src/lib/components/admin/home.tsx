import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function Home() {
  const [bancoVazio, setBancoVazio] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    status: "Verificando...",
    tabelas: 0,
    registros: 0,
  });

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
    const { data, error } = await supabase.rpc(
      "obter_estatisticas_banco"
    );

    if (!error && data) {
      setStats(data);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18051f] via-[#2a0d3d] to-[#14031d] text-white overflow-hidden">
      {/* Glow Effects */}
      <div className="fixed top-[-150px] left-[-100px] h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />
      <div className="fixed bottom-[-200px] right-[-100px] h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[180px]" />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-black/10 backdrop-blur-xl">
          <div className="p-8">
            <h1 className="text-3xl tracking-[0.4rem] font-light">
              LUNARIS
            </h1>

            <p className="text-sm text-zinc-400 mt-2">
              Administração
            </p>
          </div>

          <nav className="px-4 space-y-3">
            <button className="w-full text-left px-5 py-4 rounded-2xl bg-pink-500/20 border border-pink-400/30">
              Banco de Dados
            </button>

            <button className="w-full text-left px-5 py-4 rounded-2xl hover:bg-white/5 transition">
              Estatísticas
            </button>
          </nav>

          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="font-medium">
                Administrador Chefe
              </p>

              <p className="text-sm text-zinc-400">
                admin@lunaris.com
              </p>
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 p-12">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-5xl font-semibold">
              Banco de Dados
            </h2>

            <p className="text-zinc-400 mt-3 text-lg">
              Gerenciamento do sistema Lunaris
            </p>
          </div>

          {/* Status */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
                <p className="text-zinc-400">Status</p>

                <h3 className="text-3xl mt-2 text-green-400">
                  {stats.status}
                </h3>
              </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <p className="text-zinc-400">Tabelas</p>

              <h3 className="text-3xl mt-2">
                {stats.tabelas}
              </h3>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <p className="text-zinc-400">Registros</p>

              <h3 className="text-3xl mt-2">
                {stats.registros.toLocaleString("pt-BR")}
              </h3>
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