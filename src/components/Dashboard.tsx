import { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Contract, Blueprint, ContractStatus } from '../types';
import { useApp } from '../context/AppContext';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface ContractWithBlueprint extends Contract {
  blueprint: Blueprint;
}

type FilterStatus = 'all' | 'active' | 'pending' | 'signed';

const statusGroups: Record<FilterStatus, ContractStatus[]> = {
  all: ['created', 'approved', 'sent', 'signed', 'locked', 'revoked'],
  active: ['created', 'approved'],
  pending: ['sent'],
  signed: ['signed', 'locked'],
};

const statusColors: Record<ContractStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  created: 'default',
  approved: 'info',
  sent: 'warning',
  signed: 'success',
  locked: 'success',
  revoked: 'danger',
};

const statusLabels: Record<ContractStatus, string> = {
  created: 'Created',
  approved: 'Approved',
  sent: 'Sent',
  signed: 'Signed',
  locked: 'Locked',
  revoked: 'Revoked',
};

export default function Dashboard() {
  const [contracts, setContracts] = useState<ContractWithBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const { setCurrentView, setSelectedContractId } = useApp();

  useEffect(() => {
    fetchContracts();
  }, []);

  async function fetchContracts() {
    setLoading(true);
    const { data: contractsData, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      setLoading(false);
      return;
    }

    const blueprintIds = [...new Set(contractsData?.map((c) => c.blueprint_id))];
    const { data: blueprintsData } = await supabase
      .from('blueprints')
      .select('*')
      .in('id', blueprintIds);

    const blueprintMap = new Map(blueprintsData?.map((b) => [b.id, b]));

    const contractsWithBlueprints = contractsData
      ?.map((contract) => ({
        ...contract,
        blueprint: blueprintMap.get(contract.blueprint_id)!,
      }))
      .filter((c) => c.blueprint);

    setContracts(contractsWithBlueprints || []);
    setLoading(false);
  }

  function handleView(id: string) {
    setSelectedContractId(id);
    setCurrentView('contract-view');
  }

  const filteredContracts = contracts.filter((contract) =>
    statusGroups[filterStatus].includes(contract.status)
  );

  const statusCounts = {
    all: contracts.length,
    active: contracts.filter((c) => statusGroups.active.includes(c.status)).length,
    pending: contracts.filter((c) => statusGroups.pending.includes(c.status)).length,
    signed: contracts.filter((c) => statusGroups.signed.includes(c.status)).length,
  };

  if (loading) {
    return <div className="text-center py-12">Loading contracts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contracts Dashboard</h1>
        <Button onClick={() => setCurrentView('contract-create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      <div className="mb-6 flex gap-3">
        {(Object.keys(statusGroups) as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-75">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {filteredContracts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">
            {contracts.length === 0 ? 'No contracts yet' : 'No contracts in this category'}
          </p>
          {contracts.length === 0 && (
            <Button onClick={() => setCurrentView('contract-create')}>
              Create your first contract
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blueprint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contract.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contract.blueprint?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[contract.status]} size="sm">
                      {statusLabels[contract.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(contract.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
