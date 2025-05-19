import React from 'react';
import Select from 'react-select';
import { TemplateVariable } from '../types/template';

interface VariableEditorProps {
  variables: TemplateVariable[];
  csvColumns: string[];
  onUpdate: (variables: TemplateVariable[]) => void;
}

const VariableEditor: React.FC<VariableEditorProps> = ({ variables, csvColumns, onUpdate }) => {
  const handleVariableUpdate = (index: number, field: keyof TemplateVariable, value: any) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = {
      ...updatedVariables[index],
      [field]: value
    };
    onUpdate(updatedVariables);
  };

  const addVariable = () => {
    onUpdate([
      ...variables,
      {
        name: '',
        type: 'text',
        description: '',
        required: false
      }
    ]);
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onUpdate(updatedVariables);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Template Variables</h3>
        <button
          onClick={addVariable}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Add Variable
        </button>
      </div>

      <div className="space-y-4">
        {variables.map((variable, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex justify-between">
              <div className="flex-1 mr-4">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={variable.name}
                  onChange={(e) => handleVariableUpdate(index, 'name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex-1 mr-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={variable.type}
                  onChange={(e) => handleVariableUpdate(index, 'type', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="text">Text</option>
                  <option value="html">HTML</option>
                  <option value="list">List</option>
                  <option value="date">Date</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">CSV Column</label>
                <Select
                  value={csvColumns.map(col => ({ value: col, label: col })).find(opt => opt.value === variable.csvColumn)}
                  onChange={(option) => handleVariableUpdate(index, 'csvColumn', option?.value)}
                  options={csvColumns.map(col => ({ value: col, label: col }))}
                  className="mt-1"
                  isClearable
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={variable.description || ''}
                onChange={(e) => handleVariableUpdate(index, 'description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={variable.required}
                  onChange={(e) => handleVariableUpdate(index, 'required', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Required</span>
              </label>

              <button
                onClick={() => removeVariable(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariableEditor;