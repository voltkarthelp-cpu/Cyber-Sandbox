/**
 * CyberHeader Top Navigation Bar
 * Features mode switcher, terminal theme selector, host status indicator, and sound toggle.
 */

import React from 'react';
import { Terminal, Shield, Network, Volume2, VolumeX, HelpCircle, Code2, BookOpen } from 'lucide-react';
import { TerminalTheme, GameMode } from '../types/cyber';

interface CyberHeaderProps {
  theme: TerminalTheme;
  setTheme: (t: TerminalTheme) => void;
  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;
  activeTab: 'terminal' | 'network' | 'vulns' | 'java_workbench';
  setActiveTab: (tab: 'terminal' | 'network' | 'vulns' | 'java_workbench') => void;
  currentHostHostname: string;
  currentHostIp: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenManual: () => void;
  currentMissionTitle: string;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  theme,
  setTheme,
  gameMode,
  setGameMode,
  activeTab,
  setActiveTab,
  currentHostHostname,
  currentHostIp,
  isMuted,
  onToggleMute,
  onOpenManual,
  currentMissionTitle
}) => {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-950 px-3 sm:px-4 flex items-center justify-between gap-4 select-none shrink-0 z-40">
      {/* Brand & Host Indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span className="font-mono font-bold text-sm tracking-wider text-white hidden sm:inline">
            CYBERSANDBOX
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded font-mono text-xs text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-medium">{currentHostHostname}</span>
          <span className="text-neutral-500 text-[11px] hidden md:inline">({currentHostIp})</span>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeTab === 'terminal'
              ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>CLI Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeTab === 'network'
              ? 'bg-neutral-800 text-sky-400 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Network Map</span>
        </button>

        <button
          onClick={() => setActiveTab('vulns')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeTab === 'vulns'
              ? 'bg-neutral-800 text-amber-400 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">CVE Vulnerabilities</span>
        </button>

        <button
          onClick={() => setActiveTab('java_workbench')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
            activeTab === 'java_workbench'
              ? 'bg-neutral-800 text-purple-400 font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Java Security Lab</span>
        </button>
      </nav>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mode Toggle */}
        <div className="hidden lg:flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded text-xs font-mono">
          <button
            onClick={() => setGameMode('academy')}
            className={`px-2.5 py-1 rounded transition-colors ${
              gameMode === 'academy' ? 'bg-emerald-600/30 text-emerald-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Academy CTF
          </button>
          <button
            onClick={() => setGameMode('sandbox')}
            className={`px-2.5 py-1 rounded transition-colors ${
              gameMode === 'sandbox' ? 'bg-sky-600/30 text-sky-400 font-semibold' : 'text-neutral-400'
            }`}
          >
            Free Sandbox
          </button>
        </div>

        {/* Theme Selector */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as TerminalTheme)}
          aria-label="Select terminal theme"
          className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-neutral-600 hidden sm:block"
        >
          <option value="matrix_green">Matrix Green</option>
          <option value="cyberpunk_amber">Cyber Amber</option>
          <option value="monokai">Monokai Dark</option>
          <option value="stealth_dark">Stealth Grey</option>
        </select>

        {/* Sound Toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Manual Button */}
        <button
          onClick={onOpenManual}
          title="CLI Guide & Cyber Defense Manual"
          className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-sky-400" />
        </button>
      </div>
    </header>
  );
};
