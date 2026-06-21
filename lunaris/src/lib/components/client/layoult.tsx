import {
  LayoutDashboard,
  Telescope,
  Orbit,
  Rocket,
  BookOpen,
  Star,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    active: true,
  },
  {
    icon: Telescope,
    label: "Observações",
  },
  {
    icon: Orbit,
    label: "Corpos Celestes",
  },
  {
    icon: Rocket,
    label: "Missões",
  },
  {
    icon: BookOpen,
    label: "Material de Estudos",
  },
  {
    icon: BookOpen,
    label: "Biblioteca",
  },
  {
    icon: Star,
    label: "Favoritos",
  },
];

export default function Layout({ children }: LayoutProps) {
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
          {menuItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`mb-2 flex w-full items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200
                ${
                  active
                    ? "bg-linear-to-r from-pink-500/20 to-purple-500/20 text-pink-300 shadow-lg shadow-pink-500/10"
                    : "text-zinc-300 hover:bg-white/5"
                }
              `}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4">
          <div className="rounded-2xl border border-fuchsia-500/10 bg-white/5 p-4">
            <p className="font-medium">Visitante</p>
            <p className="text-sm text-zinc-400">Explorador do cosmos</p>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
