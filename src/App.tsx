/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Plus, Trash2, MapPin, Sparkles, ArrowRight } from "lucide-react";

interface Item {
  name: string;
  qty: number;
  priceTraditional: number;
  priceWholesale: number;
}

const SAMPLE_LISTS = [
  {
    title: "Marmitas Fitness Semanal",
    description: "Rica em proteínas",
    icon: "🍗",
    text: "3kg de peito de frango, 2 dúzias de ovos, 1kg de batata doce, 2 brócolis"
  },
  {
    title: "Básico Mensal Familiar",
    description: "Alimentos não perecíveis",
    icon: "📦",
    text: "5 pacotes de arroz 1kg, 3 pacotes de feijão preto 1kg, 2 óleos de soja, 1 café"
  },
  {
    title: "Café da Manhã & Lanches",
    description: "Rápido e prático",
    icon: "☕",
    text: "2 pacotes de pão de forma, 1 manteiga, 12 caixas de leite, 1 achocolatado"
  }
];

export default function App() {
  const [listInput, setListInput] = useState<string>("");
  const [editableItems, setEditableItems] = useState<Item[]>([]);
  const [assistantMessage, setAssistantMessage] = useState<string>("Total de gastos com compras da loja.");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const currentTraditionalTotal = editableItems.reduce((acc, item) => 
    acc + (item.priceTraditional * item.qty), 0);
    
  const currentWholesaleTotal = editableItems.reduce((acc, item) => 
    acc + (item.priceWholesale * item.qty), 0);

  const handleUpdateQty = (index: number, value: string) => {
    const updated = [...editableItems];
    const newQty = parseInt(value);
    updated[index] = { ...updated[index], qty: isNaN(newQty) ? 0 : newQty };
    setEditableItems(updated);
  };

  const handleUpdateName = (index: number, value: string) => {
    const updated = [...editableItems];
    updated[index].name = value;
    setEditableItems(updated);
  };

  const handleUpdatePrice = (index: number, field: "priceTraditional" | "priceWholesale", value: string) => {
    const updated = [...editableItems];
    const newPrice = parseFloat(value.replace(',', '.'));
    updated[index] = { ...updated[index], [field]: isNaN(newPrice) ? 0 : newPrice };
    setEditableItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setEditableItems([...editableItems, { name: "novo item", qty: 1, priceTraditional: 0, priceWholesale: 0 }]);
  };

  const optimizeShoppingList = async (overrideText?: string) => {
    const textToProcess = overrideText || listInput;
    if (!textToProcess.trim()) return;
    
    setLoading(true);
    setError(null);
    if (overrideText) setListInput(overrideText);
    
    try {
      const response = await fetch("/api/check-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listText: textToProcess }),
      });

      if (!response.ok) throw new Error("Erro de comunicação com o servidor.");
      
      const data = await response.json();
      
      const rawItems = Array.isArray(data.items) ? data.items : [];
      const safeItems = rawItems.map((item: any) => {
        const parsePrice = (val: any) => {
          if (typeof val === 'string') {
            return parseFloat(val.replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0;
          }
          return typeof val === 'number' ? val : 0;
        };

        return {
          name: item.name || "item",
          qty: parseInt(item.qty) || 1,
          priceTraditional: parsePrice(item.priceTraditional),
          priceWholesale: parsePrice(item.priceWholesale)
        };
      });

      setEditableItems(safeItems);
      if (data.assistantMessage) {
        setAssistantMessage(data.assistantMessage);
      }
    } catch (err) {
      setError("Não foi possível conectar à IA. Verifique se o servidor está online.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] text-slate-100 font-sans p-4 md:p-8">
      {/* SEÇÃO DE LISTAS PRONTAS */}
      <div className="mb-12 max-w-5xl mx-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          🔥 Listas prontas de exemplo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_LISTS.map((list, index) => (
            <button
              key={index}
              onClick={() => optimizeShoppingList(list.text)}
              disabled={loading}
              className="bg-[#151E32] border border-slate-700/50 hover:border-slate-500 p-5 rounded-3xl flex items-center justify-between text-left transition-all hover:bg-slate-800/80 group w-full"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl bg-[#1E293B] p-3 rounded-xl group-hover:scale-110 transition-transform">
                  {list.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{list.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{list.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors hidden md:block" />
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto bg-rose-500/10 text-rose-400 p-4 rounded-2xl mb-6 border border-rose-500/20 font-bold">
          {error}
        </div>
      )}

      {/* ÁREA PRINCIPAL E COMPARATIVO */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#151E32] border border-slate-700/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
          
          <div className="mb-8">
            <h2 className="font-black text-xl md:text-2xl text-white flex items-center gap-3 mb-2">
               📊 COMPARATIVO DE ECONOMIA
            </h2>
            <p className="text-slate-400 text-sm">
               Valores locais autênticos de atacarejo. <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-xs">Clique</span> para editar quantidades ou preços e recalcular em tempo real.
            </p>
          </div>

          <button onClick={handleAddItem} className="bg-slate-50 hover:bg-white text-emerald-600 px-8 py-2 rounded-2xl text-2xl font-black mb-8 transition-colors shadow-sm">
            +
          </button>
          
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-[10px] md:text-xs uppercase text-slate-500 border-b border-slate-700/50">
                  <th className="pb-4 pl-2 font-bold tracking-wider">Item / Ingrediente</th>
                  <th className="pb-4 text-center font-bold tracking-wider">Quant.</th>
                  <th className="pb-4 text-right pr-4 font-bold tracking-wider">Mercado Padrão</th>
                  <th className="pb-4 text-right pr-4 font-bold tracking-wider text-emerald-500">No Atacadão</th>
                  <th className="pb-4 text-center font-bold tracking-wider">Economia</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {editableItems.map((item, index) => {
                  const itemEconomy = (item.priceTraditional - item.priceWholesale) * item.qty;
                  return (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/20 transition-colors group">
                      <td className="py-4 pl-2">
                         <input 
                           type="text" 
                           value={item.name} 
                           onChange={(e) => handleUpdateName(index, e.target.value)} 
                           className="bg-[#1E293B] border border-transparent focus:border-emerald-500/50 text-white font-bold text-sm rounded-xl px-3 py-2.5 w-full outline-none transition-colors"
                         />
                      </td>
                      <td className="py-4 text-center">
                         <input 
                           type="number" 
                           value={item.qty === 0 ? "" : item.qty} 
                           onChange={(e) => handleUpdateQty(index, e.target.value)} 
                           min="1"
                           className="bg-[#1E293B] border border-transparent focus:border-emerald-500/50 text-center text-white font-bold text-sm rounded-xl px-2 py-2.5 w-16 outline-none transition-colors mx-auto block" 
                         />
                      </td>
                      <td className="py-4 text-right pr-4">
                         <div className="flex items-center justify-end gap-2">
                            <span className="text-slate-500 text-xs font-bold">R$</span>
                            <input 
                              type="number" 
                              value={item.priceTraditional === 0 ? "" : item.priceTraditional} 
                              onChange={(e) => handleUpdatePrice(index, "priceTraditional", e.target.value)} 
                              className="bg-[#1E293B] border border-transparent focus:border-emerald-500/50 text-right text-white font-mono font-bold text-sm rounded-xl px-3 py-2.5 w-20 outline-none transition-colors" 
                            />
                         </div>
                      </td>
                      <td className="py-4 text-right pr-4">
                         <div className="flex items-center justify-end gap-2">
                            <span className="text-emerald-500/70 text-xs font-bold">R$</span>
                            <input 
                              type="number" 
                              value={item.priceWholesale === 0 ? "" : item.priceWholesale} 
                              onChange={(e) => handleUpdatePrice(index, "priceWholesale", e.target.value)} 
                              className="bg-[#1E293B] border border-transparent focus:border-emerald-500 text-right text-emerald-400 font-mono font-bold text-sm rounded-xl px-3 py-2.5 w-20 outline-none transition-colors" 
                            />
                         </div>
                      </td>
                      <td className="py-4 text-center">
                         <span className="bg-emerald-500/10 text-emerald-400 font-mono font-bold px-3 py-1.5 rounded-lg text-sm border border-emerald-500/20">
                            R$ {formatCurrency(itemEconomy > 0 ? itemEconomy : 0)}
                         </span>
                      </td>
                      <td className="py-4 text-center">
                         <button onClick={() => handleRemoveItem(index)} className="text-slate-600 hover:text-rose-400 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </td>
                    </tr>
                  )
                })}
                {editableItems.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500 font-medium text-sm">
                      Nenhum item adicionado. Adicione manualmente ou selecione uma lista pronta.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALIZADORES */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 px-4">
             <div className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2 md:mb-0">
                Total Padrão: <span className="text-slate-200 text-lg ml-2">R$ {formatCurrency(currentTraditionalTotal)}</span>
             </div>
             <div className="text-emerald-500/70 font-bold uppercase tracking-wider text-xs">
                Total Atacadão: <span className="text-emerald-400 text-2xl ml-2 font-black">R$ {formatCurrency(currentWholesaleTotal)}</span>
             </div>
          </div>

          {/* CARD DO ROBÔ (PechinchaBot Otimizador) */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
             <div className="bg-emerald-400/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                <span className="text-3xl">🤖</span>
             </div>
             
             <div className="flex justify-between items-center mb-3">
                <span className="text-emerald-500 font-black text-[10px] md:text-xs tracking-widest uppercase">
                   PechinchaBot Otimizador
                </span>
                <span className="bg-emerald-500 text-[#0B1121] text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                   Análise Regional
                </span>
             </div>
             
             <p className="text-slate-300 italic text-sm md:text-base font-medium leading-relaxed">
                "{assistantMessage}"
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
