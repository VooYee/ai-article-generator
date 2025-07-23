/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import PreviewModal from "./PreviewModal";

const ResultsSection: React.FC = () => {
  const { generatedContent, downloadUrl } = useAppContext();
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  console.log("ResultsSection - generatedContent:", generatedContent);
  console.log("ResultsSection - downloadUrl:", downloadUrl);

  if (generatedContent.length === 0 && !downloadUrl) return null;

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Generated Results
        </h2>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download="generated_articles.csv"
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </a>
        )}
      </div>

      {generatedContent.length > 0 ? (
        <div className="mt-4">
          <ResultsTable
            content={generatedContent}
            onPreview={setSelectedArticle}
          />
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <p>Results will appear here after generation</p>
        </div>
      )}

      <PreviewModal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        article={
          selectedArticle || {
            h1: "",
            metaTitle: "",
            metaDescription: "",
            fullArticle: "",
          }
        }
      />
    </section>
  );
};

const ResultsTable: React.FC<{
  content: any[];
  onPreview: (article: any) => void;
}> = ({ content, onPreview }) => {
  console.log("ResultsTable - content:", content);

  // Show a preview of the first 5 results
  const previewContent = content.slice(0, 5);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              H1
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Meta Title
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preview
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {previewContent.map((item, index) => {
            console.log("ResultsTable - rendering item:", item);
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.articleId}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.h1 || (
                    <span className="italic text-gray-400">No H1 title</span>
                  )}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.metaTitle || (
                    <span className="italic text-gray-400">No meta title</span>
                  )}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  <button
                    onClick={() => {
                      console.log("Preview button clicked for item:", item);
                      onPreview(item);
                    }}
                    className="text-teal-600 hover:text-teal-800 flex items-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Preview
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {content.length > 5 && (
        <p className="text-gray-500 text-xs mt-3">
          Showing 5 of {content.length} results. Download the CSV for complete
          data.
        </p>
      )}
    </div>
  );
};

export default ResultsSection;
