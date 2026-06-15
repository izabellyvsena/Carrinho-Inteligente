import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

// Configuração necessária para rodar módulos ES no Node
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Função de fallback para simulação offline
function getLocalFallback(listText: string, location?: string) {
  const targetLocation = location || "Baixada Fluminense";
  return {
    items: [{ name: "Análise Offline", qty: "1 un", priceTraditional: 10.0, priceWholesale: 8.0 }],
    suggestions: [],
    traditionalTotal: 10.0,
    wholesaleTotal: 8.0,
    savingsTotal: 2.0,
    economyCenters: [
      { name: "Assaí Atacadista", address: "Consulte o mapa local", badge: "Atacado", desc: "Simulação ativa.", active: true }
    ],
    assistantMessage: `💡 [Modo Offline] Simulação para ${targetLocation}. Configure a GEMINI_API_KEY no Render.`
  };
}

// Rota da API
app.post("/api/check-list", async (req, res) => {
  const { listText, location } = req.body;
  const targetLocation = location || "Baixada Fluminense";

  try {
    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) return res.json(getLocalFallback(listText, targetLocation));

    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: { headers: { "User-Agent": "render-build" } },
    });

    const prompt = `Analise a lista: ${listText}. Localização: ${targetLocation}. Responda apenas em JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (err) {
    return res.json(getLocalFallback(listText, targetLocation));
  }
});

// Servir arquivos estáticos da pasta 'dist'
// Se o build gerar 'dist/dist', tentamos buscar nela também
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'dist', 'dist')));

app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  const doubleIndexPath = path.join(__dirname, 'dist', 'dist', 'index.html');
  
  // Verifica qual caminho é válido
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(doubleIndexPath);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`PechinchaBot rodando na porta ${PORT}`);
});
