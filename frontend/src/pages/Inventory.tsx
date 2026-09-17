import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { PackageCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProductInventory {
  id: string;
  sku: string;
  name: string;
  basePrice: number;
  physicalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory & Stock Status</h1>
          <p className="text-sm text-slate-500">Real-time tracking of physical stock vs reserved allocations</p>
        </div>
        {user?.role === 'ADMIN' && <button
          onClick={fetchInventory}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stock</span>
        </button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th className="p-4">SKU</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Physical Stock</th>
              <th className="p-4">Reserved Stock</th>
              <th className="p-4">Net Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">Loading live inventory...</td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-medium text-indigo-600">{item.sku}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-600">₹{Number(item.basePrice).toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-700">{item.physicalQuantity}</td>
                  <td className="p-4 font-medium text-amber-600">{item.reservedQuantity}</td>
                  <td className="p-4 font-bold text-emerald-600">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <PackageCheck className="w-4 h-4" />
                      <span>{item.availableQuantity}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};