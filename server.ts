import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

function getLocalFallback(listText: string, location?: string) {
  const lines = listText.split("\n").map(l => l.trim()).filter(Boolean);
  const items: any[] = [];
  const targetLocation = location || "Baixada Fluminense (Duque de Caxias, Meriti, etc.)";
  
  interface BulkProductConfig {
    name: string;
    unitPriceTrad: number;
    unitPriceWholesale: number;
    qtyLabel: string;
    bulkConfig?: {
      bulkQty: number;
      bulkName: string;
      bulkPriceTrad: number;
      bulkPriceWholesale: number;
    };
  }

  const priceMap: { [key: string]: BulkProductConfig } = {
    arroz: { 
      name: "Arroz Agulhinha 1kg", 
      unitPriceTrad: 6.90, 
      unitPriceWholesale: 5.70, 
      qtyLabel: "kg",
      bulkConfig: {
        bulkQty: 5,
        bulkName: "Arroz Agulhinha 5kg",
        bulkPriceTrad: 29.90,
        bulkPriceWholesale: 24.50
      }
    },
    feijao: { name: "Feijão Preto 1kg", unitPriceTrad: 8.90, unitPriceWholesale: 6.99, qtyLabel: "kg" },
    feijão: { name: "Feijão Preto 1kg", unitPriceTrad: 8.90, unitPriceWholesale: 6.99, qtyLabel: "kg" },
    frango: { name: "Peito de Frango 1kg", unitPriceTrad: 21.90, unitPriceWholesale: 17.80, qtyLabel: "kg" },
    peito: { name: "Peito de Frango 1kg", unitPriceTrad: 21.90, unitPriceWholesale: 17.80, qtyLabel: "kg" },
    oleo: { 
      name: "Óleo de Soja 900ml", 
      unitPriceTrad: 7.90, 
      unitPriceWholesale: 6.20, 
      qtyLabel: "un",
      bulkConfig: {
        bulkQty: 6,
        bulkName: "Fardo Óleo de Soja (6 un)",
        bulkPriceTrad: 45.00,
        bulkPriceWholesale: 34.80
      }
    },
    óleo: { 
      name: "Óleo de Soja 900ml", 
      unitPriceTrad: 7.90, 
      unitPriceWholesale: 6.20, 
      qtyLabel: "un",
      bulkConfig: {
        bulkQty: 6,
        bulkName: "Fardo Óleo de Soja (6 un)",
        bulkPriceTrad: 45.00,
        bulkPriceWholesale: 34.80
      }
    },
    leite: { 
      name: "Leite Integral 1L", 
      unitPriceTrad: 5.99, 
      unitPriceWholesale: 4.85, 
      qtyLabel: "L",
      bulkConfig: {
        bulkQty: 12,
        bulkName: "Caixa de Leite Integral (12L)",
        bulkPriceTrad: 68.00,
        bulkPriceWholesale: 54.00
      }
    },
    macarrao: { name: "Macarrão Espaguete 500g", unitPriceTrad: 5.47, unitPriceWholesale: 4.63, qtyLabel: "un" },
    macarrão: { name: "Macarrão Espaguete 500g", unitPriceTrad: 5.47, unitPriceWholesale: 4.63, qtyLabel: "un" },
    espaguete: { name: "Macarrão Espaguete 500g", unitPriceTrad: 5.47, unitPriceWholesale: 4.63, qtyLabel: "un" },
    acucar: { name: "Açúcar Refinado 1kg", unitPriceTrad: 4.80, unitPriceWholesale: 3.90, qtyLabel: "kg" },
    açúcar: { name: "Açúcar Refinado 1kg", unitPriceTrad: 4.80, unitPriceWholesale: 3.90, qtyLabel: "kg" },
    batata: { name: "Batata Doce 1kg", unitPriceTrad: 6.00, unitPriceWholesale: 4.25, qtyLabel: "kg" },
    azeite: { name: "Azeite de Oliva 500ml", unitPriceTrad: 34.90, unitPriceWholesale: 29.90, qtyLabel: "un" },
    carne: { name: "Patinho Moído 1kg", unitPriceTrad: 38.90, unitPriceWholesale: 31.90, qtyLabel: "kg" },
    pato: { name: "Patinho Moído 1kg", unitPriceTrad: 38.90, unitPriceWholesale: 31.90, qtyLabel: "kg" },
    patinho: { name: "Patinho Moído 1kg", unitPriceTrad: 38.90, unitPriceWholesale: 31.90, qtyLabel: "kg" },
    brocolis: { name: "Brócolis Congelado", unitPriceTrad: 12.00, unitPriceWholesale: 9.50, qtyLabel: "un" },
    brócolis: { name: "Brócolis Congelado", unitPriceTrad: 12.00, unitPriceWholesale: 9.50, qtyLabel: "un" },
    queijo: { name: "Queijo Muçarela 1kg", unitPriceTrad: 45.00, unitPriceWholesale: 38.00, qtyLabel: "kg" },
    mussarela: { name: "Queijo Muçarela 1kg", unitPriceTrad: 45.00, unitPriceWholesale: 38.00, qtyLabel: "kg" },
    muçarela: { name: "Queijo Muçarela 1kg", unitPriceTrad: 45.00, unitPriceWholesale: 38.00, qtyLabel: "kg" },
    presunto: { name: "Presunto Cozido 1kg", unitPriceTrad: 28.00, unitPriceWholesale: 22.00, qtyLabel: "kg" },
    manteiga: { name: "Manteiga 500g", unitPriceTrad: 19.90, unitPriceWholesale: 15.90, qtyLabel: "un" },
    cafe: { name: "Café a Vácuo 500g", unitPriceTrad: 18.00, unitPriceWholesale: 14.50, qtyLabel: "un" },
    café: { name: "Café a Vácuo 500g", unitPriceTrad: 18.00, unitPriceWholesale: 14.50, qtyLabel: "un" },
    pao: { name: "Pão de Forma", unitPriceTrad: 9.50, unitPriceWholesale: 7.80, qtyLabel: "un" },
    pão: { name: "Pão de Forma", unitPriceTrad: 9.50, unitPriceWholesale: 7.80, qtyLabel: "un" }
  };

  const locHash = targetLocation.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const multiplier = 0.88 + ((locHash % 31) / 100);

  for (const line of lines) {
    let qtyNum = 1;
    let productName = line;

    const leadingMatch = line.match(/^(\d+)\s*(?:kg|unidades|unidade|un|g|litros|l|potes|pacotes|pct|x|cx|sacos)?\s*(?:de)?\s*(.+)$/i);
    if (leadingMatch) {
      qtyNum = parseInt(leadingMatch[1]) || 1;
      productName = leadingMatch[2].trim();
    } else {
      const trailingMatch = line.match(/^(.+?)\s*(\d+)\s*(?:kg|unidades|unidade|un|g|litros|l|potes|pacotes|pct|x|cx|sacos)?\s*$/i);
      if (trailingMatch) {
        qtyNum = parseInt(trailingMatch[2]) || 1;
        productName = trailingMatch[1].trim();
      }
    }

    const lowerName = productName.toLowerCase();
    let foundKey = Object.keys(priceMap).find(key => lowerName.includes(key));
    
    let displayName = productName;
    let finalQtyLabel = "un";

    let finalTradPrice = 12.50;
    let finalWholesalePrice = 9.90;
    let qtyDescription = `${qtyNum} un`;

    if (foundKey) {
      const config = priceMap[foundKey];
      displayName = config.name;
      finalQtyLabel = config.qtyLabel;

      const unitTrad = config.unitPriceTrad * multiplier;
      const unitWholesale = config.unitPriceWholesale * multiplier;

      if (config.bulkConfig) {
        const bConf = config.bulkConfig;
        const bulkTrad = bConf.bulkPriceTrad * multiplier;
        const bulkWholesale = bConf.bulkPriceWholesale * multiplier;

        const numBulks = Math.floor(qtyNum / bConf.bulkQty);
        const remainder = qtyNum % bConf.bulkQty;

        const costWithBulk_Trad = (numBulks * bulkTrad) + (remainder * unitTrad);
        const costWithBulk_Wholesale = (numBulks * bulkWholesale) + (remainder * unitWholesale);

        const costPureUnit_Trad = qtyNum * unitTrad;
        const costPureUnit_Wholesale = qtyNum * unitWholesale;

        if (costWithBulk_Wholesale < costPureUnit_Wholesale && numBulks > 0) {
          finalTradPrice = costWithBulk_Trad;
          finalWholesalePrice = costWithBulk_Wholesale;
          displayName = `${displayName.split(" ")[0]} (${bConf.bulkName})`;
          
          if (remainder > 0) {
            qtyDescription = `${numBulks} fardo(s) de ${bConf.bulkQty}${finalQtyLabel} + ${remainder}${finalQtyLabel} avulso(s) (Mais econômico do que comprar ${qtyNum} unidades individuais)`;
          } else {
            qtyDescription = `1 fardo fechado de ${bConf.bulkQty}${finalQtyLabel} (Mais em conta do que comprar ${qtyNum} unidades avulsas)`;
          }
        } else {
          finalTradPrice = costPureUnit_Trad;
          finalWholesalePrice = costPureUnit_Wholesale;
          qtyDescription = `${qtyNum} unidade(s) individuais de 1${finalQtyLabel} (Preço unitário avulso é melhor para esta quantidade)`;
        }
      } else {
        finalTradPrice = unitTrad * qtyNum;
        finalWholesalePrice = unitWholesale * qtyNum;
        qtyDescription = `${qtyNum} ${finalQtyLabel}`;
      }
    } else {
      const hash = productName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomUnitPriceTrad = (5 + (hash % 45)) * multiplier;
      const randomUnitPriceWholesale = randomUnitPriceTrad * 0.81;

      finalTradPrice = randomUnitPriceTrad * qtyNum;
      finalWholesalePrice = randomUnitPriceWholesale * qtyNum;
      qtyDescription = `${qtyNum} un`;
    }

    items.push({
      name: displayName,
      qty: qtyDescription,
      priceTraditional: Number(finalTradPrice.toFixed(2)),
      priceWholesale: Number(finalWholesalePrice.toFixed(2))
    });
  }

  const traditionalTotal = Number(items.reduce((acc, i) => acc + i.priceTraditional, 0).toFixed(2));
  const wholesaleTotal = Number(items.reduce((acc, i) => acc + i.priceWholesale, 0).toFixed(2));
  const savingsTotal = Number(Math.max(0, traditionalTotal - wholesaleTotal).toFixed(2));

  const cleanLocName = targetLocation.split(",")[0].trim() || "Sua Região";
  const locLower = targetLocation.toLowerCase();

  let defaultLocalCenters = [];

  if (locLower.includes("meriti") || locLower.includes("coelho da rocha") || locLower.includes("vilar dos teles")) {
    defaultLocalCenters = [
      { name: "Dom Atacadista - São João de Meriti", address: "Rodovia Presidente Dutra, 3900", badge: "Dom de Economizar (Atacarejo 🌟)", desc: "Excelente setor de mercearia seca em fardo.", active: true },
      { name: "Assaí Atacadista - São João de Meriti", address: "Rua Maria José, 211", badge: "Líder Regional de fardos fechados", desc: "Excelente para compras mensais pesadas.", active: true },
      { name: "Supermercados Guanabara - São João de Meriti", address: "Rua da Matriz, 321", badge: "Varejo com preço imbatível", desc: "Referência histórica para compras no varejo.", active: false }
    ];
  } else if (locLower.includes("caxias") || locLower.includes("duque de caxias")) {
    defaultLocalCenters = [
      { name: "Assaí Atacadista - Dutra / Caxias", address: "Rodovia Washington Luiz, 2895", badge: "Preço Baixo Laticínios", desc: "Muito procurado para compras coletivas de fardos.", active: true },
      { name: "Atacadão - Duque de Caxias", address: "Rodovia Washington Luís (BR-040)", badge: "Maior fluxo de Fardos", desc: "Arroz de 5kg e óleo com cotação diferenciada.", active: true },
      { name: "Supermercados Guanabara - Caxias Laureano", address: "Av. Dr. Laureano, 900", badge: "Melhor para Mercearia", desc: "Melhores ofertas no varejo.", active: false }
    ];
  } else {
    defaultLocalCenters = [
      { name: `Assaí Atacadista - ${cleanLocName}`, address: `Avenida Principal perto do Centro`, badge: "Menor Preço em Fardos", desc: `Unidade servindo ${cleanLocName}.`, active: true },
      { name: `Atacadão - ${cleanLocName}`, address: `Rodovia de Acesso Regional`, badge: "Melhores Condições para Grandes Volumes", desc: `Líder em atacado para ${cleanLocName}.`, active: true },
      { name: `Supermercado Líder Tradicional - ${cleanLocName}`, address: `Área Central Comercial`, badge: "Melhor para Hortifrúti", desc: `Recomendável para reposição rápida.`, active: false }
    ];
  }

  return {
    items,
    suggestions: [
      {
        originalItem: items[0]?.name || "Arroz de Marca Líder",
        suggestedItem: "Marca Própria Local",
        savingEstimate: Number((savingsTotal * 0.15).toFixed(2)) || 5.40,
        explanation: `Troque o produto premium por marcas locais no Atacadão da região de ${targetLocation}.`
      },
      {
        originalItem: "Leite Unitário / Óleos",
        suggestedItem: "Caixa Fechada / Fardo",
        savingEstimate: Number((savingsTotal * 0.25).toFixed(2)) || 13.68,
        explanation: `Comprar fardos reduz o preço unitário.`
      }
    ],
    traditionalTotal,
    wholesaleTotal,
    savingsTotal,
    economyCenters: defaultLocalCenters,
    assistantMessage: `💡 [Simulação Simples: ${targetLocation}] Mostrando estimativa baseada na região de ${cleanLocName}.`
  };
}

// ==========================================
// API ROUTE
// ==========================================
app.post("/api/check-list", async (req, res) => {
  const { listText, items, location, profileOption } = req.body;
  
  let finalRawText = listText;
  if (items && Array.isArray(items) && items.length > 0) {
    finalRawText = items.map(item => `${item.qty} de ${item.name}`).join("\n");
  }

  if (!finalRawText || typeof finalRawText !== "string") {
    return res.status(400).json({ error: "Por favor, envie uma lista válida." });
  }

  const targetLocation = location && typeof location === "string" && location.trim() 
    ? location.trim() 
    : "Baixada Fluminense";

  const profile = profileOption === "confeitaria" ? "confeitaria" : "domestico";
  const profilePromptAddendum = profile === "confeitaria" 
    ? "\nPERFIL DO USUÁRIO: EMPREENDEDOR / CONFEITARIA."
    : "\nPERFIL DO USUÁRIO: USO DOMÉSTICO / ALIMENTAÇÃO DA FAMÍLIA.";

  try {
    const activeApiKey = process.env.GEMINI_API_KEY;
    if (!activeApiKey) {
      const fallbackObj = getLocalFallback(finalRawText, targetLocation);
      return res.json(fallbackObj);
    }

    const ai = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const prompt = `Analise a lista comparando mercados tradicionais vs atacadões em: ${targetLocation}. Siga o formato de JSON especificado. ${profilePromptAddendum}\n\nLista:\n"""\n${finalRawText}\n"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `Você é o assistente "Carrinho Inteligente" focado em economia e embalagens de fardo na região informada. Responda apenas em JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  qty: { type: Type.STRING },
                  priceTraditional: { type: Type.NUMBER },
                  priceWholesale: { type: Type.NUMBER }
                },
                required: ["name", "qty", "priceTraditional", "priceWholesale"],
              },
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalItem: { type: Type.STRING },
                  suggestedItem: { type: Type.STRING },
                  savingEstimate: { type: Type.NUMBER },
                  explanation: { type: Type.STRING }
                },
                required: ["originalItem", "suggestedItem", "savingEstimate", "explanation"],
              },
            },
            traditionalTotal: { type: Type.NUMBER },
            wholesaleTotal: { type: Type.NUMBER },
            savingsTotal: { type: Type.NUMBER },
            assistantMessage: { type: Type.STRING },
            economyCenters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  address: { type: Type.STRING },
                  badge: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  active: { type: Type.BOOLEAN }
                },
                required: ["name", "address", "badge", "desc", "active"]
              }
            }
          },
          required: ["items", "suggestions", "traditionalTotal", "wholesaleTotal", "savingsTotal", "assistantMessage", "economyCenters"],
        },
      },
    });

    const responseText = response.text || "{}";
    let cleanText = responseText.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/i, '');
    const resultObj = JSON.parse(cleanText);
    return res.json(resultObj);
    
  } catch (err: any) {
    console.error("Erro no endpoint:", err);
    const fallbackObj = getLocalFallback(finalRawText, targetLocation);
    fallbackObj.assistantMessage = `⚠️ [Aviso de IA] Houve um problema na nuvem: ${err.message}. Ativando modo offline.`;
    return res.json(fallbackObj);
  }
});

// ==========================================
// CONFIGURAÇÃO DE AMBIENTE (LOCAL VS VERCEL)
// ==========================================

// Se NÃO estivermos na Vercel (Produção), ele usa uma importação dinâmica para não quebrar a nuvem
if (process.env.NODE_ENV !== "production") {
  // O "import" dinâmico só acorda o Vite quando você testa no seu computador
  import("vite").then(async ({ createServer: createViteServer }) => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.listen(3000, "0.0.0.0", () => {
      console.log("Servidor de desenvolvimento rodando na porta 3000");
    });
  }).catch(err => console.error("Erro ao iniciar ambiente de dev:", err));
}

// A Vercel vai usar apenas esta linha para gerenciar o seu aplicativo
module.exports = app;
