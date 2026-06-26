import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
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

type AbaId =
  | "meteorologia"
  | "missoes"
  | "corpos"
  | "constelacoes"
  | "pontos"
  | "eventos"
  | "materiais";

const menuTodos = [
  { id: "meteorologia" as AbaId, nome: "Dados Meteorológicos", icon: CloudSun, tipo: [2] },
  { id: "missoes"      as AbaId, nome: "Missões Espaciais",    icon: Rocket,   tipo: [1] },
  { id: "corpos"       as AbaId, nome: "Corpos Celestes",      icon: Star,     tipo: [1] },
  { id: "constelacoes" as AbaId, nome: "Constelações",         icon: Telescope,tipo: [1] },
  { id: "pontos"       as AbaId, nome: "Pontos de Observação", icon: MapPinned,tipo: [1, 2] },
  { id: "eventos"      as AbaId, nome: "Eventos",              icon: CalendarDays, tipo: [1, 2] },
  { id: "materiais"    as AbaId, nome: "Materiais de Estudo",  icon: BookOpen,  tipo: [1, 2] },
];

export default function Cadastros() {
  const [aba, setAba] = useState<AbaId | null>(null);
  const [tipoAcesso, setTipoAcesso] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("usuario")
          .select("tipo_acesso_usuario")
          .eq("id", user.id)
          .single();

        if (data) {
          setTipoAcesso(data.tipo_acesso_usuario);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };

    init();
  }, []);

  // Define o menu visível para o tipo de pesquisador
  const menu = tipoAcesso !== null
    ? menuTodos.filter((item) => item.tipo.includes(tipoAcesso))
    : [];

  // Define a aba inicial quando o menu estiver disponível
  useEffect(() => {
    if (menu.length > 0 && aba === null) {
      setAba(menu[0].id);
    }
  }, [menu.length]);

  // Para eventos, o tipo é travado conforme o perfil
  const tipoFixoEvento =
    tipoAcesso === 1 ? "astronomico" :
    tipoAcesso === 2 ? "meteorologico" :
    undefined;

  return (
    <div className="text-white">
      <div className="flex gap-8">
        {/* SIDEBAR */}
         <div className="w-[360px] shrink-0 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <div className="mb-10">
            <h1 className="text-4xl font-semibold">Cadastros</h1>

            <p className="mt-3 text-gray-400">
              Gerencie todas as informações do sistema Lunaris.
            </p>

            {tipoAcesso !== null && (
              <span className="mt-4 inline-block rounded-xl bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300 border border-fuchsia-500/20">
                {tipoAcesso === 1 ? "Pesquisador Astronômico" : "Pesquisador Meteorológico"}
              </span>
            )}
          </div>

          {carregando ? (
            <p className="text-gray-400 text-sm">Carregando...</p>
          ) : (
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
          )}
        </div>

        {/* CONTEÚDO */}
        <main className="flex-1 space-y-8">
          {/* CARD DE TÍTULO */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              <h2 className="text-3xl font-semibold">Painel de Cadastros</h2>

            <p className="mt-2 text-zinc-400">
              Utilize o menu lateral para cadastrar informações do sistema Lunaris.
            </p>
          </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
              {aba === "meteorologia" && <FormMeteorologia />}
              {aba === "missoes"      && <FormMissao />}
              {aba === "corpos"       && <FormCorpoCeleste />}
              {aba === "constelacoes" && <FormConstelacao />}
              {aba === "pontos"       && <FormPontoObservacao />}
              {aba === "eventos"      && <FormEvento tipoFixo={tipoFixoEvento} />}
              {aba === "materiais"    && <FormMaterialEstudo />}
            </div>
        </main>
      </div>
    </div>
    
  );
}
