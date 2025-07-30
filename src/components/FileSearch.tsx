import React, { useState } from 'react';
import { Search, File, X, Plus } from 'lucide-react';
import { ApiFileSystemService } from '../utils/apiFileSystem';

interface FileSearchProps {
  onSelectFile: (filePath: string) => void;
  onCancel: () => void;
}

const fileSystem = new ApiFileSystemService();

export const FileSearch: React.FC<FileSearchProps> = ({ onSelectFile, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await fileSystem.searchProjectFiles(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Find Agent Files</h2>
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search for agent files... (e.g., 'agent', '*.md')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="space-y-3">
            {searchResults.length === 0 && !isSearching && searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <File className="mx-auto mb-2" size={32} />
                <p>No agent files found matching "{searchQuery}"</p>
                <p className="text-sm mt-1">Try searching for "agent" or "*.md"</p>
              </div>
            )}

            {searchResults.length === 0 && !searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <Search className="mx-auto mb-2" size={32} />
                <p>Search for existing agent files in your project</p>
                <p className="text-sm mt-1">Files will be parsed as Claude Code agents</p>
              </div>
            )}

            {isSearching && (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin mx-auto mb-2 w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p>Searching for files...</p>
              </div>
            )}

            {searchResults.map((filePath) => (
              <div
                key={filePath}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectFile(filePath)}
              >
                <div className="flex items-center gap-3">
                  <File className="text-gray-400" size={16} />
                  <div>
                    <p className="font-medium text-gray-900">{filePath.split('/').pop()}</p>
                    <p className="text-sm text-gray-500">{filePath}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFile(filePath);
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Import
                </button>
              </div>
            ))}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Selected files will be parsed as Claude Code agents. 
                Make sure they follow the correct format with YAML frontmatter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};