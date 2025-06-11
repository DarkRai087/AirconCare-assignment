'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';

interface Contract {
  id: string;
  acType: string;
  address: string;
  status: string;
  quoteAmount: number;
  serviceDate?: string;
  clientId: string;
}

export default function AdminDashboard() {
  const { user, getToken } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      const res = await axios.get('/api/contracts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContracts(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') fetchContracts();
  }, [user, getToken]);

  // Example: Approve quote (send quote to client)
  const handleAction = async (id: string, status: string, extra: any = {}) => {
    setError('');
    try {
      const token = getToken();
      await axios.patch(`/api/contracts/${id}`, { status, ...extra }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContracts();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update contract');
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-6 min-h-screen bg-black text-white">
        <h1 className="text-2xl mb-4 font-bold">Admin Dashboard</h1>
        {loading && <div className="text-center py-10">Loading contracts...</div>}
        {error && <div className="text-center text-red-400 py-4">{error}</div>}
        <ul className="space-y-4">
          {contracts.map((contract) => (
            <li key={contract.id} className="p-4 bg-gray-900 rounded shadow border border-gray-800">
              <p>Contract for <span className="font-semibold">{contract.acType}</span> at <span className="font-semibold">{contract.address}</span></p>
              <p>Status: <span className="font-semibold">{contract.status}</span></p>
              <p>Quote Amount: <span className="font-semibold">{contract.quoteAmount}</span></p>
              <p>Service Date: <span className="font-semibold">{contract.serviceDate || "-"}</span></p>
              <p>Client ID: <span className="font-semibold">{contract.clientId}</span></p>
              {/* Admin actions */}
              <div className="mt-2 space-x-2">
                {contract.status === 'QUOTE_REQUESTED' && (
                  <button onClick={() => handleAction(contract.id, 'QUOTE_SENT', { quoteAmount: 100 })} className="p-2 bg-blue-500 text-white rounded">Send Quote</button>
                )}
                {contract.status === 'PAYMENT_COMPLETED' && (
                  <button onClick={() => handleAction(contract.id, 'SERVICE_SCHEDULED', { serviceDate: new Date().toISOString() })} className="p-2 bg-yellow-600 text-white rounded">Schedule Service</button>
                )}
                {contract.status === 'SERVICE_SCHEDULED' && (
                  <button onClick={() => handleAction(contract.id, 'IN_PROGRESS')} className="p-2 bg-orange-600 text-white rounded">Start Service</button>
                )}
                {contract.status === 'IN_PROGRESS' && (
                  <button onClick={() => handleAction(contract.id, 'COMPLETED')} className="p-2 bg-green-700 text-white rounded">Mark Completed</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}
