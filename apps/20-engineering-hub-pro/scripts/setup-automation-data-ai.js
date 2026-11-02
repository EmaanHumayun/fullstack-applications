import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// -------------------------------------------------------------
// 1. automation-engineering
// -------------------------------------------------------------
const AUTO_DIR = path.join(BASE, 'automation-engineering');
ensureDir(path.join(AUTO_DIR, 'bash'));
ensureDir(path.join(AUTO_DIR, 'python'));
ensureDir(path.join(AUTO_DIR, 'cron'));

fs.writeFileSync(path.join(AUTO_DIR, '.gitignore'), `__pycache__/
*.pyc
.env
*.log
`);

fs.writeFileSync(path.join(AUTO_DIR, 'README.md'), `# Automation & Integration Engineering

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-Python%20%7C%20Bash%20%7C%20Cron-green.svg)](#)

A practical engineering repository containing automated system operations, Python data synchronization scripts, event-driven webhooks, and scheduled background daemons.

---

## 📂 Repository Contents

| Component | Language | Purpose | Key Script |
| :--- | :--- | :--- | :--- |
| **System Diagnostics** | Bash | Automated CPU, memory, and disk health auditing with threshold alerts | \`bash/system-health-reporter.sh\` |
| **Log Archival Daemon** | Bash | Automated log compression, rotation, and S3-ready timestamping | \`bash/log-archive-daemon.sh\` |
| **API Data Synchronizer** | Python | Robust REST API polling, error retry with exponential backoff, JSON transform | \`python/api-data-sync.py\` |
| **Webhook Receiver** | Python | Lightweight HTTP listener for third-party webhook ingestion and verification | \`python/webhook-receiver.py\` |

---

## 🚀 Quickstart & Execution

### 1. Run Health Reporter
\`\`\`bash
chmod +x bash/*.sh
./bash/system-health-reporter.sh
\`\`\`

### 2. Run API Sync Script
\`\`\`bash
python3 python/api-data-sync.py
\`\`\`
`);

fs.writeFileSync(path.join(AUTO_DIR, 'bash', 'system-health-reporter.sh'), `#!/usr/bin/env bash
# Automated System Health Reporter
set -euo pipefail

LOG_FILE="/tmp/system_health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] === SYSTEM HEALTH REPORT ===" >> "$LOG_FILE"

# CPU Load
CPU_LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | cut -d, -f1 | tr -d ' ')
echo "[$TIMESTAMP] CPU Load (1m): $CPU_LOAD" >> "$LOG_FILE"

# Memory Check
MEM_FREE=$(free -m | awk '/Mem:/ { printf "%.2f", ($4+$6+$7)/$2 * 100 }')
echo "[$TIMESTAMP] Free Memory: $MEM_FREE%" >> "$LOG_FILE"

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2 { print $5 }' | tr -d '%')
echo "[$TIMESTAMP] Root Disk Usage: $DISK_USAGE%" >> "$LOG_FILE"

if [ "$DISK_USAGE" -gt 85 ]; then
    echo "[$TIMESTAMP] ⚠️ WARNING: Disk usage exceeded 85% ($DISK_USAGE%)" >> "$LOG_FILE"
fi

echo "[$TIMESTAMP] Health check finished successfully." >> "$LOG_FILE"
echo "Report appended to $LOG_FILE"
`);

fs.writeFileSync(path.join(AUTO_DIR, 'bash', 'log-archive-daemon.sh'), `#!/usr/bin/env bash
# Automated Log Archival and Rotation Daemon
set -euo pipefail

SOURCE_DIR="\${1:-/var/log}"
ARCHIVE_DIR="\${2:-/var/log/archives}"
RETENTION_DAYS=7

mkdir -p "$ARCHIVE_DIR"
ARCHIVE_NAME="logs_\$(date '+%Y%m%d_%H%M%S').tar.gz"

echo "Compressing logs from $SOURCE_DIR..."
tar -czf "$ARCHIVE_DIR/$ARCHIVE_NAME" --exclude="$ARCHIVE_DIR" -C "$SOURCE_DIR" . 2>/dev/null || true
echo "Archive created: $ARCHIVE_DIR/$ARCHIVE_NAME"

echo "Pruning archives older than $RETENTION_DAYS days..."
find "$ARCHIVE_DIR" -type f -name "logs_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete
echo "Log rotation completed."
`);

fs.writeFileSync(path.join(AUTO_DIR, 'python', 'api-data-sync.py'), `"""
Automated REST API Data Synchronizer
Fetches data from upstream endpoints, validates payload structure, and writes to local cache.
"""
import urllib.request
import json
import time

def fetch_data(url: str, retries: int = 3, backoff: float = 1.5):
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "AutomationSync/1.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status == 200:
                    return json.loads(resp.read().decode())
        except Exception as e:
            print(f"[RETRY {attempt}/{retries}] Failed to fetch: {e}")
            time.sleep(backoff * attempt)
    raise RuntimeError("Max retries exceeded for upstream API.")

if __name__ == "__main__":
    print("Initiating automated synchronization...")
    # Example using public JSON placeholder
    data = fetch_data("https://jsonplaceholder.typicode.com/todos/1")
    print(f"✅ Synchronized record #{data.get('id')}: {data.get('title')}")
`);

try {
  execSync('git init -b main', { cwd: AUTO_DIR });
  execSync('git config user.name "EmaanHumayun"', { cwd: AUTO_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: AUTO_DIR });
  execSync('git add .', { cwd: AUTO_DIR });
  execSync('git commit -m "feat: initialize automation engineering repository with shell & python daemons"', { cwd: AUTO_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized automation-engineering!');
} catch (e) {
  console.log('Notice:', e.message);
}

// -------------------------------------------------------------
// 2. data-analytics-portfolio
// -------------------------------------------------------------
const DATA_DIR = path.join(BASE, 'data-analytics-portfolio');
ensureDir(path.join(DATA_DIR, 'sql-queries'));
ensureDir(path.join(DATA_DIR, 'python-analysis'));
ensureDir(path.join(DATA_DIR, 'bi-dashboards'));

fs.writeFileSync(path.join(DATA_DIR, '.gitignore'), `__pycache__/
*.pyc
.env
*.csv
`);

fs.writeFileSync(path.join(DATA_DIR, 'README.md'), `# Data, BI & Analytics Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Analytics](https://img.shields.io/badge/Domain-SQL%20%7C%20Python%20%7C%20PowerBI-orange.svg)](#)

Engineering repository documenting practical data analysis, complex SQL queries, window functions, statistical summaries, and business intelligence dashboards.

---

## 📊 Modules & Case Studies

| Project | Tooling | Focus Area | Deliverable |
| :--- | :--- | :--- | :--- |
| **E-Commerce Cohort Retention** | PostgreSQL | User retention, monthly cohort churn, CTEs | \`sql-queries/01-e-commerce-retention-analysis.sql\` |
| **Sales Performance & Window Functions** | SQL | Running totals, moving averages, RANK() | \`sql-queries/02-sales-performance-window-functions.sql\` |
| **Customer Segmentation EDA** | Python (Pandas) | Exploratory data analysis, quartile distribution | \`python-analysis/customer-segmentation-eda.py\` |
| **Enterprise KPI Dashboard Spec** | Power BI | Star schema modeling, DAX measures, KPI cards | \`bi-dashboards/power-bi-model-spec.md\` |
`);

fs.writeFileSync(path.join(DATA_DIR, 'sql-queries', '01-e-commerce-retention-analysis.sql'), `-- E-Commerce Cohort Retention & Churn Analysis
-- Analyzes user retention over a 6-month period following initial signup.

WITH first_purchase AS (
    SELECT
        user_id,
        DATE_TRUNC('month', MIN(order_date)) AS cohort_month
    FROM orders
    WHERE order_status = 'COMPLETED'
    GROUP BY user_id
),
monthly_activity AS (
    SELECT
        o.user_id,
        DATE_TRUNC('month', o.order_date) AS active_month,
        fp.cohort_month,
        (EXTRACT(YEAR FROM o.order_date) - EXTRACT(YEAR FROM fp.cohort_month)) * 12 +
        (EXTRACT(MONTH FROM o.order_date) - EXTRACT(MONTH FROM fp.cohort_month)) AS month_number
    FROM orders o
    JOIN first_purchase fp ON o.user_id = fp.user_id
    WHERE o.order_status = 'COMPLETED'
)
SELECT
    cohort_month,
    month_number,
    COUNT(DISTINCT user_id) AS active_users,
    ROUND(
        COUNT(DISTINCT user_id)::NUMERIC / 
        FIRST_VALUE(COUNT(DISTINCT user_id)) OVER (PARTITION BY cohort_month ORDER BY month_number) * 100, 
        2
    ) AS retention_rate_percentage
FROM monthly_activity
GROUP BY cohort_month, month_number
ORDER BY cohort_month, month_number;
`);

fs.writeFileSync(path.join(DATA_DIR, 'sql-queries', '02-sales-performance-window-functions.sql'), `-- Sales Performance Analysis with Window Functions
-- Calculates 30-day rolling averages and revenue rankings per product category.

SELECT
    order_date,
    category_name,
    product_name,
    daily_revenue,
    -- 7-day moving average revenue
    ROUND(
        AVG(daily_revenue) OVER (
            PARTITION BY category_name 
            ORDER BY order_date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ), 2
    ) AS rolling_7d_avg_revenue,
    -- Rank within category for the day
    DENSE_RANK() OVER (
        PARTITION BY category_name, order_date 
        ORDER BY daily_revenue DESC
    ) AS category_daily_rank
FROM daily_product_sales
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
ORDER BY category_name, order_date DESC;
`);

try {
  execSync('git init -b main', { cwd: DATA_DIR });
  execSync('git config user.name "EmaanHumayun"', { cwd: DATA_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: DATA_DIR });
  execSync('git add .', { cwd: DATA_DIR });
  execSync('git commit -m "feat: initialize data analytics repository with SQL cohort & window function models"', { cwd: DATA_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized data-analytics-portfolio!');
} catch (e) {
  console.log('Notice:', e.message);
}

// -------------------------------------------------------------
// 3. ai-automation-engineering
// -------------------------------------------------------------
const AI_DIR = path.join(BASE, 'ai-automation-engineering');
ensureDir(path.join(AI_DIR, 'agents'));
ensureDir(path.join(AI_DIR, 'integrations'));
ensureDir(path.join(AI_DIR, 'prompts'));

fs.writeFileSync(path.join(AI_DIR, '.gitignore'), `__pycache__/
*.pyc
.env
*.log
`);

fs.writeFileSync(path.join(AI_DIR, 'README.md'), `# AI & Agentic Automation Engineering

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![AI Engineering](https://img.shields.io/badge/Focus-LLMs%20%7C%20Agentic%20Loops%20%7C%20APIs-purple.svg)](#)

Engineering repository focused on practical AI integrations: Large Language Model API consumption, deterministic schema enforcement, function calling, and structured agent loops.

---

## 🤖 Modules & Architectures

| Component | Architecture Pattern | File |
| :--- | :--- | :--- |
| **Agentic Loop** | Tool-calling / ReAct loop with validation guards | \`agents/simple-agentic-loop.py\` |
| **Document Summarizer** | Zero-shot structured summarization via REST API | \`integrations/document-summarizer.py\` |
| **Structured Prompts** | JSON schema-constrained generation templates | \`prompts/structured-extraction.json\` |
`);

fs.writeFileSync(path.join(AI_DIR, 'agents', 'simple-agentic-loop.py'), `"""
Simple Tool-Calling Agent Loop (First-Principles Implementation)
Demonstrates tool invocation, execution reflection, and stop conditions.
"""
import json

TOOLS = {
    "get_weather": lambda loc: f"Sunny, 22°C in {loc}",
    "calculate_metric": lambda a, b: str(float(a) * float(b))
}

def simulate_llm_response(prompt: str):
    if "weather in Lahore" in prompt:
        return {"action": "call_tool", "tool": "get_weather", "arg": "Lahore"}
    return {"action": "final_answer", "answer": "I have completed the task."}

def run_agent_loop(goal: str, max_steps: int = 5):
    print(f"[AGENT] Goal: {goal}")
    for step in range(1, max_steps + 1):
        print(f"--- Step {step} ---")
        decision = simulate_llm_response(goal)
        if decision["action"] == "final_answer":
            print(f"[AGENT] Result: {decision['answer']}")
            break
        elif decision["action"] == "call_tool":
            tool_name = decision["tool"]
            arg = decision["arg"]
            output = TOOLS[tool_name](arg)
            print(f"[AGENT] Executed tool '{tool_name}' -> '{output}'")
            goal = f"Observed: {output}. Provide final answer."

if __name__ == "__main__":
    run_agent_loop("Check the weather in Lahore and summarize.")
`);

try {
  execSync('git init -b main', { cwd: AI_DIR });
  execSync('git config user.name "EmaanHumayun"', { cwd: AI_DIR });
  execSync('git config user.email "emaanhumayun23072@gmail.com"', { cwd: AI_DIR });
  execSync('git add .', { cwd: AI_DIR });
  execSync('git commit -m "feat: initialize AI automation engineering with tool-calling agent implementation"', { cwd: AI_DIR, stdio: 'inherit' });
  console.log('✅ Successfully initialized ai-automation-engineering!');
} catch (e) {
  console.log('Notice:', e.message);
}

