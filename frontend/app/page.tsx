"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Activity, Database, Cpu } from 'lucide-react';

export default function NexusHUD() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'NEXUS SYSTEM ONLINE. AWAITING COMMANDS...' }
  ]);
  const [thoughts, setThoughts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dataResult, setDataResult] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thoughts]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQuery = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsAnalyzing(true);
    setThoughts([]);
    setDataResult(null);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });
      
      const data = await response.json();
      
      // Simulate streaming thoughts for a high-end feel
      for (let i = 0; i < data.thoughts.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setThoughts(prev => [...prev, data.thoughts[i]]);
      }
      
      setMessages(prev => [...prev, { role: 'agent', content: data.answer }]);
      setDataResult(data.data);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: 'CRITICAL ERROR: CONNECTION LOST' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
      <div className="scanline" />
      
      {/* Top HUD Nav */}
      <nav className="flex justify-between items-center mb-8 border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-500 animate-pulse" />
          <h1 className="font-rajdhani text-2xl font-bold tracking-tighter uppercase">
            Nexus <span className="text-amber-500">Intelligence</span>
          </h1>
        </div>
        <div className="font-mono text-xs text-amber-500/60 uppercase hidden md:block">
          System Status: <span className="text-amber-500">Active</span> // Node: 0x7F4A // Env: Production
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        
        {/* Left Column: Chat Interface */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto nexus-card p-6 font-mono text-sm flex flex-col gap-4"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 ${
                  msg.role === 'user' 
                  ? 'bg-amber-500 text-black font-bold' 
                  : msg.role === 'system' 
                  ? 'text-amber-500/60 italic' 
                  : 'nexus-border bg-surface/50 text-white'
                }`}>
                  <span className="text-[10px] block uppercase opacity-50 mb-1">
                    {msg.role}
                  </span>
                  {msg.content}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start">
                <div className="nexus-border bg-surface/50 p-3 animate-pulse text-amber-500 font-mono text-xs">
                  ANALYZING DATA STREAMS...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER COMMAND..."
              className="flex-1 bg-surface border border-amber-500/30 p-4 font-mono text-amber-500 focus:outline-none focus:border-amber-500 uppercase"
            />
            <button 
              onClick={handleSend}
              className="bg-amber-500 text-black px-6 font-bold uppercase hover:bg-white transition-colors"
            >
              Execute
            </button>
          </div>
        </div>

        {/* Right Column: Logic Trace & Data */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Reasoning Trace */}
          <div className="flex-1 nexus-card p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-amber-500 font-rajdhani uppercase tracking-wider">
              <Activity size={16} />
              <h2>Reasoning Trace</h2>
            </div>
            <div className="flex-1 font-mono text-xs space-y-4 overflow-y-auto">
              {thoughts.length === 0 && (
                <div className="text-amber-500/30 italic">No active processes...</div>
              )}
              {thoughts.map((thought, i) => (
                <div key={i} className="flex gap-3 border-l border-amber-500/30 pl-3 py-1">
                  <span className="text-amber-500">[{i+1}]</span>
                  <span className="text-gray-300">{thought}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Result Window */}
          <div className="h-1/3 nexus-card p-6 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-amber-500 font-rajdhani uppercase tracking-wider">
              <Database size={16} />
              <h2>Raw Data Relay</h2>
            </div>
            <div className="flex-1 font-mono text-[10px] text-amber-500/80 overflow-auto whitespace-pre-wrap bg-black/50 p-2 border border-amber-500/20">
              {dataResult ? JSON.stringify(dataResult, null, 2) : 'NO DATA RELAYED'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
