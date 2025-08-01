import React from 'react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Layout, Grid } from 'lucide-react';

interface LayoutToggleProps {
  useNewLayout: boolean;
  onToggle: (newValue: boolean) => void;
}

export function LayoutToggle({ useNewLayout, onToggle }: LayoutToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Grid size={14} className={!useNewLayout ? 'text-primary' : 'text-muted-foreground'} />
        <span className="text-sm">Tabbed</span>
      </div>
      
      <Switch
        checked={useNewLayout}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className="flex items-center gap-2">
        <Layout size={14} className={useNewLayout ? 'text-primary' : 'text-muted-foreground'} />
        <span className="text-sm">3-Column</span>
        <Badge variant="secondary" className="text-xs px-1 py-0">
          Beta
        </Badge>
      </div>
    </div>
  );
}