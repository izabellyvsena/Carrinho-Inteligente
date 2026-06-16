/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface Item {
  name: string;
  qty: number;
  priceTraditional: number;
  priceWholesale: number;
}

interface AnalyseResult {
  items: Item[];
  traditionalTotal: number;
  wholesaleTotal: number;
  assistantMessage: string;
}

const DEFAULT_RESULT: AnalyseResult = {
  items: [],
  traditionalTotal: 0,
  wholesaleTotal: 0,
  assistantMessage: "",
};

export default function App() {
  const [listInput, setListInput] = useState<string>("");
  const [editableItems, setEditableItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cálculo matemático corrigido: Preço * Quantidade
  const currentTraditionalTotal = editableItems.reduce((acc, item) => 
    acc + ((item.priceTraditional || 0) * (item.qty || 1)), 0);
    
  const currentWholesaleTotal = editableItems.reduce((acc, item) => 
    acc + ((item.priceWholesale || 0) * (item.qty || 1)), 0);

  const handleUpdateQty = (index: number, value: string) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], qty: parseInt(value) || 0 };
    setEditableItems(updated);
  };

  const optimizeShoppingList = async () => {
    if (!listInput.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listText: listInput, location: "Baixada Fluminense, RJ" }),
      });

      if (!response.ok) throw new Error("Erro no servidor");
      
      const data = await response.json();
      setEditableItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError("Ops! Não consegui conectar com a IA. Verifique sua internet ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-10 font-sans">
      <h1 className="text-2xl font-black mb-6">PechinchaBot</h1>
      
      {/* Exibição de erro para não ficar tela branca */}
      {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4 font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <textarea
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              className="w-full bg-slate-50 border p-4 rounded-xl mb-4 h-32"
              placeholder="Ex: 12 leites, 2 arrozes..."
            />
            <button
              onClick={optimizeShoppingList}
              disabled={loading}
              className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold"
            >
              {loading ? "Processando..." : "Calcular Economia com IA"}
            </button>
        </div>

        <div className="bg-white p-6 rounded-3xl border shadow-sm">
            <table className="w-full mb-6">
                <thead>
                    <tr className="text-slate-400 text-xs uppercase border-b">
                        <th className="pb-2 text-left">Item</th>
                        <th className="pb-2 text-center">Qtd</th>
                        <th className="pb-2 text-right">R$</th>
                        <th className="pb-2 text-right text-emerald-600">Atacado</th>
                    </tr>
                </thead>
                <tbody>
                  {editableItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 text-sm font-bold">{item.name}</td>
                      <td className="py-2 text-center">
                         <input type="number" value={item.qty} onChange={(e) => handleUpdateQty(index, e.target.value)} className="w-10 bg-slate-100 text-center rounded" />
                      </td>
                      <td className="py-2 text-right text-sm">{(item.priceTraditional * item.qty).toFixed(2)}</td>
                      <td className="py-2 text-right text-sm font-bold text-emerald-600">{(item.priceWholesale * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
            </table>

            <div className="flex justify-between font-black text-md">
               <span>Trad: R$ {currentTraditionalTotal.toFixed(2)}</span>
               <span className="text-emerald-600">Atac: R$ {currentWholesaleTotal.toFixed(2)}</span>
            </div>
        </div>
      </div>
    </div>
  );
}
