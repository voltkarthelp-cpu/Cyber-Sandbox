/**
 * Mobile Touch & Quick Command Bar
 * Provides responsive buttons for common terminal keystrokes and hacker commands on mobile and touchscreens.
 */

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface MobileActionBarProps {
  onInsertCommand: (cmd: string) => void;
  onExecuteCommand: (cmd: string) => void;
  onNavigateHistory: (direction: 'up' | 'down') => void;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  onInsertCommand,
  onExecuteCommand,
  onNavigateHistory
}) => {
  const quickRun = (cmd: string) => {
    soundEngine.playKeyClick();
    onExecuteCommand(cmd);
  };

  const quickInsert = (text: string) => {
    soundEngine.playKeyClick();
    onInsertCommand(text);
  };

  return (
    <div className="h-10 bg-neutral-900 border-t border-neutral-800 px-2 flex items-center gap-1.5 overflow-x-auto select-none shrink-0 text-xs font-mono">
      {/* History buttons */}
      <button
        onClick={() => { soundEngine.playKeyClick(); onNavigateHistory('up'); }}
        title="Previous Command"
        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 rounded shrink-0 border border-neutral-700"
      >
        <ArrowUp className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => { soundEngine.playKeyClick(); onNavigateHistory('down'); }}
        title="Next Command"
        className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 rounded shrink-0 border border-neutral-700"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-neutral-700 mx-1 shrink-0" />

      {/* Quick hacker utility triggers */}
      <button
        onClick={() => quickRun('ls -la')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-sky-400 rounded shrink-0 font-medium"
      >
        ls -la
      </button>

      <button
        onClick={() => quickRun('pwd')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded shrink-0 font-medium"
      >
        pwd
      </button>

      <button
        onClick={() => quickInsert('cat ')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded shrink-0 font-medium"
      >
        cat ...
      </button>

      <button
        onClick={() => quickInsert('nmap -sV ')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded shrink-0 font-medium"
      >
        nmap -sV
      </button>

      <button
        onClick={() => quickInsert('vulnscan ')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-red-400 rounded shrink-0 font-medium"
      >
        vulnscan
      </button>

      <button
        onClick={() => quickInsert('curl ')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded shrink-0 font-medium"
      >
        curl
      </button>

      <button
        onClick={() => quickRun('hint')}
        className="px-2.5 py-1 bg-sky-950/80 border border-sky-800 text-sky-300 rounded shrink-0 font-bold"
      >
        hint
      </button>

      <button
        onClick={() => quickRun('clear')}
        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded shrink-0"
      >
        clear
      </button>
    </div>
  );
};
