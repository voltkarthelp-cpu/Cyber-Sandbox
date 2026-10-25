/**
 * Academy Mission Briefing & CTF Progress Drawer
 * Features hint token unlock system and investigative suggestions without command spoilers.
 */

import React from 'react';
import { AcademyMission } from '../types/cyber';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Lightbulb, Compass, Lock, Unlock, Coins } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface MissionBriefingDrawerProps {
  mission: AcademyMission;
  currentIndex: number;
  totalMissions: number;
  hintTokens: number;
  onNextMission: () => void;
  onPrevMission: () => void;
  onUnlockHint: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenLevelBriefing: () => void;
}

export const MissionBriefingDrawer: React.FC<MissionBriefingDrawerProps> = ({
  mission,
  currentIndex,
  totalMissions,
  hintTokens,
  onNextMission,
  onPrevMission,
  onUnlockHint,
  isOpen,
  onToggleOpen,
  onOpenLevelBriefing
}) => {
  const isMissionCompleted = mission.steps.every((s) => s.completed);

  return (
    <div
      className={`border-b border-neutral-800 bg-neutral-900/90 font-mono text-xs select-none transition-all ${
        isOpen ? 'p-4' : 'px-4 py-2'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleOpen}
            className="flex items-center gap-2 text-left hover:text-white cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {mission.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">{mission.title}</span>
                {isMissionCompleted ? (
                  <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                    COMPLETED
                  </span>
                ) : (
                  <span className="text-neutral-500 text-[10px] hidden sm:inline">
                    ({mission.steps.filter((s) => s.completed).length}/{mission.steps.length} Tasks)
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Hint Tokens Badge */}
          <div
            title="Earn 1 Hint Token every time you pass a level"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-800/60 rounded text-amber-300 text-[11px] font-semibold"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{hintTokens} Token{hintTokens === 1 ? '' : 's'}</span>
          </div>

          <button
            onClick={onOpenLevelBriefing}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-sky-400 rounded text-[11px] font-semibold border border-neutral-700 transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Level Briefing</span>
          </button>

          <button
            onClick={onPrevMission}
            disabled={currentIndex === 0}
            className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-neutral-400 text-[11px]">
            {currentIndex + 1}/{totalMissions}
          </span>

          <button
            onClick={onNextMission}
            disabled={currentIndex === totalMissions - 1}
            className="p-1 rounded bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isOpen && (
        <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-3">
          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
            {mission.description}
          </p>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-neutral-200">
            <span className="text-sky-400 font-bold">INVESTIGATION OBJECTIVE: </span>
            <span>{mission.objective}</span>
          </div>

          {/* Hint Unlock Section */}
          <div className="p-3 rounded-xl border transition-all bg-neutral-950/70 border-neutral-800">
            {mission.isHintUnlocked ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Lightbulb className="w-4 h-4" />
                  <span>INVESTIGATIVE NUDGE & SUGGESTION</span>
                </div>
                <p className="text-neutral-200 text-xs leading-relaxed">
                  {mission.investigativeSuggestion}
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Lock className="w-4 h-4 text-neutral-500" />
                  <span>Level Hint is locked. Challenge yourself to identify the issue on your own!</span>
                </div>

                <button
                  onClick={onUnlockHint}
                  disabled={hintTokens < 1}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    hintTokens >= 1
                      ? 'bg-amber-600 hover:bg-amber-500 active:scale-95 text-white cursor-pointer shadow-md'
                      : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Hint (1 Token)</span>
                </button>
              </div>
            )}
          </div>

          {/* Steps list without command spoilers */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Investigation Checkpoints
            </div>
            {mission.steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-start gap-2.5 p-2 rounded-lg border ${
                  step.completed
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-300'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-xs leading-snug">{step.instruction}</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">{step.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
