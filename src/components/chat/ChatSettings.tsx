import React, { useState } from 'react';
import { Settings, Sparkles, Thermometer, MessageCircle, Shield, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export interface ChatSettingsConfig {
  model: 'gemini-2.0-flash' | 'gemini-1.5-pro';
  tone: 'calm' | 'clinical' | 'friendly';
  temperature: number;
  maxTokens: number;
  safetyFilter: boolean;
  streamingEnabled: boolean;
}

interface ChatSettingsProps {
  config: ChatSettingsConfig;
  onConfigChange: (config: ChatSettingsConfig) => void;
  trigger?: React.ReactNode;
}

const TONE_PRESETS = {
  calm: {
    label: 'Calm & Supportive',
    description: 'Gentle, reassuring responses focused on emotional support',
    icon: '🌸',
  },
  clinical: {
    label: 'Clinical & Professional',
    description: 'Evidence-based, structured therapeutic guidance',
    icon: '🩺',
  },
  friendly: {
    label: 'Friendly & Casual',
    description: 'Warm, conversational approach like talking to a friend',
    icon: '😊',
  },
};

const MODELS = {
  'gemini-2.0-flash': {
    label: 'Gemini 2.0 Flash',
    description: 'Latest model - Fast and efficient',
    badge: 'Recommended',
    speed: 'Very Fast',
  },
  'gemini-1.5-pro': {
    label: 'Gemini 1.5 Pro',
    description: 'Advanced reasoning and context',
    badge: 'Advanced',
    speed: 'Fast',
  },
};

export function ChatSettings({ config, onConfigChange, trigger }: ChatSettingsProps) {
  const [localConfig, setLocalConfig] = useState<ChatSettingsConfig>(config);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onConfigChange(localConfig);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultConfig: ChatSettingsConfig = {
      model: 'gemini-2.0-flash',
      tone: 'calm',
      temperature: 0.7,
      maxTokens: 2048,
      safetyFilter: true,
      streamingEnabled: true,
    };
    setLocalConfig(defaultConfig);
    onConfigChange(defaultConfig);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" aria-label="Chat settings">
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Chat Settings
          </DialogTitle>
          <DialogDescription>
            Customize your AI chat experience. Changes apply to new conversations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Model
            </Label>
            <div className="grid gap-3">
              {Object.entries(MODELS).map(([key, model]) => (
                <Card
                  key={key}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    localConfig.model === key
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setLocalConfig({ ...localConfig, model: key as any })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setLocalConfig({ ...localConfig, model: key as any });
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm">{model.label}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {model.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {model.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Zap className="w-3 h-3" />
                        <span>{model.speed}</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      localConfig.model === key
                        ? 'border-primary bg-primary'
                        : 'border-muted'
                    }`}>
                      {localConfig.model === key && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tone Presets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Conversation Tone
            </Label>
            <div className="grid gap-3">
              {Object.entries(TONE_PRESETS).map(([key, tone]) => (
                <Card
                  key={key}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    localConfig.tone === key
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => setLocalConfig({ ...localConfig, tone: key as any })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setLocalConfig({ ...localConfig, tone: key as any });
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tone.icon}</span>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm">{tone.label}</h4>
                      <p className="text-xs text-muted-foreground">
                        {tone.description}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      localConfig.tone === key
                        ? 'border-primary bg-primary'
                        : 'border-muted'
                    }`}>
                      {localConfig.tone === key && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Temperature Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Creativity Level
              </Label>
              <span className="text-sm text-muted-foreground">
                {localConfig.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[localConfig.temperature]}
              onValueChange={([value]) => setLocalConfig({ ...localConfig, temperature: value })}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
              aria-label="Creativity level"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More Focused</span>
              <span>More Creative</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Lower values make responses more focused and deterministic. Higher values increase creativity and variety.
            </p>
          </div>

          <Separator />

          {/* Max Tokens */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Response Length</Label>
              <span className="text-sm text-muted-foreground">
                {localConfig.maxTokens} tokens
              </span>
            </div>
            <Slider
              value={[localConfig.maxTokens]}
              onValueChange={([value]) => setLocalConfig({ ...localConfig, maxTokens: value })}
              min={512}
              max={4096}
              step={256}
              className="w-full"
              aria-label="Maximum response length"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Concise</span>
              <span>Detailed</span>
            </div>
          </div>

          <Separator />

          {/* Safety & Features */}
          <div className="space-y-4">
            <Label>Safety & Features</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Content Safety Filter</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Filters potentially harmful or sensitive content
                </p>
              </div>
              <Switch
                checked={localConfig.safetyFilter}
                onCheckedChange={(checked) => 
                  setLocalConfig({ ...localConfig, safetyFilter: checked })
                }
                aria-label="Toggle safety filter"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Streaming Responses</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Show AI responses as they're being generated
                </p>
              </div>
              <Switch
                checked={localConfig.streamingEnabled}
                onCheckedChange={(checked) => 
                  setLocalConfig({ ...localConfig, streamingEnabled: checked })
                }
                aria-label="Toggle streaming"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="ghost" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
