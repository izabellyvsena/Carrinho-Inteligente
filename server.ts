import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const __dirname = path.resolve();
const app = express();
app.use(express.json());

// Função de fallback para simulação offline com a estrutura idêntica que o frontend espera
function getLocalFallback(listText: string, location?: string) {
  const targetLocation = location || "Baixada Fluminense";
  return {
    items: [
      { name: "Peito de Frango (Simulação)", qty: "1 kg", priceTraditional: 22.0, priceWholesale: 18.0 },
      { name: "Arroz Agulhinha (Simulação)", qty: "5 kg", priceTraditional: 30.0, priceWholesale: 24.5 }
    ],
    suggestions: [
      { originalItem: "Item Padrão", suggestedItem: "Item Atacado", savingEstimate: 9.5, explanation: "Compre em fardos para economizar." }
    ],
    traditionalTotal: 52.0,
    wholesaleTotal: 42.5,
    savingsTotal: 9.5,
    economyCenters: [
      { name: "Assaí Atacadista", address: "Consulte o mapa local", badge: "Atacado", desc: "Modo de segurança ativo.", active: true }
    ],
    assistantMessage: `💡 [Modo Offline] Usando dados locais para ${targetLocation}.`
  };
}

// Rota da API corrigida para usar a Groq
app.post("/api/check-list", async (req, res) => {
  const { listText, location } = req.body;
  const targetLocation = location || "Baixada Fluminense";
  const activeApiKey = process.env.GROQ_API_KEY;

  try {
    if (!activeApiKey) {
      throw new Error("A variável GROQ_API_KEY não foi encontrada.");
    }

    // Inicializa o cliente da Groq
    const groq = new Groq({ apiKey: activeApiKey });

    const prompt = `
      Você é o PechinchaBot. Analise esta lista de compras: "${listText}". 
      Considere a localização do usuário: "${targetLocation}".
      Retorne obrigatoriamente um objeto JSON válido com a seguinte estrutura:
      {
        "items": [
          { "name": "Nome do item", "qty": "quantidade", "priceTraditional": 10.0, "priceWholesale": 8.0 }
        ],
        "suggestions": [
          { "originalItem": "nome", "suggestedItem": "nome sugerido", "savingEstimate": 2.0, "explanation": "motivo" }
        ],
        "traditionalTotal": 10.0,
        "wholesaleTotal": 8.0,
        "savingsTotal": 2.0,
        "assistantMessage": "Sua mensagem de resumo aqui."
      }
    `;
    
    // Chamada ao modelo Llama 3 da Meta
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" } // Garante que a resposta venha estritamente como JSON estruturado
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const jsonResult = JSON.parse(responseText.trim());
    
    return res.json(jsonResult);
    
  } catch (err: any) {
    console.error("--- ERRO NA API GROQ ---");
    console.error(err.message);
    return res.json(getLocalFallback(listText, targetLocation));
  }
});

// Servir arquivos estáticos (Frontend React)
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Porta dinâmica para o Render
const PORT = process.env.PORT || 10000;
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Servidor rodando com Groq na porta ${PORT}`);
});
