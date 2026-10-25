/**
 * In-Terminal Text Editor (Nano/Vim style)
 * Allows players to inspect and edit code or configuration files directly within the terminal shell.
 */

import React, { useState } from 'react';
import { EditorState } from '../types/cyber';
import { Save, X, FileCode } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface NanoEditorProps {
  editorState: EditorState;
  onSave: (content: string) => void;
  onClose: () => void;
}

export const NanoEditor: React.FC<NanoEditorProps> = ({
  editorState,
  onSave,
  onClose
}) => {
  const [content, setContent] = useState(editorState.initialContent);
  const [isSavedMessage, setIsSavedMessage] = useState(false);

  const handleSave = () => {
    onSave(content);
    soundEngine.playSuccess();
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+O or Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'o')) {
      e.preventDefault();
      handleSave();
    }
    // Ctrl+X to exit
    if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] text-neutral-200 font-mono text-xs sm:text-sm select-none">
      {/* Nano Header Bar */}
      <div className="h-7 bg-neutral-200 text-neutral-900 px-3 flex items-center justify-between font-bold text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span>GNU nano 7.2</span>
          <span className="text-neutral-600 font-normal">File: {editorState.filePath}</span>
        </div>
        <div className="text-[11px] font-semibold text-emerald-800">
          {isSavedMessage ? '[ WROTE TO DISK ]' : '[ MODIFIED ]'}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative p-3 overflow-hidden flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-xs sm:text-sm text-neutral-100 leading-relaxed"
        />
      </div>

      {/* Nano Bottom Shortcuts Key Strip */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-2 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-300 shrink-0">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-left font-mono"
        >
          <span className="text-white font-bold bg-neutral-700 px-1 rounded">^O</span>
          <span>WriteOut (Save)</span>
        </button>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-left font-mono"
        >
          <span className="text-white font-bold bg-neutral-700 px-1 rounded">^X</span>
          <span>Exit Editor</span>
        </button>

        <div className="flex items-center gap-1.5 px-2 py-1 text-neutral-500 font-mono hidden sm:flex">
          <span className="text-neutral-400 font-bold bg-neutral-800 px-1 rounded">^G</span>
          <span>Get Help</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 text-neutral-500 font-mono hidden sm:flex">
          <span className="text-neutral-400 font-bold bg-neutral-800 px-1 rounded">^W</span>
          <span>Where Is</span>
        </div>
      </div>
    </div>
  );
};
