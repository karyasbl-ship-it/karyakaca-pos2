import React, { useEffect, useMemo, useState } from "react";

// ============================================================= // KARYA • POS + Bahan Baku + Produksi + Laporan (Versi Lengkap) // - Single-file React (siap dipakai untuk project Vite/CRA) // - Tailwind utility classes // - Data disimpan di localStorage (client-side) // =============================================================

// ---------- Helpers ---------- const uid = () => Math.random().toString(36).slice(2, 10); const todayISO = () => new Date().toISOString(); const fmtIDR = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0); const fromLocal = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch { return def; } }; const toLocal = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ---------- Initial Seeds ---------- const initialMaterials = [ { id: uid(), name: "Kaca Tempered 8mm", unit: "m²", stock: 50, price: 550000 }, { id: uid(), name: "Kaca Bening 5mm", unit: "m²", stock: 200, price: 300000 }, { id: uid(), name: "Profil Aluminium 3"", unit: "m", stock: 500, price: 65000 }, { id: uid(), name: "Engsel Pintu Kaca", unit: "pcs", stock: 100, price: 45000 }, { id: uid(), name: "Handle Pintu (set)", unit: "set", stock: 50, price: 250000 }, { id: uid(), name: "Sealant Silicone", unit: "tube", stock: 80, price: 35000 }, ];

const initialServices = [ { id: uid(), name: "Jasa Pemasangan Kaca", unit: "m²", price: 150000 }, { id: uid(), name: "Jasa Pemasangan Aluminium", unit: "m", price: 40000 }, { id: uid(), name: "Survey & Pengukuran", unit: "item", price: 50000 }, ];

const makeInitialProducts = (materials) => { // contoh 1 produk jadi (Pintu Kaca) dgn resep const kaca8 = materials.find(m => m.name.includes("Tempered 8mm"))?.id; const alu3 = materials.find(m => m.name.includes("Profil Aluminium"))?.id; const engsel = materials.find(m => m.name.includes("Engsel"))?.id; const handle = materials.find(m => m.name.includes("Handle"))?.id; return [ { id: uid(), name: "Pintu Kaca (1 daun)", unit: "unit", stock: 0, price: 1800000, recipe: [ kaca8 ? { materialId: kaca8, qty: 1.8 } : null, // m² alu3 ? { materialId: alu3, qty: 6 } : null, // meter engsel ? { materialId: engsel, qty: 3 } : null, // pcs handle ? { materialId: handle, qty: 1 } : null, // set ].filter(Boolean), }, ]; };

// ---------- App ---------- export default function App() { const [tab, setTab] = useState("penjualan");

const [company, setCompany] = useState(() => fromLocal("karya_company", { name: "KARYA Kaca & Aluminium", address: "Jl. Contoh No. 1, Sumbul - Dairi", phone: "0852-6222-2676", }));

const [materials, setMaterials] = useState(() => fromLocal("karya_materials", initialMaterials)); const [products, setProducts] = useState(() => fromLocal("karya_products", makeInitialProducts(initialMaterials))); const [services, setServices] = useState(() => fromLocal("karya_services", initialServices));

const [sales, setSales] = useState(() => fromLocal("karya_sales", [])); const [purchases, setPurchases] = useState(() => fromLocal("karya_purchases", []));

useEffect(() => { toLocal("karya_company", company); }, [company]); useEffect(() => { toLocal("karya_materials", materials); }, [materials]); useEffect(() => { toLocal("karya_products", products); }, [products]); useEffect(() => { toLocal("karya_services", services); }, [services]); useEffect(() => { toLocal("karya_sales", sales); }, [sales]); useEffect(() => { toLocal("karya_purchases", purchases); }, [purchases]);

// ---------- CRUD: Materials ---------- const addMaterial = (m) => setMaterials((arr) => [...arr, { id: uid(), stock: 0, price: 0, unit: "pcs", ...m }]); const updateMaterial = (id, patch) => setMaterials((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a))); const deleteMaterial = (id) => setMaterials((arr) => arr.filter((a) => a.id !== id));

// ---------- CRUD: Services ---------- const addService = (s) => setServices((arr) => [...arr, { id: uid(), unit: "item", price: 0, ...s }]); const updateService = (id, patch) => setServices((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a))); const deleteService = (id) => setServices((arr) => arr.filter((a) => a.id !== id));

// ---------- CRUD: Products (with recipe) ---------- const addProduct = (p) => setProducts((arr) => [...arr, { id: uid(), stock: 0, unit: "unit", price: 0, recipe: [], ...p }]); const updateProduct = (id, patch) => setProducts((arr) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a))); const deleteProduct = (id) => setProducts((arr) => arr.filter((a) => a.id !== id)); const setProductRecipe = (id, recipe) => setProducts((arr) => arr.map((a) => (a.id === id ? { ...a, recipe } : a)));

// ---------- Inventory Movements ---------- function purchaseIn({ supplier, lines, note }) { // lines: [{materialId, qty, price}] const po = { id: PO-${uid().toUpperCase()}, date: todayISO(), supplier, lines, note, total: lines.reduce((a, l) => a + l.qty * l.price, 0) }; setPurchases((p) => [po, ...p]); setMaterials((mats) => mats.map((m) => { const line = lines.find((l) => l.materialId === m.id); if (!line) return m; return { ...m, stock: (m.stock || 0) + Number(line.qty), price: m.price || line.price }; })); return po.id; }

function produceProduct(productId, qty) { qty = Number(qty); const product = products.find((p) => p.id === productId); if (!product) return alert("Produk tidak ditemukan"); if (!qty || qty <= 0) return alert("Qty produksi harus > 0");

// cek kecukupan stok bahan baku
const lack = product.recipe.filter((r) => {
  const mat = materials.find((m) => m.id === r.materialId);
  return !mat || (mat.stock || 0) < r.qty * qty;
});
if (lack.length) {
  const names = lack.map((r) => materials.find((m) => m.id === r.materialId)?.name || "(tidak ditemukan)").join(", ");
  return alert(`Stok bahan baku kurang: ${names}`);
}

// kurangi stok material
setMaterials((mats) => mats.map((m) => {
  const r = product.recipe.find((x) => x.materialId === m.id);
  return r ? { ...m, stock: Number((m.stock || 0) - r.qty * qty) } : m;
}));

// tambah stok produk jadi
setProducts((arr) => arr.map((p) => (p.id === productId ? { ...p, stock: Number((p.stock || 0) + qty) } : p)));

alert(`Produksi berhasil: ${product.name} +${qty} unit (stok bahan baku dikurangi).`);

}

// ---------- Sales / Invoice ---------- function createInvoice({ customer, lines, discount = 0, taxPct = 0, paid = 0, note }) { // lines: [{type: 'product'|'service'|'material', refId, name, unit, qty, price}] const subtotal = lines.reduce((a, l) => a + l.qty * l.price, 0); const discountAmount = typeof discount === "number" && discount < 1 ? subtotal * discount : Number(discount || 0); const taxed = (subtotal - discountAmount) * (1 + Number(taxPct || 0)); const total = Math.round(taxed); const inv = { id: INV-${uid().toUpperCase()}, date: todayISO(), customer, lines, subtotal, discountAmount, taxPct, total, paid, due: Math.max(total - paid, 0), note, status: paid >= total ? "LUNAS" : paid > 0 ? "DP" : "BELUM BAYAR" };

// apply stock movements for products & materials (services tidak punya stok)
setProducts((arr) => arr.map((p) => {
  const line = lines.find((l) => l.type === "product" && l.refId === p.id);
  return line ? { ...p, stock: Math.max(Number((p.stock || 0) - Number(line.qty)), 0) } : p;
}));
setMaterials((arr) => arr.map((m) => {
  const line = lines.find((l) => l.type === "material" && l.refId === m.id);
  return line ? { ...m, stock: Math.max(Number((m.stock || 0) - Number(line.qty)), 0) } : m;
}));

setSales((s) => [inv, ...s]);
return inv.id;

}

// ---------- Small UI Parts ---------- const Section = ({ title, right, children }) => ( <section className="bg-white rounded-2xl shadow-sm border p-4"> <div className="flex items-center justify-between mb-3"> <h3 className="text-lg font-semibold">{title}</h3> {right} </div> {children} </section> );

// -------- Penjualan -------- function Penjualan() { const [customer, setCustomer] = useState(""); const [note, setNote] = useState(""); const [discount, setDiscount] = useState(0); // nominal const [taxPct, setTaxPct] = useState(0); // mis. 0.11 utk PPN 11% const [includeMaterials, setIncludeMaterials] = useState(false); const [lines, setLines] = useState([]);

const searchList = useMemo(() => {
  let list = [
    ...products.map((p) => ({ type: "product", refId: p.id, name: p.name, unit: p.unit, price: p.price, stock: p.stock })),
    ...services.map((s) => ({ type: "service", refId: s.id, name: s.name, unit: s.unit, price: s.price, stock: null })),
  ];
  if (includeMaterials) list = [
    ...list,
    ...materials.map((m) => ({ type: "material", refId: m.id, name: m.name, unit: m.unit, price: m.price, stock: m.stock })),
  ];
  return list;
}, [products, services, materials, includeMaterials]);

const [q, setQ] = useState("");
const filtered = useMemo(() => searchList.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())), [q, searchList]);

const addLine = (item) => setLines((ls) => [...ls, { ...item, qty: 1 }]);
const updateLine = (i, patch) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
const deleteLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i));

const sub = lines.reduce((a, l) => a + l.qty * l.price, 0);
const total = Math.round((sub - Number(discount || 0)) * (1 + Number(taxPct || 0)));

const doSave = () => {
  if (!lines.length) return alert("Tambahkan item dulu");
  const id = createInvoice({ customer: customer || "UMUM", lines, discount, taxPct, paid: 0, note });
  setCustomer(""); setLines([]); setDiscount(0); setTaxPct(0); setNote("");
  alert(`Invoice ${id} tersimpan!`);
};

return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Section title="Cari & Tambah Item" right={
      <label className="text-sm flex items-center gap-2">
        <input type="checkbox" className="accent-black" checked={includeMaterials} onChange={(e) => setIncludeMaterials(e.target.checked)} />
        Sertakan Material (bahan baku)
      </label>
    }>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk/jasa/material..." className="w-full border rounded-xl px-3 py-2 mb-3" />
      <div className="max-h-[380px] overflow-auto divide-y">
        {filtered.map((c) => (
          <div key={`${c.type}-${c.refId}`} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">{c.type.toUpperCase()} • {c.unit} {c.stock!=null ? `• Stok: ${c.stock}` : ""}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm tabular-nums">{fmtIDR(c.price)}</div>
              <button className="text-xs px-2 py-1 rounded-lg bg-black text-white" onClick={() => addLine(c)}>Pilih</button>
            </div>
          </div>
        ))}
        {!filtered.length && <div className="text-gray-500 text-sm py-2">Tidak ada hasil</div>}
      </div>
    </Section>

    <Section title="Keranjang / Invoice">
      <div className="space-y-2">
        <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nama pelanggan" className="w-full border rounded-xl px-3 py-2" />
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Harga</th>
                <th className="p-2 text-right">Subtotal</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.type.toUpperCase()} • {l.unit}</div>
                  </td>
                  <td className="p-2 text-center">
                    <input type="number" min="0" step="0.01" value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) })} className="w-20 border rounded-lg px-2 py-1 text-right" />
                  </td>
                  <td className="p-2 text-right">
                    <input type="number" min="0" step="100" value={l.price} onChange={(e) => updateLine(i, { price: Number(e.target.value) })} className="w-28 border rounded-lg px-2 py-1 text-right" />
                  </td>
                  <td className="p-2 text-right">{fmtIDR(l.qty * l.price)}</td>
                  <td className="p-2 text-right"><button className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg" onClick={() => deleteLine(i)}>Hapus</button></td>
                </tr>
              ))}
              {!lines.length && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada item</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="border rounded-xl px-3 py-2" placeholder="Diskon (nominal)" />
          <input type="number" step="0.01" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} className="border rounded-xl px-3 py-2" placeholder="Pajak (mis. 0.11)" />
          <div className="flex items-center justify-end font-semibold">Total: {fmtIDR(total)}</div>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan" className="w-full border rounded-xl px-3 py-2" />
        <div className="flex gap-2">
          <button onClick={doSave} className="px-4 py-2 bg-black text-white rounded-xl">Simpan & Kurangi Stok</button>
        </div>
      </div>
    </Section>

    <Section title="Riwayat Penjualan">
      <div className="max-h-[440px] overflow-auto">
        {sales.map((s) => (
          <div key={s.id} className="border rounded-xl p-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{s.id} — {s.customer}</div>
              <div className={`text-xs ${s.status === 'LUNAS' ? 'text-green-700' : s.status === 'DP' ? 'text-amber-700' : 'text-red-700'}`}>{s.status}</div>
            </div>
            <div className="text-xs text-gray-500">{new Date(s.date).toLocaleString()}</div>
            <div className="text-sm mt-1">Total {fmtIDR(s.total)} • Dibayar {fmtIDR(s.paid)} • Sisa {fmtIDR(s.due)}</div>
          </div>
        ))}
        {!sales.length && <div className="text-gray-500 text-sm">Belum ada penjualan</div>}
      </div>
    </Section>
  </div>
);

}

// -------- Inventori Bahan Baku (Pembelian) -------- function InventoryMaterials() { const [supplier, setSupplier] = useState(""); const [note, setNote] = useState(""); const [lines, setLines] = useState([]); // {materialId, name, unit, qty, price}

const addLine = (m) => setLines((ls) => [...ls, { materialId: m.id, name: m.name, unit: m.unit, qty: 1, price: m.price || 0 }]);
const updateLine = (i, patch) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
const removeLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i));
const total = lines.reduce((a, l) => a + l.qty * l.price, 0);

const doSave = () => {
  if (!lines.length) return alert("Tambahkan item dulu");
  purchaseIn({ supplier: supplier || "Umum", lines, note });
  setSupplier(""); setLines([]); setNote("");
  alert("Pembelian tersimpan dan stok bertambah");
};

const [q, setQ] = useState("");
const filtered = useMemo(() => materials.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())), [q, materials]);

return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Section title="Tambah Baris Pembelian">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bahan baku..." className="w-full border rounded-xl px-3 py-2 mb-3" />
      <div className="max-h-[360px] overflow-auto divide-y">
        {filtered.map((m) => (
          <div key={m.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-gray-500">{m.unit} • Stok: {m.stock}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">Harga sekarang {fmtIDR(m.price)}</div>
              <button className="text-xs px-2 py-1 bg-black text-white rounded-lg" onClick={() => addLine(m)}>Tambah</button>
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Form Pembelian">
      <div className="space-y-2">
        <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Nama supplier" className="w-full border rounded-xl px-3 py-2" />
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Material</th><th className="p-2">Qty</th><th className="p-2">Harga</th><th className="p-2 text-right">Subtotal</th><th className="p-2"></th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{l.name}<div className="text-xs text-gray-500">{l.unit}</div></td>
                  <td className="p-2 text-center"><input type="number" min="0" step="0.01" value={l.qty} onChange={(e) => updateLine(i, { qty: Number(e.target.value) })} className="w-20 border rounded-lg px-2 py-1 text-right" /></td>
                  <td className="p-2 text-right"><input type="number" min="0" step="100" value={l.price} onChange={(e) => updateLine(i, { price: Number(e.target.value) })} className="w-28 border rounded-lg px-2 py-1 text-right" /></td>
                  <td className="p-2 text-right">{fmtIDR(l.qty * l.price)}</td>
                  <td className="p-2 text-right"><button className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg" onClick={() => removeLine(i)}>Hapus</button></td>
                </tr>
              ))}
              {!lines.length && <tr><td colSpan={5} className="p-4 text-center text-gray-500">Belum ada item</td></tr>}
            </tbody>
          </table>
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan" className="w-full border rounded-xl px-3 py-2" />
        <div className="flex items-center justify-between">
          <div className="font-medium">Total: {fmtIDR(total)}</div>
          <button onClick={doSave} className="px-4 py-2 bg-black text-white rounded-xl">Simpan Pembelian</button>
        </div>
      </div>
    </Section>

    <Section title="Bahan Baku (Stok & Harga)" right={<AddMaterialForm onAdd={addMaterial} />}>
      <div className="max-h-[440px] overflow-auto text-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white"><tr className="border-b"><th className="p-2 text-left">Item</th><th className="p-2">Stok</th><th className="p-2">Unit</th><th className="p-2 text-right">Harga</th><th className="p-2 text-right"></th></tr></thead>
          <tbody>
            {materials.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-center">{c.stock}</td>
                <td className="p-2 text-center">{c.unit}</td>
                <td className="p-2 text-right">{fmtIDR(c.price)}</td>
                <td className="p-2 text-right">
                  <button className="text-xs px-2 py-1 bg-gray-900 text-white rounded-lg mr-2" onClick={() => {
                    const harga = prompt(`Ubah harga untuk ${c.name}`, String(c.price));
                    if (harga !== null) updateMaterial(c.id, { price: Number(harga) });
                  }}>Ubah Harga</button>
                  <button className="text-xs px-2 py-1 bg-gray-200 rounded-lg" onClick={() => {
                    const stok = prompt(`Ubah stok untuk ${c.name}`, String(c.stock));
                    if (stok !== null) updateMaterial(c.id, { stock: Number(stok) });
                  }}>Ubah Stok</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </div>
);

}

// -------- Produk & Resep + Produksi -------- function ProductsAndProduction() { const [editingId, setEditingId] = useState(null); const [newProduct, setNewProduct] = useState({ name: "", unit: "unit", price: 0 });

const doAddProduct = () => {
  if (!newProduct.name) return alert("Nama produk wajib");
  addProduct({ ...newProduct, stock: 0, recipe: [] });
  setNewProduct({ name: "", unit: "unit", price: 0 });
};

const editRecipe = (prod) => setEditingId(prod.id === editingId ? null : prod.id);

const updateRecipeLine = (prod, idx, patch) => {
  const recipe = prod.recipe.map((r, i) => (i === idx ? { ...r, ...patch } : r));
  setProductRecipe(prod.id, recipe);
};
const addRecipeLine = (prod) => setProductRecipe(prod.id, [...prod.recipe, { materialId: materials[0]?.id, qty: 1 }]);
const removeRecipeLine = (prod, idx) => setProductRecipe(prod.id, prod.recipe.filter((_, i) => i !== idx));

const askProduce = (prod) => {
  const qty = prompt(`Produksi berapa ${prod.unit}?`, "1");
  if (qty !== null) produceProduct(prod.id, Number(qty));
};

return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <Section title="Tambah Produk Baru">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="border rounded-xl px-3 py-2" placeholder="Nama produk" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <input className="border rounded-xl px-3 py-2" placeholder="Unit (unit/m²/dll)" value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} />
        <input type="number" className="border rounded-xl px-3 py-2" placeholder="Harga jual" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />
        <button onClick={doAddProduct} className="px-4 py-2 bg-black text-white rounded-xl">Tambah</button>
      </div>
    </Section>

    <Section title="Daftar Produk (Stok, Harga, Resep)">
      <div className="max-h-[520px] overflow-auto space-y-3">
        {products.map((p) => (
          <div key={p.id} className="border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-gray-600">Stok: {p.stock} {p.unit} • Harga: {fmtIDR(p.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded-lg bg-emerald-600 text-white" onClick={() => askProduce(p)}>Produksi</button>
                <button className="px-3 py-1 rounded-lg bg-gray-200" onClick={() => editRecipe(p)}>{editingId === p.id ? "Tutup Resep" : "Edit Resep"}</button>
                <button className="px-3 py-1 rounded-lg bg-white border" onClick={() => {
                  const newPrice = prompt("Ubah harga jual", String(p.price));
                  if (newPrice !== null) updateProduct(p.id, { price: Number(newPrice) });
                }}>Ubah Harga</button>
                <button className="px-3 py-1 rounded-lg bg-red-600 text-white" onClick={() => {
                  if (confirm(`Hapus produk ${p.name}?`)) deleteProduct(p.id);
                }}>Hapus</button>
              </div>
            </div>

            {editingId === p.id && (
              <div className="mt-3">
                <div className="font-medium mb-2">Resep / Bill of Materials</div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="p-2 text-left">Bahan Baku</th><th className="p-2">Qty per {p.unit}</th><th className="p-2 text-right"></th></tr></thead>
                  <tbody>
                    {p.recipe.map((r, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">
                          <select className="border rounded-lg px-2 py-1" value={r.materialId} onChange={(e) => updateRecipeLine(p, idx, { materialId: e.target.value })}>
                            {materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <input type="number" min="0" step="0.01" className="border rounded-lg px-2 py-1 w-28 text-right" value={r.qty} onChange={(e) => updateRecipeLine(p, idx, { qty: Number(e.target.value) })} />
                        </td>
                        <td className="p-2 text-right">
                          <button className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg" onClick={() => removeRecipeLine(p, idx)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2">
                  <button className="px-3 py-1 rounded-lg bg-black text-white" onClick={() => addRecipeLine(p)}>Tambah Bahan</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!products.length && <div className="text-gray-500 text-sm">Belum ada produk</div>}
      </div>
    </Section>
  </div>
);

}

// -------- Laporan -------- function Reports() { const now = new Date(); const ymd = now.toISOString().slice(0, 10); const month = now.getMonth(); const year = now.getFullYear(); const isSameDay = (d) => new Date(d).toISOString().slice(0, 10) === ymd; const isSameMonth = (d) => { const x = new Date(d); return x.getMonth() === month && x.getFullYear() === year; };

const todaySales = sales.filter((s) => isSameDay(s.date));
const monthSales = sales.filter((s) => isSameMonth(s.date));
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

// Nilai inventori sederhana (bahan baku + produk) berdasarkan harga terakhir
const inventoryValue = materials.reduce((a, m) => a + (m.stock || 0) * (m.price || 0), 0)
  + products.reduce((a, p) => a + (p.stock || 0) * (p.price || 0), 0);

// Top penjualan per item (gabungan produk/jasa/material)
const topItems = useMemo(() => {
  const map = new Map();
  for (const s of sales) for (const l of s.lines) {
    const key = `${l.type}:${l.name}`;
    map.set(key, (map.get(key) || 0) + l.qty * l.price);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}, [sales]);

return (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Section title="Ringkasan Hari Ini">
      <div className="text-sm space-y-1">
        <div>Transaksi: {todaySales.length}</div>
        <div>Omzet: {fmtIDR(sum(todaySales, (s) => s.total))}</div>
        <div>Piutang: {fmtIDR(sum(todaySales, (s) => s.due))}</div>
      </div>
    </Section>
    <Section title="Ringkasan Bulan Ini">
      <div className="text-sm space-y-1">
        <div>Transaksi: {monthSales.length}</div>
        <div>Omzet: {fmtIDR(sum(monthSales, (s) => s.total))}</div>
        <div>Piutang: {fmtIDR(sum(monthSales, (s) => s.due))}</div>
      </div>
    </Section>
    <Section title="Nilai Persediaan (perkiraan)">
      <div className="text-sm">{fmtIDR(inventoryValue)}</div>
    </Section>
    <Section title="Top Item (nilai penjualan)">
      <div className="text-sm">
        {topItems.map(([name, val]) => (
          <div key={name} className="flex items-center justify-between border-b py-1">
            <div>{name.split(":")[1]}</div>
            <div className="font-medium">{fmtIDR(val)}</div>
          </div>
        ))}
        {!topItems.length && <div className="text-gray-500">Belum ada data</div>}
      </div>
    </Section>
    <Section title="Inventori Bahan Baku">
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white"><tr className="border-b"><th className="p-2 text-left">Item</th><th className="p-2">Stok</th><th className="p-2">Unit</th><th className="p-2 text-right">Nilai</th></tr></thead>
          <tbody>
            {materials.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-center">{c.stock}</td>
                <td className="p-2 text-center">{c.unit}</td>
                <td className="p-2 text-right">{fmtIDR((c.stock || 0) * (c.price || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
    <Section title="Inventori Produk Jadi">
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white"><tr className="border-b"><th className="p-2 text-left">Produk</th><th className="p-2">Stok</th><th className="p-2">Unit</th><th className="p-2 text-right">Harga Jual</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2 text-center">{p.stock}</td>
                <td className="p-2 text-center">{p.unit}</td>
                <td className="p-2 text-right">{fmtIDR(p.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </div>
);

}

// -------- Settings -------- function Settings() { const [form, setForm] = useState(company); return ( <div className="space-y-3"> <Section title="Profil Usaha"> <div className="grid md:grid-cols-3 gap-2"> <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-xl px-3 py-2" placeholder="Nama usaha" /> <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border rounded-xl px-3 py-2" placeholder="Alamat" /> <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-xl px-3 py-2" placeholder="Telepon" /> </div> <div className="mt-2 flex gap-2"> <button onClick={() => setCompany(form)} className="px-4 py-2 bg-black text-white rounded-xl">Simpan</button> <button onClick={() => { if (confirm('Reset semua data? (material, produk, jasa, penjualan, pembelian)')) { const mats = initialMaterials; const prods = makeInitialProducts(initialMaterials); setMaterials(mats); setProducts(prods); setServices(initialServices); setSales([]); setPurchases([]); setCompany(form); } }} className="px-4 py-2 bg-red-600 text-white rounded-xl">Reset Data</button> </div> <p className="text-xs text-gray-500 mt-2">Tips: Tambahkan variasi ketebalan/jenis kaca sebagai material terpisah agar stok & harga akurat.</p> </Section>

<Section title="Kelola Jasa (Opsional)" right={<AddServiceForm onAdd={addService} />}>
      <div className="max-h-[340px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white"><tr className="border-b"><th className="p-2 text-left">Nama Jasa</th><th className="p-2">Unit</th><th className="p-2 text-right">Harga</th><th className="p-2 text-right"></th></tr></thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.name}</td>
                <td className="p-2 text-center">{s.unit}</td>
                <td className="p-2 text-right">{fmtIDR(s.price)}</td>
                <td className="p-2 text-right">
                  <button className="text-xs px-2 py-1 bg-gray-900 text-white rounded-lg mr-2" onClick={() => {
                    const harga = prompt(`Ubah harga untuk ${s.name}`, String(s.price));
                    if (harga !== null) updateService(s.id, { price: Number(harga) });
                  }}>Ubah Harga</button>
                  <button className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg" onClick={() => {
                    if (confirm(`Hapus jasa ${s.name}?`)) deleteService(s.id);
                  }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </div>
);

}

// -------- Small Forms -------- function AddMaterialForm({ onAdd }) { const [form, setForm] = useState({ name: "", unit: "pcs", stock: 0, price: 0 }); return ( <div className="flex items-center gap-2"> <input className="border rounded-xl px-2 py-1 text-sm" placeholder="Nama material" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /> <input className="border rounded-xl px-2 py-1 text-sm w-20" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /> <input type="number" className="border rounded-xl px-2 py-1 text-sm w-24" placeholder="Stok" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /> <input type="number" className="border rounded-xl px-2 py-1 text-sm w-28" placeholder="Harga" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /> <button className="text-xs px-2 py-1 bg-black text-white rounded-lg" onClick={() => { if (!form.name) return alert("Nama material wajib"); onAdd(form); setForm({ name: "", unit: "pcs", stock: 0, price: 0 }); }}>Tambah</button> </div> ); }

function AddServiceForm({ onAdd }) { const [form, setForm] = useState({ name: "", unit: "item", price: 0 }); return ( <div className="flex items-center gap-2"> <input className="border rounded-xl px-2 py-1 text-sm" placeholder="Nama jasa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /> <input className="border rounded-xl px-2 py-1 text-sm w-24" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /> <input type="number" className="border rounded-xl px-2 py-1 text-sm w-28" placeholder="Harga" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /> <button className="text-xs px-2 py-1 bg-black text-white rounded-lg" onClick={() => { if (!form.name) return alert("Nama jasa wajib"); onAdd(form); setForm({ name: "", unit: "item", price: 0 }); }}>Tambah</button> </div> ); }

// -------- Layout -------- return ( <div className="min-h-screen bg-gray-50"> <div className="max-w-7xl mx-auto p-4"> <header className="mb-4"> <h1 className="text-2xl font-bold">KARYA • POS, Bahan Baku & Produksi</h1> <p className="text-sm text-gray-600">{company.name} • {company.address} • {company.phone}</p> </header>

<div className="flex gap-2 mb-4 flex-wrap">
      <Tab id="penjualan" active={tab === "penjualan"} onClick={setTab}>Penjualan</Tab>
      <Tab id="inventori" active={tab === "inventori"} onClick={setTab}>Bahan Baku (Pembelian)</Tab>
      <Tab id="produk" active={tab === "produk"} onClick={setTab}>Produk & Resep / Produksi</Tab>
      <Tab id="laporan" active={tab === "laporan"} onClick={setTab}>Laporan</Tab>
      <Tab id="pengaturan" active={tab === "pengaturan"} onClick={setTab}>Pengaturan</Tab>
    </div>

    {tab === "penjualan" && <Penjualan />}
    {tab === "inventori" && <InventoryMaterials />}
    {tab === "produk" && <ProductsAndProduction />}
    {tab === "laporan" && <Reports />}
    {tab === "pengaturan" && <Settings />}

    <footer className="mt-8 text-xs text-gray-500">
      Prototype lokal (data tersimpan di browser). Siap di-upgrade ke backend (Laravel/Node) bila dibutuhkan.
    </footer>
  </div>
</div>

); }

function Tab({ id, active, onClick, children }) { return ( <button onClick={() => onClick(id)} className={px-3 py-2 rounded-xl text-sm font-medium transition shadow-sm ${active ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}}> {children} </button> ); }

