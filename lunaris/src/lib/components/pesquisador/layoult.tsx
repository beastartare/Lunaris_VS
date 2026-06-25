import { LayoutDashboard, Pencil, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "../../supabase";
import UserProfileCard from "../shared/UserProfileCard";

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
    <div className="flex h-screen bg-[#2a102f] text-white">
      {/* Sidebar */}
      <aside className="flex w-[22rem] flex-col border-r border-fuchsia-500/10 bg-[#240d28]">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold tracking-wide text-fuchsia-300">
            Lunaris
          </h1>
        </div>

        <nav className="flex-1 px-5">
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
        </nav>

        <UserProfileCard />
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
