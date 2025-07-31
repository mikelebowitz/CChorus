import React from 'react';
import { SubAgent } from '../types';
import { Edit, Trash2, Bot } from 'lucide-react';

interface AgentCardProps {
  agent: SubAgent;
  onEdit: (agent: SubAgent) => void;
  onDelete: (name: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => {
  const toolsText = agent.tools?.join(', ') || 'All tools';
  const colorStyle = agent.color ? { borderLeftColor: agent.color } : {};

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border-l-4"
      style={colorStyle}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bot 
            size={20} 
            className="text-gray-600"
            style={{ color: agent.color }}
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{agent.name}</h3>
            {agent.level && (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-muted text-muted-foreground">
                {agent.level}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(agent)}
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(agent.name)}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{agent.description}</p>
      
      <div className="space-y-2">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tools</span>
          <p className="text-sm text-gray-600 truncate">{toolsText}</p>
        </div>
        
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prompt Preview</span>
          <p className="text-sm text-gray-600 line-clamp-2">
            {agent.prompt.slice(0, 100)}...
          </p>
        </div>
      </div>
    </div>
  );
};