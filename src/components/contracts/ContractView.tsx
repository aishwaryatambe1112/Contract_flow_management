import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Contract, Blueprint, BlueprintField, ContractStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ContractStatusManager from './ContractStatusManager';

export default function ContractView() {
  const { setCurrentView, selectedContractId, setSelectedContractId } = useApp();
  const [contract, setContract] = useState<Contract | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [fields, setFields] = useState<BlueprintField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedContractId) {
      loadContract();
    }
  }, [selectedContractId]);

  async function loadContract() {
    if (!selectedContractId) return;

    setLoading(true);

    const { data: contractData } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', selectedContractId)
      .single();

    if (!contractData) {
      setLoading(false);
      return;
    }

    setContract(contractData);

    const { data: blueprintData } = await supabase
      .from('blueprints')
      .select('*')
      .eq('id', contractData.blueprint_id)
      .single();

    setBlueprint(blueprintData);

    const { data: fieldsData } = await supabase
      .from('blueprint_fields')
      .select('*')
      .eq('blueprint_id', contractData.blueprint_id)
      .order('position_y', { ascending: true });

    setFields(fieldsData || []);

    const { data: valuesData } = await supabase
      .from('contract_field_values')
      .select('*')
      .eq('contract_id', selectedContractId);

    const values: Record<string, string> = {};
    valuesData?.forEach((v) => {
      values[v.blueprint_field_id] = v.value;
    });
    setFieldValues(values);

    setLoading(false);
  }

  async function handleSave() {
    if (!selectedContractId || !contract) return;

    setSaving(true);

    try {
      for (const [fieldId, value] of Object.entries(fieldValues)) {
        await supabase
          .from('contract_field_values')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('contract_id', selectedContractId)
          .eq('blueprint_field_id', fieldId);
      }

      alert('Contract saved successfully');
    } catch (error) {
      console.error('Error saving contract:', error);
      alert('Error saving contract');
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    setSelectedContractId(null);
    setCurrentView('dashboard');
  }

  async function handleStatusChange(newStatus: ContractStatus) {
    if (!selectedContractId) return;

    await supabase
      .from('contracts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', selectedContractId);

    loadContract();
  }

  function updateFieldValue(fieldId: string, value: string) {
    setFieldValues({ ...fieldValues, [fieldId]: value });
  }

  function renderFieldInput(field: BlueprintField) {
    const isLocked = contract?.status === 'locked' || contract?.status === 'revoked';

    switch (field.field_type) {
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValues[field.id] === 'true'}
              onChange={(e) => updateFieldValue(field.id, e.target.checked.toString())}
              disabled={isLocked}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={fieldValues[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={isLocked}
          />
        );
      case 'signature':
        return (
          <Input
            type="text"
            value={fieldValues[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder="Type your name to sign"
            disabled={isLocked}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={fieldValues[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            disabled={isLocked}
          />
        );
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading contract...</div>;
  }

  if (!contract) {
    return <div className="text-center py-12">Contract not found</div>;
  }

  const isLocked = contract.status === 'locked' || contract.status === 'revoked';

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contract.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Blueprint: {blueprint?.name || 'Unknown'}
              </p>
            </div>
            <ContractStatusManager
              currentStatus={contract.status}
              onStatusChange={handleStatusChange}
            />
          </div>

          {isLocked && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This contract is {contract.status} and cannot be edited.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Contract Fields</h2>
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  <span className="text-gray-400 ml-2 text-xs">({field.field_type})</span>
                </label>
                {renderFieldInput(field)}
              </div>
            ))}
          </div>

          {!isLocked && (
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={handleBack}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
