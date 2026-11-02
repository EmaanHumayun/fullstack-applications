import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store with seed items
let tasks = [
  { id: "1", title: "Configure production Linux server", status: "completed", priority: "high", createdAt: new Date().toISOString() },
  { id: "2", title: "Build Docker multi-stage build files", status: "in-progress", priority: "high", createdAt: new Date().toISOString() },
  { id: "3", title: "Author Kubernetes manifest files", status: "pending", priority: "medium", createdAt: new Date().toISOString() }
];

// Healthcheck endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Telemetry metrics
app.get('/metrics', (req, res) => {
  res.type('text/plain').send(`
# HELP tasks_total Total number of tasks in the system
# TYPE tasks_total gauge
tasks_total ${tasks.length}
# HELP process_uptime_seconds Total uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${process.uptime()}
  `.trim());
});

// Tasks CRUD
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, count: tasks.length, data: tasks });
});

app.post('/api/tasks', (req, res) => {
  const { title, priority = "medium" } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, error: "Task title is required." });
  }
  const newTask = {
    id: String(Date.now()),
    title,
    status: "pending",
    priority,
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.status !== undefined) task.status = req.body.status;
  if (req.body.priority !== undefined) task.priority = req.body.priority;
  res.json({ success: true, data: task });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  if (tasks.length === initialLen) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }
  res.json({ success: true, message: "Task deleted successfully." });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TASK API] Service listening on http://0.0.0.0:${PORT}`);
});
