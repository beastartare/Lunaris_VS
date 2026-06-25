import express from "express";
import { supabase } from "../services/supabase.js";
import { model } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { mensagem } = req.body;

    let contexto = "";

    const pergunta = mensagem.toLowerCase();

    // EVENTOS
    if (
      pergunta.includes("evento") ||
      pergunta.includes("eventos")
    ) {
      const { data, error } = await supabase
        .from("evento")
        .select("*");

      if (error) throw error;

      contexto += `
EVENTOS CADASTRADOS:
${JSON.stringify(data, null, 2)}
`;
    }

    // CORPOS CELESTES
    if (
      pergunta.includes("planeta") ||
      pergunta.includes("planetas") ||
      pergunta.includes("estrela") ||
      pergunta.includes("estrelas") ||
      pergunta.includes("corpo celeste") ||
      pergunta.includes("corpos celestes")
    ) {
      const { data, error } = await supabase
        .from("corpoceleste")
        .select("*");

      if (error) throw error;

      contexto += `
CORPOS CELESTES:
${JSON.stringify(data, null, 2)}
`;
    }

    // CONSTELAÇÕES
    if (
      pergunta.includes("constela")
    ) {
      const { data, error } = await supabase
        .from("constelacao")
        .select("*");

      if (error) throw error;

      contexto += `
CONSTELAÇÕES:
${JSON.stringify(data, null, 2)}
`;
    }

    // MISSÕES ESPACIAIS
    if (
      pergunta.includes("missão") ||
      pergunta.includes("missao") ||
      pergunta.includes("missões") ||
      pergunta.includes("missoes")
    ) {
      const { data, error } = await supabase
        .from("missaoespacial")
        .select("*");

      if (error) throw error;

      contexto += `
MISSÕES ESPACIAIS:
${JSON.stringify(data, null, 2)}
`;
    }

    // PONTOS DE OBSERVAÇÃO
    if (
      pergunta.includes("ponto de observação") ||
      pergunta.includes("ponto de observacao") ||
      pergunta.includes("pontos de observação") ||
      pergunta.includes("pontos de observacao")
    ) {
      const { data, error } = await supabase
        .from("pontoobservacao")
        .select("*");

      if (error) throw error;

      contexto += `
PONTOS DE OBSERVAÇÃO:
${JSON.stringify(data, null, 2)}
`;
    }
    console.log("Entrou em dados meteorológicos");
    // DADOS METEOROLÓGICOS
    if (
    pergunta.includes("temperatura") ||
    pergunta.includes("clima") ||
    pergunta.includes("meteorologia") ||
    pergunta.includes("meteorológico") ||
    pergunta.includes("meteorologico") ||
    pergunta.includes("umidade") ||
    pergunta.includes("vento") ||
    pergunta.includes("uv") ||
    pergunta.includes("dados meteorológicos") ||
    pergunta.includes("dados meteorologicos") ||
    pergunta.includes("observação") ||
    pergunta.includes("observacao") ||
    pergunta.includes("céu") ||
    pergunta.includes("ceu") ||
    pergunta.includes("condições") ||
    pergunta.includes("condicoes")
  ) {
      const { data, error } = await supabase
        .from("dadometereologico")
        .select(`
          *,
          pontoobservacao (
            nome,
            descricao
          )
        `);

      if (error) throw error;

      contexto += `
DADOS METEOROLÓGICOS:
${JSON.stringify(data, null, 2)}
`;
    }

    const prompt = `
CONTEXTO DO SISTEMA:

${contexto}

PERGUNTA DO USUÁRIO:

${mensagem}

Responda utilizando o contexto acima quando ele existir.
`;

    const result = await model.generateContent(prompt);

    return res.json({
      resposta: result.response.text()
    });

  } catch (error) {
  console.error(error);

  return res.status(500).json({
    erro: error.message,
    tipo: error.status || 500
  });
}
});

export default router;