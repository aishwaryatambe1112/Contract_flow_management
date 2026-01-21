import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BlueprintField, FieldType } from '../../types';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

export default function BlueprintForm() {
  const { setCurrentView, selectedBlueprintId, setSelectedBlueprintId } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Omit<BlueprintField, 'id' | 'blueprint_id' | 'created_at'>[]>([]);
  const [saving, setSaving] = useState(false);

  const isEditMode = !!selectedBlueprintId;

  useEffect(() => {
    if (selectedBlueprintId) {
      loadBlueprint();
    }
  }, [selectedBlueprintId]);

  async function loadBlueprint() {
    if (!selectedBlueprintId) return;

    const { data: blueprint } = await supabase
      .from('blueprints')
      .select('*')
      .eq('id', selectedBlueprintId)
      .single();

    const { data: blueprintFields } = await supabase
      .from('blueprint_fields')
      .select('*')
      .eq('blueprint_id', selectedBlueprintId);

    if (blueprint) {
      setName(blueprint.name);
      setDescription(blueprint.description);
    }

    if (blueprintFields) {
      setFields(blueprintFields.map(f => ({
        field_type: f.field_type,
        label: f.label,
        position_x: f.position_x,
        position_y: f.position_y,
      })));
    }
  }

  function addField() {
    setFields([
      ...fields,
      {
        field_type: 'text',
        label: '',
        position_x: 0,
        position_y: fields.length * 60,
      },
    ]);
  }

  function updateField(index: number, updates: Partial<BlueprintField>) {
    setFields(fields.map((field, i) => (i === index ? { ...field, ...updates } : field)));
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || fields.some(f => !f.label.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      let blueprintId = selectedBlueprintId;

      if (isEditMode && blueprintId) {
        await supabase
          .from('blueprints')
          .update({ name, description, updated_at: new Date().toISOString() })
          .eq('id', blueprintId);

        await supabase.from('blueprint_fields').delete().eq('blueprint_id', blueprintId);
      } else {
        const { data, error } = await supabase
          .from('blueprints')
          .insert({ name, description })
          .select()
          .single();

        if (error) throw error;
        blueprintId = data.id;
      }

      if (blueprintId) {
        const fieldsToInsert = fields.map(field => ({
          blueprint_id: blueprintId,
          ...field,
        }));

        await supabase.from('blueprint_fields').insert(fieldsToInsert);
      }

      setSelectedBlueprintId(null);
      setCurrentView('blueprints');
    } catch (error) {
      console.error('Error saving blueprint:', error);
      alert('Error saving blueprint');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setSelectedBlueprintId(null);
    setCurrentView('blueprints');
  }

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'date', label: 'Date' },
    { value: 'signature', label: 'Signature' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blueprints
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Blueprint' : 'Create Blueprint'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Blueprint Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Employment Contract"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this blueprint..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Fields</h2>
              <Button type="button" size="sm" onClick={addField}>
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No fields yet. Add your first field.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <Input
                        label="Field Label"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g., Employee Name"
                        required
                      />

                      <Select
                        label="Field Type"
                        value={field.field_type}
                        onChange={(e) =>
                          updateField(index, { field_type: e.target.value as FieldType })
                        }
                        options={fieldTypeOptions}
                      />

                      <Input
                        label="Position X"
                        type="number"
                        value={field.position_x}
                        onChange={(e) =>
                          updateField(index, { position_x: parseFloat(e.target.value) })
                        }
                      />

                      <Input
                        label="Position Y"
                        type="number"
                        value={field.position_y}
                        onChange={(e) =>
                          updateField(index, { position_y: parseFloat(e.target.value) })
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                      className="mt-6"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : isEditMode ? 'Update Blueprint' : 'Create Blueprint'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
