import React, { useState } from 'react';
import api from '../api/axios';
import { ShoppingCart, Truck } from 'lucide-react';

interface Quotation { id: string; quotationNumber: string; grandTotal: number; }

export const OrdersAndDispatch: React.FC = () => {
  const [quotationId, setQuotationId] = useState('');
  const [salesOrderId, setSalesOrderId] = useState('');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  React.useEffect(() => { api.get('/quotations').then((response) => setQuotations(response.data)).catch(() => setStatusMsg('Unable to load quotations.')); }, []);

  const handleConvertOrder = async () => {
    try {
      const res = await api.post('/orders/convert-quotation', { quotationId });
      setStatusMsg(`Order Created: #${res.data.salesOrder.orderNumber}`);
      setSalesOrderId(res.data.salesOrder.id);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.response?.data?.error || 'Conversion failed'}`);
    }
  };

  const handleDispatch = async () => {
    try {
      const res = await api.post('/dispatch', { salesOrderId, vehicleNumber, driverName });
      setStatusMsg(`Dispatched Successfully: Note #${res.data.dispatchNote.dispatchNumber}`);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.response?.data?.error || 'Dispatch failed'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Order Conversion & Dispatch Settlement</h1>

      {statusMsg && (
        <div className="p-4 bg-slate-800 text-white font-medium rounded-lg">{statusMsg}</div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="font-bold text-lg flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-indigo-600" />
          <span>Convert Quotation to Sales Order</span>
        </h2>
        <select required value={quotationId} onChange={(e) => setQuotationId(e.target.value)} className="w-full border rounded p-2 text-sm"><option value="">Select quotation</option>{quotations.map((quotation) => <option key={quotation.id} value={quotation.id}>{quotation.quotationNumber} - ₹{Number(quotation.grandTotal).toFixed(2)}</option>)}</select>
        <button onClick={handleConvertOrder} className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg">
          Execute FOR UPDATE Reservation
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h2 className="font-bold text-lg flex items-center space-x-2">
          <Truck className="w-5 h-5 text-emerald-600" />
          <span>Fulfill & Settle Inventory Dispatch</span>
        </h2>
        <input required type="text" placeholder="Sales order ID (created above)" value={salesOrderId} onChange={(e) => setSalesOrderId(e.target.value)} className="w-full border rounded p-2 text-sm" />
        <input required type="text" placeholder="Vehicle number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="w-full border rounded p-2 text-sm" />
        <input required type="text" placeholder="Driver name" value={driverName} onChange={(e) => setDriverName(e.target.value)} className="w-full border rounded p-2 text-sm" />
        <button onClick={handleDispatch} className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg">
          Complete Dispatch & Settle Stock
        </button>
      </div>
    </div>
  );
};