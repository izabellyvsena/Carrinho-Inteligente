/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedCounter } from "./components/AnimatedCounter";
import { 
  ShoppingBag, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp,
  Store, 
  RefreshCw,
  MapPin,
  Flame,
  UtensilsCrossed,
  DollarSign,
  Calendar,
  Save,
  BarChart3,
  History,
  ArchiveRestore,
  Sparkle,
  ShieldCheck,
  HelpCircle,
  X,
  Star,
  Sun,
  Moon
} from "lucide-react";

interface Item {
  name: string;
  qty: string;
  priceTraditional: number;
  priceWholesale: number;
}

interface Suggestion {
  originalItem: string;
  suggestedItem: string;
  savingEstimate: number;
  explanation: string;
}

interface AnalyseResult {
  items: Item[];
  suggestions: Suggestion[];
  traditionalTotal: number;
  wholesaleTotal: number;
  savingsTotal: number;
  assistantMessage: string;
  economyCenters?: EconomyCenter[];
}

interface EconomyCenter {
  name: string;
  address: string;
  badge: string;
  desc: string;
  active: boolean;
}

function getEconomyCenters(locationStr: string): EconomyCenter[] {
  const loc = (locationStr || "").toLowerCase();
  const cleanLocName = locationStr.split(",")[0].trim() || "Sua Região";
  
  if (loc.includes("meriti") || loc.includes("coelho da rocha") || loc.includes("vilar dos teles")) {
    return [
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
  } else if (loc.includes("caxias") || loc.includes("duque de caxias") || loc.includes("redutor")) {
    return [
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
  } else if (loc.includes("niteroi") || loc.includes("niterói") || loc.includes("icaraí") || loc.includes("fonseca") || loc.includes("gonçalo")) {
    return [
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
  } else if (loc.includes("sp") || loc.includes("são paulo") || loc.includes("sao paulo") || loc.includes("paulista") || loc.includes("guarulhos") || loc.includes("campinas")) {
    return [
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
  } else if (loc.includes("mg") || loc.includes("belo horizonte") || loc.includes("bh") || loc.includes("contagem") || loc.includes("betim") || loc.includes("minas")) {
    return [
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
  } else if (loc.includes("pr") || loc.includes("sc") || loc.includes("rs") || loc.includes("porto alegre") || loc.includes("curitiba") || loc.includes("sul")) {
    return [
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
  } else if (loc.includes("ne") || loc.includes("nordeste") || loc.includes("pe") || loc.includes("ba") || loc.includes("ce") || loc.includes("recife") || loc.includes("salvador") || loc.includes("fortaleza") || loc.includes("bahia") || loc.includes("pernambuco")) {
    return [
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
    return [
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
}

interface SavedList {
  id: string;
  name: string;
  date: string;
  items: Item[];
  traditionalTotal: number;
  wholesaleTotal: number;
  savingsTotal: number;
}

const DEFAULT_RESULT: AnalyseResult = {
  items: [],
  suggestions: [],
  traditionalTotal: 0,
  wholesaleTotal: 0,
  savingsTotal: 0,
  assistantMessage: "Olá! Digite ou insira sua lista de compras no painel ao lado e clique em 'Calcular Economia com IA !' para ver a mágica ocorrer."
};

const SAMPLE_LISTS = [
  {
    title: "Marmitas Fitness Semanal",
    subtitle: "Rica em proteínas",
    icon: "🍗",
    text: "4kg Peito de Frango\n2kg de Arroz Integral\n1kg de Patinho Moído\n3kg de Batata Doce\n2 unidades de Azeite de Oliva\n1 fardo de Brócolis Congelado"
  },
  {
    title: "Básico Mensal Familiar",
    subtitle: "Alimentos não perecíveis",
    icon: "📦",
    text: "2 unidades de Arroz de 5kg\n5 pacotes de Feijão Preto 1kg\n4 unidades de Óleo de Soja\n12 caixas de Leite Integral\n4 pacotes de Macarrão Espaguete\n2 kg de Açúcar Refinado"
  },
  {
    title: "Café da Manhã & Lanches",
    subtitle: "Rápido e prático",
    icon: "☕",
    text: "12 caixas de Leite Integral\n2 potes de Manteiga 500g\n2 pacotes de Café a vácuo 500g\n4 pacotes de Pão de Forma\n2kg de Queijo Muçarela\n1kg de Presunto Cozido"
  }
];

export default function App() {
  const [listInput, setListInput] = useState<string>("");
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("carrinho_inteligente_theme");
    if (saved === "light" || saved === "dark") return saved;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("carrinho_inteligente_theme", theme);
  }, [theme]);
  
  const [userLocation, setUserLocation] = useState<string>(() => {
    return localStorage.getItem("carrinho_inteligente_user_location") || "Baixada Fluminense, RJ";
  });
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  
  const [result, setResult] = useState<AnalyseResult>(DEFAULT_RESULT);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newListName, setNewListName] = useState<string>("");
  const [focusedWeekIndex, setFocusedWeekIndex] = useState<number | null>(null);

  const [purchaseProfile, setPurchaseProfile] = useState<"domestico" | "confeitaria">("domestico");

  const [openFeedbackModal, setOpenFeedbackModal] = useState<boolean>(false);
  const [feedbackType, setFeedbackType] = useState<"feature" | "bug">("feature");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("carrinho_inteligente_onboarded") !== "true";
  });

  const handleEnterApp = (locationOverride?: string) => {
    const loc = locationOverride || userLocation;
    localStorage.setItem("carrinho_inteligente_onboarded", "true");
    localStorage.setItem("carrinho_inteligente_user_location", loc);
    setUserLocation(loc);
    setShowOnboarding(false);
  };

  const [lastSource, setLastSource] = useState<"text" | "table">("text");
  const [editableItems, setEditableItems] = useState<Item[]>(DEFAULT_RESULT.items);

  const setEditableItemsAndSync = (items: Item[]) => {
    setEditableItems(items);
    setLastSource("table");
    const textRepr = items.map(item => `${item.qty} de ${item.name}`).join("\n");
    setListInput(textRepr);
  };

  const [savedLists, setSavedLists] = useState<SavedList[]>(() => {
    const local = localStorage.getItem("carrinho_inteligente_history");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Erro ao ler do localStorage", e);
      }
    }
    return [
      {
        id: "hist-1",
        name: "Marmitas - 1ª Semana de Maio",
        date: "12/05/2026",
        items: [
          { name: "Peito de Frango", qty: "3 kg", priceTraditional: 65.70, priceWholesale: 53.40 },
          { name: "Batata Doce", qty: "2 kg", priceTraditional: 12.00, priceWholesale: 8.50 },
          { name: "Azeite de Oliva", qty: "1 un", priceTraditional: 34.90, priceWholesale: 29.90 }
        ],
        traditionalTotal: 112.60,
        wholesaleTotal: 91.80,
        savingsTotal: 20.80
      },
      {
        id: "hist-2",
        name: "Estoque Geral de Laticínios",
        date: "26/05/2026",
        items: [
          { name: "Leite Integral 1L", qty: "12 un", priceTraditional: 71.88, priceWholesale: 58.20 },
          { name: "Arroz Agulhinha 5kg", qty: "1 un", priceTraditional: 29.90, priceWholesale: 24.50 },
          { name: "Feijão Preto 1kg", qty: "2 un", priceTraditional: 17.80, priceWholesale: 13.98 }
        ],
        traditionalTotal: 119.58,
        wholesaleTotal: 96.68,
        savingsTotal: 22.90
      },
      {
        id: "hist-3",
        name: "Sacolão & Mercearia do Mês",
        date: "06/06/2026",
        items: [
          { name: "Macarrão Espaguete", qty: "4 un", priceTraditional: 21.90, priceWholesale: 18.50 },
          { name: "Óleo de Soja 900ml", qty: "3 un", priceTraditional: 23.70, priceWholesale: 18.60 },
          { name: "Peito de Frango Especial", qty: "6 kg", priceTraditional: 131.40, priceWholesale: 106.80 }
        ],
        traditionalTotal: 177.00,
        wholesaleTotal: 143.90,
        savingsTotal: 33.10
      }
    ];
  });

  useEffect(() => {
    if (result) {
      setEditableItems(result.items);
    }
  }, [result]);

  useEffect(() => {
    localStorage.setItem("carrinho_inteligente_history", JSON.stringify(savedLists));
  }, [savedLists]);

  const [favoriteMarkets, setFavoriteMarkets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("carrinho_inteligente_favorite_markets");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao ler mercados favoritos do localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("carrinho_inteligente_favorite_markets", JSON.stringify(favoriteMarkets));
  }, [favoriteMarkets]);

  const handleUpdatePrice = (index: number, field: "priceTraditional" | "priceWholesale", value: number) => {
    const updated = [...editableItems];
    const safeValue = isNaN(value) ? 0 : Math.max(0, value);
    
    updated[index] = {
      ...updated[index],
      [field]: safeValue
    };
    setEditableItemsAndSync(updated);
  };

  const handleUpdateQty = (index: number, value: string) => {
    const updated = [...editableItems];
    updated[index] = {
      ...updated[index],
      qty: value
    };
    setEditableItemsAndSync(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = editableItems.filter((_, i) => i !== index);
    setEditableItemsAndSync(updated);
    
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(35);
    }
  };

  const handleAddItem = () => {
    const newItem: Item = {
      name: "Novo Item de Compra",
      qty: "1 un",
      priceTraditional: 10.00,
      priceWholesale: 8.00
    };
    setEditableItemsAndSync([...editableItems, newItem]);
    
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(45);
    }
  };

  // CÁLCULOS BLINDADOS MATEMATICAMENTE: Quantidade x Preço Unitário
  const currentTraditionalTotal = editableItems.reduce((acc, item) => {
    const q = parseFloat(item?.qty) || 1;
    return acc + (Number(item?.priceTraditional || 0) * q);
  }, 0);

  const currentWholesaleTotal = editableItems.reduce((acc, item) => {
    const q = parseFloat(item?.qty) || 1;
    return acc + (Number(item?.priceWholesale || 0) * q);
  }, 0);

  const currentSavingsTotal = Math.max(0, currentTraditionalTotal - currentWholesaleTotal);
  const savingsPercent = currentTraditionalTotal > 0 
    ? ((currentSavingsTotal / currentTraditionalTotal) * 100).toFixed(1) 
    : "0.0";

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta geolocalização por GPS.");
      return;
    }
    setGpsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const neighborhood = address.suburb || address.neighbourhood || address.quarter || address.city_district || "";
            const city = address.city || address.town || address.municipality || address.village || address.hamlet || "";
            const state = address.state_code || address.state || "";

            const parts: string[] = [];
            if (neighborhood) parts.push(neighborhood);
            if (city && city !== neighborhood) parts.push(city);
            if (state) parts.push(state);

            const combined = parts.join(", ") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setUserLocation(combined);
            localStorage.setItem("carrinho_inteligente_user_location", combined);
            setSuccessMessage(`📍 Sua localização foi detectada via GPS: ${combined}!`);
            optimizeShoppingList(listInput, combined);
          } else {
            const coordsStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setUserLocation(coordsStr);
            localStorage.setItem("carrinho_inteligente_user_location", coordsStr);
            setSuccessMessage(`Localização detectada via coordenadas: ${coordsStr}`);
            optimizeShoppingList(listInput, coordsStr);
          }
        } catch (err) {
          console.error(err);
          const fallbackCoords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setUserLocation(fallbackCoords);
          localStorage.setItem("carrinho_inteligente_user_location", fallbackCoords);
          optimizeShoppingList(listInput, fallbackCoords);
        } finally {
          setGpsLoading(false);
         }
       },
       (err) => {
         console.error(err);
         setError("Não foi possível acessar seu GPS. Por favor, digite sua localização manualmente ou use um dos botões rápidos.");
         setGpsLoading(false);
       },
      { timeout: 8000 }
    );
  };

  const optimizeShoppingList = async (textToAnalyse: string, locOverride?: string) => {
    if (!textToAnalyse.trim()) {
      setError("Insira pelo menos um item na lista de compras.");
      return;
    }

    if (textToAnalyse.length > 1500) {
      setError("Sua lista está muito extensa! Por favor, resuma os itens ou divida a compra em duas etapas para a IA processar corretamente.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const targetLoc = locOverride || userLocation;

    const payload: any = {
      listText: textToAnalyse,
      location: targetLoc,
      profileOption: purchaseProfile
    };
    if (lastSource === "table") {
      payload.items = editableItems;
    }

    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao otimizar a lista.");
      }
      
      setResult(data);
      setSuccessMessage(`Lista de preços otimizada com sucesso para a região: ${targetLoc}!`);
      
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate([80, 50, 80]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleText: string) => {
    setListInput(sampleText);
    setLastSource("text");
    optimizeShoppingList(sampleText);
  };

  const handleSaveCurrentList = (e: FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      setError("Diga-nos um nome identificador (ex: Marmitas Semana 3) para salvar no seu histórico.");
      return;
    }

    if (editableItems.length === 0) {
      setError("Não é possível salvar uma lista de compras vazia!");
      return;
    }

    const dateObj = new Date();
    const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
    
    const newHistoryEntry: SavedList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      date: formattedDate,
      items: [...editableItems],
      traditionalTotal: Number(currentTraditionalTotal.toFixed(2)),
      wholesaleTotal: Number(currentWholesaleTotal.toFixed(2)),
      savingsTotal: Number(currentSavingsTotal.toFixed(2))
    };

    setSavedLists([newHistoryEntry, ...savedLists]);
    setNewListName("");
    setError(null);
    setSuccessMessage(`A lista "${newHistoryEntry.name}" foi salva com sucesso no seu histórico financeiro!`);
  };

  const handleDeleteHistoryItem = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = savedLists.filter(list => list.id !== id);
    setSavedLists(updated);
    setSuccessMessage("Registro de histórico removido.");
  };

  const handleRestoreList = (pastList: SavedList) => {
    const generatedText = pastList.items.map(item => `${item.qty} de ${item.name}`).join("\n");
    setListInput(generatedText);
    setEditableItems(pastList.items);
    setLastSource("table");
    
    setResult({
      items: pastList.items,
      suggestions: result.suggestions,
      traditionalTotal: pastList.traditionalTotal,
      wholesaleTotal: pastList.wholesaleTotal,
      savingsTotal: pastList.savingsTotal,
      assistantMessage: `Você restaurou com sucesso os valores de "${pastList.name}" salvos em ${pastList.date}. Você pode modificar quantidades ou preços na tabela abaixo diretamente!`
    });

    setSuccessMessage(`Lista de compras "${pastList.name}" restaurada no painel comparativo.`);
  };

  const totalTraditionalInvested = savedLists.reduce((sum, list) => sum + list.traditionalTotal, 0) + currentTraditionalTotal;
  const totalWholesaleInvested = savedLists.reduce((sum, list) => sum + list.wholesaleTotal, 0) + currentWholesaleTotal;
  const cumulativeSavingsTotal = Math.max(0, totalTraditionalInvested - totalWholesaleInvested);
  const averageSavingPercent = totalTraditionalInvested > 0 
    ? ((cumulativeSavingsTotal / totalTraditionalInvested) * 100).toFixed(1)
    : "0.0";

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-950 p-6 md:p-12 lg:p-16 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-150/15 via-teal-100/10 to-transparent blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-100/10 via-emerald-100/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl w-full relative z-10 my-auto flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-5 bg-white/80 backdrop-blur-md text-emerald-800 border border-emerald-100 px-4.5 py-2 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.12)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Otimizador Financeiro Premium</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight text-slate-950 font-display text-center leading-[1.05] max-w-3xl"
          >
            Carrinho Inteligente <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">PechinchaBot</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-500 text-sm md:text-base text-center mt-5 max-w-2xl font-medium leading-relaxed"
          >
            Sua lista tradicional de supermercado, otimizada para compras em fardos de atacado de forma rápida. Encontre os maiores atacadistas reais da sua região!
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12"
          >
            <div className="bg-white border border-slate-200/50 p-6.5 rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.04)] hover:border-slate-300/80 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="bg-emerald-50/60 text-emerald-700 w-11 h-11 rounded-2xl flex items-center justify-center mb-5 font-black text-xl group-hover:scale-105 transition-transform duration-300 shadow-inner">
                📦
              </div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-950 font-display mb-2">Compre em Escala</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Nossa IA inteligente agrupa produtos de consumo em fardos fechados ou caixas, revelando economias fiscais de até 40% reais.
              </p>
            </div>

            <div className="bg-white border border-slate-200/50 p-6.5 rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.04)] hover:border-slate-300/80 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-indigo-400" />
              <div className="bg-teal-50/60 text-teal-700 w-11 h-11 rounded-2xl flex items-center justify-center mb-5 font-black text-xl group-hover:scale-105 transition-transform duration-300 shadow-inner">
                📍
              </div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-950 font-display mb-2">Lojas Recomendadas</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Descubra opções certeiras de atacadões físicos e feiras livres na sua região, com endereços e diferenciais do que comprar por lá.
              </p>
            </div>

            <div className="bg-white border border-slate-200/50 p-6.5 rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.04)] hover:border-slate-300/80 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-400" />
              <div className="bg-indigo-50/50 text-indigo-700 w-11 h-11 rounded-2xl flex items-center justify-center mb-5 font-black text-xl group-hover:scale-105 transition-transform duration-300 shadow-inner">
                🛡️
              </div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-950 font-display mb-2">Privacidade Total</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Nenhum dado é compartilhado fora. Suas listas e relatórios de compra ficam salvos puramente de forma local no seu navegador.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="bg-white border border-slate-200/60 rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.03)] w-full mt-10"
          >
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider font-display mb-2.5 flex items-center gap-2">
              📍 Configurar Seu Portal de Sintonização
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">
              Para estimar preços precisos e sugerir atacados que existem fisicamente na sua área de verdade, selecione ou digite sua localização.
            </p>

            <div className="space-y-5">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-4.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder="Ex: Rio de Janeiro - Baixada Fluminense, RJ..."
                    className="w-full bg-slate-50/80 border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none rounded-2xl pl-12 pr-4.5 py-4 text-xs font-bold text-slate-850 placeholder:text-slate-400 transition-all font-sans"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.012 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={async () => {
                    setGpsLoading(true);
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        async (position) => {
                          const { latitude, longitude } = position.coords;
                          try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
                            const data = await response.json();
                            const address = data.address || {};
                            
                            const neighborhood = address.suburb || address.neighbourhood || address.quarter || address.city_district || "";
                            const city = address.city || address.town || address.municipality || address.village || address.hamlet || "";
                            const state = address.state_code || address.state || "";

                            const parts: string[] = [];
                            if (neighborhood) parts.push(neighborhood);
                            if (city && city !== neighborhood) parts.push(city);
                            if (state) parts.push(state);

                            const composed = parts.join(", ");
                            if (composed) {
                              setUserLocation(composed);
                            } else {
                              setUserLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                            }
                          } catch (e) {
                            setUserLocation("Sua Região, BR");
                          } finally {
                            setGpsLoading(false);
                          }
                        },
                        () => {
                          setGpsLoading(false);
                        }
                      );
                    } else {
                      setGpsLoading(false);
                    }
                  }}
                  disabled={gpsLoading}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold border border-slate-200 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer h-[52px] md:h-auto shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 text-emerald-600 ${gpsLoading ? "animate-spin" : ""}`} />
                  {gpsLoading ? "Detectando..." : "Detectar com GPS"}
                </motion.button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-3 font-display">Regiões Atendidas Rápidas</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Baixada Fluminense, RJ",
                    "Zona Sul, Rio",
                    "Niterói, RJ",
                    "São Paulo, SP",
                    "Belo Horizonte, MG"
                  ].map((loc) => (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      key={loc}
                      onClick={() => setUserLocation(loc)}
                      className={`text-[11px] px-4 py-2 rounded-full font-bold border transition-all cursor-pointer ${
                        userLocation === loc
                          ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "bg-slate-50 border-slate-200/80 text-slate-650 hover:bg-slate-100"
                      }`}
                    >
                      {loc}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-5">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setListInput(
                    "5kg de Arroz Agulhinha\n3kg de Feijão Preto\n4kg de Peito de Frango\n2 unidades de Óleo de Soja 900ml\n12 litros de Leite Integral\n3 pacotes de Macarrão Espaguete"
                  );
                  handleEnterApp();
                }}
                className="text-xs font-black text-teal-800 hover:text-emerald-900 transition-colors p-2 cursor-pointer bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-100"
              >
                💡 Carregar Lista de Exemplo Rápido
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEnterApp()}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-black px-8 py-4.5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_45px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                Entrar no Carrinho Inteligente
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-1.5 text-[10.5px] text-slate-400 mt-6 font-bold"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Servidor Criptografado & Histórico Confidencial Offline</span>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-950 p-6 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-x-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-emerald-150/15 via-teal-100/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-100/10 via-emerald-100/10 to-transparent blur-3xl pointer-events-none" />

      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-10 gap-8 relative z-10">
        <div>
          <div className="flex items-center gap-5">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white p-4 rounded-[24px] shadow-[0_12px_35px_-8px_rgba(16,185,129,0.3)] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-8 h-8" />
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="text-3xl md:text-4.5xl font-black tracking-tight text-slate-950 font-display leading-[1.1]"
              >
                Carrinho Inteligente <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">PechinchaBot</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-500 text-[11px] font-bold uppercase tracking-widest flex items-center flex-wrap gap-2.5 mt-1.5"
              >
                <span className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/50 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  Região: <span className="text-emerald-800 font-extrabold">{userLocation}</span>
                </span>
                <span className="text-slate-300 font-normal">|</span>
                <span className="text-slate-500 font-medium tracking-wide">Abastecimento Regional Otimizado</span>
              </motion.p>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start lg:self-auto"
        >
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 px-4.5 py-2.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_25px_rgba(0,0,0,0.015)]">
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <span className="text-slate-800 text-xs font-black tracking-tight">Otimização Ativa</span>
          </div>

          <div className="bg-emerald-50/50 backdrop-blur-md border border-emerald-100/80 px-4.5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-[0_8px_25px_rgba(16,185,129,0.01)] cursor-help group relative" title="Seus dados são 100% confidenciais e salvos exclusivamente no seu próprio dispositivo!">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            <span className="text-emerald-800 text-xs font-black tracking-tight">Sessão Individual Privada</span>
            <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white text-[10.5px] rounded-2xl p-4.5 w-72 md:w-80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl leading-relaxed whitespace-normal border border-white/5">
              🛡️ <b>Sua Privacidade Importa</b>: Nenhuma informação é compartilhada! Todo o histórico de listas e alterações permanece armazenado unicamente no seu dispositivo.
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-2xl text-xs font-black border border-slate-200/80 transition-all cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
          >
            <HelpCircle className="w-4.5 h-4.5 text-slate-400 shrink-0" />
            <span>Guia do App</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            className="flex items-center justify-center p-2.5 rounded-2xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 transition-all cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.015)]"
            title={theme === "light" ? "Alternar para Modo Escuro" : "Alternar para Modo Claro"}
          >
            {theme === "light" ? (
              <Moon className="w-4.5 h-4.5 text-slate-600 shrink-0 animate-pulse" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-500 shrink-0 animate-spin-slow" />
            )}
          </motion.button>
        </motion.div>
      </header>

      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            className="bg-rose-50/90 backdrop-blur-md border border-rose-200/80 text-rose-800 p-4 rounded-3xl mb-6 flex items-start gap-4 shadow-[0_4px_20px_rgba(244,63,94,0.05)] overflow-hidden"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-extrabold text-sm font-display text-rose-900">Aviso do Sistema</p>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800 font-black text-xs px-2.5 py-1 rounded-lg hover:bg-rose-100/50 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            className="bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 text-emerald-950 p-4 rounded-3xl mb-6 flex items-start gap-4 shadow-[0_4px_20px_rgba(16,185,129,0.05)] overflow-hidden"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-extrabold text-sm font-display text-emerald-900">Sucesso!</p>
              <p className="text-xs text-emerald-800/90 mt-0.5 font-medium leading-relaxed">{successMessage}</p>
            </div>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-black text-xs px-2.5 py-1 rounded-lg hover:bg-emerald-100/50 transition-all cursor-pointer"
            >
              Dispensar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative z-10">
        
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(15,23,42,0.025)] flex flex-col transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.05)] relative overflow-hidden group animate-fade-in"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Região Ativa
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Geolocalizado</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">
              Preços locais baseados em estabelecimentos ativos próximos. Clique para alternar ou use GPS.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-5.5">
              {[
                "Baixada Fluminense, RJ",
                "Zona Sul, Rio",
                "Niterói, RJ",
                "São Paulo, SP",
                "Belo Horizonte, MG"
              ].map((loc) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={loc}
                  onClick={() => {
                    setUserLocation(loc);
                    localStorage.setItem("carrinho_inteligente_user_location", loc);
                    optimizeShoppingList(listInput, loc);
                  }}
                  className={`text-[10px] px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    userLocation === loc
                      ? "bg-slate-950 text-white border-slate-950 shadow-md shadow-slate-950/20"
                      : "bg-slate-50 text-slate-650 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {loc.split(",")[0]}
                </motion.button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-2xl p-1 transition-all">
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => {
                    setUserLocation(e.target.value);
                    localStorage.setItem("carrinho_inteligente_user_location", e.target.value);
                  }}
                  onBlur={() => {
                    optimizeShoppingList(listInput, userLocation);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      optimizeShoppingList(listInput, userLocation);
                    }
                  }}
                  placeholder="Seu bairro ou cidade"
                  className="w-full bg-transparent px-3 py-2 text-xs focus:outline-none font-bold text-slate-805"
                />
                
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={getGPSLocation}
                  disabled={gpsLoading}
                  title="Detectar minha localização usando GPS"
                  aria-label="Detectar minha localização usando GPS"
                  className="text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center hover:bg-emerald-50 shrink-0"
                >
                  {gpsLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-slate-400 font-bold italic tracking-wide">
                Dica: Pressione <span className="bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono text-[9px]">Enter</span> para forçar a busca da IA na região.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(15,23,42,0.025)] flex flex-col transition-all hover:shadow-[0_20px_50px_rgba(15,23,42,0.05)]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-slate-950 flex items-center gap-2 font-display uppercase tracking-wider">
                <span className="text-emerald-500 text-lg">📝</span> 
                Sua Lista de Compras
              </h2>
              <span className="text-[9px] bg-indigo-50 border border-indigo-150 text-indigo-805 font-black px-2 py-0.5 rounded-full tracking-widest uppercase">Planner</span>
            </div>
            
            <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">
              Insira os produtos com quantidades e veja as frações sugeridas com valores econômicos para <span className="font-extrabold text-emerald-700">{userLocation.split(",")[0]}</span>.
            </p>

            <textarea
              id="list-textarea"
              value={listInput}
              onChange={(e) => {
                setListInput(e.target.value);
                setLastSource("text");
              }}
              placeholder="Ex:&#10;5kg de arroz&#10;3kg de feijão preto&#10;4kg peito de frango..."
              rows={6}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-400 font-mono leading-relaxed"
            />

            <div className="mt-5.5">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                🎯 Perfil Estimado (Inteligência de Volume)
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setPurchaseProfile("domestico");
                    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                      navigator.vibrate(20);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-emerald-150 ${
                    purchaseProfile === "domestico"
                      ? "bg-slate-950 border-slate-955 text-white shadow-md shadow-slate-950/15"
                      : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">🏠</span>
                    <span className="font-black text-[10.5px] uppercase tracking-wider block">Foco Doméstico</span>
                  </div>
                  <span className={`text-[9.5px] font-semibold leading-relaxed block ${purchaseProfile === "domestico" ? "text-slate-300" : "text-slate-450"}`}>
                    Marmitas e reposição de mantimentos domésticos da família.
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setPurchaseProfile("confeitaria");
                    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                      navigator.vibrate(20);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-150 ${
                    purchaseProfile === "confeitaria"
                      ? "bg-indigo-950 border-indigo-900 text-white shadow-md shadow-indigo-950/20"
                      : "bg-slate-50/60 border-slate-200 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">🎂</span>
                    <span className="font-black text-[10.5px] uppercase tracking-wider block">Foco Comercial</span>
                  </div>
                  <span className={`text-[9.5px] font-semibold leading-relaxed block ${purchaseProfile === "confeitaria" ? "text-indigo-200" : "text-slate-450"}`}>
                    Confeitaria, eventos, bolo no pote e compras corporativas em fardos.
                  </span>
                </motion.button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              id="btn-optimize"
              onClick={() => optimizeShoppingList(listInput)}
              disabled={loading}
              className="w-full mt-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_45px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  Calculando economia com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                  Calcular Economia com IA !
                </>
              )}
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#0F172A] border border-slate-800 text-white rounded-[2rem] p-7.5 shadow-[0_15px_40px_rgba(15,23,42,0.15)] flex flex-col transition-all"
          >
            <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2.5 mb-2 font-display">
              <Save className="w-4 h-4 text-emerald-500" />
              Arquivar no Histórico
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Deseja salvar esta lista atual para comparar e otimizar suas despesas de forma acumulada?
            </p>
            <p className="text-[10px] text-slate-400 bg-slate-850/60 p-3 rounded-2xl border border-slate-800 leading-relaxed my-4.5 font-medium">
              🔒 <b>Privacidade Inteligente</b>: Os dados permanecem criptografados e restritos no seu navegador para sua tranquilidade total.
            </p>

            <form onSubmit={handleSaveCurrentList} className="space-y-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Ex: Marmitas Fitness - Semana 3"
                className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3 px-4.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold"
              />
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_20px_-4px_rgba(16,185,129,0.25)] hover:opacity-95"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                Salvar no Histórico
              </motion.button>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-[#1E293B] border border-slate-800/80 text-white rounded-[2rem] p-7.5 shadow-[0_15px_40px_rgba(30,41,59,0.12)] flex flex-col gap-3.5 transition-all"
          >
            <div>
              <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Listas Prontas de Exemplo
              </h3>
            </div>

            <div className="space-y-2.5">
              {SAMPLE_LISTS.map((sample, idx) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={idx}
                  onClick={() => handleLoadSample(sample.text)}
                  disabled={loading}
                  className="w-full text-left bg-slate-900/60 hover:bg-slate-900 focus:bg-slate-900 p-3.5 rounded-2xl transition-all border border-slate-800/60 hover:border-emerald-500/40 group flex items-start gap-3.5 cursor-pointer"
                >
                  <span className="text-xl mt-0.5 shrink-0" role="img" aria-label="icon">
                    {sample.icon}
                  </span>
                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-white group-hover:text-emerald-450 transition-colors block truncate">
                        {sample.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0" />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate font-semibold mt-0.5">
                      {sample.subtitle}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

        </div>

        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-[2rem] p-7 md:p-8 shadow-[0_12px_45px_rgba(15,23,42,0.02)] flex-grow flex flex-col transition-all hover:shadow-[0_20px_55px_rgba(15,23,42,0.045)] relative"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-7">
              <div>
                <h2 className="text-base font-black text-slate-950 flex items-center gap-3 font-display uppercase tracking-wider">
                  <span className="text-emerald-500 text-xl">📊</span>
                  Comparativo de Economia
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  Valores locais autênticos de atacarejo. <span className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">Clique</span> para editar quantidades ou preços e recalcular em tempo real.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAddItem}
                className="self-start sm:self-auto flex items-center gap-2 bg-[#F1F5F9] hover:bg-slate-200 text-slate-705 py-2 px-4 rounded-xl text-xs font-black transition-all border border-slate-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                Mais +
              </motion.button>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 font-extrabold tracking-widest border-b border-slate-200/60 pb-3">
                    <th className="pb-3 text-left pl-3">Item / Ingrediente</th>
                    <th className="pb-3 text-center w-24">Quant.</th>
                    <th className="pb-3 text-right pr-3">Mercado Padrão</th>
                    <th className="pb-3 text-right pr-3 text-emerald-600">No Atacadão</th>
                    <th className="pb-3 text-right">Economia %</th>
                    <th className="pb-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 text-xs">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className="animate-pulse">
                        <td className="py-4 pl-3">
                          <div className="h-6 bg-slate-100/90 border border-slate-200/40 rounded-xl w-32 md:w-56" />
                        </td>
                        <td className="py-4 text-center">
                          <div className="h-6 bg-slate-100/90 border border-slate-200/40 rounded-xl w-14 mx-auto" />
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="h-6 bg-slate-100/90 border border-slate-200/40 rounded-xl w-16 ml-auto" />
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="h-6 bg-emerald-100/80 border border-emerald-200/30 rounded-xl w-16 ml-auto" />
                        </td>
                        <td className="py-4 text-right">
                          <div className="h-6 bg-slate-100/90 border border-slate-200/40 rounded-xl w-10 ml-auto" />
                        </td>
                        <td className="py-4 text-center">
                          <div className="h-6 w-6 bg-slate-100/90 border border-slate-200/40 rounded-xl mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    editableItems.map((item, index) => {
                      const diff = item.priceTraditional - item.priceWholesale;
                      const percentSaved = item.priceTraditional > 0 
                        ? Math.round((diff / item.priceTraditional) * 100) 
                        : 0;

                      return (
                        <tr key={index} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-3 pl-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...editableItems];
                                updated[index] = { ...updated[index], name: e.target.value };
                                setEditableItemsAndSync(updated);
                              }}
                              className="bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-4 focus:ring-slate-200/30 outline-none rounded-xl px-2 py-1.5 text-xs md:text-sm font-black text-slate-900 transition-all max-w-full"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="text"
                              value={item.qty}
                              onChange={(e) => handleUpdateQty(index, e.target.value)}
                              className="bg-transparent hover:bg-slate-100/70 focus:bg-white text-center rounded-xl px-1.5 py-1.5 text-xs font-black text-slate-700 w-16 outline-none focus:ring-4 focus:ring-slate-250/30 transition-all font-mono"
                            />
                          </td>
                          {/* CELULAS BLINDADAS COM SUBTOTAL (Preço * Quantidade) */}
                          <td className="py-3 text-right pr-3 font-mono text-slate-800 font-bold">
                             R$ {Number((item?.priceTraditional || 0) * (parseFloat(item?.qty) || 1)).toFixed(2)}
                          </td>
                          <td className="py-3 text-right pr-3 font-black text-emerald-600 font-mono">
                             R$ {Number((item?.priceWholesale || 0) * (parseFloat(item?.qty) || 1)).toFixed(2)}
                          </td>
                          <td className="py-3 text-right font-black text-emerald-600 text-xs md:text-sm">
                            {percentSaved > 0 ? (
                              <span className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-2 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">
                                -{percentSaved}%
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-black">0%</span>
                            )}
                          </td>
                          <td className="py-3 text-center pl-2">
                            <motion.button
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.88 }}
                              onClick={() => handleRemoveItem(index)}
                              title="Remover produto da lista"
                              aria-label="Remover produto da lista"
                              className="text-slate-350 hover:text-rose-600 hover:bg-rose-50/70 p-2 rounded-xl transition-all cursor-pointer opacity-70 group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-400 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {!loading && editableItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-slate-400">
                        <div className="max-w-md mx-auto flex flex-col items-center">
                          <div className="bg-slate-50 text-slate-400 p-5 rounded-full mb-3.5 border border-slate-150">
                            <ShoppingBag className="w-9 h-9" />
                          </div>
                          <p className="text-xs md:text-sm font-black text-slate-805">Sua lista está vazia</p>
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold leading-relaxed">Insira itens no painel ou carregue um dos nossos modelos prontos para ver a mágica ocorrer !</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-7 border-t border-slate-200/60">
              <div className="bg-gradient-to-r from-emerald-50/40 via-teal-50/10 to-indigo-50/20 border border-slate-150/60 rounded-[28px] p-6.5 flex flex-col sm:flex-row gap-5.5 items-start relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="w-13 h-13 rounded-2.5xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 font-extrabold text-2xl shadow-[0_6px_20px_rgba(16,185,129,0.22)]">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-extrabold text-[10.5px] text-emerald-900 uppercase tracking-widest font-display">
                      PechinchaBot Otimizador
                    </span>
                    <span className="bg-emerald-600 text-white font-black text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                      Análise Regional
                    </span>
                  </div>
                  <p className="text-xs md:text-[13px] text-slate-800 font-bold leading-relaxed font-sans italic">
                    "{result.assistantMessage}"
                  </p>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 relative z-10"
      >
        
        <motion.div 
          whileHover={{ y: -4 }}
          className="lg:col-span-5 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-[2rem] p-7 shadow-[0_12px_45px_rgba(15,23,42,0.02)] flex flex-col justify-between transition-all hover:shadow-[0_20px_55px_rgba(15,23,42,0.04)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/40 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2.5 font-display uppercase tracking-wider">
                <History className="w-4 h-4 text-emerald-600" />
                Histórico de Economia
              </h3>
              <span className="text-[9px] bg-slate-105 border border-slate-200 text-slate-600 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {savedLists.length} Arquivadas
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed font-semibold">
              As listas salvas nas semanas anteriores são guardadas de forma segura aqui. Toque em qualquer lote para restaurá-lo na tabela!
            </p>

            <div className="mb-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-650 rounded-2xl p-5 text-white shadow-[0_10px_30px_rgba(16,185,129,0.18)] flex items-center justify-between border border-emerald-500/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#E2E8F0] mb-1">Acumulado Salvo Líquido</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-emerald-200">R$</span>
                  <span className="text-2xl font-black tracking-tight font-mono">
                    {savedLists.reduce((sum, list) => sum + list.savingsTotal, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl shrink-0 border border-white/10 shadow-inner">
                <TrendingUp className="w-5 h-5 text-emerald-100" />
              </div>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {savedLists.map((list) => {
                const percent = list.traditionalTotal > 0 
                  ? ((list.savingsTotal / list.traditionalTotal) * 100).toFixed(0) 
                  : "0";

                return (
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    key={list.id}
                    onClick={() => handleRestoreList(list)}
                    title="Clique para restaurar esta lista na tabela"
                    className="group border border-slate-100 hover:border-emerald-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer flex justify-between items-center relative gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-extrabold text-xs md:text-sm text-slate-900 group-hover:text-emerald-800 transition-colors block truncate font-display">
                          {list.name}
                        </span>
                        <span className="text-[9px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                          {list.date}
                        </span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-slate-500 font-semibold">
                        <span>Tradicional: <strong className="text-slate-800 font-mono font-extrabold">R$ {list.traditionalTotal.toFixed(2)}</strong></span>
                        <span>Atacadão: <strong className="text-emerald-700 font-mono font-black">R$ {list.wholesaleTotal.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-emerald-50 border border-emerald-100/50 px-3 py-1.5 rounded-xl shrink-0">
                        <p className="text-[8px] text-[#047857] font-black uppercase tracking-widest">Poupado</p>
                        <p className="text-xs font-black text-[#065F46] font-mono">R$ {list.savingsTotal.toFixed(2)}</p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryItem(list.id, e);
                        }}
                        className="text-slate-350 hover:text-rose-600 hover:bg-rose-50/80 p-2.5 rounded-xl transition-all cursor-pointer shrink-0"
                        title="Deletar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}

              {savedLists.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-slate-50/60 rounded-[24px] border border-dashed border-slate-200">
                  <ArchiveRestore className="w-9 h-9 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Não há registros salvos</p>
                  <p className="text-[11px] mt-0.5 max-w-xs mx-auto">Salve suas listas no painel lateral esquerdo para arquivar seu progresso!</p>
                </div>
              )}
            </div>
          </div>


        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] p-7 shadow-[0_12px_45px_rgba(15,23,42,0.12)] flex flex-col justify-between transition-all hover:shadow-[0_20px_55px_rgba(15,23,42,0.18)] text-white"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-2.5 font-display uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-emerald-450" />
                Histórico de Evolução
              </h4>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-black px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
                Média {averageSavingPercent}% Poupar
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-semibold">
              Evolução e contraste real entre as compras de mercado e a economia líquida do Atacadão.
            </p>

            <div className="space-y-4">
              <div className="h-44 flex items-end justify-between gap-3 border-b border-slate-800/80 pb-2.5 pt-4">
                {savedLists.map((list, index) => {
                  const maxTotal = Math.max(...savedLists.map(l => l.traditionalTotal), 100);
                  const traditionalHeight = (list.traditionalTotal / maxTotal) * 100;
                  const wholesaleHeight = (list.wholesaleTotal / maxTotal) * 100;

                  const isFocused = focusedWeekIndex === index;

                  return (
                    <div 
                      key={list.id} 
                      className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                      onMouseEnter={() => setFocusedWeekIndex(index)}
                      onMouseLeave={() => setFocusedWeekIndex(null)}
                    >
                      <div className={`absolute -top-12 bg-slate-950 text-white text-[10px] rounded-xl p-2.5 shadow-2xl border border-slate-800 z-50 transition-all duration-200 pointer-events-none w-32 text-center ${isFocused ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                        <p className="font-extrabold text-emerald-400 block truncate">{list.name}</p>
                        <p className="font-black text-slate-100 font-mono mt-0.5">Poupança R$ {list.savingsTotal.toFixed(2)}</p>
                      </div>

                      <div className="w-full flex items-end gap-1.5 h-full max-w-[48px] justify-center">
                        <div 
                          style={{ height: `${traditionalHeight}%` }} 
                          className={`w-3 bg-slate-700 hover:bg-slate-600 rounded-t-lg transition-all duration-300 relative ${isFocused ? "opacity-100" : "opacity-60"}`}
                        >
                          <div className="absolute inset-x-0 bottom-0 top-[35%] bg-slate-805 rounded-t-lg pointer-events-none"></div>
                        </div>

                        <div 
                          style={{ height: `${wholesaleHeight}%` }} 
                          className={`w-3.5 bg-emerald-500 hover:bg-emerald-400 rounded-t-lg transition-all duration-300 relative shadow-md ${isFocused ? "scale-110" : ""}`}
                        >
                          <div className="absolute inset-x-0 bottom-0 top-[20%] bg-emerald-600/35 rounded-t-lg pointer-events-none"></div>
                        </div>
                      </div>

                      <span className="text-[9px] text-slate-500 mt-2.5 block font-extrabold font-mono truncate max-w-full uppercase">
                        {list.name.split("-")[1] || list.name.slice(0, 8)}
                      </span>
                    </div>
                  );
                })}

                {editableItems.length > 0 && (
                  <div 
                    className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer border-l border-dashed border-slate-800 pl-2"
                    onMouseEnter={() => setFocusedWeekIndex(99)}
                    onMouseLeave={() => setFocusedWeekIndex(null)}
                  >
                    <div className={`absolute -top-12 bg-slate-950 text-white text-[10px] rounded-xl p-2.5 shadow-2xl border border-slate-800 z-50 transition-all duration-200 pointer-events-none w-32 text-center ${focusedWeekIndex === 99 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                      <p className="font-extrabold text-emerald-400 block">Lista Ativa</p>
                      <p className="font-black text-slate-100 font-mono mt-0.5">Econ. R$ {currentSavingsTotal.toFixed(2)}</p>
                    </div>

                    <div className="w-full flex items-end gap-1.5 h-full max-w-[48px] justify-center">
                      <div 
                        style={{ height: `${Math.min(100, (currentTraditionalTotal / (Math.max(...savedLists.map(l => l.traditionalTotal), 100))) * 100)}%` }} 
                        className="w-3 bg-slate-700 rounded-t-lg opacity-40 animate-pulse"
                      />
                      <div 
                        style={{ height: `${Math.min(100, (currentWholesaleTotal / (Math.max(...savedLists.map(l => l.traditionalTotal), 100))) * 100)}%` }} 
                        className="w-3.5 bg-emerald-500 rounded-t-lg shadow-md animate-pulse"
                      />
                    </div>

                    <span className="text-[9px] text-emerald-400 mt-2.5 block font-black uppercase font-mono tracking-wider">
                      ★ Atual
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-slate-700 rounded"></span>
                  Mercado Padrão
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 rounded"></span>
                  No Atacadão
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800 text-center">
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Mercado Tradicional</p>
                <p className="text-sm md:text-base font-bold text-slate-300 font-mono mt-1">
                  R$ {totalTraditionalInvested.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Rede Atacadista</p>
                <p className="text-sm md:text-base font-bold text-emerald-400 font-mono mt-1">
                  R$ {totalWholesaleInvested.toFixed(2)}
                </p>
              </div>
              <div className="bg-emerald-950/80 rounded-2xl p-3.5 border border-emerald-800/30">
                <p className="text-[8px] text-emerald-300 font-black uppercase tracking-widest">Economia Líquida</p>
                <p className="text-sm md:text-base font-black text-emerald-400 font-mono mt-1">
                  R$ {cumulativeSavingsTotal.toFixed(2)}
                </p>
              </div>
            </div>

          </div>
        </motion.div>

      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 relative z-10">
        
        <div className="md:col-span-4 bg-amber-50 border border-amber-200/80 rounded-[32px] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col justify-between transition-all hover:shadow-[0_8px_35px_rgba(245,158,11,0.05)] hover:scale-[1.01] duration-300">
          <div>
            <div className="flex items-center text-amber-950 gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-lg border border-amber-200/40">
                💡
              </div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-900 font-display">
                Troca de Marcas
              </h3>
            </div>
            
            {result.suggestions && result.suggestions[0] ? (
              <div className="space-y-3">
                <p className="text-xs text-amber-950 leading-relaxed font-semibold">
                  Altere <span className="line-through text-slate-400 font-bold">{result.suggestions[0].originalItem}</span> pela excelente <span className="font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-lg">{result.suggestions[0].suggestedItem}</span>.
                </p>
                <div className="bg-white/75 rounded-2xl p-4 border border-amber-200/50 text-xs text-amber-900/90 leading-relaxed font-semibold">
                  {result.suggestions[0].explanation}
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-850 leading-relaxed font-semibold">
                Sempre prefira marcas do próprio Atacadão instaladas na Baixada para Arroz e Açúcar. Elas custam de 15% a 25% menos e possuem alta qualidade.
              </p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-amber-200/65 flex justify-between items-center">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
              <TrendingDown className="w-4 h-4 text-amber-700" />
              Economia Extra:
            </span>
            <span className="text-base font-black text-amber-850 font-mono">
              R$ {result.suggestions?.[0]?.savingEstimate?.toFixed(2) || "5.40"}
            </span>
          </div>
        </div>

        <div className="md:col-span-4 bg-blue-50 border border-blue-200/85 rounded-[32px] p-6 shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex flex-col justify-between transition-all hover:shadow-[0_8px_35px_rgba(59,130,246,0.05)] hover:scale-[1.01] duration-300">
          <div>
            <div className="flex items-center text-blue-950 gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-lg border border-blue-200/40">
                📦
              </div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-blue-900 font-display">
                Volume & Estocagem
              </h3>
            </div>
            
            {result.suggestions && result.suggestions[1] ? (
              <div className="space-y-3">
                <p className="text-xs text-blue-950 leading-relaxed font-semibold">
                  Compre em maior escala em vez de unitários: <span className="font-black text-blue-800 bg-blue-100/80 px-1.5 py-0.5 rounded-lg">{result.suggestions[1].suggestedItem}</span>.
                </p>
                <div className="bg-white/75 rounded-2xl p-4 border border-blue-200/50 text-xs text-blue-900/90 leading-relaxed font-semibold">
                  {result.suggestions[1].explanation}
                </div>
              </div>
            ) : (
              <p className="text-xs text-blue-850 leading-relaxed font-semibold">
                Itens como Leite Integral e Óleo saem cerca de 19% mais baratos se comprados em fardos de 12 ou caixas institucionais nas redes atacadistas.
              </p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-blue-200/65 flex justify-between items-center">
            <span className="text-xs font-black text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
              <UtensilsCrossed className="w-4 h-4 text-blue-700" />
              Impacto no Prato:
            </span>
            <span className="text-base font-black text-blue-850 font-mono">
              R$ {result.suggestions?.[1]?.savingEstimate?.toFixed(2) || "13.68"}
            </span>
          </div>
        </div>

        <div className="md:col-span-4 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-[0_4px_25px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.01] duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="bg-white/15 p-3 rounded-2xl group-hover:scale-105 transition-transform">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <span className="bg-white/20 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-widest">
                Lote Otimizado
              </span>
            </div>
          </div>

          <div className="my-5">
            <p className="text-emerald-100 font-extrabold uppercase tracking-widest text-[9.5px]">
              Economia Estimada
            </p>
            <h2 className="text-4.5xl font-black font-mono leading-none mt-1 shadow-sm">
              R$ <AnimatedCounter value={currentSavingsTotal} decimals={2} />
            </h2>
            <p className="text-emerald-50 text-xs mt-2 font-medium">
              Você poupou cerca de <span className="bg-white/20 px-2 py-0.5 rounded-lg font-black">-<AnimatedCounter value={Number(savingsPercent)} decimals={1} />%</span> do valor tradicional!
            </p>
          </div>

          <div className="pt-3.5 border-t border-white/10 flex justify-between items-center text-[11px] text-emerald-100">
            <span className="font-medium italic">
              "Isso equivale a 8kg de frango!"
            </span>
            <div className="text-right text-[10px] bg-emerald-800/50 border border-emerald-400/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              Poupança Ativa
            </div>
          </div>
        </div>

      </div>

      <section className="bg-white border border-slate-200/95 rounded-[32px] p-6 md:p-8 mt-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        <div className="md:col-span-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-8">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 font-display">
              <Store className="w-4 h-4 text-emerald-600 animate-pulse" />
              Centros de Abastecimento
            </h3>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold">
              Os maiores atacadões e centros de atacado na redondeza de <span className="text-emerald-700 font-extrabold">{userLocation.split(",")[0]}</span> para você sintonizar fardos e economizar muito mais.
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
            Dados Atualizados Diariamente
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-3 gap-4">
          {(() => {
            const rawCenters = result.economyCenters || getEconomyCenters(userLocation);
            const sortedCenters = [...rawCenters].sort((a, b) => {
              const aFav = favoriteMarkets.includes(a.name);
              const bFav = favoriteMarkets.includes(b.name);
              if (aFav && !bFav) return -1;
              if (!aFav && bFav) return 1;
              return 0;
            });
            return sortedCenters.map((center, idx) => {
              const isFavorite = favoriteMarkets.includes(center.name);
              return (
                <div 
                  key={idx} 
                  className={`border p-5 rounded-2xl flex flex-col justify-between hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 relative group overflow-hidden ${
                    isFavorite 
                      ? "border-amber-300 bg-amber-50/15" 
                      : "bg-slate-50 border-slate-150"
                  }`}
                >
                  {isFavorite && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                  )}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${center.active ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        <p className="text-xs font-black text-slate-900 font-display">{center.name}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => {
                          setFavoriteMarkets(prev => 
                            prev.includes(center.name)
                              ? prev.filter(name => name !== center.name)
                              : [...prev, center.name]
                          );
                        }}
                        className="text-amber-500 hover:text-amber-600 p-1 rounded-full transition-colors focus:outline-none shrink-0 cursor-pointer"
                        title={isFavorite ? "Remover dos favoritos" : "Marcar como favorito"}
                      >
                        <Star className={`w-4 h-4 ${isFavorite ? "fill-amber-400 text-amber-500" : "text-slate-350 hover:text-amber-400"}`} />
                      </motion.button>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-relaxed font-semibold">
                      📍 {center.address}
                    </p>
                    <p className="text-[10.5px] text-slate-500 mt-3 font-medium leading-relaxed">
                      {center.desc}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[9.5px] px-2.5 py-1 rounded-xl font-black inline-block uppercase tracking-wider ${
                      center.active 
                        ? "text-[#065F46] bg-emerald-50 border border-emerald-150"
                        : "text-slate-650 bg-slate-150 border border-slate-200"
                    }`}>
                      {center.badge}
                    </span>
                    {isFavorite && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-amber-200/50">
                        ★ Favorito
                      </span>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </section>

      <footer className="mt-14 mb-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-black gap-4 relative z-10 border-t border-slate-200/60 pt-6">
        <span>Carrinho Inteligente (PechinchaBot) v1.2.0</span>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => {
              setFeedbackSubmitted(false);
              setFeedbackText("");
              setOpenFeedbackModal(true);
            }} 
            className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1 text-[10px] uppercase font-black tracking-widest"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            Sugerir Melhoria ou Reportar Erro
          </button>
        </div>
        <span>PechinchaBot © 2026</span>
      </footer>

      <AnimatePresence>
        {openFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200/85 shadow-2xl rounded-[32px] w-full max-w-lg overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
              
              <div className="p-6 border-b border-slate-105 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Canal de Feedback</h3>
                    <p className="text-[10px] text-slate-450 uppercase tracking-wider font-extrabold mt-0.5">Sugerir Melhorias ou Erros de Preços</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenFeedbackModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 relative z-10">
                {!feedbackSubmitted ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!feedbackText.trim()) return;
                    
                    const existing = localStorage.getItem("carrinho_inteligente_feedbacks");
                    const list = existing ? JSON.parse(existing) : [];
                    list.push({
                      id: `fb-${Date.now()}`,
                      type: feedbackType,
                      text: feedbackText,
                      date: new Date().toISOString(),
                      location: userLocation
                    });
                    localStorage.setItem("carrinho_inteligente_feedbacks", JSON.stringify(list));
                    
                    setFeedbackSubmitted(true);
                  }} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Qual tipo de feedback?</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFeedbackType("feature")}
                          className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border transition-all cursor-pointer ${
                            feedbackType === "feature"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                              : "bg-slate-50/55 border-slate-200 hover:bg-slate-50 text-slate-650"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Sugerir Melhoria
                        </button>
                        <button
                          type="button"
                          onClick={() => setFeedbackType("bug")}
                          className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs border transition-all cursor-pointer ${
                            feedbackType === "bug"
                              ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                              : "bg-slate-50/55 border-slate-200 hover:bg-slate-50 text-slate-650"
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Reportar Erro
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Descreva com detalhes</label>
                      <textarea
                        required
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder={
                          feedbackType === "feature"
                            ? "Ex: Gostaria de poder filtrar por marcas baratas ou ver promoções do dia..."
                            : "Ex: O preço do quilo do frango no Dom Atacadista de São João de Meriti mudou para R$..."
                        }
                        rows={4}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50 outline-none rounded-2xl p-4 text-xs font-semibold text-slate-800 placeholder:text-slate-405 resize-none transition-all"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setOpenFeedbackModal(false)}
                        className="px-5 py-3 border border-slate-200 rounded-2xl hover:bg-slate-100 text-slate-650 font-extrabold cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!feedbackText.trim()}
                        className="bg-emerald-600 border border-emerald-500/10 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-extrabold flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                      >
                        Enviar Feedback
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-display">Feedback Enviado com Sucesso!</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-sm mx-auto mt-2.5">
                      Muito obrigado pelo envio! Suas sugestões nos ajudam a manter a curadoria geográfica perfeita em <span className="font-extrabold text-emerald-700">{userLocation.split(",")[0]}</span> sem erros.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenFeedbackModal(false)}
                      className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-2xl font-extrabold hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                    >
                      Fechar Canal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
