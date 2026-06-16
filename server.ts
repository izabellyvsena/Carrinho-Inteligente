import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const __dirname = path.resolve();
const app = express();
app.use(express.json());

// Função de fallback para simulação offline
function getLocalFallback(listText: string, location?: string) {
  const targetLocation = location || "Baixada Fluminense";
  return {
    items: [
      { name: "Peito de Frango", qty: 1, priceTraditional: 22.0, priceWholesale: 18.0 },
      { name: "Arroz Agulhinha", qty: 1, priceTraditional: 30.0, priceWholesale: 24.5 }
    ],
    traditionalTotal: 52.0,
    wholesaleTotal: 42.5,
    savingsTotal: 9.5,
    assistantMessage: `💡 [Modo Offline] Usando dados locais para ${targetLocation}.`
  };
}

app.post("/api/check-list", async (req, res) => {
  const { listText, location } = req.body;
  const targetLocation = location || "Baixada Fluminense";
  const activeApiKey = process.env.GROQ_API_KEY;

  try {
    if (!activeApiKey) {
      throw new Error("A variável GROQ_API_KEY não foi encontrada.");
    }

    const groq = new Groq({ apiKey: activeApiKey });

    const prompt = `
      Você é o PechinchaBot. Analise esta lista de compras: "${listText}". 
      Considere a localização: "${targetLocation}".
      
      IMPORTANTE:
      1. Extraia a quantidade (qty) de cada item. Se não houver, assuma 1.
      2. Calcule o preço total de cada item (preço unitário * quantidade).
      3. Some todos os itens para obter o 'traditionalTotal' e 'wholesaleTotal'.
      
      Retorne APENAS um JSON estrito:
      {
        "items": [
          { "name": "Nome", "qty": 4, "priceTraditional": 8.99, "priceWholesale": 7.49 }
        ],
        "traditionalTotal": (soma de todos os itens * qty),
        "wholesaleTotal": (soma de todos os atacados * qty),
        "savingsTotal": (diferença total),
        "assistantMessage": "Mensagem curta de economia."
      }
    `;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const jsonResult = JSON.parse(responseText.trim());
    
    return res.json(jsonResult);
    
  } catch (err: any) {
    console.error("--- ERRO NA API ---", err.message);
    return res.json(getLocalFallback(listText, targetLocation));
  }
});

const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));
app.get("*", (req, res) => { res.sendFile(path.join(staticPath, 'index.html')); });

const PORT = process.env.PORT || 10000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
