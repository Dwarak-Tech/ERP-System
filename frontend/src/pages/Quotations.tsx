import React, { useState } from 'react';
import api from '../api/axios';
import { CheckCircle2 } from 'lucide-react';

interface Enquiry { id: string; enquiryNumber: string; customer: { companyName: string }; }
interface Product { id: string; code: string; name: string; basePrice: number; }

export const Quotations: React.FC = () => {
  const [enquiryId, setEnquiryId] = useState('');
  const [productId, setProductId] = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [discountPct, setDiscountPct] = useState(0);
  const [gstPct, setGstPct] = useState(18);
  const [validUntil, setValidUntil] = useState('');
  const [generatedQuotation, setGeneratedQuotation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    Promise.all([api.get('/enquiries'), api.get('/products')]).then(([enquiriesResponse, productsResponse]) => {
      setEnquiries(enquiriesResponse.data);
      setProducts(productsResponse.data);
    }).catch(() => alert('Unable to load enquiry and product options'));
  }, []);

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedQuotation(null);

    try {
      const response = await api.post('/quotations', {
        enquiryId,
        validUntil,
        items: [{ productId, quantity: Number(quantity), discountPct: Number(discountPct), gstPct: Number(gstPct) }]
      });
      setGeneratedQuotation(response.data.quotation);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generate Official Quotation</h1>
        <p className="text-sm text-slate-500">Calculations are strictly processed server-side from database pricing</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <form onSubmit={handleCreateQuotation} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Enquiry ID</label>
            <select required value={enquiryId} onChange={(e) => setEnquiryId(e.target.value)} className="w-full border rounded p-2 text-sm"><option value="">Select enquiry</option>{enquiries.map((enquiry) => <option key={enquiry.id} value={enquiry.id}>{enquiry.enquiryNumber} - {enquiry.customer.companyName}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full border rounded p-2 text-sm"><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}</select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border rounded p-2 text-sm" />
          </div>
          <div><label className="block text-sm font-medium mb-1">Valid until</label><input required type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full border rounded p-2 text-sm" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount %</label>
            <input type="number" value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full border rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GST %</label>
            <input type="number" value={gstPct} onChange={(e) => setGstPct(Number(e.target.value))} className="w-full border rounded p-2 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="col-span-2 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700">
            {loading ? 'Computing On Server...' : 'Submit Quotation Request'}
          </button>
        </form>
      </div>

      {generatedQuotation && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Server-Authoritative Quotation Generated</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Quotation #:</span> <p className="font-bold">{generatedQuotation.quotationNumber}</p></div>
            <div><span className="text-slate-500">Subtotal:</span> <p className="font-bold">₹{Number(generatedQuotation.subtotal).toFixed(2)}</p></div>
            <div><span className="text-slate-500">Grand Total:</span> <p className="font-bold text-indigo-600">₹{Number(generatedQuotation.grandTotal).toFixed(2)}</p></div>
          </div>
        </div>
      )}
    </div>
  );
};