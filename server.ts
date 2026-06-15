import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

// Função de fallback para simulação offline
function getLocalFallback(listText: string, location?: string) {
  const targetLocation = location || "Baixada Fluminense";
  const cleanLocName = targetLocation.split(",")[0].trim();
  
  return {
    items: [{ name: "Análise Offline", qty: "1 un", priceTraditional: 10.0, priceWholesale: 8.0 }],
    suggestions: [],
    traditionalTotal: 10.0,
    wholesaleTotal: 8.0,
    savingsTotal: 2.0,
    economyCenters: [
      { name: `Assaí Atacadista - ${cleanLocName}`, address: "Consulte o mapa local", badge: "Atacado", desc: "Simulação ativa.", active: true }
    ],
    assistantMessage: `💡 [Modo Offline] Simulação para ${targetLocation}. Configure a GEMINI_API_KEY no Render.`
  };
}

// Rota da API
app.post("/api/check-list", async (req, res) => {
  const { listText, items, location, profileOption } = req.body;
  const targetLocation = location || "Baixada Fluminense";

  try {
    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) {
      return res.json(getLocalFallback(listText, targetLocation));
    }

    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: { headers: { "User-Agent": "render-build" } },
    });

    const prompt = `Analise a lista: ${listText}. Localização: ${targetLocation}. Responda apenas em JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultObj = JSON.parse(response.text || "{}");
    return res.json(resultObj);
  } catch (err: any) {
    console.error("Erro na API:", err);
    return res.json(getLocalFallback(listText, targetLocation));
  }
});

// Servir arquivos estáticos (Frontend React)
app.use(express.static(path.join(__dirname, 'dist')));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Porta dinâmica para o Render (APENAS UMA VEZ)
const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`PechinchaBot rodando na porta ${PORT}`);
});
