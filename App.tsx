import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { ChatInterface } from './components/ChatInterface';
import { generateSchematicCode } from './services/geminiService';
import { TechDrawEngine } from './services/techDrawEngine';
import { ChatMessage } from './types';
import { Button } from './components/Button';

// Initial welcome message
const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'ai',
  content: `Hello! I'm PromptCAD 2.0, powered by Gemini 3.0 Pro. I can design complex analog and digital circuits.\n\nTry asking for:\n• "A common emitter amplifier with NPN transistor"\n• "A full adder circuit using logic gates"\n• "A standard op-amp integrator with bypass capacitors"`,
  timestamp: Date.now()
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  
  // Refs for imperative access
  const engineRef = useRef<TechDrawEngine | null>(null);
  const canvasRef = useRef<{ exportSVG: () => string }>(null);

  const handleEngineReady = useCallback((engine: TechDrawEngine) => {
    engineRef.current = engine;
  }, []);

  const executeCode = (code: string) => {
    if (!engineRef.current) return;
    
    try {
      engineRef.current.reset();
      // Safe(r) execution of generated code:
      // We wrap it in a function and pass the engine instance as 'TechDraw'
      // eslint-disable-next-line no-new-func
      const runCircuit = new Function('TechDraw', code);
      runCircuit(engineRef.current);
    } catch (err) {
      console.error("Execution Error:", err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: "Error: The generated code was invalid. Please try describing the circuit differently.",
        timestamp: Date.now()
      }]);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const code = await generateSchematicCode(text);
      setGeneratedCode(code);
      executeCode(code);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: `I've generated the schematic for "${text}". You can view the JavaScript code in the drawer below.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Notify external hook if present
      window.parent.postMessage({ type: 'PROMPTCAD_GENERATED', payload: { code, prompt: text } }, '*');

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "Sorry, I encountered an error connecting to the AI service. Please check your API key.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    engineRef.current?.reset();
    setGeneratedCode('');
    setMessages([INITIAL_MESSAGE]);
    window.parent.postMessage({ type: 'PROMPTCAD_CLEARED' }, '*');
  };

  const handleExport = () => {
    const svgContent = canvasRef.current?.exportSVG();
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schematic.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      window.parent.postMessage({ type: 'PROMPTCAD_EXPORTED', payload: { svg: svgContent } }, '*');
    }
  };

  // --- External Messaging Hook ---
  useEffect(() => {
    const handleExternalMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (!type) return;

      switch (type) {
        case 'PROMPTCAD_CMD_GENERATE':
          if (payload?.prompt) handleSendMessage(payload.prompt);
          break;
        case 'PROMPTCAD_CMD_CLEAR':
          handleClear();
          break;
        case 'PROMPTCAD_CMD_EXPORT':
          handleExport();
          break;
        case 'PROMPTCAD_CMD_PING':
          event.source?.postMessage({ type: 'PROMPTCAD_PONG' }, { targetOrigin: event.origin });
          break;
      }
    };

    window.addEventListener('message', handleExternalMessage);
    return () => window.removeEventListener('message', handleExternalMessage);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-cad-dark text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-cad-border flex items-center justify-between px-6 bg-cad-panel shadow-sm z-10">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 fill-cad-accent" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-5v5l-2 3v2h10v-2l-2-3v-5l8 5z"/>
          </svg>
          <div className="font-bold text-xl tracking-tight">
            PromptCAD <span className="text-[10px] bg-cad-accent text-cad-dark px-1.5 py-0.5 rounded ml-1 align-top font-extrabold">2.0</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClear}>New Project</Button>
          <Button variant="primary" onClick={handleExport}>Export SVG</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Chat */}
        <div className="w-[400px] flex flex-col z-10 shadow-xl">
          <ChatInterface 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage}
            generatedCode={generatedCode}
          />
        </div>

        {/* Right Area: Canvas */}
        <div className="flex-1 relative">
          <Canvas ref={canvasRef} onEngineReady={handleEngineReady} />
        </div>
      </main>
    </div>
  );
};

export default App;