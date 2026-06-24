import { LayoutDashboard, Pencil, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";

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

export default function Pesquisador({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#2a102f] text-white">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r border-fuchsia-500/10 bg-[#240d28]">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold tracking-wide text-fuchsia-300">
            Lunaris
          </h1>
        </div>

        <nav className="flex-1 px-4">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `mb-2 flex w-full items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-linear-to-r from-pink-500/20 to-purple-500/20 text-pink-300 shadow-lg shadow-pink-500/10"
                    : "text-zinc-300 hover:bg-white/5"
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-fuchsia-500/10 bg-white/5 p-4">
            <p className="font-medium">Pesquisador</p>
            <p className="text-sm text-zinc-400">Tipo</p>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
