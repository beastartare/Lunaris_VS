import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  LogOut,
  User,
  Info,
  ChevronUp,
  X,
  Star,
  Telescope,
  Moon,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react";

interface UsuarioInfo {
  idusuario?: number;
  nome: string | null;
  email: string | null;
  username: string | null;
  tipo_acesso_usuario: number | null;
}

const tipoLabel: Record<number, string> = {
  0: "Visitante",
  1: "Pesquisador Astronômico",
  2: "Pesquisador Meteorológico",
  3: "Explorador do Cosmos",
};

function getInitials(nome: string | null, email: string | null): string {
  const source = nome || email || "?";
  return source
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Modal reutilizável ──────────────────────────
function Modal({
  aberto,
  onFechar,
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  children: React.ReactNode;
}) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-fuchsia-700/40 bg-[#1e0a23] p-6 shadow-2xl">
        <button
          onClick={onFechar}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

// ── Modal: Dados do Usuário ─────────────────────
function ModalDados({
  aberto,
  onFechar,
  usuario,
  onEditarClick,
  onExcluirClick,
}: {
  aberto: boolean;
  onFechar: () => void;
  usuario: UsuarioInfo | null;
  onEditarClick: () => void;
  onExcluirClick: () => void;
}) {
  const initials = getInitials(usuario?.nome ?? null, usuario?.email ?? null);

  return (
    <Modal aberto={aberto} onFechar={onFechar}>
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* Avatar */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 text-xl font-bold shadow-lg">
          {initials}
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white">
            {usuario?.nome ?? "—"}
          </h2>
          <p className="text-sm text-gray-400">{usuario?.email ?? "—"}</p>
          {usuario?.username && (
            <p className="mt-1 text-xs text-fuchsia-400">@{usuario.username}</p>
          )}
        </div>

        <div className="w-full rounded-xl border border-fuchsia-800/40 bg-white/5 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Perfil</span>
            <span className="text-white">
              {usuario?.tipo_acesso_usuario != null
                ? tipoLabel[usuario.tipo_acesso_usuario] ?? "Desconhecido"
                : "—"}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="w-full flex gap-3 pt-1">
          <button
            onClick={() => { onFechar(); onEditarClick(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-fuchsia-700/40 bg-fuchsia-900/30 px-4 py-2.5 text-sm font-medium text-fuchsia-300 hover:bg-fuchsia-800/40 hover:text-white transition-colors"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            onClick={() => { onFechar(); onExcluirClick(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-800/30 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
            Excluir conta
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ModalEditarPerfil({
  aberto,
  onFechar,
  usuario,
  onSalvo,
}: {
  aberto: boolean;
  onFechar: () => void;
  usuario: UsuarioInfo | null;
  onSalvo: (dados: Partial<UsuarioInfo>) => void;
}) {
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [username, setUsername] = useState(usuario?.username ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setNome(usuario?.nome ?? "");
    setUsername(usuario?.username ?? "");
    setEmail(usuario?.email ?? "");
    setErro(null);
  }, [usuario, aberto]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setErro("O nome não pode estar vazio.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const { error: updateError } = await supabase
        .from("usuario")
        .update({ nome: nome.trim(), username: username.trim() })
        .eq("id", user.id);

      if (updateError) throw updateError;

      if (email.trim() !== usuario?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (emailError) throw emailError;

        await supabase
          .from("usuario")
          .update({ email: email.trim() })
          .eq("id", user.id);
      }

      onSalvo({ nome: nome.trim(), username: username.trim(), email: email.trim() });
      onFechar();
    } catch (err: any) {
      setErro(err.message ?? "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar}>
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-900/50 text-fuchsia-300">
            <Pencil size={18} />
          </div>
          <h2 className="text-lg font-bold text-white">Editar Perfil</h2>
        </div>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-xl border border-fuchsia-700/30 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-fuchsia-500/60 focus:outline-none transition-colors"
              placeholder="Seu nome completo"
            />
          </div>

          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
              Username
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-fuchsia-700/30 bg-white/5 px-4 py-2.5">
              <span className="text-fuchsia-500 text-sm">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 focus:outline-none"
                placeholder="seu_username"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-fuchsia-700/30 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-fuchsia-500/60 focus:outline-none transition-colors"
              placeholder="seu@email.com"
            />
            {email !== usuario?.email && (
              <p className="mt-1 text-xs text-amber-400">
                ⚠ Um e-mail de confirmação será enviado para o novo endereço.
              </p>
            )}
          </div>
        </div>

        {erro && (
          <p className="rounded-lg border border-red-700/30 bg-red-900/20 px-3 py-2 text-sm text-red-400">
            {erro}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onFechar}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-fuchsia-700 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-600 disabled:opacity-50 transition-colors"
          >
            <Save size={14} />
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ModalExcluirPerfil({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  const navigate = useNavigate();
  const [confirmacao, setConfirmacao] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) { setConfirmacao(""); setErro(null); }
  }, [aberto]);

  const handleExcluir = async () => {
    if (confirmacao !== "EXCLUIR") {
      setErro('Digite "EXCLUIR" para confirmar.');
      return;
    }
    setExcluindo(true);
    setErro(null);
    try {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/");
    } catch (err: any) {
      console.error("Erro ao excluir conta:", err);
      setErro(err.message ?? "Erro ao excluir conta. Tente novamente.");
      setExcluindo(false);
    }
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar}>
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/50 text-red-400">
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-lg font-bold text-white">Excluir conta</h2>
        </div>

        <div className="rounded-xl border border-red-700/30 bg-red-900/10 p-4 space-y-2">
          <p className="text-sm font-semibold text-red-300">
            ⚠ Esta ação é irreversível
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Todos os seus dados serão permanentemente removidos do sistema, incluindo observações, favoritos e histórico de atividades.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">
            Para confirmar, digite <span className="text-red-400 font-bold">EXCLUIR</span>
          </label>
          <input
            type="text"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className="w-full rounded-xl border border-red-700/30 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-red-500/60 focus:outline-none transition-colors"
            placeholder="EXCLUIR"
          />
        </div>

        {erro && (
          <p className="rounded-lg border border-red-700/30 bg-red-900/20 px-3 py-2 text-sm text-red-400">
            {erro}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onFechar}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExcluir}
            disabled={excluindo || confirmacao !== "EXCLUIR"}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-40 transition-colors"
          >
            <Trash2 size={14} />
            {excluindo ? "Excluindo..." : "Excluir conta"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Modal: Sobre o Sistema ──────────────────────
function ModalSobre({
  aberto,
  onFechar,
}: {
  aberto: boolean;
  onFechar: () => void;
}) {
  return (
    <Modal aberto={aberto} onFechar={onFechar}>
      <div className="flex flex-col items-center gap-5 pt-2 text-center">
        {/* Logo decorativa */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-800 shadow-lg shadow-fuchsia-900/50">
          <Moon size={28} className="text-white" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-fuchsia-300">Lunaris</h2>
          <p className="mt-1 text-xs text-gray-500 uppercase tracking-widest">
            Sistema de Observação Astronômica
          </p>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed">
          O <span className="text-fuchsia-300 font-semibold">Lunaris</span> é
          uma plataforma colaborativa para registro e exploração de eventos
          astronômicos e meteorológicos. Pesquisadores e entusiastas podem
          catalogar observações, corpos celestes, constelações, missões
          espaciais e muito mais.
        </p>

        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { icon: Star, label: "Eventos" },
            { icon: Telescope, label: "Observações" },
            { icon: Moon, label: "Astronomia" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-xl border border-fuchsia-800/30 bg-white/5 p-3"
            >
              <Icon size={18} className="text-fuchsia-400" />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600">v1.0.0 — 2026</p>
      </div>
    </Modal>
  );
}

// ── Componente principal ────────────────────────
export default function UserProfileCard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalDados, setModalDados] = useState(false);
  const [modalSobre, setModalSobre] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("usuario")
          .select("idusuario, nome, username, tipo_acesso_usuario")
          .eq("id", user.id)
          .single();

        setUsuario({
          idusuario: data?.idusuario ?? undefined,
          nome: data?.nome ?? null,
          email: user.email ?? null,
          username: data?.username ?? null,
          tipo_acesso_usuario: data?.tipo_acesso_usuario ?? null,
        });
      } catch (err) {
        console.error(err);
      }
    };

    carregar();
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSair = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSalvo = (dados: Partial<UsuarioInfo>) => {
    setUsuario((prev) => prev ? { ...prev, ...dados } : prev);
  };

  const initials = getInitials(usuario?.nome ?? null, usuario?.email ?? null);
  const subtitulo =
    usuario?.tipo_acesso_usuario != null
      ? tipoLabel[usuario.tipo_acesso_usuario] ?? "Usuário"
      : "Usuário";

  return (
    <>
      <div ref={menuRef} className="relative px-4 pb-4">
        {/* Popover do menu */}
        {menuAberto && (
          <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-fuchsia-700/40 bg-[#1e0a23] py-2 shadow-2xl shadow-black/50">
            {/* Cabeçalho do popover */}
            <div className="flex items-center gap-3 border-b border-white/5 px-5 pb-4 pt-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 text-base font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {usuario?.nome ?? "Carregando..."}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {usuario?.email ?? ""}
                </p>
              </div>
            </div>

            {/* Opções */}
            <div className="mt-2 px-2 space-y-0.5">
              <button
                onClick={() => {
                  setMenuAberto(false);
                  setModalDados(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <User size={16} className="text-fuchsia-400" />
                Ver Perfil
              </button>

              <button
                onClick={() => {
                  setMenuAberto(false);
                  setModalEditar(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Pencil size={16} className="text-fuchsia-400" />
                Editar Informações
              </button>

              <button
                onClick={() => {
                  setMenuAberto(false);
                  setModalSobre(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Info size={16} className="text-fuchsia-400" />
                Sobre o Lunaris
              </button>

              <div className="my-1 border-t border-white/5" />

              <button
                onClick={() => {
                  setMenuAberto(false);
                  setModalExcluir(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
                Excluir Conta
              </button>

              <button
                onClick={handleSair}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        )}

        {/* Botão de perfil na sidebar */}
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="flex w-full items-center gap-4 rounded-2xl border border-fuchsia-500/10 bg-white/5 px-4 py-4 text-left transition-all hover:bg-white/10 hover:border-fuchsia-500/30"
        >
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 text-base font-bold shadow">
            {initials}
          </div>

          {/* Texto */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.95rem] font-semibold text-white">
              {usuario?.nome ?? "Carregando..."}
            </p>
            <p className="truncate text-sm text-zinc-400">{subtitulo}</p>
          </div>

          {/* Chevron */}
          <ChevronUp
            size={14}
            className={`shrink-0 text-gray-400 transition-transform ${menuAberto ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      {/* Modais */}
      <ModalDados
        aberto={modalDados}
        onFechar={() => setModalDados(false)}
        usuario={usuario}
        onEditarClick={() => setModalEditar(true)}
        onExcluirClick={() => setModalExcluir(true)}
      />
      <ModalEditarPerfil
        aberto={modalEditar}
        onFechar={() => setModalEditar(false)}
        usuario={usuario}
        onSalvo={handleSalvo}
      />
      <ModalExcluirPerfil
        aberto={modalExcluir}
        onFechar={() => setModalExcluir(false)}
      />
      <ModalSobre aberto={modalSobre} onFechar={() => setModalSobre(false)} />
    </>
  );
}
