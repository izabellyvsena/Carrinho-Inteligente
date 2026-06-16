/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Plus, Trash2, MapPin, Sparkles } from "lucide-react";

interface Item {
  name: string;
  qty: number;
  priceTraditional: number;
  priceWholesale: number;
}

export default function App() {
  const [listInput, setListInput] = useState<string>("");
  const [editableItems, setEditableItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // CÁLCULO MATEMÁTICO REAL: (Preço * Quantidade)
  const currentTraditionalTotal = editableItems.reduce((acc, item) => 
    acc + ((item.priceTraditional || 0) * (item.qty || 1)), 0);
    
  const currentWholesaleTotal = editableItems.reduce((acc, item) => 
    acc + ((item.priceWholesale || 0) * (item.qty || 1)), 0);

  const handleUpdateQty = (index: number, value: string) => {
    const updated = [...editableItems];
    const newQty = parseInt(value);
    updated[index] = { ...updated[index], qty: isNaN(newQty) ? 0 : newQty };
    setEditableItems(updated);
  };

  const handleUpdatePrice = (index: number, field: "priceTraditional" | "priceWholesale", value: string) => {
    const updated = [...editableItems];
    const newPrice = parseFloat(value);
    updated[index] = { ...updated[index], [field]: isNaN(newPrice) ? 0 : newPrice };
    setEditableItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setEditableItems([...editableItems, { name: "Novo Item", qty: 1, priceTraditional: 0, priceWholesale: 0 }]);
  };

  const optimizeShoppingList = async () => {
    if (!listInput.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listText: listInput }),
      });

      if (!response.ok) throw new Error("Erro de comunicação com o servidor.");
      
      const data = await response.json();
      setEditableItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError("Não foi possível conectar à IA. Verifique se o servidor está online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans p-6 md:p-12">
      <header className="mb-10 flex justify-between items-center">
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <Sparkles className="text-emerald-400" /> PechinchaBot
        </h1>
      </header>

      {error && (
        <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl mb-6 border border-rose-500/20 font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUNA ESQUERDA: INPUT */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-[2rem] p-7 shadow-xl">
            <div className="flex gap-2 mb-4 items-center">
              <div className="w-full bg-slate-900/50 border border-slate-700/50 p-3 rounded-xl flex items-center text-slate-400">
                <MapPin className="w-5 h-5 mr-2" /> Baixada Fluminense, RJ
              </div>
            </div>
            <textarea
              value={listInput}
              onChange={(e) => setListInput(e.target.value)}
              placeholder="Digite sua lista aqui (Ex: 12 leites, 2 arrozes...)"
              rows={6}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white p-4 rounded-xl outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              onClick={optimizeShoppingList}
              disabled={loading}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 rounded-xl font-black transition-colors"
            >
              {loading ? "Processando com IA..." : "Calcular Economia com IA"}
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: TABELA OTIMIZADA */}
        <div className="col-span-1 lg:col-span-8">
          <div className="bg-[#1E293B] border border-slate-700/50 rounded-[2rem] p-7 shadow-xl flex flex-col min-h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl text-white">Comparativo de Economia</h2>
              <button onClick={handleAddItem} className="bg-slate-700 hover:bg-slate-600 text-white p-2 px-4 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
            
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 border-b border-slate-700/50">
                    <th className="pb-3 pl-2">Item</th>
                    <th className="pb-3 text-center">Quant.</th>
                    <th className="pb-3 text-right pr-4">Mercado Padrão</th>
                    <th className="pb-3 text-right pr-2 text-emerald-400">No Atacadão</th>
                    <th className="pb-3 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {editableItems.map((item, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pl-2 font-bold">{item.name}</td>
                      <td className="py-4 text-center">
                         <input 
                           type="number" 
                           value={item.qty} 
                           onChange={(e) => handleUpdateQty(index, e.target.value)} 
                           className="w-14 bg-slate-900 border border-slate-700 text-center text-white rounded-lg p-1 outline-none focus:border-emerald-500" 
                         />
                      </td>
                      <td className="py-4 text-right pr-4 font-mono text-slate-300">
                         R$ {(item.priceTraditional * item.qty).toFixed(2)}
                      </td>
                      <td className="py-4 text-right pr-2 font-mono font-bold text-emerald-400">
                         R$ {(item.priceWholesale * item.qty).toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                         <button onClick={() => handleRemoveItem(index)} className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  ))}
                  {editableItems.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 font-medium">
                        Sua lista otimizada aparecerá aqui.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-between items-center text-lg md:text-xl font-black">
               <span className="text-slate-300">Total Padrão: R$ {currentTraditionalTotal.toFixed(2)}</span>
               <span className="text-emerald-400">Total Atacadão: R$ {currentWholesaleTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
