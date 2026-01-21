import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ContractStatus } from '../../types';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface ContractStatusManagerProps {
  currentStatus: ContractStatus;
  onStatusChange: (newStatus: ContractStatus) => void;
}

const statusFlow: Record<ContractStatus, ContractStatus[]> = {
  created: ['approved', 'revoked'],
  approved: ['sent', 'revoked'],
  sent: ['signed', 'revoked'],
  signed: ['locked'],
  locked: [],
  revoked: [],
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

export default function ContractStatusManager({
  currentStatus,
  onStatusChange,
}: ContractStatusManagerProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const availableTransitions = statusFlow[currentStatus] || [];
  const canTransition = availableTransitions.length > 0;

  function handleStatusChange(newStatus: ContractStatus) {
    if (window.confirm(`Are you sure you want to change status to "${statusLabels[newStatus]}"?`)) {
      onStatusChange(newStatus);
      setShowDropdown(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Badge variant={statusColors[currentStatus]} size="md">
          {statusLabels[currentStatus]}
        </Badge>
        {canTransition && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showDropdown && canTransition && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 px-2 py-1">Change status to:</p>
              {availableTransitions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  {statusLabels[status]}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
