/**
 * Main Application Orchestrator for CyberSandbox: Terminal Hacking & Defense Simulator
 * Cross-platform CLI, Network Reconnaissance, Vulnerability Identification, and Defensive Hardening.
 */

import React, { useState, useRef, useEffect } from 'react';
import { VirtualOS } from './simulation/virtualOS';
import { TerminalTheme, GameMode, TerminalOutputLine } from './types/cyber';
import { CyberHeader } from './components/CyberHeader';
import { TerminalView } from './components/TerminalView';
import { NetworkMapView } from './components/NetworkMapView';
import { VulnerabilityRadar } from './components/VulnerabilityRadar';
import { NanoEditor } from './components/NanoEditor';
import { JavaSecurityWorkbench } from './components/JavaSecurityWorkbench';
import { MissionBriefingDrawer } from './components/MissionBriefingDrawer';
import { MobileActionBar } from './components/MobileActionBar';
import { CyberManualModal } from './components/CyberManualModal';
import { IntroOnboardingCard } from './components/IntroOnboardingCard';
import { LevelBriefingModal } from './components/LevelBriefingModal';
import { soundEngine } from './services/soundEngine';

export default function App() {
  const osRef = useRef<VirtualOS>(new VirtualOS());
  const os = osRef.current;

  // View & Theme State
  const [activeTab, setActiveTab] = useState<'terminal' | 'network' | 'vulns' | 'java_workbench'>('terminal');
  const [theme, setTheme] = useState<TerminalTheme>('matrix_green');
  const [gameMode, setGameMode] = useState<GameMode>('academy');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isMissionDrawerOpen, setIsMissionDrawerOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Onboarding & Level Briefing Modals
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(() => {
    return localStorage.getItem('cybersandbox_intro_seen') === 'true';
  });
  const [showLevelBriefing, setShowLevelBriefing] = useState<boolean>(false);

  // Terminal Line Output Stream
  const [terminalLines, setTerminalLines] = useState<TerminalOutputLine[]>([
    {
      id: 'banner_1',
      type: 'banner',
      text: `========================================================================\n  CYBERSANDBOX: ETHICAL HACKING & SYSTEM DEFENSE SIMULATOR\n  Kernel: Linux 6.1-amd64 | Runtime: OpenJDK 21 (JVM HotSpot)\n========================================================================\nWelcome, Cyber Security Analyst!\nYour terminal is armed with full Linux CLI tools and security utilities.\n\nQuick Commands:\n  • mission   : View your current training mission and learning outcome\n  • hint      : Get instant advice on the next command to execute\n  • ls -la    : Explore current directory files and hidden tokens\n  • nmap -sV  : Scan target subnet hosts and service banners\n  • vulnscan  : Audit systems for CVE vulnerabilities & CVSS scores\n  • help      : List all available commands & tools\n========================================================================`
    }
  ]);

  // Force React render on internal VirtualOS state mutation
  const [, setTick] = useState(0);
  const refreshUI = () => setTick((t) => t + 1);

  // Check if mission just completed all steps
  const prevCompletedCountRef = useRef<number>(0);
  useEffect(() => {
    const currentMission = os.missions[os.currentMissionIndex];
    if (!currentMission) return;

    const completedCount = currentMission.steps.filter((s) => s.completed).length;
    const isAllDone = currentMission.steps.every((s) => s.completed);

    if (isAllDone && prevCompletedCountRef.current < currentMission.steps.length) {
      soundEngine.playExploitSuccess();
      setTerminalLines((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: 'success',
          text: `\n[★ LEVEL ${currentMission.id} COMPLETED ★]\nAll objectives accomplished for: ${currentMission.title}!\nType 'mission next' or check the next Level Briefing to proceed.`
        }
      ]);
    }

    prevCompletedCountRef.current = completedCount;
  }, [os.currentMissionIndex, setTick]);

  // Command Execution
  const handleCommandSubmit = (commandText: string) => {
    if (!commandText.trim()) return;

    const newOutputs = os.executeCommand(commandText);

    // If 'clear' was triggered
    if (newOutputs.some((o) => o.text === '__CLEAR__')) {
      setTerminalLines([]);
    } else {
      setTerminalLines((prev) => [...prev, ...newOutputs]);
    }

    refreshUI();
  };

  // Run command from external UI buttons (Map / Mission / Quick Bar)
  const handleQuickCommand = (cmd: string) => {
    setActiveTab('terminal');
    handleCommandSubmit(cmd);
  };

  // Patching vulnerability
  const handleApplyPatch = (vulnId: string) => {
    handleCommandSubmit(`patch ${vulnId}`);
  };

  // Open Java Lab for specific CVE
  const handleOpenJavaLab = (vulnId: string) => {
    setActiveTab('java_workbench');
  };

  // Editor Save & Close
  const handleEditorSave = (newContent: string) => {
    os.editorState.currentContent = newContent;
    os.editorState.isSaved = true;
    handleCommandSubmit(`echo "Saved changes to ${os.editorState.filePath}"`);
    refreshUI();
  };

  const handleEditorClose = () => {
    os.editorState.isOpen = false;
    refreshUI();
  };

  // Audio Toggle
  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Mission Navigation
  const handleNextMission = () => {
    if (os.currentMissionIndex < os.missions.length - 1) {
      os.currentMissionIndex += 1;
      soundEngine.playSuccess();
      setShowLevelBriefing(true);
      handleCommandSubmit('mission');
      refreshUI();
    }
  };

  const handlePrevMission = () => {
    if (os.currentMissionIndex > 0) {
      os.currentMissionIndex -= 1;
      soundEngine.playSuccess();
      setShowLevelBriefing(true);
      handleCommandSubmit('mission');
      refreshUI();
    }
  };

  // Intro dismissal & start Level 1
  const handleStartFromIntro = () => {
    setHasSeenIntro(true);
    localStorage.setItem('cybersandbox_intro_seen', 'true');
    setShowLevelBriefing(true);
  };

  const currentHost = os.hosts[os.currentHostIp];
  const currentMission = os.missions[os.currentMissionIndex];

  // Aggregate all vulnerabilities from all network hosts
  const allVulnerabilities = Object.values(os.hosts).flatMap((h) => h.vulnerabilities);

  return (
    <div className="w-screen h-screen overflow-hidden bg-neutral-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] select-none text-white">
      {/* Top Navigation Header */}
      <CyberHeader
        theme={theme}
        setTheme={setTheme}
        gameMode={gameMode}
        setGameMode={setGameMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentHostHostname={currentHost.hostname}
        currentHostIp={currentHost.ip}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenManual={() => setIsManualOpen(true)}
        currentMissionTitle={currentMission.title}
      />

      {/* Guided Academy CTF Mission Drawer (Shown in Academy Mode) */}
      {gameMode === 'academy' && (
        <MissionBriefingDrawer
          mission={currentMission}
          currentIndex={os.currentMissionIndex}
          totalMissions={os.missions.length}
          hintTokens={os.hintTokens}
          onNextMission={handleNextMission}
          onPrevMission={handlePrevMission}
          onUnlockHint={() => handleCommandSubmit('hint unlock')}
          isOpen={isMissionDrawerOpen}
          onToggleOpen={() => setIsMissionDrawerOpen((prev) => !prev)}
          onOpenLevelBriefing={() => setShowLevelBriefing(true)}
        />
      )}

      {/* Main Center Stage */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* If Nano editor is open, it takes over center viewport */}
        {os.editorState.isOpen ? (
          <NanoEditor
            editorState={os.editorState}
            onSave={handleEditorSave}
            onClose={handleEditorClose}
          />
        ) : (
          <>
            {activeTab === 'terminal' && (
              <TerminalView
                lines={terminalLines}
                onCommandSubmit={handleCommandSubmit}
                theme={theme}
                currentHostHostname={currentHost.hostname}
                currentUser={os.currentUser}
                currentPath={os.currentPath}
              />
            )}

            {activeTab === 'network' && (
              <NetworkMapView
                hosts={os.hosts}
                currentHostIp={os.currentHostIp}
                onRunCommand={handleQuickCommand}
              />
            )}

            {activeTab === 'vulns' && (
              <VulnerabilityRadar
                vulnerabilities={allVulnerabilities}
                onApplyPatch={handleApplyPatch}
                onOpenJavaLab={handleOpenJavaLab}
              />
            )}

            {activeTab === 'java_workbench' && <JavaSecurityWorkbench />}
          </>
        )}
      </div>

      {/* Mobile Touch & Quick Key Bar (Always visible on touchscreens / compact views) */}
      <MobileActionBar
        onInsertCommand={(cmd) => handleCommandSubmit(cmd)}
        onExecuteCommand={handleCommandSubmit}
        onNavigateHistory={() => {}}
      />

      {/* 1. Introductory Onboarding Modal (Shown once at start, dismissible) */}
      {!hasSeenIntro && (
        <IntroOnboardingCard onStartGame={handleStartFromIntro} />
      )}

      {/* 2. Level Transition Briefing Modal (Explains problem & pass requirements) */}
      <LevelBriefingModal
        isOpen={showLevelBriefing}
        onClose={() => setShowLevelBriefing(false)}
        mission={currentMission}
        currentIndex={os.currentMissionIndex}
        allMissions={os.missions}
      />

      {/* 3. Knowledge Base & CLI Reference Modal */}
      <CyberManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  );
}
