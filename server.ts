import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

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
      bulkQty: number; // e.g. 5 for arroz 5kg or 12 for milk crate
      bulkName: string; // e.g. "Arroz Agulhinha 5kg" or "Caixa Leite Integral (12L)"
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

    // Smart double-sided matcher: leading vs trailing
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

        // Fiel comparison: show what is cheaper
        if (costWithBulk_Wholesale < costPureUnit_Wholesale && numBulks > 0) {
          finalTradPrice = costWithBulk_Trad;
          finalWholesalePrice = costWithBulk_Wholesale;
          // Change display name to reflect optimal bulk choice
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

  // Comprehensive Brazilian geographical intelligence fallback system
  const cleanLocName = targetLocation.split(",")[0].trim() || "Sua Região";
  const locLower = targetLocation.toLowerCase();

  let defaultLocalCenters = [];

  if (locLower.includes("meriti") || locLower.includes("coelho da rocha") || locLower.includes("vilar dos teles")) {
    defaultLocalCenters = [
      {
        name: "Dom Atacadista - São João de Meriti",
        address: "Rodovia Presidente Dutra, 3900 - Coelho da Rocha, São João de Meriti - RJ, 25550-000",
        badge: "Dom de Economizar (Atacarejo 🌟)",
        desc: "Excelente setor de mercearia seca em fardo, frios em peça e hortifrúti fresco nas quartas-feiras.",
        active: true
      },
      {
        name: "Assaí Atacadista - São João de Meriti",
        address: "Rua Maria José, 211 - Centro, São João de Meriti - RJ, 25520-020",
        badge: "Líder Regional de fardos fechados",
        desc: "Excelente para compras mensais familiares pesadas, onde fardos fechados de leite Integral e óleo possuem descontos superiores de até 15%.",
        active: true
      },
      {
        name: "Supermercados Guanabara - São João de Meriti",
        address: "Rua da Matriz, 321 - Centro, São João de Meriti - RJ, 25520-210",
        badge: "Varejo com preço imbatível",
        desc: "Referência histórica regional de filas e preços baixos para compras pequenas no varejo do dia a dia.",
        active: false
      }
    ];
  } else if (locLower.includes("caxias") || locLower.includes("duque de caxias") || locLower.includes("redutor")) {
    defaultLocalCenters = [
      {
        name: "Assaí Atacadista - Dutra / Caxias",
        address: "Rodovia Washington Luiz, 2895 - Parque Beira Mar, Duque de Caxias - RJ, 25085-009",
        badge: "Preço Baixo Laticínios / Carnes",
        desc: "Muito procurado por famílias de toda a Baixada Fluminense para compras coletivas de fardos e caixas organizadoras.",
        active: true
      },
      {
        name: "Atacadão - Duque de Caxias (Rio-Magé)",
        address: "Rodovia Washington Luís (BR-040), s/n - Chácaras Rio-Petrópolis, Duque de Caxias - RJ, 25213-005",
        badge: "Maior fluxo de Fardos de Grãos",
        desc: "Arroz de 5kg, óleo fardo de 6un e caixas de leite possuem cotação direta diferenciada.",
        active: true
      },
      {
        name: "Supermercados Guanabara - Caxias Laureano",
        address: "Av. Dr. Laureano, 900 - Dr. Laureano, Duque de Caxias - RJ, 25060-191",
        badge: "Melhor para Mercearia e Bebidas",
        desc: "As melhores ofertas no varejo com ampla estrutura para pequenos carrinhos sem necessidade de quantidade mínima.",
        active: false
      }
    ];
  } else if (locLower.includes("niteroi") || locLower.includes("niterói") || locLower.includes("icaraí") || locLower.includes("fonseca") || locLower.includes("gonçalo")) {
    defaultLocalCenters = [
      {
        name: "Assaí Atacadista - Niterói Barreto",
        address: "Rua Benjamin Constant, 126 - Barreto, Niterói - RJ, 24110-004",
        badge: "Fardos & Atacado Estacionável",
        desc: "Opções excelentes de caixas institucionais fechadas de óleo de soja e fardo de leite.",
        active: true
      },
      {
        name: "Supermercados Guanabara - Niterói Centro",
        address: "Av. Marquês do Paraná, 335 - Centro, Niterói - RJ, 24030-215",
        badge: "Fenômeno de Vendas e Preço Baixo",
        desc: "As promoções de aniversário e ofertas diárias de sabão em pó, óleos e café moído são imbatíveis de verdade.",
        active: false
      },
      {
        name: "Atacadão - São Gonçalo",
        address: "Rodovia BR-101, s/n - Gradim, São Gonçalo - RJ, 24650-000",
        badge: "Menor Margem em Mercearia",
        desc: "Grande atacadista para compras massivas de fardos fechados ou caixas fechadas de conserva e grãos.",
        active: true
      }
    ];
  } else if (locLower.includes("sp") || locLower.includes("são paulo") || locLower.includes("sao paulo") || locLower.includes("paulista") || locLower.includes("guarulhos") || locLower.includes("campinas")) {
    defaultLocalCenters = [
      {
        name: "Atacadão - Vila Maria SP",
        address: "Av. Morvan Dias de Figueiredo, 6157 - Vila Maria, São Paulo - SP, 02170-000",
        badge: "Atacado Oficial de Margens Mínimas",
        desc: "Ideal para economizar de forma garantida nas compras de caixas de leite, arroz 5kg e produtos de limpeza concentrados.",
        active: true
      },
      {
        name: "Assaí Atacadista - Barra Funda SP",
        address: "Av. Marquês de São Vicente, 1500 - Várzea da Barra Funda, São Paulo - SP, 01139-002",
        badge: "Abastecimento Central em Fardos",
        desc: "A melhor escolha logística para reabastecimento de produtos em grande quantidade para moradores e pequenos empreendedores.",
        active: true
      },
      {
        name: "Sonda Supermercados - Vila Romana SP",
        address: "Rua Caio Graco, 549 - Vila Romana, São Paulo - SP, 05044-000",
        badge: "Melhor Hortifrúti e Rotisseria",
        desc: "Opção prática e confortável para compras diárias frescas e itens de reposição sem quantidade mínima.",
        active: false
      }
    ];
  } else if (locLower.includes("mg") || locLower.includes("belo horizonte") || locLower.includes("bh") || locLower.includes("contagem") || locLower.includes("betim") || locLower.includes("minas")) {
    defaultLocalCenters = [
      {
        name: "Villefort Atacadão - BH Cristiano Machado",
        address: "Av. Cristiano Machado, 9900 - Planalto, Belo Horizonte - MG, 31730-790",
        badge: "Atacarejo Mineiro Tradicional",
        desc: "Preço excelente em laticínios regionais, queijos, requeijão de fardo e produtos de limpeza corporativos.",
        active: true
      },
      {
        name: "Mart Minas - Conexão Contagem",
        address: "Via Expressa de Contagem, 2900 - Cinco, Contagem - MG, 32010-090",
        badge: "Líder regional em grandes fardos",
        desc: "Os melhores fardos de grãos fáceis de carregar e excelente oferta de óleo fardo com 6 unidades.",
        active: true
      },
      {
        name: "Supermercados BH - Lourdes",
        address: "Rua Curitiba, 2000 - Lourdes, Belo Horizonte - MG, 30170-122",
        badge: "Melhor para Hortifrúti e Diários",
        desc: "Excelente rede local com cobertura incrível em todos os cantos de Minas. Praticidade absoluta de varejo local.",
        active: false
      }
    ];
  } else if (locLower.includes("pr") || locLower.includes("sc") || locLower.includes("rs") || locLower.includes("porto alegre") || locLower.includes("curitiba") || locLower.includes("sul")) {
    defaultLocalCenters = [
      {
        name: "Zaffari - Bourbon Assis Brasil",
        address: "Av. Assis Brasil, 164 - Passo d'Areia, Porto Alegre - RS, 91010-000",
        badge: "Qualidade de Atendimento Premium",
        desc: "A melhor rede tradicional para compra de produtos selecionados, frios fatiados frescos e padaria de excelência.",
        active: false
      },
      {
        name: "Muffato Max Atacado - Curitiba Pinheirinho",
        address: "Rua Lothário Boutin, 451 - Pinheirinho, Curitiba - PR, 81110-022",
        badge: "Líder em Atacarejo no Paraná",
        desc: "Muito procurado para economizar comprando fardos de arroz 5kg, açúcar e enlatados por atacado.",
        active: true
      },
      {
        name: "Fort Atacadista - São José",
        address: "Rodovia BR-101, Km 202 - Barreiros, São José - SC, 88117-000",
        badge: "Líder de Preço no Atacado",
        desc: "Ótima economia de fardo em toda a região metropolitana. Perfeito para manter a dispensa cheia por semanas.",
        active: true
      }
    ];
  } else if (locLower.includes("ne") || locLower.includes("nordeste") || locLower.includes("pe") || locLower.includes("ba") || locLower.includes("ce") || locLower.includes("recife") || locLower.includes("salvador") || locLower.includes("fortaleza") || locLower.includes("bahia") || locLower.includes("pernambuco")) {
    defaultLocalCenters = [
      {
        name: "Novo Atacarejo - Recife Caxangá",
        address: "Av. Caxangá, 3400 - Caxangá, Recife - PE, 50731-000",
        badge: "Mais Próximo de Você em Recife",
        desc: "Preços excelentes em cereais secos, temperos regionais e fardos de leite integral.",
        active: true
      },
      {
        name: "Mercantil Rodrigues - Salvador Calçada",
        address: "Av. Jequitaia, 411 - Calçada, Salvador - BA, 40411-120",
        badge: "O Gigante dos Fardos",
        desc: "Ótimos descontos progressivos comprando a partir de 3 unidades do mesmo produto na sua farta mercearia.",
        active: true
      },
      {
        name: "G.Barbosa - Salvador Costa Azul",
        address: "Rua Arthur de Azevêdo Machado, 344 - Costa Azul, Salvador - BA, 41760-000",
        badge: "Especialista em Higiene e Varejo",
        desc: "A rede tradicional mais famosa para compras frescas da semana, frutas e reposição rápida de frios.",
        active: false
      }
    ];
  } else {
    // Elegant universal fallback based on the detected Brazilian city name
    defaultLocalCenters = [
      {
        name: `Assaí Atacadista - ${cleanLocName}`,
        address: `Avenida Principal de Acesso perto do Centro de ${cleanLocName}`,
        badge: "Menor Preço em Fardos Fechados (Atacarejo)",
        desc: `Unidade principal da rede Assaí servindo ${cleanLocName}. Compre arroz no fardo de 5kg e caixas de leite para economizar até 20%.`,
        active: true
      },
      {
        name: `Atacadão - ${cleanLocName}`,
        address: `Rodovia de Acesso Regional, saída para ${cleanLocName}`,
        badge: "Melhores Condições para Grandes Volumes",
        desc: `Líder nacional em atacado de grãos secos, óleos, produtos em conserva e mercearia básica para ${cleanLocName}.`,
        active: true
      },
      {
        name: `Supermercado Líder Tradicional - ${cleanLocName}`,
        address: `Área Central Comercial, ${cleanLocName}`,
        badge: "Melhor para Hortifrúti e Diários (Varejo)",
        desc: `Parceiro recomendável para reposição diária rápida de frios fatiados e verduras frescas sem fila.`,
        active: false
      }
    ];
  }

  return {
    items,
    suggestions: [
      {
        originalItem: items[0]?.name || "Arroz de Marca Líder",
        suggestedItem: "Marca Própria Local",
        savingEstimate: Number((savingsTotal * 0.15).toFixed(2)) || 5.40,
        explanation: `Troque o produto premium por marcas próprias locais ou faça compras coletivas/pesadas no Atacadão ou Assaí da região de ${targetLocation} para maximizar sua economia.`
      },
      {
        originalItem: "Leite Unitário / Óleos",
        suggestedItem: "Caixa Fechada / Fardo de Atacado",
        savingEstimate: Number((savingsTotal * 0.25).toFixed(2)) || 13.68,
        explanation: `Comprar fardos fechados ou caixas institucionais em atacadistas em ${targetLocation} reduz bastante o preço unitário e economiza tempo e custos de deslocamento.`
      }
    ],
    traditionalTotal,
    wholesaleTotal,
    savingsTotal,
    economyCenters: defaultLocalCenters,
    assistantMessage: `💡 [Simulação Simples: ${targetLocation}] Mostrando estimativa baseada nos atacadistas e redes locais detectados no seu bairro de ${cleanLocName}. Para garantir inteligência completa via IA com as melhores marcas, garanta uma chave GEMINI_API_KEY configurada!`
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route
  app.post("/api/check-list", async (req, res) => {
    const { listText, items, location, profileOption } = req.body;
    
    // Support utilizing structured editable items directly from the spreadsheet table to optimize
    let finalRawText = listText;
    if (items && Array.isArray(items) && items.length > 0) {
      finalRawText = items.map(item => `${item.qty} de ${item.name}`).join("\n");
    }

    if (!finalRawText || typeof finalRawText !== "string") {
      return res.status(400).json({ error: "Por favor, envie uma lista de compras ou itens válidos." });
    }

    const targetLocation = location && typeof location === "string" && location.trim() 
      ? location.trim() 
      : "Baixada Fluminense (Duque de Caxias, São João de Meriti e arredores)";

    const profile = profileOption === "confeitaria" ? "confeitaria" : "domestico";
    const profilePromptAddendum = profile === "confeitaria" 
      ? "\nPERFIL DO USUÁRIO: EMPREENDEDOR / CONFEITARIA / PEQUENOS NEGÓCIOS / MARMITAS COMERCIAIS. Dê atenção especial a insumos em grande quantidade, açúcar refinado em fardos, caixas de leite condensado, caixas de creme de leite de marcas conhecidas, trigo de 5kg ou fardo, óleo em caixas, ovos em cartelas comerciais de 30 e embalagens descartáveis. Calcule as embalagens ideais para maximizar as margens do microempreendedor local."
      : "\nPERFIL DO USUÁRIO: USO DOMÉSTICO / ALIMENTAÇÃO DA FAMÍLIA. Foque em embalagens normais de supermercado, pequenas compras familiares e fardos médios adequados para o consumo da casa ou preparação de marmitas de treino individuais.";

    try {
      const activeApiKey = process.env.GEMINI_API_KEY;
      if (!activeApiKey) {
        // Fallback safely to simulator so the app never fails or throws 500
        const fallbackObj = getLocalFallback(finalRawText, targetLocation);
        return res.json(fallbackObj);
      }

      // Lazy initialize the SDK client per request to stay completely fresh
      const ai = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Analise a seguinte lista de compras e forneça estimativas de preços realistas comparando supermercados tradicionais locais (ex: Guanabara, Zona Sul, Pão de Açúcar, Zaffari, Sonda, Muffato, dependendo da região) vs atacadões locais da região (ex: Assaí, Atacadão, Dom Atacadista, Roldão, Sam's Club) especificamente na localização física real de: ${targetLocation}. 
Siga restritamente o formato de JSON especificado.
${profilePromptAddendum}

DIRETRIZ DE CÁLCULO FIEL DE EMBALAGENS E PREÇOS:
1. Sempre verifique a quantidade solicitada do produto e selecione a embalagem ou combinação de fardos mais em conta do mercado.
2. Exemplo de Arroz:
   - Se o usuário pedir "5 kg", compare a unidade fechada de 5kg (ex: R$ 24,50 no atacado) versus 5 pacotes individuais de 1kg (ex: 5 x R$ 5,70 = R$ 28,50). Exiba sempre a opção mais barata (a embalagem de 5kg se for o caso) em "priceTraditional" e "priceWholesale", e justifique.
   - Se pedir "1 kg", mostre a embalagem unitária de 1kg.
3. Exemplo de Leite ou Óleo:
   - Se o usuário pedir grandes quantidades (ex: "12 litros", "12 unidades", "6 unidades"), monte a comparação de preço de fardos fechados ou caixas institucionais versus unidades avulsas. Mostre a opção que der menor preço final.
4. O campo "qty" de retorno para cada item no JSON deve ser muito explicativo sobre a embalagem adotada por economia (ex: "1 fardo de 5kg (Mais em conta que 5x 1kg)", ou "1 caixa de 12 unidades (Mais em conta que avulsos)", ou "2 unidade(s) de 1kg").

Além do comparativo de preços e das sugestões de economia tradicionais, identifique com precisão geográfica EXCELENTES OPÇÕES CERTEIRAS de mercados locais físicos na região de "${targetLocation}" (pesquise e cite 3 redes ou lojas exatas e reais de supermercados e atacadistas que existam fisicamente nesse local, informando nomes reais, diferenciais reais, endereços ou avenidas de referência locais reais e o tipo correto de mercado: atacadão versus supermercado tradicional).

Sua mensagem final "assistantMessage" deve ser muito amigável, motivadora e engraçada para quem mora em ${targetLocation} comentando sobre os desafios econômicos reais, mencionando nomes de bairros locais, feiras livres famosas ou marcos fáceis de reconhecer.

Lista de compras do usuário para otimizar:
"""
${finalRawText}
"""`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `Você é o "Carrinho Inteligente" (ou PechinchaBot), um assistente financeiro de elite focado em economizar nas compras de supermercado para qualquer região do Brasil informada. Seu compromisso número um é calcular os preços fielmente e guiar o usuário em direção à otimização inteligente de tamanhos e fardos (ex: sugerir 1 fardo de 5kg de arroz ou 1 caixa de 12 unidades de leite sempre que forem mais em conta do que comprar embalagens de 1kg ou unidades avulsas). Responda sempre em português do Brasil e mencione redes de supermercados, comércios populares, feiras livres ou locais de compra reais de verdade compatíveis com a localização do usuário: ${targetLocation} (ex: mencionar Carrefour, Pão de Açúcar, Assaí e Roldão se for São Paulo; Guanabara, Mundial, Assaí, Atacadão se for Rio/Baixada, etc.). ${profilePromptAddendum}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                description: "Lista de itens analisados e seus preços aproximados nos dois ambientes de compra.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Nome do produto/item" },
                    qty: { type: Type.STRING, description: "Quantidade estimada ou informada (ex: '1 kg', '2 unidades', '500g')" },
                    priceTraditional: { type: Type.NUMBER, description: "Preço médio estimado em supermercado tradicional em BRL (número)" },
                    priceWholesale: { type: Type.NUMBER, description: "Preço médio estimado em atacadão em BRL (número)" },
                  },
                  required: ["name", "qty", "priceTraditional", "priceWholesale"],
                },
              },
              suggestions: {
                type: Type.ARRAY,
                description: "Exatamente duas recomendações ou trocas inteligentes de marcas ou volumes para otimizar custo.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalItem: { type: Type.STRING, description: "Produto original ou categoria que motivou a troca." },
                    suggestedItem: { type: Type.STRING, description: "A substituição ou alteração sugerida." },
                    savingEstimate: { type: Type.NUMBER, description: "Valor de economia aproximado em Reais (BRL)." },
                    explanation: { type: Type.STRING, description: "Explicação ou justificativa prática e engajadora." },
                  },
                  required: ["originalItem", "suggestedItem", "savingEstimate", "explanation"],
                },
              },
              traditionalTotal: { type: Type.NUMBER, description: "Soma de todos os preços no mercado tradicional em BRL" },
              wholesaleTotal: { type: Type.NUMBER, description: "Soma de todos os preços no atacadão em BRL" },
              savingsTotal: { type: Type.NUMBER, description: "Economia total estimada (traditionalTotal - wholesaleTotal) em BRL" },
              assistantMessage: { type: Type.STRING, description: `Uma mensagem bem calorosa, simpática, do assistente para o morador de ${targetLocation}. Deve conter referências divertidas e reais às feiras e mercados regionais desse local estimulando economizar.` },
              economyCenters: {
                type: Type.ARRAY,
                description: "Exatamente três redes ou lojas específicas, famosas e reais de supermercados e atacadões localizados de verdade de forma física bem perto ou na região de preço.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Nome real e exato da unidade ou rede de mercado (ex: 'Supermercados Guanabara - Centro', 'Atacadão - Dutra')" },
                    address: { type: Type.STRING, description: "Endereço aproximado ou avenida de referência real aplicável física" },
                    badge: { type: Type.STRING, description: "Vantagem principal com marketing expressivo (ex: 'Imperdível de Terça-feira', 'Atacado de Laticínios')" },
                    desc: { type: Type.STRING, description: "Fatos reais do estabelecimento, melhores produtos ou se vale comprar em fardo lá." },
                    active: { type: Type.BOOLEAN, description: "True se for estabelecimento de Atacarejo/Atacado comercial, False se for Supermercado varejo tradicional." }
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
      
      // Limpeza robusta de Markdown para evitar quebra de leitura do JSON
      let cleanText = responseText.trim();
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/i, '');
      
      const resultObj = JSON.parse(cleanText);
      return res.json(resultObj);
    } catch (err: any) {
      console.error("Erro no endpoint /api/check-list:", err);
      try {
        const fallbackObj = getLocalFallback(finalRawText, targetLocation);
        fallbackObj.assistantMessage = `⚠️ [Aviso: Falha temporária da IA] Houve um problema ao conectar com o Gemini (${err.message}). Exibindo estimativa offline baseada na localização ${targetLocation} para manter seu planejamento ativo!`;
        return res.json(fallbackObj);
      } catch (fallbackErr) {
        return res.status(500).json({ error: "Erro crítico ao processar sua lista de compras." });
      }
    }
  });

  // Serve static UI assets or let Vite middleware handle dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
