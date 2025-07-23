import React, { useRef, useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { parseCSV } from "../utils/csvUtils";

const FileUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCsvData, setCsvFile } = useAppContext();
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file is CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file");
      setFileName(null);
      setCsvData(null);
      setCsvFile(null);
      return;
    }

    try {
      setError(null);
      setFileName(file.name);
      setCsvFile(file);

      // Parse CSV file
      const data = await parseCSV(file);
      setCsvData(data);
    } catch (err) {
      setError("Error parsing CSV file. Please check the format.");
      setCsvData(null);
      console.error(err);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(false);

    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      // Create a DataTransfer object to set the files of the input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;

      // Trigger change event manually
      const event = new Event("change", { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors 
          ${
            isHovering
              ? "border-teal-500 bg-teal-50"
              : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
          } 
          ${error ? "border-red-300" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
        />

        {!fileName ? (
          <div className="py-8">
            <Upload className="mx-auto h-20 w-20 text-gray-400 mb-4" />
            <p className="text-gray-700 font-semibold text-lg">
              Drag & drop your CSV file here
            </p>
            <p className="text-gray-500 text-sm mt-2">
              or click to browse files
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Supports .csv files only
            </p>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-gray-800 font-semibold text-lg">
              File Uploaded Successfully!
            </p>
            <p className="text-gray-600 font-medium break-all mt-2 px-4 text-center">
              {fileName}
            </p>
            <p className="text-green-600 text-sm mt-3 flex items-center font-medium">
              <CheckCircle className="h-4 w-4 mr-1" />
              Ready to process
            </p>
            <button
              onClick={() => {
                setFileName(null);
                setCsvData(null);
                setCsvFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="mt-4 text-sm text-gray-500 hover:text-red-500 underline transition-colors"
            >
              Remove file
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-red-500 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <FilePreview />
    </div>
  );
};

const FilePreview: React.FC = () => {
  const { csvData } = useAppContext();

  if (!csvData) return null;

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        CSV Data Preview
      </h3>
      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {csvData.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {csvData.rows.slice(0, 3).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {csvData.headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: "200px" }}
                    title={row[header] || "-"}
                  >
                    {row[header] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <p className="text-gray-600 text-sm">
          {csvData.rows.length > 3
            ? `Showing 3 of ${csvData.rows.length} rows`
            : `Total: ${csvData.rows.length} rows`}
        </p>
        <p className="text-green-600 text-sm font-medium">
          ✓ Ready for processing
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
