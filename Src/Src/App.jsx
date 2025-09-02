import React, { useState } from "react";

function App() {
  const [products, setProducts] = useState([
    { id: 1, name: "Kaca 5mm", stock: 10 },
    { id: 2, name: "Aluminium Frame", stock: 15 }
  ]);

  const [newProduct, setNewProduct] = useState("");

  const addProduct = () => {
    if (newProduct.trim() === "") return;
    setProducts([
      ...products,
      { id: Date.now(), name: newProduct, stock: 0 }
    ]);
    setNewProduct("");
  };

  const increaseStock = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: p.stock + 1 } : p
    ));
  };

  const decreaseStock = (id) => {
    setProducts(products.map(p => 
      p.id === id && p.stock > 0 ? { ...p, stock: p.stock - 1 } : p
    ));
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">KaryaKaca POS</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Tambah produk..."
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />
        <button onClick={addProduct} className="bg-blue-500 text-white px-3 py-1 rounded">
          Tambah
        </button>
      </div>

      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between items-center bg-white shadow p-2 rounded">
            <span>{p.name} (stok: {p.stock})</span>
            <div className="flex gap-2">
              <button onClick={() => decreaseStock(p.id)} className="bg-red-500 text-white px-2 rounded">-</button>
              <button onClick={() => increaseStock(p.id)} className="bg-green-500 text-white px-2 rounded">+</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
