import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface Enquiry {
  id: string;
  enquiryNumber: string;
  customerId: string;
  status: string;
}

interface Customer {
  id: string;
  companyName: string;
}

export const Enquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ companyName: '', contactPerson: '', mobile: '', email: '', city: '' });
  const [requiredDate, setRequiredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchEnquiries = async () => {
    try {
      const [enquiriesResponse, customersResponse] = await Promise.all([api.get('/enquiries'), api.get('/customers')]);
      setEnquiries(enquiriesResponse.data);
      setCustomers(customersResponse.data);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/enquiries', {
        ...(customerId ? { customerId } : newCustomer),
        requiredDate,
        notes
      });
      setCustomerId('');
      setNewCustomer({ companyName: '', contactPerson: '', mobile: '', email: '', city: '' });
      setRequiredDate('');
      setNotes('');
      setShowModal(false);
      fetchEnquiries();
    } catch (err) {
      console.error('Error creating enquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Enquiries</h1>
          <p className="text-gray-500 text-sm">Manage incoming client demands and lead tracking</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors"
        >
          + New Enquiry
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Enquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Existing customer</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5">
                  <option value="">Create a new customer below</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.companyName}</option>)}
                </select>
              </div>
              {!customerId && <div className="grid grid-cols-2 gap-3">
                {(['companyName', 'contactPerson', 'mobile', 'email', 'city'] as const).map((field) => (
                  <input key={field} required placeholder={field.replace(/([A-Z])/g, ' $1')} type={field === 'email' ? 'email' : 'text'} value={newCustomer[field]} onChange={(e) => setNewCustomer({ ...newCustomer, [field]: e.target.value })} className="border border-gray-300 rounded-lg p-2.5" />
                ))}
              </div>}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Required date</label><input required type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5" /></div>
              <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5" />
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  {loading ? 'Creating...' : 'Create Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-4 font-semibold">ENQUIRY #</th>
              <th className="p-4 font-semibold">CUSTOMER ID</th>
              <th className="p-4 font-semibold">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400">
                  No enquiries found. Click "+ New Enquiry" above to create one.
                </td>
              </tr>
            ) : (
              enquiries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono font-medium text-blue-600">{e.enquiryNumber || e.id}</td>
                  <td className="p-4 font-medium text-gray-800">{e.customerId}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                      {e.status}
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

export default Enquiries;