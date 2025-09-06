'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  getDefaultClient, 
  setDefaultClient, 
  getSnapchainNodeUrl, 
  setSnapchainNodeUrl,
  validateSnapchainUrl,
  type DefaultClient 
} from '../../lib/local-storage';
import { SNAPCHAIN_NODE_URL } from '../../lib/utils';

interface SettingsFormProps {
  onClose?: () => void;
}

export function SettingsForm({ onClose }: SettingsFormProps) {
  const [defaultClientState, setDefaultClientState] = useState<DefaultClient>('farcaster');
  const [snapchainUrl, setSnapchainUrl] = useState(SNAPCHAIN_NODE_URL);
  const [urlError, setUrlError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDefaultClientState(getDefaultClient());
    setSnapchainUrl(getSnapchainNodeUrl());
  }, []);

  const validateUrl = async (url: string) => {
    if (!url.trim()) {
      setUrlError('URL is required');
      return false;
    }

    setIsValidating(true);
    setUrlError('');
    
    const isValid = await validateSnapchainUrl(url);
    
    if (!isValid) {
      setUrlError('Invalid URL or /v1/info endpoint not accessible');
    }
    
    setIsValidating(false);
    return isValid;
  };

  const handleSave = async () => {
    const isUrlValid = await validateUrl(snapchainUrl);
    
    if (!isUrlValid) return;
    
    setDefaultClient(defaultClientState);
    setSnapchainNodeUrl(snapchainUrl);
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
      
      <div className="space-y-2">
        <label className="text-sm font-medium">snapchain node url</label>
        <Input
          value={snapchainUrl}
          onChange={(e) => {
            setSnapchainUrl(e.target.value);
            setUrlError('');
          }}
          placeholder={SNAPCHAIN_NODE_URL}
          className="border border-black rounded-none bg-white hover:bg-gray-50"
        />
        {urlError && <p className="text-sm text-red-600">{urlError}</p>}
      </div>
      
      <Button 
        onClick={handleSave}
        disabled={isValidating}
        className="border border-black bg-white text-black hover:bg-gray-50 rounded-none font-medium disabled:opacity-50"
      >
        {isValidating ? 'validating...' : 'save'}
      </Button>
    </div>
  );
}
