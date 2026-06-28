"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Activity, Database, Cpu, ShieldAlert, Zap } from 'lucide-react';

export default function NexusHUD() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'system', content: 'NEXUS SYSTEM ONLINE. AWAITING COMMANDS...' }
  ]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dataResult, setDataResult] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use environment variable for API URL, fallback to localhost for dev
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      for (let i = 0; i < data.thoughts.length; i++) {
        await new Promise(r => setTimeout(r, 500));
        setThoughts(prev => [...prev, data.thoughts[i]]);
      }
      
      setMessages(prev => [...prev, { role: 'agent', content: data.answer }]);
      setDataResult(data.data);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: 'CRITICAL ERROR: CONNECTION LOST. CHECK BACKEND STATUS.' }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 relative font-geist selection:bg-amber-500 selection:text-black">
      <div className="scanline-overlay" />
      <div className="scanline-bar" />
      
      {/* Header Section */}
      <header className="relative z-10 flex justify-between items-end mb-12 border-b-2 border-amber-500/30 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-amber-500 animate-ping" />
            <span className="font-mono text-[10px] text-amber-500/60 uppercase tracking-widest">Secure Uplink Established</span>
          </div>
          <h1 className="font-rajdhani text-5xl font-bold tracking-tighter uppercase leading-none">
            Nexus <span className="text-amber-500">Intelligence</span>
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <div className="font-mono text-[10px] text-amber-500/40 uppercase">Node Status</div>
          <div className="font-mono text-sm text-amber-500 uppercase tracking-tighter">Active // 0x7F4A-B82 // Prod_Env</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] relative z-10">
        
        {/* Main Command Center (Bento Column 1) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex-1 flex flex-col nexus-card p-1 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500 font-rajdhani uppercase text-xs tracking-widest">
                <Terminal size={14} />
                <span>Command Terminal</span>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                <div className="w-2 h-2 rounded-full bg-amber-500/30" />
                <div className="w-2 h-2 rounded-full bg-amber-500/30" />
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-6 scrollbar-hide"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 ${
                    msg.role === 'user' 
                    ? 'bg-amber-500 text-black font-bold clip-path-user' 
                    : msg.role === 'system' 
                    ? 'text-amber-500/60 italic text-xs' 
                    : 'nexus-card bg-surface/50 text-white border-amber-500/30'
                  }`}>
                    <span className="text-[9px] block uppercase opacity-50 mb-1 font-bold tracking-widest">
                      {msg.role}
                    </span>
                    <p className={msg.role === 'agent' ? 'leading-relaxed' : ''}>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex justify-start">
                  <div className="nexus-card bg-surface/50 p-4 animate-pulse text-amber-500 font-mono text-xs border-amber-500/50">
                    <div className="flex items-center gap-2">
                      <Cpu size={14} className="animate-spin" />
                      <span>PROCESSING DATA STREAMS...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/50 border-t border-amber-500/20 flex gap-3">
              <div className="relative flex-1">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="ENTER TACTICAL QUERY..."
                  className="w-full nexus-input p-4 pl-12 font-mono text-sm uppercase tracking-wider"
                />
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={18} />
              </div>
              <button 
                onClick={handleSend}
                className="nexus-button px-8 font-bold text-sm flex items-center gap-2"
              >
                Execute <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar (Bento Column 2) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Reasoning Trace Section */}
          <div className="h-1/2 flex flex-col nexus-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-500 font-rajdhani uppercase text-xs tracking-widest">
              <Activity size={14} />
              <span>Reasoning Trace</span>
            </div>
            <div className="flex-1 p-6 font-mono text-xs space-y-4 overflow-y-auto bg-black/20">
              {thoughts.length === 0 && (
                <div className="text-amber-500/20 italic animate-pulse">No active neural processes...</div>
              )}
              {thoughts.map((thought, i) => (
                <div key={i} className="flex gap-3 group">
                  <span className="text-amber-500/40 group-hover:text-amber-500 transition-colors">[{i+1}]</span>
                  <span className="text-gray-400 group-hover:text-white transition-colors leading-relaxed">{thought}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Data Relay Section */}
          <div className="h-1/2 flex flex-col nexus-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-500 font-rajdhani uppercase text-xs tracking-widest">
              <Database size={14} />
              <span>Raw Data Relay</span>
            </div>
            <div className="flex-1 p-6 font-mono text-[10px] text-amber-500/70 overflow-auto bg-black/40 border-t border-amber-500/10 leading-relaxed">
              {dataResult ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(dataResult, null, 2)}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-amber-500/20 italic gap-2">
                  <ShieldAlert size={24} />
                  <span>NO DATA RELAYED</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
