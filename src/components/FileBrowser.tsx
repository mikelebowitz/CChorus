import React, { useState, useEffect } from 'react';
import { Folder, File, ChevronRight, X, Plus, ArrowLeft } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  relativePath?: string;
}

interface BrowseResponse {
  currentPath: string;
  relativePath: string;
  items: FileItem[];
}

interface FileBrowserProps {
  onSelectFile: (filePath: string) => void;
  onCancel: () => void;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({ onSelectFile, onCancel }) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [relativePath, setRelativePath] = useState<string>('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const browse = async (dirPath?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/files/browse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dirPath })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to browse directory');
      }
      
      const data: BrowseResponse = await response.json();
      setCurrentPath(data.currentPath);
      setRelativePath(data.relativePath);
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to browse directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    browse(); // Start in project root
  }, []);

  const handleItemClick = (item: FileItem) => {
    if (item.type === 'directory') {
      browse(item.path);
    } else {
      onSelectFile(item.relativePath || item.path);
    }
  };

  const handleGoBack = () => {
    if (items.length > 0 && items[0].name === '..') {
      browse(items[0].path);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Browse Files</h2>
            {relativePath && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {relativePath}
              </span>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleGoBack}
              disabled={!items.some(item => item.name === '..')}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <span className="text-sm text-gray-600">
              Select a markdown file to import as an agent
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto mb-2 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="mx-auto mb-2" size={32} />
                  <p>No items in this directory</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.path}-${index}`}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      item.type === 'file' 
                        ? 'hover:bg-blue-50 border border-transparent hover:border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="flex-shrink-0">
                      {item.type === 'directory' ? (
                        <Folder className="text-blue-500" size={20} />
                      ) : (
                        <File className="text-gray-400" size={20} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        item.name.startsWith('.') 
                          ? 'text-gray-500 italic' 
                          : 'text-gray-900'
                      }`}>
                        {item.name}
                        {item.name.startsWith('.') && (
                          <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1 rounded">
                            hidden
                          </span>
                        )}
                      </p>
                      {item.type === 'file' && item.relativePath && (
                        <p className="text-sm text-gray-500 truncate">
                          {item.relativePath}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {item.type === 'directory' ? (
                        <ChevronRight className="text-gray-400" size={16} />
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFile(item.relativePath || item.path);
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Plus size={14} />
                          Import
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only markdown (.md) files are shown, including hidden files. 
              Selected files will be parsed as Claude Code agents with YAML frontmatter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};