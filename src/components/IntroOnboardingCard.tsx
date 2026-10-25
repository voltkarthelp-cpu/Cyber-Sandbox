/**
 * Introductory Onboarding Card
 * Explains the game type, what it does, and foundational steps.
 * Dismissable and not visible to the user after starting.
 */

import React from 'react';
import { Terminal, Shield, Network, Zap, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface IntroOnboardingCardProps {
  onStartGame: () => void;
}

export const IntroOnboardingCard: React.FC<IntroOnboardingCardProps> = ({ onStartGame }) => {
  const handleStart = () => {
    soundEngine.playSuccess();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none font-mono">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200 text-xs sm:text-sm">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="font-bold text-xs text-emerald-400 tracking-wider ml-2">
              CYBERSANDBOX // SYSTEM BRIEFING
            </span>
          </div>
          <span className="text-[10px] text-neutral-500">v2.4 LTS</span>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Welcome Lockup */}
          <div>
            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-widest mb-1">
              Ethical Hacking & Defense Simulator
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              Master the Command Line & System Security
            </h2>
            <p className="text-neutral-300 text-xs sm:text-sm mt-2 leading-relaxed">
              CyberSandbox is an interactive terminal simulator designed to teach real-world Linux CLI skills, network mapping, vulnerability identification (like SQL Injection & Log4Shell), and defensive system hardening.
            </p>
          </div>

          {/* 3 Step Breakdown */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              How the Simulator Works (3 Core Steps)
            </div>

            {/* Step 1 */}
            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">1. Operate the Real-World CLI Terminal</div>
                <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                  Type genuine Linux commands (<code className="text-emerald-300">ls -la</code>, <code className="text-emerald-300">cat</code>, <code className="text-emerald-300">grep</code>, <code className="text-emerald-300">chmod</code>) to inspect system files, find hidden tokens, and navigate the directory tree.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">2. Network Reconnaissance & CVE Auditing</div>
                <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                  Scan target servers using <code className="text-sky-300">nmap -sV</code>, detect open ports (SSH, HTTP, Java Spring Boot), and run <code className="text-sky-300">vulnscan</code> to audit systems against real CVE databases.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">3. Exploit Verification & Defensive Hardening</div>
                <p className="text-neutral-400 text-xs mt-0.5 leading-relaxed">
                  Safely test simulated exploit vectors, then apply industry-standard defenses: parameterized PreparedStatements, Log4j remediation, firewall drop rules (<code className="text-amber-300">ufw</code>), and in-terminal file editing (<code className="text-amber-300">nano</code>).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 hidden sm:block">
            5 Progressive Academy Levels · Free Sandbox Available
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/60 transition-all text-xs cursor-pointer"
          >
            <span>Begin Academy Training</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
