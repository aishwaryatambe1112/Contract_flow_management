import { useEffect, useState } from 'react';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Blueprint } from '../../types';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';

export default function BlueprintList() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentView, setSelectedBlueprintId } = useApp();

  useEffect(() => {
    fetchBlueprints();
  }, []);

  async function fetchBlueprints() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blueprints:', error);
    } else {
      setBlueprints(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blueprint?')) return;

    const { error } = await supabase.from('blueprints').delete().eq('id', id);

    if (error) {
      console.error('Error deleting blueprint:', error);
      alert('Error deleting blueprint');
    } else {
      fetchBlueprints();
    }
  }

  function handleView(id: string) {
    setSelectedBlueprintId(id);
    setCurrentView('blueprint-edit');
  }

  if (loading) {
    return <div className="text-center py-12">Loading blueprints...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blueprints</h1>
        <Button onClick={() => setCurrentView('blueprint-create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Blueprint
        </Button>
      </div>

      {blueprints.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No blueprints yet</p>
          <Button onClick={() => setCurrentView('blueprint-create')}>
            Create your first blueprint
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
              {blueprints.map((blueprint) => (
                <tr key={blueprint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {blueprint.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {blueprint.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(blueprint.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(blueprint.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(blueprint.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
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
