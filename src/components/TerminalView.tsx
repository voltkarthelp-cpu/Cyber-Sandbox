/**
 * Interactive Command Line Terminal View with Authentic Typing Effect Animation
 * Features real-time streaming output cadence, ANSI-style themes, autocompletion, and skip-on-click.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalOutputLine, TerminalTheme } from '../types/cyber';
import { soundEngine } from '../services/soundEngine';
import { Zap, ZapOff } from 'lucide-react';

interface TerminalViewProps {
  lines: TerminalOutputLine[];
  onCommandSubmit: (cmd: string) => void;
  theme: TerminalTheme;
  currentHostHostname: string;
  currentUser: string;
  currentPath: string;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  lines,
  onCommandSubmit,
  theme,
  currentHostHostname,
  currentUser,
  currentPath
}) => {
  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [enableTypingAnimation, setEnableTypingAnimation] = useState<boolean>(true);
  
  // Track IDs of lines that have finished typing animation
  const [completedLineIds, setCompletedLineIds] = useState<Set<string>>(() => new Set());
  // Active animating line ID and visible character count
  const [animatingLineId, setAnimatingLineId] = useState<string | null>(null);
  const [visibleChars, setVisibleChars] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const animTimerRef = useRef<number | null>(null);

  // Auto-scroll on new output or typing progress
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, visibleChars]);

  // Typing animation driver
  useEffect(() => {
    if (!enableTypingAnimation) {
      // If typing animation disabled, mark all current lines completed immediately
      setCompletedLineIds(new Set(lines.map((l) => l.id)));
      setAnimatingLineId(null);
      return;
    }

    // Find first non-input line that is not yet completed
    const pendingLine = lines.find(
      (l) => l.type !== 'input' && l.text !== '__CLEAR__' && !completedLineIds.has(l.id)
    );

    if (!pendingLine) {
      setAnimatingLineId(null);
      return;
    }

    setAnimatingLineId(pendingLine.id);
    setVisibleChars(0);

    const fullLength = pendingLine.text.length;
    // Dynamic typing speed: fast for long blocks (e.g. banners/logs), crisp for short responses
    const stepSize = Math.max(3, Math.ceil(fullLength / 22));

    const interval = window.setInterval(() => {
      setVisibleChars((prev) => {
        const next = prev + stepSize;
        if (Math.random() < 0.25) {
          soundEngine.playKeyClick();
        }

        if (next >= fullLength) {
          window.clearInterval(interval);
          setCompletedLineIds((prevSet) => new Set([...prevSet, pendingLine.id]));
          return fullLength;
        }
        return next;
      });
    }, 14);

    animTimerRef.current = interval;

    return () => {
      if (animTimerRef.current) {
        window.clearInterval(animTimerRef.current);
      }
    };
  }, [lines, enableTypingAnimation, completedLineIds]);

  // Instant skip typing on click or keystroke
  const handleInstantSkip = useCallback(() => {
    if (animTimerRef.current) {
      window.clearInterval(animTimerRef.current);
    }
    setCompletedLineIds(new Set(lines.map((l) => l.id)));
    setAnimatingLineId(null);
  }, [lines]);

  const handleContainerClick = () => {
    handleInstantSkip();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If typing animation is currently running, any key instantly completes it
    if (animatingLineId) {
      handleInstantSkip();
    }

    soundEngine.playKeyClick();

    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      onCommandSubmit(trimmed);
      setInputVal('');
      setHistoryIndex(null);
      return;
    }

    // Tab Autocompletion
    if (e.key === 'Tab') {
      e.preventDefault();
      const commonCommands = [
        'ls', 'cd', 'pwd', 'cat', 'grep', 'nmap', 'curl', 'vulnscan', 'patch',
        'ufw', 'nano', 'help', 'mission', 'hint', 'clear', 'whoami', 'history'
      ];
      const commonFiles = [
        'welcome.txt', 'cheatsheet.txt', '.env', '.bash_history', 'auth.log',
        'AuthService.java', 'AuthServiceSecured.java', 'log4j2.xml', 'CVE-2021-44228', 'CWE-89'
      ];

      const parts = inputVal.split(' ');
      const lastWord = parts[parts.length - 1];

      if (parts.length === 1) {
        const match = commonCommands.find((c) => c.startsWith(lastWord));
        if (match) setInputVal(match + ' ');
      } else {
        const match = commonFiles.find((f) => f.startsWith(lastWord));
        if (match) {
          parts[parts.length - 1] = match;
          setInputVal(parts.join(' '));
        }
      }
    }
  };

  // Color theme definitions
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix_green':
        return {
          bg: 'bg-[#0a0f0d]',
          text: 'text-[#00ff66]',
          prompt: 'text-[#33ff88]',
          system: 'text-[#00cc55]',
          cursor: 'bg-[#00ff66]',
          border: 'border-[#113322]'
        };
      case 'cyberpunk_amber':
        return {
          bg: 'bg-[#120d04]',
          text: 'text-[#ffb703]',
          prompt: 'text-[#fb8500]',
          system: 'text-[#e09f3e]',
          cursor: 'bg-[#ffb703]',
          border: 'border-[#3d2605]'
        };
      case 'monokai':
        return {
          bg: 'bg-[#1e1e1e]',
          text: 'text-[#f8f8f2]',
          prompt: 'text-[#a6e22e]',
          system: 'text-[#66d9ef]',
          cursor: 'bg-[#f8f8f2]',
          border: 'border-[#333333]'
        };
      case 'stealth_dark':
      default:
        return {
          bg: 'bg-[#0f172a]',
          text: 'text-[#e2e8f0]',
          prompt: 'text-[#38bdf8]',
          system: 'text-[#94a3b8]',
          cursor: 'bg-[#38bdf8]',
          border: 'border-[#1e293b]'
        };
    }
  };

  const themeStyle = getThemeClasses();
  const currentPrompt = `${currentUser}@${currentHostHostname}:${currentPath}$`;

  return (
    <div
      onClick={handleContainerClick}
      className={`relative flex-1 flex flex-col p-4 overflow-y-auto font-mono text-xs sm:text-sm select-text cursor-text transition-colors ${themeStyle.bg} ${themeStyle.text}`}
    >
      {/* Top Floating Controls (Typing Speed Toggle) */}
      <div className="absolute top-2 right-3 z-20 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEnableTypingAnimation((prev) => !prev);
          }}
          title={enableTypingAnimation ? 'Typing Animation Active (Click to make instant)' : 'Instant Output Active (Click to enable typewriter)'}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-neutral-400 hover:text-white transition-colors"
        >
          {enableTypingAnimation ? (
            <>
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Typewriter: ON</span>
            </>
          ) : (
            <>
              <ZapOff className="w-3 h-3 text-neutral-500" />
              <span className="hidden sm:inline">Typewriter: OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Output Stream */}
      <div className="space-y-2">
        {lines.map((line) => {
          if (line.text === '__CLEAR__') return null;

          // User typed inputs render immediately
          if (line.type === 'input') {
            return (
              <div key={line.id} className="flex items-start gap-2 leading-relaxed">
                <span className={`shrink-0 font-bold ${themeStyle.prompt}`}>{line.prompt}</span>
                <span className="font-semibold text-white">{line.text}</span>
              </div>
            );
          }

          // Calculate displayed text based on typing animation
          const isCurrentlyTyping = line.id === animatingLineId;
          const isFinished = completedLineIds.has(line.id) || !enableTypingAnimation;
          const displayedText = isFinished
            ? line.text
            : isCurrentlyTyping
            ? line.text.slice(0, visibleChars)
            : '';

          // If line has not started typing yet, wait in queue
          if (!isFinished && !isCurrentlyTyping) {
            return null;
          }

          if (line.type === 'error') {
            return (
              <div key={line.id} className="text-red-400 whitespace-pre-wrap leading-relaxed">
                {displayedText}
                {isCurrentlyTyping && <span className="inline-block w-1.5 h-3 ml-0.5 bg-red-400 animate-pulse" />}
              </div>
            );
          }

          if (line.type === 'success') {
            return (
              <div key={line.id} className="text-emerald-400 font-medium whitespace-pre-wrap leading-relaxed">
                {displayedText}
                {isCurrentlyTyping && <span className="inline-block w-1.5 h-3 ml-0.5 bg-emerald-400 animate-pulse" />}
              </div>
            );
          }

          if (line.type === 'system') {
            return (
              <div key={line.id} className={`${themeStyle.system} whitespace-pre-wrap leading-relaxed`}>
                {displayedText}
                {isCurrentlyTyping && <span className={`inline-block w-1.5 h-3 ml-0.5 ${themeStyle.cursor} animate-pulse`} />}
              </div>
            );
          }

          return (
            <div key={line.id} className="whitespace-pre-wrap leading-relaxed opacity-95">
              {displayedText}
              {isCurrentlyTyping && <span className={`inline-block w-1.5 h-3 ml-0.5 ${themeStyle.cursor} animate-pulse`} />}
            </div>
          );
        })}
      </div>

      {/* Active Input Line */}
      <div className="flex items-center gap-2 mt-2 shrink-0">
        <span className={`font-bold shrink-0 ${themeStyle.prompt}`}>
          {currentPrompt}
        </span>
        <div className="flex-1 flex items-center relative">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-inherit p-0 caret-emerald-400"
          />
        </div>
      </div>

      <div ref={scrollEndRef} className="h-4" />
    </div>
  );
};
