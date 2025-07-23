import React, { useState } from "react";
import { Upload, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ArticleTemplateManager: React.FC = () => {
  const { currentTemplate, loadTemplate, updateTemplate } = useAppContext();
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [exportStatus, setExportStatus] = useState<"idle" | "success">("idle");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleTemplateImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus("idle");
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (fileExtension === "json") {
          // Handle JSON template file
          const template = JSON.parse(content);
          loadTemplate(template);
        } else {
          // Handle HTML/text template file
          if (!currentTemplate) {
            setImportStatus("error");
            setTimeout(() => setImportStatus("idle"), 3000);
            return;
          }

          const updatedTemplate = {
            ...currentTemplate,
            template: {
              ...currentTemplate.template,
              content: content,
            },
          };
          updateTemplate(updatedTemplate);
        }

        setImportStatus("success");
        setTimeout(() => setImportStatus("idle"), 3000);
      } catch (error) {
        console.error("Error importing template:", error);
        setImportStatus("error");
        setTimeout(() => setImportStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };
  const handleTemplateExport = () => {
    if (!currentTemplate?.template?.content) {
      console.error("Invalid template structure:", currentTemplate);
      return;
    }

    const blob = new Blob([currentTemplate.template.content], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentTemplate.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportStatus("success");
    setTimeout(() => setExportStatus("idle"), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="flex flex-col">
            <input
              type="file"
              id="template-import"
              className="hidden"
              accept=".html,.txt,.json"
              onChange={handleTemplateImport}
            />
            <label
              htmlFor="template-import"
              className={`flex items-center px-4 py-2 text-sm rounded-lg hover:bg-blue-200 transition-colors cursor-pointer border font-medium shadow-sm ${
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
                  Template Imported!
                </>
              ) : importStatus === "error" ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Import Error
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Template
                </>
              )}
            </label>
            {uploadedFileName && importStatus === "success" && (
              <div className="text-xs text-gray-600 mt-1 px-2">
                📄 {uploadedFileName}
              </div>
            )}
          </div>
          {currentTemplate && (
            <button
              onClick={handleTemplateExport}
              className={`flex items-center px-4 py-2 text-sm rounded-lg hover:bg-green-200 transition-colors border font-medium shadow-sm ${
                exportStatus === "success"
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-green-100 text-green-700 border-green-300"
              }`}
            >
              {exportStatus === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Template Exported!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Template
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {currentTemplate && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Available Variables:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {currentTemplate?.template?.variables &&
                Object.keys(currentTemplate.template.variables).map(
                  (variable) => (
                    <div key={variable} className="text-sm text-gray-600">
                      {`{${variable}}`}
                    </div>
                  )
                )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Template Preview:
            </h4>
            <pre className="text-xs overflow-auto max-h-[400px] p-2 bg-white rounded border">
              {currentTemplate?.template?.content ||
                "No template content available"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleTemplateManager;
