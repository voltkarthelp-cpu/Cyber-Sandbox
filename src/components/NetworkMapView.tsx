/**
 * Network Topology Map & Host Reconnaissance View
 * Displays discovered network hosts, open ports, firewall statuses, and quick action triggers.
 */

import React from 'react';
import { NetworkHost } from '../types/cyber';
import { Server, ShieldAlert, ShieldCheck, Terminal, Radio, Lock, Globe } from 'lucide-react';

interface NetworkMapViewProps {
  hosts: Record<string, NetworkHost>;
  currentHostIp: string;
  onRunCommand: (cmd: string) => void;
}

export const NetworkMapView: React.FC<NetworkMapViewProps> = ({
  hosts,
  currentHostIp,
  onRunCommand
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950 font-mono text-xs">
      {/* Overview Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
            <span>Virtual Network Subnet Map (10.0.0.0/24 & 192.168.1.0/24)</span>
          </h2>
          <p className="text-neutral-400 text-xs mt-1">
            Map discovered servers, analyze exposed attack surfaces, and run reconnaissance probes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-1 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded">
            Discovered: {Object.values(hosts).filter((h) => h.isDiscovered).length}/{Object.values(hosts).length} Hosts
          </span>
        </div>
      </div>

      {/* Grid of Network Hosts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(hosts).map((host) => {
          const isCurrent = host.ip === currentHostIp;
          const openPortsCount = host.ports.filter((p) => p.state === 'open').length;
          const unpatchedVulns = host.vulnerabilities.filter((v) => !v.isPatched);

          return (
            <div
              key={host.id}
              className={`rounded-xl border p-4 transition-all ${
                isCurrent
                  ? 'bg-neutral-900/90 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                  : host.isDiscovered
                  ? 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  : 'bg-neutral-950/80 border-neutral-800/60 opacity-60'
              }`}
            >
              {/* Host Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{host.hostname}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded font-semibold">
                          CONNECTED (YOU)
                        </span>
                      )}
                    </div>
                    <div className="text-neutral-400 text-[11px] font-mono">{host.ip}</div>
                  </div>
                </div>

                {/* Vulnerability status icon */}
                {unpatchedVulns.length > 0 ? (
                  <div className="flex items-center gap-1 text-red-400 text-[11px] bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{unpatchedVulns.length} VULN</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-emerald-400 text-[11px] bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SECURED</span>
                  </div>
                )}
              </div>

              {/* Host Metadata */}
              <div className="space-y-1.5 mb-4 text-[11px] text-neutral-300">
                <div className="flex justify-between py-0.5 border-b border-neutral-800">
                  <span className="text-neutral-500">Role:</span>
                  <span className="font-medium text-neutral-200">{host.role}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800">
                  <span className="text-neutral-500">Operating System:</span>
                  <span className="truncate max-w-[220px] text-neutral-200">{host.os}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-neutral-800">
                  <span className="text-neutral-500">Open Ports:</span>
                  <span className="text-sky-400 font-semibold">{openPortsCount} Active</span>
                </div>
              </div>

              {/* Ports List */}
              <div className="mb-4">
                <div className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">
                  Listening Services
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {host.ports.map((p) => (
                    <div
                      key={p.port}
                      className="px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] flex items-center gap-1.5"
                    >
                      <span className="text-sky-400 font-semibold">{p.port}</span>
                      <span className="text-neutral-400">{p.service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick CLI Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800">
                <button
                  onClick={() => onRunCommand(`ping ${host.ip}`)}
                  className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[11px] transition-colors"
                >
                  ping
                </button>
                <button
                  onClick={() => onRunCommand(`nmap -sV ${host.ip}`)}
                  className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-300 rounded text-[11px] transition-colors"
                >
                  nmap -sV
                </button>
                <button
                  onClick={() => onRunCommand(`vulnscan ${host.ip}`)}
                  className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded text-[11px] transition-colors"
                >
                  vulnscan
                </button>
                {!isCurrent && (
                  <button
                    onClick={() => onRunCommand(`ssh student@${host.ip}`)}
                    className="ml-auto px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] transition-colors flex items-center gap-1"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>SSH Connect</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
