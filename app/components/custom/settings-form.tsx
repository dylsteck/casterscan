'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { LOCAL_STORAGE_KEYS, type DefaultClient } from '../../lib/local-storage';
import { useLocalStorage } from '../../hooks/use-local-storage';

interface SettingsFormProps {
  onClose?: () => void;
}

export function SettingsForm({ onClose }: SettingsFormProps) {
  const [defaultClientState, setDefaultClientState, mounted] = useLocalStorage<DefaultClient>(
    LOCAL_STORAGE_KEYS.DEFAULT_CLIENT,
    'farcaster'
  );

  const handleSave = () => {
    setDefaultClientState(defaultClientState);
    onClose?.();
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">default client</label>
        <Select value={defaultClientState} onValueChange={(value: DefaultClient) => setDefaultClientState(value)}>
          <SelectTrigger className="border border-black rounded-none bg-white hover:bg-gray-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-black rounded-none bg-white">
            <SelectItem value="farcaster" className="hover:bg-gray-50">farcaster</SelectItem>
            <SelectItem value="baseapp" className="hover:bg-gray-50">base</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleSave}
        className="border border-black bg-white text-black hover:bg-gray-50 rounded-none font-medium"
      >
        save
      </Button>
    </div>
  );
}
