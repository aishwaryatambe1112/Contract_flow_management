import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Blueprint, BlueprintField } from '../../types';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function ContractCreate() {
  const { setCurrentView } = useApp();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('');
  const [blueprintFields, setBlueprintFields] = useState<BlueprintField[]>([]);
  const [contractName, setContractName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlueprints();
  }, []);

  useEffect(() => {
    if (selectedBlueprintId) {
      fetchBlueprintFields();
    } else {
      setBlueprintFields([]);
      setFieldValues({});
    }
  }, [selectedBlueprintId]);

  async function fetchBlueprints() {
    setLoading(true);
    const { data } = await supabase
      .from('blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    setBlueprints(data || []);
    setLoading(false);
  }

  async function fetchBlueprintFields() {
    const { data } = await supabase
      .from('blueprint_fields')
      .select('*')
      .eq('blueprint_id', selectedBlueprintId)
      .order('position_y', { ascending: true });

    setBlueprintFields(data || []);

    const initialValues: Record<string, string> = {};
    data?.forEach((field) => {
      initialValues[field.id] = field.field_type === 'checkbox' ? 'false' : '';
    });
    setFieldValues(initialValues);
  }

  function updateFieldValue(fieldId: string, value: string) {
    setFieldValues({ ...fieldValues, [fieldId]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contractName.trim() || !selectedBlueprintId) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          name: contractName,
          blueprint_id: selectedBlueprintId,
          status: 'created',
        })
        .select()
        .single();

      if (contractError) throw contractError;

      const valuesToInsert = Object.entries(fieldValues).map(([fieldId, value]) => ({
        contract_id: contract.id,
        blueprint_field_id: fieldId,
        value,
      }));

      await supabase.from('contract_field_values').insert(valuesToInsert);

      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Error creating contract');
    } finally {
      setSaving(false);
    }
  }

  function renderFieldInput(field: BlueprintField) {
    switch (field.field_type) {
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={fieldValues[field.id] === 'true'}
              onChange={(e) => updateFieldValue(field.id, e.target.checked.toString())}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            value={fieldValues[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
          />
        );
      case 'signature':
        return (
          <Input
            type="text"
            value={fieldValues[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
            placeholder="Type your name to sign"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={fieldValues[field.id] || ''}
            onChange={(e) => updateFieldValue(field.id, e.target.value)}
          />
        );
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setCurrentView('dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Contract</h1>

        {blueprints.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No blueprints available</p>
            <Button onClick={() => setCurrentView('blueprint-create')}>
              Create a Blueprint First
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Contract Name"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="e.g., John Doe Employment Contract"
              required
            />

            <Select
              label="Select Blueprint"
              value={selectedBlueprintId}
              onChange={(e) => setSelectedBlueprintId(e.target.value)}
              options={[
                { value: '', label: 'Choose a blueprint...' },
                ...blueprints.map((bp) => ({ value: bp.id, label: bp.name })),
              ]}
              required
            />

            {blueprintFields.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Fill Contract Fields</h2>
                <div className="space-y-4">
                  {blueprintFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        <span className="text-gray-400 ml-2 text-xs">({field.field_type})</span>
                      </label>
                      {renderFieldInput(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentView('dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !selectedBlueprintId}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Creating...' : 'Create Contract'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
