'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

interface Contract {
  id: string;
  acType: string;
  address: string;
  status: string;
  quoteAmount: number;
  serviceDate?: string;
}

export default function Dashboard() {
  const { user, getToken } = useAuth();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewContract, setShowNewContract] = useState(false);
  const [newContract, setNewContract] = useState({
    acType: '',
    unitCount: 1,
    address: '',
    preferredDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

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
    if (user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
        return;
      }
      if (user.role === 'CLIENT') fetchContracts();
    }
  }, [user, getToken, router]);

  const handleNewContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(''); // Clear previous error
    try {
      const token = getToken();
      await axios.post('/api/contracts', {
        ...newContract,
        preferredDate: new Date(newContract.preferredDate),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowNewContract(false);
      setNewContract({ acType: '', unitCount: 1, address: '', preferredDate: '' });
      fetchContracts();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit contract request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, status: string) => {
    setError(''); // Clear previous error
    try {
      const token = getToken();
      await axios.patch(`/api/contracts/${id}`, { status }, {
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
        <h1 className="text-2xl mb-4 font-bold">Client Dashboard</h1>
        <button
          className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          onClick={() => setShowNewContract((v) => !v)}
        >
          {showNewContract ? 'Cancel' : 'Request New Contract'}
        </button>
        {showNewContract && (
          <form onSubmit={handleNewContract} className="mb-8 bg-gray-900 p-6 rounded-lg space-y-4 max-w-lg">
            <input
              type="text"
              placeholder="Address"
              value={newContract.address}
              onChange={e => setNewContract({ ...newContract, address: e.target.value })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              required
            />
            <input
              type="text"
              placeholder="AC Type"
              value={newContract.acType}
              onChange={e => setNewContract({ ...newContract, acType: e.target.value })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              required
            />
            <input
              type="number"
              min={1}
              placeholder="Unit Count"
              value={newContract.unitCount}
              onChange={e => setNewContract({ ...newContract, unitCount: Number(e.target.value) })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              required
            />
            <input
              type="datetime-local"
              value={newContract.preferredDate}
              onChange={e => setNewContract({ ...newContract, preferredDate: e.target.value })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white"
              required
            />
            <button type="submit" disabled={submitting} className="w-full p-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            {/* Dummy payment button after submitting request */}
            {!submitting && !showNewContract && contracts.length > 0 && contracts[0].status === 'QUOTE_SENT' && (
              <button
                type="button"
                onClick={() => handleAction(contracts[0].id, 'PAYMENT_COMPLETED')}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold mt-4"
              >
                Make Dummy Payment
              </button>
            )}
          </form>
        )}
        {loading && <div className="text-center py-10">Loading contracts...</div>}
        {error && <div className="text-center text-red-400 py-4">{error}</div>}
        {!loading && !error && contracts.length === 0 && (
          <div className="text-center text-gray-400 py-10">No contracts found.</div>
        )}
        <ul className="space-y-4">
          {contracts.map((contract) => (
            <li key={contract.id} className="p-4 bg-gray-900 rounded shadow border border-gray-800">
              <p>Contract for <span className="font-semibold">{contract.acType}</span> at <span className="font-semibold">{contract.address}</span></p>
              <p>Status: <span className="font-semibold">{contract.status}</span></p>
              <p>Quote Amount: <span className="font-semibold">{contract.quoteAmount}</span></p>
              <p>Service Date: <span className="font-semibold">{contract.serviceDate || "-"}</span></p>
              {/* Next actions for client */}
              <div className="mt-2 space-x-2">
                {contract.status === 'QUOTE_SENT' && (
                  <button onClick={() => handleAction(contract.id, 'ACCEPTED_BY_CLIENT')} className="p-2 bg-green-500 text-white rounded">Accept Quote</button>
                )}
                {contract.status === 'ACCEPTED_BY_CLIENT' && (
                  <button onClick={() => handleAction(contract.id, 'PAYMENT_COMPLETED')} className="p-2 bg-blue-600 text-white rounded">Make Dummy Payment</button>
                )}
                {contract.status === 'PAYMENT_COMPLETED' && (
                  <span className="p-2 bg-blue-700 text-white rounded">Payment Complete</span>
                )}
                {contract.status === 'SERVICE_SCHEDULED' && (
                  <span className="p-2 bg-yellow-600 text-white rounded">Service Scheduled</span>
                )}
                {contract.status === 'IN_PROGRESS' && (
                  <span className="p-2 bg-orange-600 text-white rounded">Service In Progress</span>
                )}
                {contract.status === 'COMPLETED' && (
                  <span className="p-2 bg-green-700 text-white rounded">Service Completed</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}