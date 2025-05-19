import Papa from 'papaparse';

type CSVData = {
  headers: string[];
  rows: Record<string, string>[];
};

export const parseCSV = (file: File): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, string>[];
          
          resolve({
            headers,
            rows
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const convertToCSV = (data: any[]): string => {
  return Papa.unparse(data);
};

// Utility to convert HTML entities back to characters
export const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};