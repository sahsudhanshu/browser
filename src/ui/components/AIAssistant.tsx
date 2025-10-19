import React from 'react';
import { X, Sparkles, Send, Mic, Image, Settings, Key, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [showApiKeyInput, setShowApiKeyInput] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    { role: 'ai', content: 'Hello! I\'m Nova AI, powered by Perplexity. Enter your API key to get started with real-time web search and assistance.' }
  ]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    if (!apiKey && showApiKeyInput) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Please enter your Perplexity API key to use AI features. You can get one at https://www.perplexity.ai/settings/api' 
      }]);
      return;
    }
    
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are Nova AI, a helpful browser assistant. Be precise and concise. Help users with web browsing, searching information, and understanding content.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: aiResponse 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please check your API key and try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
    
    setMessage('');
  };

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      setShowApiKeyInput(false);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Great! API key saved. You can now ask me anything about web content, get real-time information, or request help with browsing.' 
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[400px] bg-card/95 backdrop-blur-xl border-l border-border/50 shadow-2xl z-50",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-primary animate-glow-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Nova AI</h3>
              <p className="text-xs text-muted-foreground">Your browsing assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-secondary/80"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 p-4 border-b border-border/50">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-xs hover:bg-primary/20 transition-all duration-200"
          >
            Summarize Page
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-xs hover:bg-primary/20 transition-all duration-200"
          >
            Explain Code
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-xs hover:bg-primary/20 transition-all duration-200"
          >
            Translate
          </Button>
        </div>

        {/* API Key Input */}
        {showApiKeyInput && !apiKey && (
          <div className="p-4 border-b border-border/50">
            <Alert className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Enter your Perplexity API key to enable AI features. Get one at{' '}
                <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  perplexity.ai/settings/api
                </a>
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="pplx-xxx..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-secondary/50"
              />
              <Button onClick={handleApiKeySave} className="bg-primary hover:bg-primary/90">
                <Key className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-full",
                    msg.role === 'ai'
                      ? "bg-primary/20"
                      : "bg-secondary"
                  )}
                >
                  {msg.role === 'ai' ? (
                    <Sparkles className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-foreground/20" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 p-3 rounded-lg",
                    msg.role === 'ai'
                      ? "bg-secondary/50"
                      : "bg-primary/20"
                  )}
                >
                  <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-primary/20 animate-pulse">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 p-3 rounded-lg bg-secondary/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2 mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/80"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/80"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary/80"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="resize-none bg-secondary/50 border-border/50 focus:border-primary min-h-[80px]"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-primary hover:bg-primary/90 h-[80px]"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};