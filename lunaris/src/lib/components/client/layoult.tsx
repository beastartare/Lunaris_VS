import {
  LayoutDashboard,
  Telescope,
  Orbit,
  Rocket,
  BookOpen,
  Star,
  Sparkles,
  Binoculars,
  Library,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import LunaChat from "./LunaChat";
import UserProfileCard from "../shared/UserProfileCard";
import fundo from "../../../assets/fundo.png";

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/client/dashboard" },
  { icon: Telescope, label: "Eventos", path: "/client/observacoes" },
  { icon: Orbit, label: "Corpos Celestes", path: "/client/corpos-celestes" },
  { icon: Sparkles, label: "Constelações", path: "/client/constelacao" },
  {
    icon: Binoculars,
    label: "Pontos de Observação",
    path: "/client/pontos-observacao",
  },
  { icon: Rocket, label: "Missões", path: "/client/missoes" },
  {
    icon: BookOpen,
    label: "Material de Estudos",
    path: "/client/material-estudos",
  },
  { icon: Library, label: "Minha Biblioteca", path: "/client/minha-biblioteca" },
  { icon: Star, label: "Favoritos", path: "/client/favoritos" },

];

export default function Layout({ children }: LayoutProps) {
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
                Área do Usuário
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `
                  flex w-full items-center gap-4 rounded-xl px-5 py-4
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-pink-500/20 border border-pink-400/20 text-pink-200"
                      : "text-zinc-300 hover:bg-white/5"
                  }
                `
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

    {/* Perfil */}
          <div className="p-4">
            <UserProfileCard />
          </div>
        </div>
      </aside>
      {/* Conteúdo */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
      <LunaChat />
    </div>
    </div>
  );
}
