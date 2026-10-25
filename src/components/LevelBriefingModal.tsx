/**
 * Level Transition & Mission Briefing Modal
 * Appears when advancing to a new level to explain:
 * - What the security problem is on the target system
 * - What the player must do to pass this level
 * - Overall roadmap of all levels in the campaign
 */

import React from 'react';
import { AcademyMission } from '../types/cyber';
import { ShieldAlert, CheckCircle2, Circle, ArrowRight, Play, Terminal, Layers, Lock, Cpu } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface LevelBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: AcademyMission;
  currentIndex: number;
  allMissions: AcademyMission[];
}

export const LevelBriefingModal: React.FC<LevelBriefingModalProps> = ({
  isOpen,
  onClose,
  mission,
  currentIndex,
  allMissions
}) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    soundEngine.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none font-mono">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-neutral-200 text-xs sm:text-sm">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs tracking-wider text-emerald-400">
              MISSION DISPATCH // LEVEL {mission.id} OF {allMissions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
              Difficulty: <span className="text-white font-bold">{mission.difficulty}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 hidden sm:inline">
              Target: {mission.targetHostIp}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Level Header Lockup */}
          <div>
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-1">
              {mission.category}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {mission.title}
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              {mission.subtitle}
            </p>
          </div>

          {/* 1. What is the Problem? */}
          <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-400 text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>The Security Problem & Threat Scenario</span>
            </div>
            <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* 2. What Must You Do to Pass? */}
          <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>What You Have to Do to Pass This Level</span>
            </div>

            <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 text-neutral-300">
              <span className="text-sky-300 font-bold">PRIMARY GOAL: </span>
              <span>{mission.objective}</span>
            </div>

            <div className="space-y-2 pt-1">
              {mission.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border ${
                    step.completed
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-xs leading-snug">{step.instruction}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{step.explanation}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hint System Guidance */}
            <div className="p-2.5 bg-neutral-900/60 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Hints provide investigative suggestions (not command answers) and cost 1 token to unlock.</span>
              <span className="text-amber-400 font-bold shrink-0 ml-2">Earn +1 Token per Level</span>
            </div>
          </div>

          {/* 3. Campaign Roadmap (All Levels) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>All Levels Campaign Roadmap</span>
              </span>
              <span className="text-neutral-500">
                {allMissions.filter((m) => m.steps.every((s) => s.completed)).length}/{allMissions.length} Cleared
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {allMissions.map((m, idx) => {
                const isCurrent = idx === currentIndex;
                const isDone = m.steps.every((s) => s.completed);

                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                        : isDone
                        ? 'bg-neutral-950 border-neutral-800 text-neutral-400'
                        : 'bg-neutral-950/40 border-neutral-800/50 text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold">L{m.id}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <Lock className="w-3 h-3 text-neutral-600" />
                      )}
                    </div>
                    <div className="text-[10px] font-medium truncate leading-tight">
                      {m.category}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400 hidden sm:block">
            Target Host: <code className="text-sky-300">{mission.targetHostIp}</code>
          </div>

          <button
            onClick={handleAccept}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Accept Mission & Launch Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
