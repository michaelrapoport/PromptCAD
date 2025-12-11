import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  generatedCode: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  generatedCode 
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showCode, setShowCode] = React.useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-cad-panel border-r border-cad-border">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-3 rounded-lg max-w-[90%] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-cad-accent text-cad-dark self-end ml-auto rounded-br-none font-medium' 
                : 'bg-cad-input text-slate-200 self-start rounded-bl-none'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="self-start text-xs text-slate-400 italic animate-pulse pl-2">
            AI is drafting schematic...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Code Drawer Toggle */}
      <div className="border-t border-cad-border bg-slate-900">
          <button 
            onClick={() => setShowCode(!showCode)}
            className="w-full flex justify-between items-center px-4 py-2 text-xs text-slate-400 hover:bg-slate-800 transition-colors uppercase tracking-wider font-semibold"
          >
            <span>Generated JavaScript</span>
            <span>{showCode ? '▼' : '▲'}</span>
          </button>
          
          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${showCode ? 'h-48 opacity-100' : 'h-0 opacity-0'}`}
          >
             <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-blue-300 bg-slate-950/50 whitespace-pre">
                <code>{generatedCode || '// Waiting for input...'}</code>
             </pre>
          </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-cad-border bg-cad-panel">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a circuit (e.g., 'Low pass filter')"
            className="flex-1 bg-cad-dark border border-cad-border rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-cad-accent transition-colors text-sm"
          />
          <Button type="submit" variant="primary" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};
