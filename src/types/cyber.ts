/**
 * Type definitions for the Java Hacking & Cybersecurity Terminal Simulator
 */

export type TerminalTheme = 'matrix_green' | 'cyberpunk_amber' | 'monokai' | 'stealth_dark';

export type GameMode = 'academy' | 'sandbox';

export interface VFile {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  permissions: string; // e.g. "rw-r--r--" or "rwxr-xr-x"
  owner: string;
  group: string;
  size: number;
  modified: string;
  children?: Record<string, VFile>;
  isExecutable?: boolean;
}

export interface NetworkPort {
  port: number;
  protocol: 'TCP' | 'UDP';
  service: string;
  version: string;
  state: 'open' | 'closed' | 'filtered';
  banner?: string;
}

export interface Vulnerability {
  id: string; // e.g. "CVE-2021-44228"
  title: string;
  category: 'Injection' | 'Broken Auth' | 'Deserialization' | 'Misconfiguration' | 'Outdated Library';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvss: number;
  targetService: string;
  port: number;
  description: string;
  exploitVector: string;
  preventionGuide: string;
  vulnerableCodeSample?: string;
  secureCodeSample?: string;
  isExploited: boolean;
  isPatched: boolean;
}

export interface NetworkHost {
  id: string;
  ip: string;
  hostname: string;
  os: string;
  role: string;
  isLocal: boolean;
  isDiscovered: boolean;
  isCompromised: boolean;
  isHardened: boolean;
  ports: NetworkPort[];
  vulnerabilities: Vulnerability[];
  filesystem: VFile;
  firewallRules: { port: number; action: 'ALLOW' | 'DENY' }[];
}

export interface MissionStep {
  id: string;
  instruction: string;
  investigativeClue?: string;
  explanation: string;
  completed: boolean;
  validator: (command: string, output: string, host: NetworkHost) => boolean;
}

export interface AcademyMission {
  id: number;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  description: string;
  objective: string;
  learningOutcome: string;
  investigativeSuggestion: string;
  isHintUnlocked: boolean;
  steps: MissionStep[];
  targetHostIp: string;
}

export interface TerminalOutputLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'banner';
  text: string;
  prompt?: string;
}

export interface EditorState {
  isOpen: boolean;
  filePath: string;
  initialContent: string;
  currentContent: string;
  cursorLine: number;
  isSaved: boolean;
}
