import { useEffect, useState } from 'react';

export default function WelcomeScreen() {
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    // Connect to the FastAPI WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws/matchmaking');

    ws.onopen = () => {
      console.log('WebSocket connection established with matchmaking server.');
      setStatus('System Active');
    };

    ws.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
      setStatus('Connection Offline');
    };

    return () => {
      // Clean up the connection when the component unmounts
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Radar Animation Area */}
      <div className="relative flex items-center justify-center mb-12">
        {/* The pinging circle */}
        <div className="absolute w-24 h-24 rounded-full border border-emerald-500/50 animate-radar" />
        <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30 animate-[radar_3s_linear_infinite_1s]" />
        
        {/* The center nodes */}
        <div className="relative w-16 h-16 bg-neutral-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="z-10 max-w-2xl text-center px-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 bg-gradient-to-br from-emerald-400 to-cyan-500 text-transparent bg-clip-text uppercase">
          Matchmaking Initiated
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 font-medium leading-relaxed mb-8">
          Go rack up some hours and show us your playstyle. 
          <br className="hidden md:block" />
          We will interrupt when we find a worthy co-op partner.
        </p>

        <div className="inline-flex items-center px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-sm font-semibold uppercase tracking-widest text-emerald-400 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-3 animate-pulse" />
          {status}
        </div>
      </div>
    </div>
  );
}
