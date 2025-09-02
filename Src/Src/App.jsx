import { useState } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", stock: 0, price: 0 });
  const [newSale, setNewSale] = useState({ name: "", qty: 1 });

  // Tambah produk baru
  const addProduct = () => {
    if (!newProduct.name || newProduct.stock <= 0 || newProduct.price <= 0) return;
    setProducts([...products, { ...newProduct }]);
    setNewProduct({ name: "", stock: 0, price: 0 });
  };

  // Tambah transaksi penjualan
  const addSale = () => {
    const productIndex = products.findIndex(p => p.name === newSale.name);
    if (productIndex === -1 || newSale.qty <= 0) return;

    const updatedProducts = [...products];
    if (updatedProducts[productIndex].stock < newSale.qty) {
      alert("Stok tidak cukup!");
      return;
    }

    updatedProducts[productIndex].stock -= newSale.qty;
    setProducts(updatedProducts);

    setSales([
      ...sales,
      { ...newSale, price: updatedProducts[productIndex].price }
    ]);
    setNewSale({ name: "", qty: 1 });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 Karya Kaca POS</h1>

      {/* Form tambah produk */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Tambah Produk</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nama produk"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="border p-2 rounded w-1/3"
          />
          <input
            type="number"
            placeholder="Stok"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
            className="border p-2 rounded w-1/4"
          />
          <input
            type="number"
            placeholder="Harga"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })}
            className="border p-2 rounded w-1/4"
          />
          <button
            onClick={addProduct}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Simpan
          </button>
        </div>
      </div>

      {/* Tabel produk */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Daftar Produk</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Nama</th>
              <th className="border p-2">Stok</th>
              <th className="border p-2">Harga</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.stock}</td>
                <td className="border p-2">Rp {p.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form transaksi */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Catat Penjualan</h2>
        <div className="flex gap-2">
          <select
            value={newSale.name}
            onChange={(e) => setNewSale({ ...newSale, name: e.target.value })}
            className="border p-2 rounded w-1/2"
          >
            <option value="">Pilih produk</option>
            {products.map((p, i) => (
              <option key={i} value={p.name}>{p.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Jumlah"
            value={newSale.qty}
            onChange={(e) => setNewSale({ ...newSale, qty: parseInt(e.target.value) })}
            className="border p-2 rounded w-1/4"
          />
          <button
            onClick={addSale}
            className="bg-green-500 text-white px-4 rounded"
          >
            Jual
          </button>
        </div>
      </div>

      {/* Tabel penjualan */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Riwayat Penjualan</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Produk</th>
              <th className="border p-2">Jumlah</th>
              <th className="border p-2">Harga</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s, i) => (
              <tr key={
