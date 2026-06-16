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
    <div className="min-
