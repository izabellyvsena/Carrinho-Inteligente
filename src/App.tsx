/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent } from "react";
import * as Sentry from "@sentry/react";
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
        desc: "Excelente para compras mensais familiares pesadas.",
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
  assistantMessage: "Olá! Digite ou insira sua lista de compras no painel ao lado e clique em 'Calcular Economia com IA !' para ver a mágica ocorrer.",
  economyCenters: []
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
  const [lastSource, setLastSource] = useState<"text" | "table">("text");
  const [editableItems, setEditableItems] = useState<Item[]>([]);

  // HISTÓRICO LOCAL
  const [savedLists, setSavedLists] = useState<SavedList[]>(() => {
    const local = localStorage.getItem("carrinho_inteligente_history");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Erro ao ler do localStorage", e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (result && Array.isArray(result.items)) {
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
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("carrinho_inteligente_favorite_markets", JSON.stringify(favoriteMarkets));
  }, [favoriteMarkets]);

  // ESCUDO DE PROTEÇÃO PARA EVITAR TELA VERMELHA NO .reduce()
  const safeItems = Array.isArray(editableItems) ? editableItems : [];

  const setEditableItemsAndSync = (items: Item[]) => {
    const validItems = Array.isArray(items) ? items : [];
    setEditableItems(validItems);
    setLastSource("table");
    const textRepr = validItems.map(item => `${item.qty} de ${item.name}`).join("\n");
    setListInput(textRepr);
  };

  const handleUpdatePrice = (index: number, field: "priceTraditional" | "priceWholesale", value: number) => {
    const updated = [...safeItems];
    const safeValue = isNaN(value) ? 0 : Math.max(0, value);
    updated[index] = { ...updated[index], [field]: safeValue };
    setEditableItemsAndSync(updated);
  };

  const handleUpdateQty = (index: number, value: string) => {
    const updated = [...safeItems];
    updated[index] = { ...updated[index], qty: value };
    setEditableItemsAndSync(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = safeItems.filter((_, i) => i !== index);
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
    setEditableItemsAndSync([...safeItems, newItem]);
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(45);
    }
  };

  // CÁLCULOS SEGUROS
  const currentTraditionalTotal = safeItems.reduce((acc, item) => acc + (item.priceTraditional || 0), 0);
  const currentWholesaleTotal = safeItems.reduce((acc, item) => acc + (item.priceWholesale || 0), 0);
  const currentSavingsTotal = Math.max(0, currentTraditionalTotal - currentWholesaleTotal);
  const savingsPercent = currentTraditionalTotal > 0 
    ? ((currentSavingsTotal / currentTraditionalTotal) * 100).toFixed(1) 
    : "0.0";

  // FUNÇÃO ROBUSTA DE CHAMADA À API
  const optimizeShoppingList = async (textToAnalyse: string, locOverride?: string) => {
    if (!textToAnalyse || !textToAnalyse.trim()) {
      setError("Insira pelo menos um item na lista de compras.");
      return;
    }

    if (textToAnalyse.length > 1500) {
      setError("Sua lista está muito extensa! Por favor, resuma os itens.");
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
      payload.items = safeItems;
    }

    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      // Validação de segurança forte
      if (!response.ok || !data || typeof data !== 'object') {
        throw new Error(data?.error || "Formato de resposta inválido do servidor.");
      }
      
      setResult(data || DEFAULT_RESULT);
      setEditableItems(Array.isArray(data.items) ? data.items : []);
      setSuccessMessage(`Lista otimizada com sucesso para: ${targetLoc}!`);
      
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate([80, 50, 80]);
      }
    } catch (err: any) {
      console.error(err);
      Sentry.captureException(err, { tags: { section: "optimizeShoppingList" } });
      setError(err.message || "Erro de conexão com o servidor.");
      // Fallback para evitar tela de erro
      setResult(DEFAULT_RESULT);
      setEditableItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta geolocalização.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const neighborhood = address.suburb || address.neighbourhood || address.city_district || "";
            const city = address.city || address.town || "";
            const state = address.state_code || address.state || "";

            const parts: string[] = [];
            if (neighborhood) parts.push(neighborhood);
            if (city && city !== neighborhood) parts.push(city);
            if (state) parts.push(state);

            const combined = parts.join(", ") || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setUserLocation(combined);
            optimizeShoppingList(listInput, combined);
          }
        } catch (err) {
          const fallbackCoords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setUserLocation(fallbackCoords);
          optimizeShoppingList(listInput, fallbackCoords);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setError("Não foi possível acessar seu GPS.");
        setGpsLoading(false);
      }
    );
  };

  const handleLoadSample = (sampleText: string) => {
    setListInput(sampleText);
    setLastSource("text");
    optimizeShoppingList(sampleText);
  };

  const handleEnterApp = (locationOverride?: string) => {
    const loc = locationOverride || userLocation;
    localStorage.setItem("carrinho_inteligente_onboarded", "true");
    localStorage.setItem("carrinho_inteligente_user_location", loc);
    setUserLocation(loc);
    setShowOnboarding(false);
  };

  const handleSaveCurrentList = (e: FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || safeItems.length === 0) {
      setError("Preencha um nome e garanta que a lista não está vazia.");
      return;
    }

    const dateObj = new Date();
    const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
    
    const newHistoryEntry: SavedList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      date: formattedDate,
      items: [...safeItems],
      traditionalTotal: currentTraditionalTotal,
      wholesaleTotal: currentWholesaleTotal,
      savingsTotal: currentSavingsTotal
    };

    setSavedLists([newHistoryEntry, ...savedLists]);
    setNewListName("");
    setSuccessMessage("Lista salva no histórico!");
  };

  const handleDeleteHistoryItem = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setSavedLists(savedLists.filter(list => list.id !== id));
  };

  const handleRestoreList = (pastList: SavedList) => {
    const generatedText = pastList.items.map(item => `${item.qty} de ${item.name}`).join("\n");
    setListInput(generatedText);
    setEditableItems(pastList.items);
    setLastSource("table");
    setResult({
      ...DEFAULT_RESULT,
      items: pastList.items,
      traditionalTotal: pastList.traditionalTotal,
      wholesaleTotal: pastList.wholesaleTotal,
      savingsTotal: pastList.savingsTotal,
      assistantMessage: "Lista restaurada do histórico!"
    });
    setSuccessMessage("Lista restaurada.");
  };

  const totalTraditionalInvested = savedLists.reduce((sum, list) => sum + list.traditionalTotal, 0) + currentTraditionalTotal;
  const totalWholesaleInvested = savedLists.reduce((sum, list) => sum + list.wholesaleTotal, 0) + currentWholesaleTotal;
  const cumulativeSavingsTotal = Math.max(0, totalTraditionalInvested - totalWholesaleInvested);
  const averageSavingPercent = totalTraditionalInvested > 0 
    ? ((cumulativeSavingsTotal / totalTraditionalInvested) * 100).toFixed(1)
    : "0.0";

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-6 flex flex-col justify-center items-center">
        <button onClick={() => handleEnterApp()} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl">
          Entrar no App
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans p-6 md:p-12">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-950">PechinchaBot</h1>
        <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="p-2 bg-white rounded-full border">
           {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
        </button>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div className="bg-rose-50 text-rose-800 p-4 rounded-3xl mb-6 border border-rose-200">
            <p className="font-bold">{error}</p>
            <button onClick={() => setError(null)} className="text-rose-500 font-bold mt-2">Fechar</button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div className="bg-emerald-50 text-emerald-800 p-4 rounded-3xl mb-6 border border-emerald-200">
            <p className="font-bold">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 font-bold mt-2">Dispensar</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border rounded-[2rem] p-7 shadow-sm">
            <div className="flex gap-2 mb-4 items-center">
              <input
                type="text"
                value={userLocation}
                onChange={(e) => setUserLocation(e.target.value)}
                placeholder="Localização..."
                className="w-full bg-slate-50 border p-3 rounded-xl outline-none"
              />
              <button onClick={getGPSLocation} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                 <MapPin className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={listInput}
              onChange={(e) => { setListInput(e.target.value); setLastSource("text"); }}
              placeholder="Digite sua lista aqui..."
              rows={6}
              className="w-full bg-slate-50 border p-4 rounded-xl outline-none"
            />
            <button
              onClick={() => optimizeShoppingList(listInput)}
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 text-white p-4 rounded-xl font-bold"
            >
              {loading ? "Calculando..." : "Calcular Economia com IA"}
            </button>
          </div>
          
          <div className="bg-[#1E293B] text-white border rounded-[2rem] p-7 shadow-sm">
            <h3 className="font-bold mb-4 text-emerald-400">Modelos Prontos</h3>
            <div className="space-y-3">
               {SAMPLE_LISTS.map((sample, i) => (
                 <button key={i} onClick={() => handleLoadSample(sample.text)} className="w-full text-left bg-slate-800 p-3 rounded-xl hover:bg-slate-700">
                    {sample.icon} {sample.title}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-8">
          <div className="bg-white border rounded-[2rem] p-7 shadow-sm flex flex-col min-h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl">Tabela Otimizada</h2>
              <button onClick={handleAddItem} className="bg-slate-100 p-2 rounded-lg font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b">
                    <th className="pb-3 pl-2">Item</th>
                    <th className="pb-3 text-center">Qtd.</th>
                    <th className="pb-3 text-right pr-2">Mercado</th>
                    <th className="pb-3 text-right pr-2 text-emerald-600">Atacadão</th>
                    <th className="pb-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {safeItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-50">
                      <td className="py-3 pl-2">
                         <input value={item.name} onChange={(e) => {
                            const updated = [...safeItems];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setEditableItemsAndSync(updated);
                         }} className="bg-transparent font-bold w-full outline-none" />
                      </td>
                      <td className="py-3 text-center">
                         <input value={item.qty} onChange={(e) => handleUpdateQty(index, e.target.value)} className="bg-transparent text-center w-12 font-mono outline-none" />
                      </td>
                      <td className="py-3 text-right pr-2 font-mono">
                         R$ <input type="number" value={item.priceTraditional} onChange={(e) => handleUpdatePrice(index, "priceTraditional", parseFloat(e.target.value))} className="w-12 bg-transparent text-right outline-none" />
                      </td>
                      <td className="py-3 text-right pr-2 font-mono font-bold text-emerald-600">
                         R$ <input type="number" value={item.priceWholesale} onChange={(e) => handleUpdatePrice(index, "priceWholesale", parseFloat(e.target.value))} className="w-12 bg-transparent text-right outline-none" />
                      </td>
                      <td className="py-3 text-center">
                         <button onClick={() => handleRemoveItem(index)} className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {safeItems.length === 0 && !loading && (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-400 font-bold">Nenhum item na lista.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-between items-center text-lg font-black">
               <span>Total Tradicional: R$ {currentTraditionalTotal.toFixed(2)}</span>
               <span className="text-emerald-600">Total Atacado: R$ {currentWholesaleTotal.toFixed(2)}</span>
            </div>
            
            {result?.assistantMessage && (
              <div className="mt-6 bg-emerald-50 p-4 rounded-xl text-emerald-900 italic font-medium">
                 🤖 {result.assistantMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
