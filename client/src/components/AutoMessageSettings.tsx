import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { Settings, MessageCircle, Clock } from "lucide-react";

interface AutoMessageConfig {
  minInterval: number;
  maxInterval: number;
  enabled: boolean;
}

interface AutoMessageSettingsProps {
  conversationId?: number;
  girlfriendName?: string;
  personality?: string;
  onClose?: () => void;
}

export function AutoMessageSettings({ 
  conversationId, 
  girlfriendName, 
  personality, 
  onClose 
}: AutoMessageSettingsProps) {
  const [config, setConfig] = useState<AutoMessageConfig>({
    minInterval: 30,
    maxInterval: 180,
    enabled: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await apiRequest('/api/auto-messages/config');
      setConfig(response);
    } catch (error) {
      console.error('Failed to fetch auto message config:', error);
    }
  };

  const updateConfig = async (newConfig: Partial<AutoMessageConfig>) => {
    try {
      setLoading(true);
      await apiRequest('/api/auto-messages/config', {
        method: 'POST',
        body: JSON.stringify(newConfig),
      });
      
      setConfig({ ...config, ...newConfig });
      toast.success("Auto message settings updated!");
    } catch (error) {
      console.error('Failed to update config:', error);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const startAutoMessages = async () => {
    if (!conversationId || !girlfriendName || !personality) {
      toast.error("Missing conversation information");
      return;
    }

    try {
      setLoading(true);
      await apiRequest(`/api/auto-messages/start/${conversationId}`, {
        method: 'POST',
        body: JSON.stringify({
          girlfriendName,
          personality,
        }),
      });
      
      toast.success(`Auto messages started for ${girlfriendName}!`);
    } catch (error) {
      console.error('Failed to start auto messages:', error);
      toast.error("Failed to start auto messages");
    } finally {
      setLoading(false);
    }
  };

  const stopAutoMessages = async () => {
    if (!conversationId) {
      toast.error("No conversation selected");
      return;
    }

    try {
      setLoading(true);
      await apiRequest(`/api/auto-messages/stop/${conversationId}`, {
        method: 'POST',
      });
      
      toast.success("Auto messages stopped");
    } catch (error) {
      console.error('Failed to stop auto messages:', error);
      toast.error("Failed to stop auto messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Auto Message Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Auto Messages */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Auto Messages</Label>
            <p className="text-sm text-muted-foreground">
              Let your AI girlfriend send you spontaneous messages
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
            disabled={loading}
          />
        </div>

        {config.enabled && (
          <>
            {/* Message Interval Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Message Frequency
                </Label>
                <p className="text-sm text-muted-foreground">
                  How often she'll send you messages (in minutes)
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Minimum: {config.minInterval} minutes</Label>
                  </div>
                  <Slider
                    value={[config.minInterval]}
                    onValueChange={(value) => updateConfig({ minInterval: value[0] })}
                    max={120}
                    min={10}
                    step={5}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Maximum: {config.maxInterval} minutes</Label>
                  </div>
                  <Slider
                    value={[config.maxInterval]}
                    onValueChange={(value) => updateConfig({ maxInterval: value[0] })}
                    max={360}
                    min={config.minInterval}
                    step={10}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Conversation-specific controls */}
            {conversationId && girlfriendName && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    {girlfriendName}'s Auto Messages
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Control auto messages for this conversation
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={startAutoMessages}
                    disabled={loading}
                    size="sm"
                    className="flex-1"
                  >
                    Start Messages
                  </Button>
                  <Button
                    onClick={stopAutoMessages}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Stop Messages
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            Done
          </Button>
        )}
      </CardContent>
    </Card>
  );
}