import React from 'react';
import { Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const APILogs: React.FC = () => {
  const { apiLogs, clearLogs } = useAppContext();

  if (apiLogs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No API calls logged yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">API Calls Log</h3>
        <button
          onClick={clearLogs}
          className="flex items-center text-sm text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear Logs
        </button>
      </div>

      <div className="space-y-3">
        {apiLogs.map((log) => (
          <div
            key={log.id}
            className="border rounded-lg p-4 bg-white shadow-sm space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                {log.error ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="text-sm text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {log.duration}ms
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Prompt:</h4>
                <pre className="mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                  {log.prompt}
                </pre>
              </div>

              {log.error ? (
                <div>
                  <h4 className="text-sm font-medium text-red-600">Error:</h4>
                  <pre className="mt-1 text-sm text-red-500 whitespace-pre-wrap bg-red-50 p-2 rounded">
                    {log.error}
                  </pre>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Response:</h4>
                  <pre className="mt-1 text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                    {log.response}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default APILogs;