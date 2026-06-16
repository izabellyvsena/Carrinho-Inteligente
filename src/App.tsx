/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent } from "react";
import * as Sentry from "@sentry/react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  MapPin,
  Sun,
  Moon
} from "lucide-react";

interface Item {
  name: string;
  qty: number; // Alterado para number para facilitar o cálculo
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
}

const DEFAULT_RESULT: AnalyseResult = {
  items: [],
  suggestions: [],
  traditionalTotal: 0,
  wholesaleTotal: 0,
  savingsTotal: 0,
  assistantMessage: "Olá! Digite sua lista e clique em 'Calcular Economia' para ver a mágica ocorrer.",
};

const SAMPLE_LISTS = [
  {
    title: "Básico Mensal Familiar",
    icon: "📦",
    text: "2 unidades de Arroz de 5kg\n5 pacotes de Feijão Preto 1kg\n4 unidades de Óleo de Soja\n12 caixas de Leite Integral"
  }
];

export default function App() {
  const [listInput, setListInput] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userLocation, setUserLocation] = useState<string>("Baixada Fluminense, RJ");
  const [result, setResult] = useState<AnalyseResult>(DEFAULT_RESULT);
  const [loading, setLoading] = useState<boolean>(false);
  const [editableItems, setEditableItems] = useState<Item[]>([]);

  // CORREÇÃO: O cálculo agora multiplica o preço pela quantidade (qty)
  const currentTraditionalTotal = editableItems.reduce((acc, item) => 
    acc + ((item.priceTraditional || 0) * (item.qty || 1)), 0);
    
  const currentWholesaleTotal = editableItems.reduce((acc, item) => 
    acc + ((item.priceWholesale || 0) * (item.qty || 1)), 0);

  const handleUpdatePrice = (index: number, field: "priceTraditional" | "priceWholesale", value: number) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: isNaN(value) ? 0 : value };
    setEditableItems(updated);
  };

  const handleUpdateQty = (index: number, value: string) => {
    const updated = [...editableItems];
    // Converte o input para número para o cálculo funcionar
    updated[index] = { ...updated[index], qty: parseInt(value) || 1 };
    setEditableItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const optimizeShoppingList = async (textToAnalyse: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listText: textToAnalyse, location: userLocation }),
      });
      const data = await response.json();
      setResult(data);
      setEditableItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6">
      <h1 className="text-3xl font-black mb-8">PechinchaBot</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Painel de entrada */}
        <div className="col-span-4 bg-white p-6 rounded-3xl border">
            <textarea
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              className="w-full bg-slate-50 border p-4 rounded-xl mb-4"
              rows={6}
            />
            <button
              onClick={() => optimizeShoppingList(listInput)}
              className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold"
            >
              {loading ? "Calculando..." : "Calcular Economia com IA"}
            </button>
        </div>

        {/* Tabela de Resultados */}
        <div className="col-span-8 bg-white p-6 rounded-3xl border">
            <table className="w-full">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase border-b">
                        <th className="pb-3 text-left">Item</th>
                        <th className="pb-3 text-center">Qtd.</th>
                        <th className="pb-3 text-right">Tradicional</th>
                        <th className="pb-3 text-right text-emerald-600">Atacadão</th>
                    </tr>
                </thead>
                <tbody>
                  {editableItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 font-bold">{item.name}</td>
                      <td className="py-3 text-center">
                         <input type="number" value={item.qty} onChange={(e) => handleUpdateQty(index, e.target.value)} className="w-12 bg-slate-100 text-center rounded" />
                      </td>
                      <td className="py-3 text-right">R$ {item.priceTraditional.toFixed(2)}</td>
                      <td className="py-3 text-right font-bold text-emerald-600">R$ {item.priceWholesale.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
            </table>

            {/* A SOMA AGORA É MULTIPLICADA PELA QUANTIDADE */}
            <div className="mt-8 pt-6 border-t flex justify-between font-black text-lg">
               <span>Total Tradicional: R$ {currentTraditionalTotal.toFixed(2)}</span>
               <span className="text-emerald-600">Total Atacado: R$ {currentWholesaleTotal.toFixed(2)}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
