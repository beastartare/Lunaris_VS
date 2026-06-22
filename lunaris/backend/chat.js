import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const response =
    await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente astronômico do sistema LUNARIS.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

  res.json({
    answer:
      response.choices[0].message.content,
  });
});