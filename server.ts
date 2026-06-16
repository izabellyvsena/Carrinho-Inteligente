import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Servir arquivos estáticos da pasta 'dist'
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath, { 
  index: false,
  immutable: true,
  maxAge: '1y' 
}));

app.post("/api/check-list", async (req, res) => {
  const { listText } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

  try {
    const prompt = `Analise a lista: "${listText}". Retorne apenas JSON com items: [{name, qty, priceTraditional, priceWholesale}], traditionalTotal, wholesaleTotal, assistantMessage.`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    res.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (err) {
    res.status(500).json({ error: "Erro na IA" });
  }
});

// SPA Routing: Redireciona tudo para o index.html da pasta dist
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(Number(PORT), () => console.log(`Servidor na porta ${PORT}`));
