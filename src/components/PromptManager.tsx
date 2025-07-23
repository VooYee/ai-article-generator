import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Pause,
  Play,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Papa from "papaparse";

const PromptManager: React.FC = () => {
  const {
    prompts = [],
    addPrompt,
    removePrompt,
    updatePrompt,
    metaPrompts = { h1: "", metaTitle: "", metaDescription: "" },
    setMetaPrompts,
    setPrompts,
    isGenerating,
    isPaused,
    pauseGeneration,
    resumeGeneration,
    progressCurrent,
    progressTotal,
  } = useAppContext();

  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "success">("idle");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus("idle");
    setUploadedFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Array<Record<string, string>>;
          if (data.length > 0) {
            const row = data[0];

            // Update meta prompts (optional - only if they exist in CSV)
            const newMetaPrompts = {
              h1: row.h1 || "",
              metaTitle: row.metaTitle || "",
              metaDescription: row.metaDescription || "",
            };
            setMetaPrompts(newMetaPrompts);

            // Update paragraph prompts
            const newPrompts: string[] = [];
            for (let i = 1; i <= 10; i++) {
              const key = `paragraph_${i}`;
              if (row[key]) {
                newPrompts.push(row[key]);
              }
            }
            setPrompts(newPrompts);

            setImportStatus("success");
            setTimeout(() => setImportStatus("idle"), 3000);
          }
        } catch (error) {
          console.error("Error processing CSV:", error);
          setImportStatus("error");
          setTimeout(() => setImportStatus("idle"), 3000);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 3000);
      },
    });

    // Reset file input
    event.target.value = "";
  };

  const handleTemplateExport = () => {
    const exportData: Record<string, string> = {};

    // Add meta content only if it has content
    if (metaPrompts.h1.trim()) {
      exportData.h1 = metaPrompts.h1;
    }
    if (metaPrompts.metaTitle.trim()) {
      exportData.metaTitle = metaPrompts.metaTitle;
    }
    if (metaPrompts.metaDescription.trim()) {
      exportData.metaDescription = metaPrompts.metaDescription;
    }

    // Add paragraph prompts
    prompts.forEach((content, index) => {
      if (content.trim()) {
        exportData[`paragraph_${index + 1}`] = content;
      }
    });

    const csvData = [exportData];
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "prompts.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportStatus("success");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 items-center w-full">
        <div className="flex-1">
          <p className="text-gray-600 text-sm leading-relaxed">
            Create prompts for your article content. Use variables like{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-purple-600">
              {"{{variable}}"}
            </code>{" "}
            to insert data from your CSV.
          </p>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              ℹ️ Meta content prompts (H1, Meta Title, Meta Description) are
              optional.
            </p>
            <p className="text-blue-700 text-xs mt-1">
              Import CSV with columns: h1, metaTitle, metaDescription,
              paragraph_1, paragraph_2, etc. Only columns with actual content
              will appear in the exported CSV.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {isGenerating && (
            <div className="flex flex-col gap-2">
              <button
                onClick={isPaused ? resumeGeneration : pauseGeneration}
                className={`flex items-center text-sm px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                  isPaused
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300"
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </button>
              {progressTotal > 0 && (
                <div className="text-xs text-gray-600 text-center">
                  {progressCurrent}/{progressTotal} articles
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col">
            <input
              type="file"
              id="csv-import"
              className="hidden"
              accept=".csv"
              onChange={handleCSVImport}
            />
            <label
              htmlFor="csv-import"
              className={`flex items-center text-sm px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer border font-medium shadow-sm ${
                importStatus === "success"
                  ? "bg-green-100 text-green-700 border-green-300"
                  : importStatus === "error"
                  ? "bg-red-100 text-red-700 border-red-300"
                  : "bg-blue-100 text-blue-700 border-blue-300"
              }`}
            >
              {importStatus === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  CSV Imported!
                </>
              ) : importStatus === "error" ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Import Error
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </>
              )}
            </label>
            {uploadedFileName && importStatus === "success" && (
              <div className="text-xs text-gray-600 mt-1 px-2">
                📄 {uploadedFileName}
              </div>
            )}
          </div>
          <button
            onClick={handleTemplateExport}
            className={`flex items-center text-sm px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border font-medium shadow-sm ${
              exportStatus === "success"
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-green-100 text-green-700 border-green-300"
            }`}
          >
            {exportStatus === "success" ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                CSV Exported!
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </button>
          <button
            onClick={addPrompt}
            className="flex items-center text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors border border-purple-300 font-medium shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Meta Content Prompts - Optional */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center">
            <div className="w-2 h-5 bg-teal-500 rounded-full mr-3"></div>
            Meta Content Prompts
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
              Optional
            </span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                H1 Title Prompt
              </label>
              <textarea
                value={metaPrompts.h1}
                onChange={(e) =>
                  setMetaPrompts((prev) => ({ ...prev, h1: e.target.value }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm transition-all"
                placeholder="Write instructions for generating the H1 title (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Meta Title Prompt
              </label>
              <textarea
                value={metaPrompts.metaTitle}
                onChange={(e) =>
                  setMetaPrompts((prev) => ({
                    ...prev,
                    metaTitle: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm transition-all"
                placeholder="Write instructions for generating the meta title (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Meta Description Prompt
              </label>
              <textarea
                value={metaPrompts.metaDescription}
                onChange={(e) =>
                  setMetaPrompts((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y min-h-[80px] text-sm transition-all"
                placeholder="Write instructions for generating the meta description (optional)"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center">
            <div className="w-2 h-5 bg-purple-500 rounded-full mr-3"></div>
            Paragraph Prompts
          </h3>
          <div className="space-y-4">
            {prompts.map((prompt, index) => (
              <div key={index} className="relative group">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Paragraph {index + 1}
                  </label>
                  <button
                    onClick={() => removePrompt(index)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-md hover:bg-red-50"
                    title="Remove this prompt"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => updatePrompt(index, e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px] text-sm transition-all"
                  placeholder={`Write instructions for paragraph ${
                    index + 1
                  }. Use {{variable}} syntax to include CSV data.`}
                />
              </div>
            ))}

            {prompts.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-4">No prompts created yet</p>
                <button
                  onClick={addPrompt}
                  className="flex items-center mx-auto text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors border border-purple-300 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Prompt
                </button>
              </div>
            )}
          </div>
        </div>

        {prompts.length > 0 && (
          <div className="text-center">
            <button
              onClick={addPrompt}
              className="flex items-center mx-auto text-sm bg-purple-100 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-200 transition-all border border-purple-300 font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Prompt
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptManager;
