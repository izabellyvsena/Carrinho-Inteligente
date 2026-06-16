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
    const prompt = `
      Você é o PechinchaBot. Analise a lista de compras: "${listText}". 
      
      REGRAS ABSOLUTAS PARA QUANTIDADE (qty):
      1. Extraia apenas o número de PACOTES ou UNIDADES físicas.
      2. NUNCA converta quilogramas (kg) para gramas (g), nem litros (L) para mililitros (ml).
      3. Se o usuário pedir "5kg de arroz", a quantidade (qty) é 5.
      4. Se o usuário pedir "7 litros de leite", a quantidade (qty) é 7.
      5. Se não houver número, assuma qty: 1.
      
      Retorne APENAS um objeto JSON válido e limpo, sem marcações markdown:
      {
        "items": [{ "name": "Arroz", "qty": 5, "priceTraditional": 10.99, "priceWholesale": 8.99 }],
        "assistantMessage": "Análise concluída."
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });
    
    // 🛡️ Blindagem restaurada: remove crases se a IA tentar formatar como markdown
    const responseText = completion.choices[0].message.content || "{}";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.json(JSON.parse(cleanJson));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro na IA" });
  }
});

// SPA Routing: Redireciona tudo para o index.html da pasta dist
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(Number(PORT), () => console.log(`Servidor na porta ${PORT}`));
