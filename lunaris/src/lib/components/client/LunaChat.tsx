import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageCircle, Loader2 } from "lucide-react";

interface Mensagem {
  autor: "user" | "bot";
  texto: string;
}

export default function LunaChat() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      autor: "bot",
      texto:
        "Olá! Eu sou a Luna 🌙. Posso ajudar você a explorar o universo. O que você quer saber sobre o cosmos hoje?",
    },
  ]);

  const fimDaListaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviarMensagem = async () => {
    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    setMensagens((prev) => [...prev, { autor: "user", texto: pergunta }]);
    setTexto("");
    setCarregando(true);

    try {
  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mensagem: pergunta,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || "Erro ao consultar chatbot");
  }

  setMensagens((prev) => [
    ...prev,
    {
      autor: "bot",
      texto: data.resposta,
    },
  ]);
} catch (erro: any) {
  console.error("Erro ao consultar chatbot:", erro);

  let mensagemErro =
    "🌌 Desculpe, estou com dificuldades para responder no momento.";

  const erroTexto = String(
    erro?.message || erro
  ).toLowerCase();

  if (
    erroTexto.includes("503") ||
    erroTexto.includes("service unavailable") ||
    erroTexto.includes("high demand")
  ) {
    mensagemErro =
      "🚀 Estou recebendo muitas consultas no momento. Tente novamente em alguns segundos.";
  } else if (
    erroTexto.includes("429") ||
    erroTexto.includes("quota")
  ) {
    mensagemErro =
      "⏳ Meu limite de consultas foi atingido temporariamente. Tente novamente mais tarde.";
  } else if (
    erroTexto.includes("failed to fetch") ||
    erroTexto.includes("networkerror")
  ) {
    mensagemErro =
      "🔌 Não consegui me conectar aos meus sistemas. Verifique se o servidor está rodando.";
  }

  setMensagens((prev) => [
    ...prev,
    {
      autor: "bot",
      texto: mensagemErro,
    },
  ]);
} finally {
  setCarregando(false);
}
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-r from-fuchsia-600 to-purple-700 shadow-xl transition hover:scale-105"
        aria-label={aberto ? "Fechar chat" : "Abrir chat"}
      >
        {aberto ? (
          <X size={28} color="white" />
        ) : (
          <MessageCircle size={28} color="white" />
        )}
      </button>

      {/* Janela do Chat */}
      {aberto && (
        <div className="fixed bottom-26 right-6 z-50 flex h-150 w-100 flex-col overflow-hidden rounded-3xl border border-fuchsia-500/20 bg-[#2d1032] shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-fuchsia-500/10 bg-[#35133c] p-5">
            <div className="rounded-full bg-fuchsia-600 p-2">
              <Bot size={20} color="white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Luna</h3>
              <p className="text-xs text-zinc-400">
                Assistente Astronômica · Gemini AI
              </p>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
           {mensagens.map((msg, index) => (
            <div
              key={`${msg.autor}-${index}`} 
              className={`max-w-[85%] rounded-2xl p-3 text-sm text-white ${
                msg.autor === "user"
                  ? "ml-auto bg-fuchsia-700"
                  : "bg-white/10"
              }`}
            >
              {msg.texto}
            </div>
          ))}

            {/* Indicador de digitação */}
            {carregando && (
              <div className="flex max-w-[85%] items-center gap-2 rounded-2xl bg-white/10 p-3">
                <Loader2 size={16} className="animate-spin text-fuchsia-400" />
                <span className="text-sm text-zinc-400">
                  Luna está pensando...
                </span>
              </div>
            )}

            {/* Âncora para scroll automático */}
            <div ref={fimDaListaRef} />
          </div>

          {/* Input */}
          <div className="border-t border-fuchsia-500/10 p-4">
            <div className="flex gap-2">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensagem();
                  }
                }}
                placeholder="Pergunte algo à Luna..."
                disabled={carregando}
                className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 disabled:opacity-50"
              />
              <button
                onClick={enviarMensagem}
                disabled={carregando || !texto.trim()}
                className="rounded-xl bg-fuchsia-700 px-4 transition hover:bg-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={18} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
