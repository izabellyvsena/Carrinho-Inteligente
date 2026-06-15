/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent } from "react";
import * as Sentry from "@sentry/react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, Sparkles, Plus, Trash2, AlertTriangle, CheckCircle, 
  ArrowRight, TrendingUp, Store, RefreshCw, MapPin, Flame, 
  UtensilsCrossed, DollarSign, History, ArchiveRestore, 
  ShieldCheck, HelpCircle, X, Star, Sun, Moon
} from "lucide-react";
import { AnimatedCounter } from "./components/AnimatedCounter";

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

interface EconomyCenter {
  name: string;
  address: string;
  badge: string;
  desc: string;
  active: boolean;
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
  assistantMessage: "Olá! Digite sua lista e clique em 'Calcular Economia com IA' para começar.",
  economyCenters: []
};

export default function App() {
  const [listInput, setListInput] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userLocation, setUserLocation] = useState<string>("Baixada Fluminense, RJ");
  const [result, setResult] = useState<AnalyseResult>(DEFAULT_RESULT);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editableItems, setEditableItems] = useState<Item[]>([]);
  const [lastSource, setLastSource] = useState<"text" | "table">("text");

  // Função robusta de otimização com tratamento de erro real
  const optimizeShoppingList = async (textToAnalyse: string, locOverride?: string) => {
    if (!textToAnalyse.trim()) {
      setError("Insira itens na lista.");
      return;
    }

    setLoading(true);
    setError(null);
    const targetLoc = locOverride || userLocation;

    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listText: textToAnalyse,
          location: targetLoc,
          items: lastSource === "table" ? editableItems : undefined
        }),
      });
      
      const data = await response.json();
      
      // Validação de segurança: se não for um objeto válido, força o fallback
      if (!response.ok || !data || typeof data !== 'object') {
        throw new Error("Formato de resposta inválido.");
      }
      
      setResult(data);
      setEditableItems(data.items || []);
    } catch (err: any) {
      console.error("Erro na otimização:", err);
      // Fallback seguro: não quebra a tela, apenas avisa o usuário
      setResult(DEFAULT_RESULT);
      setError("O servidor não respondeu corretamente. Verifique sua chave API no Render.");
    } finally {
      setLoading(false);
    }
  };

  // ... [Mantenha aqui as outras funções: handleUpdatePrice, handleRemoveItem, etc.] ...

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 p-6">
       {/* Conteúdo do seu App.tsx */}
       {/* Certifique-se de que onde você chama result.items, você use result?.items || [] */}
       {/* Exemplo: {result?.items?.map(...) } */}
       <div className="p-4">
         <button onClick={() => optimizeShoppingList(listInput)} disabled={loading}>
            {loading ? "Calculando..." : "Calcular Economia com IA !"}
         </button>
       </div>
    </div>
  );
}
