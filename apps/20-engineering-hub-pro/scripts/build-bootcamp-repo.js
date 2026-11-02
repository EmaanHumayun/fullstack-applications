import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOTCAMP_DIR = path.join(__dirname, '..', 'github-ecosystem', 'devops-engineering-bootcamp');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

console.log('[INIT] Creating directory structure for devops-engineering-bootcamp...');

ensureDir(BOOTCAMP_DIR);
ensureDir(path.join(BOOTCAMP_DIR, 'modules', '01-linux-system-admin-fundamentals'));
ensureDir(path.join(BOOTCAMP_DIR, 'resources', 'official-documentation'));
ensureDir(path.join(BOOTCAMP_DIR, 'resources', 'reference-guides'));
ensureDir(path.join(BOOTCAMP_DIR, 'resources', 'tools'));
ensureDir(path.join(BOOTCAMP_DIR, 'resources', 'useful-links'));
ensureDir(path.join(BOOTCAMP_DIR, 'projects'));
ensureDir(path.join(BOOTCAMP_DIR, 'progress'));
ensureDir(path.join(BOOTCAMP_DIR, 'templates'));
ensureDir(path.join(BOOTCAMP_DIR, 'assets', 'diagrams'));
ensureDir(path.join(BOOTCAMP_DIR, 'assets', 'screenshots'));

// -----------------------------------------------------------------------------
// 1. ROOT FILES
// -----------------------------------------------------------------------------

// .gitignore
fs.writeFileSync(path.join(BOOTCAMP_DIR, '.gitignore'), `# Private course materials & restricted PDFs
private/
pdfs/restricted/
*.pdf
!resources/official-documentation/*.pdf

# Environment & credentials
.env
.env.*
*.pem
*.key
id_rsa
id_rsa.pub
*.tfstate
*.tfstate.*

# OS & Editor artifacts
.DS_Store
Thumbs.db
*.swp
*.log
node_modules/
__pycache__/
`);

// LICENSE
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'LICENSE'), `MIT License

Copyright (c) 2026 Emaan Humayun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`);

// CONTRIBUTING.md
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'CONTRIBUTING.md'), `# Contributing & Guidelines

This repository serves as a personal, rigorous technical engineering record for my DevOps Bootcamp learning and practical implementation.

## Guidelines
1. Personal Learning Archive: This repository documents actual executed commands, verified terminal outputs, original scripts, and technical reflections.
2. Academic Integrity: Copyrighted course materials, proprietary exam banks, and confidential enterprise credentials must never be committed.
3. Corrections & Improvements: Constructive suggestions regarding architectural documentation or command syntax corrections are welcome via GitHub Issues.
`);

// CHANGELOG.md
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'CHANGELOG.md'), `# Changelog

All notable changes, lab completions, and curriculum updates will be documented in this file.

## [2026-11-02] - Initial Bootcamp Repository Architecture
### Added
- Repository initialized with complete 12-module bootcamp syllabus and roadmap.
- Module 01 (Linux System Admin Fundamentals) fully established with all 8 core topics.
- Standardized documentation templates for topics, labs, assignments, and troubleshooting.
- Progress tracking system at course, module, lab, and assignment levels.
`);

// COURSE-INDEX.md
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'COURSE-INDEX.md'), `# Course Content Index

Master catalog of all modules, topics, practical labs, and assignments across the DevOps Engineering Bootcamp.

## Module 01: Linux System Admin Fundamentals
- **Topic 01:** Installing Ubuntu Latest Version
  - Lab: Virtual Machine & Dual-Boot Installation Verification
- **Topic 02:** Meet Linux
  - Lab: Linux Architecture, Kernel Inspection & Core CLI Navigation
- **Topic 03:** Working with Files, Folders & Text
  - Lab: Filesystem Hierarchy Standard, CRUD Operations & Text Editors (Vim/Nano)
- **Topic 04:** Pipes, Searching & Archives
  - Lab: Standard I/O Redirection, Grep, Find, Tar & Gzip Compression
- **Topic 05:** Users, Groups, sudo & Permissions
  - Lab: User Management, Sudoers Configuration, Octal Permissions & ACLs
- **Topic 06:** Software, Processes, Services & Logs
  - Lab: APT Package Management, Systemd Unit Control, Process Monitoring & Journald
- **Topic 07:** Shell Scripting
  - Lab: Bash Scripting, Variables, Control Flow, Automated System Health Checks
- **Topic 08:** Networking & SSH
  - Lab: TCP/IP Diagnostics, Netplan Configuration, SSH Key Hardening & SCP

## Future Modules (Awaiting Material)
- Module 02: Git & Version Control [Planned]
- Module 03: Computer Networking [Planned]
- Module 04: Bash & Python Automation [Planned]
- Module 05: Docker & Containerization [Planned]
- Module 06: CI/CD & GitHub Actions [Planned]
- Module 07: Cloud Computing & AWS [Planned]
- Module 08: Infrastructure as Code & Terraform [Planned]
- Module 09: Kubernetes & Orchestration [Planned]
- Module 10: Monitoring & Observability [Planned]
- Module 11: Infrastructure Security & DevSecOps [Planned]
- Module 12: Capstone Engineering Projects [Planned]
`);

// COURSE-SYLLABUS.md
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'COURSE-SYLLABUS.md'), `# DevOps Engineering Bootcamp — Complete Syllabus

## Program Overview
The DevOps Engineering Bootcamp is an intensive, practical learning program designed to develop job-ready capabilities spanning Linux administration, cloud infrastructure, container orchestration, CI/CD automation, and modern Site Reliability Engineering (SRE) principles.

## Verified Module Breakdown

### Module 01: Linux System Admin Fundamentals (Active)
1. **Installing Ubuntu Latest Version:** System requirements, ISO verification, virtualization (VirtualBox/WSL2/UTM), installation procedures.
2. **Meet Linux:** History, UNIX philosophy, kernel vs user space, shell architecture, basic commands (\`uname\`, \`whoami\`, \`hostname\`).
3. **Working with Files, Folders & Text:** Filesystem Hierarchy Standard (FHS), path resolution, directory traversal, file manipulation, \`cat\`, \`less\`, \`head\`, \`tail\`, text editing with Vim and Nano.
4. **Pipes, Searching & Archives:** stdin, stdout, stderr, pipeline chaining, \`grep\` regex matching, \`find\` search criteria, \`tar\`, \`gzip\`, \`bzip2\` archiving.
5. **Users, Groups, sudo & Permissions:** Linux security model, UID/GID, \`/etc/passwd\`, \`/etc/shadow\`, useradd, usermod, sudoers privileges, read/write/execute permissions, \`chmod\`, \`chown\`, umask, SUID/SGID.
6. **Software, Processes, Services & Logs:** Package management with APT, PPA repositories, process states, \`ps\`, \`top\`, \`htop\`, signal handling (\`kill\`), systemd service lifecycle, \`journalctl\`, \`/var/log\`.
7. **Shell Scripting:** Shebang, variables, positional parameters, arithmetic, conditional branching (\`if/elif/else\`), loops (\`for/while\`), functions, exit codes, script debugging (\`set -euo pipefail\`).
8. **Networking & SSH:** Network interfaces, IP addressing, DNS resolution, \`ip\`, \`ping\`, \`traceroute\`, \`curl\`, \`ss\`, OpenSSH server configuration, public key authentication, SSH config, secure file transfer.

---

### Provisional Modules (Curriculum Skeleton — Awaiting Formal Content Delivery)

| Module | Core Domain | Provisional Topics | Status |
| :--- | :--- | :--- | :--- |
| **02** | Git & Version Control | Commit hygiene, branching strategies, interactive rebasing, merge conflict resolution, pull request workflows | Awaiting Material |
| **03** | Computer Networking | OSI 7-layer model, TCP 3-way handshake, subnetting, CIDR, DNS propagation, HTTP/S protocols | Awaiting Material |
| **04** | Bash & Python Automation | Reusable shell libraries, Python system scripting, REST API automation, JSON parsing | Awaiting Material |
| **05** | Docker & Containers | OCI specifications, Dockerfiles, multi-stage builds, container networking, volumes, compose topologies | Awaiting Material |
| **06** | CI/CD & GitHub Actions | Pipeline triggers, runner architecture, matrix testing, automated linting, container registry publishing | Awaiting Material |
| **07** | Cloud Computing & AWS | AWS global infrastructure, IAM policies, EC2, S3 bucket security, VPC architecture, Route53 | Awaiting Material |
| **08** | IaC & Terraform | Declarative HCL, state locking (S3/DynamoDB), reusable modules, input validation, execution plans | Awaiting Material |
| **09** | Kubernetes & Orchestration | Cluster architecture, Pods, Deployments, Services, ConfigMaps, Ingress controllers, Helm packaging | Awaiting Material |
| **10** | Monitoring & Observability | Prometheus metric scraping, PromQL, Grafana visualization, alerting rules, log aggregation | Awaiting Material |
| **11** | Infrastructure Security | System hardening, CIS benchmarks, secret management (Vault), container vulnerability scanning (Trivy) | Awaiting Material |
| **12** | Capstone Projects | Production-grade end-to-end full-stack cloud deployment, zero-downtime releases, monitoring dashboards | Awaiting Material |
`);

// COURSE-ROADMAP.md
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'COURSE-ROADMAP.md'), `# Course Roadmap & Milestones

Visual timeline and milestone dependencies for the DevOps Engineering Bootcamp.

\`\`\`mermaid
flowchart LR
    M1["01: Linux Fundamentals<br/>(In Progress)"] --> M2["02: Git & Version Control<br/>(Pending)"]
    M2 --> M3["03: Networking<br/>(Pending)"]
    M3 --> M4["04: Automation<br/>(Pending)"]
    M4 --> M5["05: Docker<br/>(Pending)"]
    M5 --> M6["06: CI/CD<br/>(Pending)"]
    M6 --> M7["07: AWS Cloud<br/>(Pending)"]
    M7 --> M8["08: Terraform IaC<br/>(Pending)"]
    M8 --> M9["09: Kubernetes<br/>(Pending)"]
    M9 --> M10["10: Observability<br/>(Pending)"]
    M10 --> M11["11: Security & DevSecOps<br/>(Pending)"]
    M11 --> M12["12: Capstone Projects<br/>(Pending)"]
\`\`\`

## Milestone Tracking

- [ ] **Milestone 1: Linux Systems Mastery** (Target: Module 01 Complete)
- [ ] **Milestone 2: Networking & Version Control** (Target: Modules 02-03 Complete)
- [ ] **Milestone 3: Automation & Containers** (Target: Modules 04-05 Complete)
- [ ] **Milestone 4: Continuous Delivery & Cloud** (Target: Modules 06-07 Complete)
- [ ] **Milestone 5: IaC & Kubernetes Orchestration** (Target: Modules 08-09 Complete)
- [ ] **Milestone 6: SRE Observability & Security** (Target: Modules 10-11 Complete)
- [ ] **Milestone 7: Capstone Deployment Defense** (Target: Module 12 Complete)
`);

// PROGRESS.md
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'PROGRESS.md'), `# Overall Bootcamp Progress Tracker

**Engineer:** Emaan Humayun  
**Role:** Software Engineer | DevOps Engineer  
**Status:** Module 01 Under Active Execution  

---

## Course-Level Progress Summary

| Metric | Target | Current | Percentage |
| :--- | :--- | :--- | :--- |
| **Modules Started** | 12 | 1 | 8.3% |
| **Modules Completed** | 12 | 0 | 0.0% |
| **Module 01 Topics Covered** | 8 | 8 Structured | In Progress |
| **Labs Executed** | Dynamic | 0 Verified | Ready for Recording |
| **Assignments Submitted** | Dynamic | 0 Submitted | Ready for Submission |

---

## Module 01: Linux System Admin Fundamentals Status

| Topic Number | Topic Title | Notes | Commands | Labs | Assignments | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | Installing Ubuntu Latest Version | Drafted | Included | Ready | Pending | In Progress |
| **02** | Meet Linux | Drafted | Included | Ready | Pending | In Progress |
| **03** | Working with Files, Folders & Text | Drafted | Included | Ready | Pending | In Progress |
| **04** | Pipes, Searching & Archives | Drafted | Included | Ready | Pending | In Progress |
| **05** | Users, Groups, sudo & Permissions | Drafted | Included | Ready | Pending | In Progress |
| **06** | Software, Processes, Services & Logs | Drafted | Included | Ready | Pending | In Progress |
| **07** | Shell Scripting | Drafted | Included | Ready | Pending | In Progress |
| **08** | Networking & SSH | Drafted | Included | Ready | Pending | In Progress |

*Status key: Not Started | In Progress | Completed | Verified*
`);

// -----------------------------------------------------------------------------
// 2. ROOT README.md
// -----------------------------------------------------------------------------
const rootReadme = `# DevOps Engineering Bootcamp

[![Maintained by: Emaan Humayun](https://img.shields.io/badge/Maintainer-Emaan%20Humayun-1F2937?style=flat-square&logo=github)](https://github.com/EmaanHumayun)
[![Bootcamp Track](https://img.shields.io/badge/Track-DevOps%20Engineering-059669?style=flat-square)](#curriculum-matrix)
[![Status: Active](https://img.shields.io/badge/Status-Module%2001%20In%20Progress-blue?style=flat-square)](#curriculum-matrix)

A comprehensive, long-term technical engineering repository documenting lecture notes, hands-on labs, command executions, terminal outputs, assignment submissions, troubleshooting records, and architectural projects throughout the complete DevOps Bootcamp.

---

## Engineering Overview

**Engineer:** Emaan Humayun  
**Professional Identity:** Software Engineer | DevOps Engineer  
**Learning Philosophy:** First-principles mastery. Operating system internals, networking layers, deterministic automation, container isolation, and declarative infrastructure before high-level abstraction.

This repository serves as a permanent, verifiable audit trail of technical development and engineering capability.

---

## Curriculum Matrix & Navigation

| Module | Focus Area | Topics | Labs | Assignments | Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| [**01: Linux System Admin Fundamentals**](./modules/01-linux-system-admin-fundamentals/) | OS Architecture, CLI, Permissions, Services, Scripting, SSH | 8 | Active | Active | \`In Progress\` |
| **02: Git & Version Control** | Branching, interactive rebasing, merge workflows | TBD | TBD | TBD | \`Awaiting Material\` |
| **03: Computer Networking** | OSI Model, TCP/IP, DNS, Routing, Firewalls | TBD | TBD | TBD | \`Awaiting Material\` |
| **04: Bash & Python Automation** | Shell scripting, Python automation, API consumers | TBD | TBD | TBD | \`Awaiting Material\` |
| **05: Docker & Containerization** | OCI Images, Multi-Stage builds, Compose topologies | TBD | TBD | TBD | \`Awaiting Material\` |
| **06: CI/CD & GitHub Actions** | Pipeline automation, testing gates, artifact publishing | TBD | TBD | TBD | \`Awaiting Material\` |
| **07: Cloud Computing & AWS** | IAM, VPC, EC2, S3, Security Groups, Cloud Networking | TBD | TBD | TBD | \`Awaiting Material\` |
| **08: IaC & Terraform** | Modular HCL, State Locking, Providers, Declarative IaC | TBD | TBD | TBD | \`Awaiting Material\` |
| **09: Kubernetes & Orchestration** | Pods, Deployments, Services, ConfigMaps, Ingress, Helm | TBD | TBD | TBD | \`Awaiting Material\` |
| **10: Monitoring & Observability** | Prometheus Metrics, Grafana, Alerting, Telemetry | TBD | TBD | TBD | \`Awaiting Material\` |
| **11: Infrastructure Security** | Linux hardening, CIS Benchmarks, DevSecOps, Trivy | TBD | TBD | TBD | \`Awaiting Material\` |
| **12: Capstone Projects** | Production End-to-End Cloud Native Architecture | TBD | TBD | TBD | \`Awaiting Material\` |

---

## Repository Architecture

\`\`\`text
devops-engineering-bootcamp/
├── README.md                           # Master repository documentation & navigation
├── COURSE-SYLLABUS.md                  # Comprehensive course curriculum
├── COURSE-ROADMAP.md                   # Visual milestone dependencies
├── COURSE-INDEX.md                     # Complete topic & lab index
├── PROGRESS.md                         # Real-time course progress tracking
├── CHANGELOG.md                        # Log of updates and milestone completions
├── modules/
│   └── 01-linux-system-admin-fundamentals/
│       ├── 01-installing-ubuntu-latest-version/
│       ├── 02-meet-linux/
│       ├── 03-working-with-files-folders-text/
│       ├── 04-pipes-searching-archives/
│       ├── 05-users-groups-sudo-permissions/
│       ├── 06-software-processes-services-logs/
│       ├── 07-shell-scripting/
│       └── 08-networking-ssh/
├── progress/                           # Learning logs & weekly progress audits
├── resources/                          # Reference guides, cheat sheets, official docs
├── templates/                          # Standardized templates for labs and notes
└── assets/                             # Architecture diagrams and verified screenshots
\`\`\`

---

## Technical Standards & Verification Policy

1. **Authenticity:** Only actual commands executed in terminal environments are recorded. No fabricated outputs.
2. **Security:** Sensitive credentials, private IPs, SSH private keys, and API tokens are strictly excluded via \`.gitignore\`.
3. **Reproducibility:** Every lab includes step-by-step reproduction instructions and prerequisites.
4. **Documentation Quality:** Pure Markdown formatting, structured tables, and code syntax highlighting.

---

## Daily Git Workflow

To preserve engineering momentum and document practical work daily:

\`\`\`bash
# 1. Check local status
git status

# 2. Stage specific lab or notes
git add modules/01-linux-system-admin-fundamentals/03-working-with-files-folders-text/

# 3. Commit with conventional commit specification
git commit -m "docs(linux): complete text processing and file navigation notes"

# 4. Push safely to remote main branch
git push origin main
\`\`\`

---

## Professional Coordinates

- **Engineer:** Emaan Humayun
- **Specialization:** Software Engineer | DevOps Engineer
- **GitHub:** [@EmaanHumayun](https://github.com/EmaanHumayun)
- **Central Hub:** [Engineering Portfolio](https://github.com/EmaanHumayun/engineering-portfolio)
`;

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'README.md'), rootReadme);

// -----------------------------------------------------------------------------
// 3. TEMPLATES
// -----------------------------------------------------------------------------
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'templates', 'topic-template.md'), `# Topic Title

**Module:** [Module Name]  
**Topic Number:** [Number]  
**Status:** [Not Started / In Progress / Completed]  

---

## Learning Objectives
- [Objective 1]
- [Objective 2]

## Key Concepts
[Detailed technical explanations with clear terminology]

## Core Commands Reference
\`\`\`bash
# Command description
command [options] [arguments]
\`\`\`

## Practical Labs Under This Topic
- [Lab 01 Name](./labs/lab-001/)

## Assignments Under This Topic
- [Assignment 01 Name](./assignments/assignment-001/)

## Common Errors & Troubleshooting
| Error / Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| [Issue Description] | [Why it happens] | [How to resolve] |

## Learning Reflection
[Technical takeaways, insights, and edge cases discovered]
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'templates', 'lab-template.md'), `# Lab: [Lab Name]

**Module:** [Module Name]  
**Topic:** [Topic Name]  
**Lab ID:** lab-[000]  
**Date Executed:** [YYYY-MM-DD]  
**Status:** [Not Started / In Progress / Completed]  

---

## 1. Objectives
- [Specific technical objective]

## 2. Environment & Prerequisites
- OS: Ubuntu 24.04 LTS / Debian / WSL2
- Privileges: Non-root user with sudo access
- Required Packages: [e.g. curl, net-tools, vim]

## 3. Step-by-Step Instructions & Execution
### Step 1: [Step Title]
Command:
\`\`\`bash
[command]
\`\`\`

Expected Output:
\`\`\`text
[expected]
\`\`\`

Actual Terminal Output:
\`\`\`text
[actual output pasted directly from terminal]
\`\`\`

## 4. Errors & Troubleshooting
[Document any permission denied, syntax errors, or dependency blocks encountered and how they were resolved]

## 5. Verification & Results
- [ ] Task completed successfully
- [ ] Evidence recorded in screenshots or log outputs

## 6. Key Takeaways
[Lessons learned regarding flags, exit codes, or behavior]
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'templates', 'assignment-template.md'), `# Assignment: [Assignment Name]

**Module:** [Module Name]  
**Assignment ID:** assignment-[000]  
**Due Date:** [YYYY-MM-DD]  
**Submission Date:** [YYYY-MM-DD]  
**Status:** [Not Started / In Progress / Submitted / Evaluated]  

---

## 1. Requirements & Problem Statement
[Detailed assignment requirements from course instructor]

## 2. Solution Architecture & Design
[Technical approach, script logic, or configuration design]

## 3. Implementation Code & Commands
\`\`\`bash
[commands or script contents]
\`\`\`

## 4. Execution Evidence & Actual Outputs
\`\`\`text
[paste raw terminal output]
\`\`\`

## 5. Self-Evaluation Checklist
- [ ] All mandatory requirements addressed
- [ ] Script tested on clean environment
- [ ] Edge cases handled (invalid input, non-existent files)
- [ ] Idempotency verified where applicable

## 6. Post-Submission Feedback
[Instructor feedback and optimization suggestions]
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'templates', 'troubleshooting-template.md'), `# Troubleshooting Incident Record

**Incident Date:** [YYYY-MM-DD]  
**Context:** [Lab / Assignment / Service Startup]  
**Component:** [systemd / network / permissions / package]  

---

## Problem Description
[Describe the exact symptom observed]

## Error Message / Log Excerpt
\`\`\`text
[paste exact error message from terminal or journalctl]
\`\`\`

## Diagnostic Commands Run
\`\`\`bash
# Commands used to investigate
systemctl status [service]
journalctl -xeu [service]
\`\`\`

## Root Cause Analysis (RCA)
[Explain technically why the failure occurred]

## Corrective Action & Solution
\`\`\`bash
# Commands that fixed the issue
\`\`\`

## Prevention Strategy
[How to prevent this configuration error in future deployments]
`);

// -----------------------------------------------------------------------------
// 4. PROGRESS TRACKING FILES
// -----------------------------------------------------------------------------
fs.writeFileSync(path.join(BOOTCAMP_DIR, 'progress', 'learning-log.md'), `# Daily Learning Log

Documenting daily engineering activities, concepts mastered, and labs executed.

## Log Format
### [YYYY-MM-DD] — [Topic / Milestone]
- **Time Invested:** [X hours]
- **Topics Studied:** [List]
- **Labs Executed:** [Links to lab READMEs]
- **Challenges Encountered:** [Summary]
- **Key Takeaways:** [Summary]

---

### 2026-11-02 — DevOps Bootcamp Repository Architecture Initialized
- **Time Invested:** 3 hours
- **Topics Studied:** Course syllabus structuring, Linux System Administration curriculum breakdown.
- **Labs Executed:** Module 01 directory scaffolding and standardized Markdown templates.
- **Key Takeaways:** Clean, modular repository design allows progressive documentation as course lectures advance without fabricating unverified work.
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'progress', 'weekly-progress.md'), `# Weekly Progress Reviews

Structured weekly reflections on curriculum velocity, practical lab completions, and engineering hurdles.

## Week 01: Linux Foundations
- **Focus:** Ubuntu environment setup, core CLI commands, file manipulation, pipes, searching.
- **Status:** In Progress.
- **Planned Deliverables:** Complete Labs 01-04 under Module 01.
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'progress', 'module-progress.md'), `# Module-Level Progress Matrix

| Module Number | Title | Topics Total | Topics Done | Labs Total | Labs Done | Status |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **01** | Linux System Admin Fundamentals | 8 | 0 | 8 Planned | 0 | In Progress |
| **02** | Git & Version Control | TBD | 0 | TBD | 0 | Awaiting Material |
| **03** | Computer Networking | TBD | 0 | TBD | 0 | Awaiting Material |
| **04** | Bash & Python Automation | TBD | 0 | TBD | 0 | Awaiting Material |
| **05** | Docker & Containerization | TBD | 0 | TBD | 0 | Awaiting Material |
| **06** | CI/CD & GitHub Actions | TBD | 0 | TBD | 0 | Awaiting Material |
| **07** | Cloud Computing & AWS | TBD | 0 | TBD | 0 | Awaiting Material |
| **08** | IaC & Terraform | TBD | 0 | TBD | 0 | Awaiting Material |
| **09** | Kubernetes & Orchestration | TBD | 0 | TBD | 0 | Awaiting Material |
| **10** | Monitoring & Observability | TBD | 0 | TBD | 0 | Awaiting Material |
| **11** | Infrastructure Security | TBD | 0 | TBD | 0 | Awaiting Material |
| **12** | Capstone Projects | TBD | 0 | TBD | 0 | Awaiting Material |
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'progress', 'skills-progress.md'), `# Technical Skills Competency Matrix

| Skill Area | Technology / Tool | Current Proficiency | Verified in Lab |
| :--- | :--- | :--- | :--- |
| **Operating Systems** | Ubuntu Linux / Debian | Intermediate | Active (Module 01) |
| **Shell & Scripting** | Bash / Shell CLI | Intermediate | Active (Module 01) |
| **Version Control** | Git / GitHub | Intermediate | Verified in Portfolio |
| **Containers** | Docker / Compose | Working Knowledge | Lab Pending (Module 05) |
| **Orchestration** | Kubernetes | Developing | Lab Pending (Module 09) |
| **IaC** | Terraform / OpenTofu | Developing | Lab Pending (Module 08) |
| **CI/CD** | GitHub Actions | Working Knowledge | Lab Pending (Module 06) |
| **Observability** | Prometheus / Grafana | Developing | Lab Pending (Module 10) |
`);

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'progress', 'achievements.md'), `# Engineering Milestones & Achievements

Track verified course milestones, exam results, certificate verifications, and project approvals.

- [x] **Repository Ecosystem Architecture Completed:** Full 12-module bootcamp blueprint established with zero emojis and clean engineering typography.
`);

// -----------------------------------------------------------------------------
// 5. MODULE 01: ALL 8 TOPICS
// -----------------------------------------------------------------------------
const TOPICS = [
  {
    dir: '01-installing-ubuntu-latest-version',
    title: 'Installing Ubuntu Latest Version',
    summary: 'System requirements, ISO download, live USB creation, virtualization via VirtualBox/WSL2/UTM, disk partitioning, and initial post-install configuration.',
    objectives: [
      'Understand hardware requirements and release cadence (LTS vs Interim)',
      'Deploy Ubuntu in a virtualized development environment (VirtualBox/WSL2)',
      'Configure initial network connectivity, timezone, and mirror repositories'
    ],
    commands: [
      { cmd: 'lsb_release -a', desc: 'Verify installed Ubuntu version and release codename' },
      { cmd: 'uname -r', desc: 'Display active Linux kernel version' },
      { cmd: 'sudo apt update && sudo apt upgrade -y', desc: 'Synchronize package indexes and apply latest security patches' }
    ]
  },
  {
    dir: '02-meet-linux',
    title: 'Meet Linux',
    summary: 'Linux history, open-source licensing, kernel vs user space architecture, the UNIX philosophy, and core command line interface principles.',
    objectives: [
      'Explain the relationship between the Linux kernel, system libraries, and the shell',
      'Understand the UNIX philosophy: small programs doing one thing well',
      'Navigate the CLI efficiently using command history, tab completion, and built-in help'
    ],
    commands: [
      { cmd: 'whoami', desc: 'Print effective user ID' },
      { cmd: 'hostname -I', desc: 'Display host IP addresses' },
      { cmd: 'uptime', desc: 'Show system uptime and load average across 1, 5, and 15 minutes' },
      { cmd: 'man [command] / [command] --help', desc: 'Access authoritative reference manuals and synopsis' }
    ]
  },
  {
    dir: '03-working-with-files-folders-text',
    title: 'Working with Files, Folders & Text',
    summary: 'Filesystem Hierarchy Standard (FHS), absolute vs relative paths, file and directory CRUD operations, file inspection, and text editing with Vim and Nano.',
    objectives: [
      'Navigate the FHS (/etc, /var, /home, /usr, /bin, /opt)',
      'Perform file operations safely (mkdir, cp, mv, rm, touch)',
      'Inspect and manipulate text streams using cat, less, head, tail, and wc',
      'Edit system configuration files comfortably in terminal editors'
    ],
    commands: [
      { cmd: 'pwd', desc: 'Print working directory' },
      { cmd: 'ls -lah', desc: 'List all files including hidden with human-readable sizes and permissions' },
      { cmd: 'mkdir -p /path/to/nested/dir', desc: 'Create nested directory hierarchy safely' },
      { cmd: 'head -n 20 file.txt', desc: 'View first 20 lines of a file' },
      { cmd: 'tail -f /var/log/syslog', desc: 'Follow live log stream output in real-time' }
    ]
  },
  {
    dir: '04-pipes-searching-archives',
    title: 'Pipes, Searching & Archives',
    summary: 'Standard streams (stdin, stdout, stderr), pipe operators, regex search with grep, file search with find, and archive compression with tar, gzip, and bzip2.',
    objectives: [
      'Master stream redirection (>, >>, 2>, 2>&1) and pipeline chaining (|)',
      'Filter output streams with grep, cut, sort, and uniq',
      'Locate files dynamically across the filesystem based on size, mtime, and type using find',
      'Create and extract compressed archive tarballs (.tar.gz, .tar.bz2)'
    ],
    commands: [
      { cmd: 'grep -E "ERROR|CRITICAL" /var/log/syslog', desc: 'Search for error patterns using extended regular expressions' },
      { cmd: 'find /var -type f -size +100M', desc: 'Locate files exceeding 100MB in size' },
      { cmd: 'tar -czvf archive.tar.gz /path/to/directory', desc: 'Create gzip-compressed tar archive' },
      { cmd: 'tar -xzvf archive.tar.gz -C /destination', desc: 'Extract gzip archive to target directory' }
    ]
  },
  {
    dir: '05-users-groups-sudo-permissions',
    title: 'Users, Groups, sudo & Permissions',
    summary: 'Linux multi-user security model, user and group creation, /etc/passwd and /etc/shadow, sudoers privilege delegation, octal/symbolic permissions, and sticky bits.',
    objectives: [
      'Create and manage user accounts (useradd, usermod, userdel) and groups',
      'Configure sudo privileges safely using visudo and /etc/sudoers.d/',
      'Master standard UNIX permissions (rwx) in both symbolic and octal (755, 644, 700)',
      'Apply advanced file attributes: SUID, SGID, and the Sticky Bit'
    ],
    commands: [
      { cmd: 'sudo useradd -m -s /bin/bash devops_user', desc: 'Create new user with home directory and default bash shell' },
      { cmd: 'sudo usermod -aG sudo devops_user', desc: 'Append user to the administrative sudo group' },
      { cmd: 'chmod 750 /path/to/script.sh', desc: 'Set rwxr-x--- permissions' },
      { cmd: 'chown -R user:group /opt/app', desc: 'Recursively change file ownership' }
    ]
  },
  {
    dir: '06-software-processes-services-logs',
    title: 'Software, Processes, Services & Logs',
    summary: 'APT package management, process life cycles and signals, interactive process monitoring (top/htop), systemd unit service management, and journald log analysis.',
    objectives: [
      'Manage packages and repositories safely (apt, dpkg, ppa)',
      'Inspect running processes, background jobs, and signals (SIGTERM, SIGKILL)',
      'Manage systemd services: start, stop, restart, enable, disable, and status',
      'Query system logs using journalctl with time and unit filtering'
    ],
    commands: [
      { cmd: 'ps aux | grep [process_name]', desc: 'Inspect process table with full command arguments' },
      { cmd: 'sudo systemctl status [service_name]', desc: 'Check service health, PID, and recent log outputs' },
      { cmd: 'sudo systemctl enable --now [service_name]', desc: 'Enable service on system boot and start immediately' },
      { cmd: 'journalctl -u [service_name] -n 50 --no-pager', desc: 'View the last 50 log entries for a specific service' }
    ]
  },
  {
    dir: '07-shell-scripting',
    title: 'Shell Scripting',
    summary: 'Bash automation from first principles: script shebangs, variables, arguments, conditionals, iteration loops, functions, exit codes, and defensive error handling.',
    objectives: [
      'Write structured, readable, and defensive Bash scripts using set -euo pipefail',
      'Handle user arguments and positional parameters ($1, $#, $@)',
      'Implement conditional branching (if/then/else, case) and loops (for, while)',
      'Create reusable automated operations: system health audits, log rotation, and backups'
    ],
    commands: [
      { cmd: '#!/usr/bin/env bash', desc: 'Portable bash shebang declaration' },
      { cmd: 'set -euo pipefail', desc: 'Fail fast on errors, undefined variables, and pipe failures' },
      { cmd: 'chmod +x script.sh && ./script.sh', desc: 'Make script executable and execute in current shell' }
    ]
  },
  {
    dir: '08-networking-ssh',
    title: 'Networking & SSH',
    summary: 'Computer networking fundamentals on Linux: network interfaces, Netplan, IP addressing, DNS troubleshooting, socket inspection, and OpenSSH server hardening.',
    objectives: [
      'Inspect and configure network interfaces and routing tables (ip a, ip r)',
      'Troubleshoot connectivity using ping, traceroute, dig, curl, and ss',
      'Configure OpenSSH server: disable password auth, disable root login, change port',
      'Generate ED25519/RSA SSH key pairs and manage ~/.ssh/authorized_keys and config files'
    ],
    commands: [
      { cmd: 'ip addr show', desc: 'List active network interfaces and assigned IP addresses' },
      { cmd: 'ss -tulpn', desc: 'Display listening TCP/UDP sockets with process identification' },
      { cmd: 'ssh-keygen -t ed25519 -C "emaan@devops"', desc: 'Generate secure ED25519 SSH keypair' },
      { cmd: 'ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host', desc: 'Copy public key to remote host authorized_keys safely' }
    ]
  }
];

// Module 01 README
const mod01Readme = `# Module 01: Linux System Admin Fundamentals

**Track:** DevOps Engineering Bootcamp  
**Module ID:** 01-linux-system-admin-fundamentals  
**Status:** In Progress  

---

## Module Overview
Linux is the foundational operating system powering over 90% of cloud infrastructure, Kubernetes clusters, and containerized microservices. This module builds comprehensive system administration capability from basic CLI navigation through permission models, service orchestration with systemd, automated shell scripting, and secure network administration.

---

## Topics Index

| Topic # | Directory | Core Focus | Status |
| :---: | :--- | :--- | :--- |
| **01** | [**01-installing-ubuntu-latest-version**](./01-installing-ubuntu-latest-version/) | Installation, ISO, Virtualization, Initial Setup | \`In Progress\` |
| **02** | [**02-meet-linux**](./02-meet-linux/) | Kernel vs Userspace, UNIX Philosophy, CLI Navigation | \`In Progress\` |
| **03** | [**03-working-with-files-folders-text**](./03-working-with-files-folders-text/) | FHS, Pathing, CRUD Operations, Vim/Nano | \`In Progress\` |
| **04** | [**04-pipes-searching-archives**](./04-pipes-searching-archives/) | Standard I/O, Grep, Find, Tar & Gzip Compression | \`In Progress\` |
| **05** | [**05-users-groups-sudo-permissions**](./05-users-groups-sudo-permissions/) | Security Model, Sudoers, Octal Permissions, SUID | \`In Progress\` |
| **06** | [**06-software-processes-services-logs**](./06-software-processes-services-logs/) | APT, Systemd Units, Process States, Journalctl | \`In Progress\` |
| **07** | [**07-shell-scripting**](./07-shell-scripting/) | Bash Automation, Control Flow, Error Handling | \`In Progress\` |
| **08** | [**08-networking-ssh**](./08-networking-ssh/) | TCP/IP, Netplan, OpenSSH Hardening, Sockets | \`In Progress\` |

---

## Topic Folder Standard

Every topic directory is organized as:

\`\`\`text
[topic-name]/
├── README.md                 # Topic overview, objectives & command reference
├── lectures/                 # Lecture summaries and slide notes
├── notes/                    # In-depth technical Markdown notes
├── pdfs/                     # Reference documents & authorized resources
├── labs/                     # Hands-on lab execution records and actual outputs
├── assignments/              # Assignment submissions and problem solutions
├── commands/                 # Tested command lists and one-liners
├── scripts/                  # Executable, reusable shell scripts (.sh)
├── outputs/                  # Raw terminal logs and execution outputs (.txt, .log)
├── screenshots/              # Evidence screenshots (sanitized)
├── reports/                  # Detailed lab completion writeups
└── troubleshooting/          # Incident logs, errors encountered, and resolutions
\`\`\`
`;

fs.writeFileSync(path.join(BOOTCAMP_DIR, 'modules', '01-linux-system-admin-fundamentals', 'README.md'), mod01Readme);

// Build each topic folder
TOPICS.forEach((topic, idx) => {
  const topicPath = path.join(BOOTCAMP_DIR, 'modules', '01-linux-system-admin-fundamentals', topic.dir);
  ensureDir(topicPath);
  ensureDir(path.join(topicPath, 'lectures'));
  ensureDir(path.join(topicPath, 'notes'));
  ensureDir(path.join(topicPath, 'pdfs'));
  ensureDir(path.join(topicPath, 'labs'));
  ensureDir(path.join(topicPath, 'assignments'));
  ensureDir(path.join(topicPath, 'commands'));
  ensureDir(path.join(topicPath, 'scripts'));
  ensureDir(path.join(topicPath, 'outputs'));
  ensureDir(path.join(topicPath, 'screenshots'));
  ensureDir(path.join(topicPath, 'reports'));
  ensureDir(path.join(topicPath, 'troubleshooting'));

  // Topic README
  const topicReadme = `# Topic ${String(idx + 1).padStart(2, '0')}: ${topic.title}

**Module:** 01-linux-system-admin-fundamentals  
**Topic Sequence:** ${idx + 1} of 8  
**Status:** In Progress  

---

## 1. Overview & Scope
${topic.summary}

---

## 2. Learning Objectives
${topic.objectives.map(o => `- ${o}`).join('\n')}

---

## 3. Core Commands Reference

| Command | Operational Purpose |
| :--- | :--- |
${topic.commands.map(c => `| \`${c.cmd}\` | ${c.desc} |`).join('\n')}

---

## 4. Subdirectory Structure

- \`lectures/\`: Lecture notes and structured summaries.
- \`notes/\`: Comprehensive technical notes and concept deep dives.
- \`labs/\`: Hands-on lab procedures, step-by-step commands, and actual outputs.
- \`assignments/\`: Problem statements, submitted solutions, and evidence.
- \`commands/\`: Reusable command references and tested one-liners.
- \`scripts/\`: Validated, executable shell automation scripts.
- \`outputs/\`: Actual terminal output logs captured during practice.
- \`screenshots/\`: Visual evidence of completed configurations and tools.
- \`reports/\`: Formal technical reports summarizing lab outcomes.
- \`troubleshooting/\`: Incident logs, root cause analysis, and error resolutions.

---

## 5. Progress & Completion Checklist

- [x] Topic structure established and documented
- [ ] Lecture materials reviewed and notes synthesized
- [ ] Core commands executed and verified in terminal environment
- [ ] Practical lab executed with actual outputs recorded
- [ ] Topic assignment completed and submitted
- [ ] Troubleshooting incidents documented (if encountered)
`;
  fs.writeFileSync(path.join(topicPath, 'README.md'), topicReadme);

  // Initial starter notes
  fs.writeFileSync(path.join(topicPath, 'notes', 'concept-summary.md'), `# ${topic.title} — Technical Notes

## Fundamental Concepts
${topic.summary}

## Command Syntax & Parameters
\`\`\`bash
${topic.commands.map(c => `# ${c.desc}\n${c.cmd}\n`).join('\n')}
\`\`\`

## Practical Observations
- Commands must always be tested in non-production development environments.
- Verify exit codes using \`echo $?\` immediately after execution.
`);

  // Initial command reference
  fs.writeFileSync(path.join(topicPath, 'commands', 'quick-reference.sh'), `#!/usr/bin/env bash
# Command reference for: ${topic.title}
# Generated for reproducible practice in local terminal

${topic.commands.map(c => `# ${c.desc}\n${c.cmd}`).join('\n\n')}
`);
});

// Initialize git repository
try {
  execSync('git init -b main', { cwd: BOOTCAMP_DIR });
  execSync('git config user.name "EmaanHumayun"', { cwd: BOOTCAMP_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: BOOTCAMP_DIR });
  execSync('git add .', { cwd: BOOTCAMP_DIR });
  execSync('git commit -m "feat: initialize devops-engineering-bootcamp repository with module 01 linux fundamentals"', { cwd: BOOTCAMP_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized devops-engineering-bootcamp locally!');
} catch (e) {
  console.error('Git notice:', e.message);
}

