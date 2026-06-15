import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Função de fallback para simulação offline
function getLocalFallback(listText: string, location?: string) {
  const targetLocation = location || "Baixada Fluminense (Duque de Caxias, Meriti, etc.)";
  const cleanLocName = targetLocation.split(",")[0].trim() || "Sua Região";
  
  return {
    items: [{ name: "Análise Offline", qty: "1 un", priceTraditional: 10.0, priceWholesale: 8.0 }],
    suggestions: [],
    traditionalTotal: 10.0,
    wholesaleTotal: 8.0,
    savingsTotal: 2.0,
    economyCenters: [
      { name: `Assaí Atacadista - ${cleanLocName}`, address: "Consulte o mapa local", badge: "Atacado", desc: "Simulação ativa.", active: true }
    ],
    assistantMessage: `💡 [Modo Offline] Simulação para ${targetLocation}. Configure a GEMINI_API_KEY no Render para inteligência real.`
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

// Servir arquivos estáticos da pasta 'dist' (React)
const path = require('path');
app.use(express.static(path.join(__dirname, 'dist')));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Porta do Render (obrigatória)const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`PechinchaBot rodando na porta ${PORT}`);
});

// ... (seu código anterior permanece igual)

// Garanta que PORT esteja definido antes de ser usado
const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`PechinchaBot rodando na porta ${PORT}`);
});

