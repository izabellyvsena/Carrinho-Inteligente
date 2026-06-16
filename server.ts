import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const __dirname = path.resolve();
const app = express();
app.use(express.json());

app.post("/api/check-list", async (req, res) => {
  const { listText, location } = req.body;
  const activeApiKey = process.env.GROQ_API_KEY;

  try {
    const groq = new Groq({ apiKey: activeApiKey! });

    const prompt = `
      Você é o PechinchaBot. Analise a lista: "${listText}".
      Para cada item, calcule o subtotal (preço unitário * quantidade).
      Retorne APENAS um JSON estrito:
      {
        "items": [{ "name": "Nome", "qty": 12, "priceTraditional": 2.50, "subtotalTraditional": 30.00, "priceWholesale": 2.00, "subtotalWholesale": 24.00 }],
        "traditionalTotal": 30.00,
        "wholesaleTotal": 24.00,
        "assistantMessage": "Calculado para 12 unidades."
      }
    `;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return res.json(JSON.parse(cleanJson));
    
  } catch (err) {
    console.error("Erro na API:", err);
    return res.status(500).json({ error: "Falha ao processar" });
  }
});

const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));
app.get("*", (req, res) => res.sendFile(path.join(staticPath, 'index.html')));

app.listen(Number(process.env.PORT || 10000), "0.0.0.0");
