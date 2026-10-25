/**
 * Comprehensive Cybersecurity & Linux CLI Manual Modal
 */

import React from 'react';
import { BookOpen, X, Terminal, Shield, Network, Lock, Code2 } from 'lucide-react';

interface CyberManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CyberManualModal: React.FC<CyberManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-neutral-200 font-mono text-xs">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-white">
              Cybersecurity, CLI & Defense Knowledge Base
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 leading-relaxed">
          {/* Section: Terminal & CLI Primer */}
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-2">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>1. Linux CLI & Terminal Mechanics</span>
            </h3>
            <p className="text-neutral-300 text-xs">
              The terminal provides direct access to the operating system kernel via shell commands:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <span className="text-sky-300 font-bold">ls -la</span>
                <p className="text-neutral-400">List all directory files including permissions and hidden dotfiles (.env).</p>
              </div>
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <span className="text-sky-300 font-bold">cat & grep</span>
                <p className="text-neutral-400">Read and filter file streams (e.g. grep "Failed password" /var/log/auth.log).</p>
              </div>
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <span className="text-sky-300 font-bold">chmod 600</span>
                <p className="text-neutral-400">Restrict file read/write permissions to owner only, protecting private keys.</p>
              </div>
              <div className="p-2 bg-neutral-900/80 rounded border border-neutral-800">
                <span className="text-sky-300 font-bold">nano & vim</span>
                <p className="text-neutral-400">In-terminal text editor for live patching of configuration and Java code.</p>
              </div>
            </div>
          </div>

          {/* Section: Identifying Vulnerabilities */}
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>2. How to Identify System Vulnerabilities</span>
            </h3>
            <ul className="space-y-1.5 text-neutral-300 text-xs list-disc list-inside">
              <li><strong>Port & Service Scanning (nmap -sV):</strong> Probes open ports to identify software version banners (e.g., Log4j 2.14, Spring Boot 2.5, PostgreSQL 14).</li>
              <li><strong>Vulnerability Databases (CVE / NVD):</strong> Matches discovered versions against known Common Vulnerabilities and Exposures (e.g. Log4Shell CVE-2021-44228).</li>
              <li><strong>Log Auditing & Forensics:</strong> Inspecting <code>/var/log/auth.log</code> or web access logs for brute-force patterns and suspicious request headers.</li>
              <li><strong>Static & Dynamic Code Analysis:</strong> Searching Java source code for raw SQL concatenations or insecure reflection / deserialization.</li>
            </ul>
          </div>

          {/* Section: Prevention & Defense */}
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 space-y-2">
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>3. How to Prevent Vulnerabilities (System Hardening)</span>
            </h3>
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                <strong className="text-emerald-400">SQL Injection Prevention:</strong> Always use JDBC <code>PreparedStatement</code> with bind parameters (<code>?</code>) or Spring Data JPA. Never concatenate user strings into SQL queries.
              </div>
              <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                <strong className="text-emerald-400">Log4Shell Prevention:</strong> Upgrade to Apache Log4j &ge; 2.17.1, pass <code>-Dlog4j2.formatMsgNoLookups=true</code> to the JVM, and strip <code>$&#123;&#125;</code> expressions before logging.
              </div>
              <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                <strong className="text-emerald-400">Network Firewalls (ufw):</strong> Block all non-essential ingress ports and restrict database ports (5432, 3306) to localhost or trusted internal subnets only.
              </div>
              <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                <strong className="text-emerald-400">Principle of Least Privilege:</strong> Run services under dedicated non-root service accounts, remove SUID bits on dangerous binaries, and enforce strong SSH key authentication.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition-colors"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
