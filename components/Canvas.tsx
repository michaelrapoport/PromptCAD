import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { TechDrawEngine } from '../services/techDrawEngine';

interface CanvasProps {
  onEngineReady: (engine: TechDrawEngine) => void;
}

export const Canvas = forwardRef<unknown, CanvasProps>(({ onEngineReady }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const engineRef = useRef<TechDrawEngine | null>(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Initialize Engine
  useEffect(() => {
    if (svgRef.current && groupRef.current && !engineRef.current) {
      const engine = new TechDrawEngine(svgRef.current, groupRef.current);
      engineRef.current = engine;
      onEngineReady(engine);
      
      // Center Viewport initially
      const parent = svgRef.current.parentElement;
      if (parent) {
        setTransform(prev => ({
            ...prev,
            x: parent.clientWidth / 2,
            y: parent.clientHeight / 2
        }));
      }
    }
  }, [onEngineReady]);

  // Handle Pan Interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Handle Zoom Interaction
  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 0.05;
    const delta = e.deltaY > 0 ? -scaleFactor : scaleFactor;
    const newScale = Math.max(0.1, Math.min(5, transform.scale + delta));
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(5, prev.scale * 1.2) }));
  const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale / 1.2) }));
  const resetZoom = () => setTransform({ x: transform.x, y: transform.y, scale: 1 });

  // Expose Controls via custom events or imperative handle if needed, 
  // but for now we just use internal state and external toolbar buttons
  useImperativeHandle(ref, () => ({
    zoomIn, zoomOut, resetZoom,
    exportSVG: () => engineRef.current?.getExportSVG()
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 cursor-grab active:cursor-grabbing select-none">
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />
      
      <svg
        ref={svgRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          <g ref={groupRef} />
        </g>
      </svg>
      
      {/* Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-cad-panel/90 backdrop-blur border border-cad-border p-2 rounded-full shadow-2xl">
         <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-full bg-cad-input text-slate-200 hover:bg-cad-accent hover:text-cad-dark transition-colors font-mono text-lg">+</button>
         <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-full bg-cad-input text-slate-200 hover:bg-cad-accent hover:text-cad-dark transition-colors font-mono text-lg">-</button>
         <button onClick={resetZoom} className="w-8 h-8 flex items-center justify-center rounded-full bg-cad-input text-slate-200 hover:bg-cad-accent hover:text-cad-dark transition-colors text-sm">⟲</button>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
