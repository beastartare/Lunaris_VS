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
} from "lucide-react";

interface UsuarioInfo {
  nome: string | null;
  email: string | null;
  username: string | null;
  tipo_acesso_usuario: number | null;
}

const tipoLabel: Record<number, string> = {
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
}: {
  aberto: boolean;
  onFechar: () => void;
  usuario: UsuarioInfo | null;
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
          .select("nome, username, tipo_acesso_usuario")
          .eq("id", user.id)
          .single();

        setUsuario({
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
                Dados do Usuário
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
      />
      <ModalSobre aberto={modalSobre} onFechar={() => setModalSobre(false)} />
    </>
  );
}
