import { LayoutDashboard, Pencil, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "../../supabase";
import UserProfileCard from "../shared/UserProfileCard";
import fundo from "../../../assets/fundo.png";
import {
  Orbit,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/pesquisador/dashboard" },
  { icon: Pencil, label: "Cadastro", path: "/pesquisador/cadastro" },
  {
    icon: BookOpen,
    label: "Minha Biblioteca",
    path: "/pesquisador/minha-biblioteca",
  },
];

async function usuario() {
  const user = supabase.auth.getUser();

  const { data, error } = await supabase
    .from("usuario")
    .select("tipo_acesso_usuario")
    .eq("id", (await user).data.user?.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data.tipo_acesso_usuario;
}

const tipo = (await usuario()) === 2 ? "Metereologico" : "Astronomo";

export default function Pesquisador({ children }: LayoutProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#18051f] via-[#2a0d3d] to-[#14031d] text-white">
    {/* Glow */}
    <div className="fixed top-[-150px] left-[-100px] h-[500px] w-[500px] rounded-full bg-pink-500/10 blur-[150px]" />
    <div className="fixed right-[-100px] bottom-[-200px] h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[180px]" />

    <div className="relative z-10 flex min-h-screen">
      <aside className="relative w-[280px] overflow-hidden border-r border-white/10">
      {/* Fundo */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${fundo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
        {/* Overlay */}
      <div className="absolute inset-0 bg-[#12051d]/70" />

      {/* Conteúdo */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <div className="px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-pink-400/30">
              <Orbit size={22} className="text-pink-400" />
            </div>

            <div>
              <h1 className="text-2xl font-light tracking-[0.35rem]">
                LUNARIS
              </h1>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Área do Pesquisador
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-5">
          <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `mb-1.5 flex w-full items-center gap-4 rounded-2xl px-5 py-3.5 text-[0.95rem] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-pink-500/20 to-purple-500/20 text-pink-300 shadow-lg shadow-pink-500/10"
                    : "text-zinc-300 hover:bg-white/5"
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          ))}
          </div>
        </nav>

        <div className="p-4">
            <UserProfileCard />
        </div>
      </div>
    </aside>
    {/* Conteúdo */}
    <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
</div>
  );
}
