import { useState } from "react";

interface Item {
  name: string;
  qty: number;
  priceTraditional: number;
  subtotalTraditional: number;
  priceWholesale: number;
  subtotalWholesale: number;
}

export default function App() {
  const [listInput, setListInput] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [totals, setTotals] = useState({ trad: 0, atac: 0 });

  const optimize = async () => {
    const res = await fetch("/api/check-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listText: listInput }),
    });
    const data = await res.json();
    setItems(data.items);
    setTotals({ trad: data.traditionalTotal, atac: data.wholesaleTotal });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-black mb-4">PechinchaBot</h1>
      <textarea className="w-full border p-2 mb-2" onChange={(e) => setListInput(e.target.value)} />
      <button onClick={optimize} className="bg-emerald-600 text-white p-2 rounded">Calcular</button>

      <table className="w-full mt-6 border-collapse">
        <thead>
          <tr className="text-xs uppercase text-slate-400 border-b">
            <th className="text-left">Item</th>
            <th>Qtd</th>
            <th className="text-right">Total Trad.</th>
            <th className="text-right text-emerald-600">Total Atac.</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b text-sm">
              <td className="py-2">{item.name}</td>
              <td className="text-center">{item.qty}</td>
              <td className="text-right">R$ {item.subtotalTraditional.toFixed(2)}</td>
              <td className="text-right text-emerald-600 font-bold">R$ {item.subtotalWholesale.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 font-black flex justify-between">
        <span>Total: R$ {totals.trad.toFixed(2)}</span>
        <span className="text-emerald-600">Total Atacado: R$ {totals.atac.toFixed(2)}</span>
      </div>
    </div>
  );
}
