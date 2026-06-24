import { useState } from "react";
import FormMeteorologia from "./cadastro/FormMeteorologia";
import FormMissao from "./cadastro/FormMissao";
import FormCorpoCeleste from "./cadastro/FormCorpoCeleste";
import FormConstelacao from "./cadastro/FormConstelacao";
import FormPontoObservacao from "./cadastro/FormPontoObservacao";
import FormEvento from "./cadastro/FormEvento";
import FormMaterialEstudo from "./cadastro/FormMaterialEstudo";
import {
  CloudSun,
  Rocket,
  Star,
  Telescope,
  MapPinned,
  CalendarDays,
  BookOpen,
} from "lucide-react";

export default function Cadastros() {
  const [aba, setAba] = useState("meteorologia");

  const menu = [
    {
      id: "meteorologia",
      nome: "Dados Meteorológicos",
      icon: CloudSun,
    },
    {
      id: "missoes",
      nome: "Missões Espaciais",
      icon: Rocket,
    },
    {
      id: "corpos",
      nome: "Corpos Celestes",
      icon: Star,
    },
    {
      id: "constelacoes",
      nome: "Constelações",
      icon: Telescope,
    },
    {
      id: "pontos",
      nome: "Pontos de Observação",
      icon: MapPinned,
    },
    {
      id: "eventos",
      nome: "Eventos",
      icon: CalendarDays,
    },
    {
      id: "materiais",
      nome: "Materiais de Estudo",
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-[#2a102f] text-white">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}

        <aside className="w-96 border-r border-fuchsia-900/40 bg-linear-to-b from-[#35133c] to-[#220c27] p-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold">Cadastros</h1>

            <p className="mt-3 text-gray-400">
              Gerencie todas as informações do sistema Lunaris.
            </p>
          </div>

          <div className="space-y-3">
            {menu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setAba(item.id)}
                  className={`group flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-all duration-300 ${
                    aba === item.id
                      ? "bg-linear-to-r from-fuchsia-700 to-purple-700 shadow-lg shadow-fuchsia-900/50"
                      : "bg-[#3b1544] hover:bg-[#4a1b54]"
                  }`}
                >
                  <div
                    className={`rounded-xl p-3 ${
                      aba === item.id ? "bg-white/20" : "bg-black/20"
                    }`}
                  >
                    <Icon size={24} />
                  </div>

                  <div>
                    <h3 className="font-semibold">{item.nome}</h3>

                    <p className="text-xs text-gray-300">Acessar cadastro</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CONTEÚDO */}

        <main className="flex-1 p-10">
          <div className="mb-8 rounded-3xl border border-fuchsia-900/30 bg-[#35133c] p-8 shadow-xl">
            <h2 className="text-3xl font-bold">Painel de Cadastros</h2>

            <p className="mt-3 text-gray-300">
              Utilize o menu lateral para cadastrar informações astronômicas,
              meteorológicas, eventos, materiais de estudo e muito mais.
            </p>
          </div>

          <div className="rounded-3xl border border-fuchsia-900/30 bg-[#35133c] p-8 shadow-xl">
            {aba === "meteorologia" && <FormMeteorologia />}

            {aba === "missoes" && <FormMissao />}

            {aba === "corpos" && <FormCorpoCeleste />}

            {aba === "constelacoes" && <FormConstelacao />}

            {aba === "pontos" && <FormPontoObservacao />}

            {aba === "eventos" && <FormEvento />}

            {aba === "materiais" && <FormMaterialEstudo />}
          </div>
        </main>
      </div>
    </div>
  );
}
