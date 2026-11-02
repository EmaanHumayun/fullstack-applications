# Task Management API Specification

## Base URL
`http://localhost:5000/api/tasks`

## Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all tasks | 200 OK |
| `POST` | `/api/tasks` | Create new task item | 201 Created |
| `PUT` | `/api/tasks/:id` | Update task status or priority | 200 OK |
| `DELETE` | `/api/tasks/:id` | Delete task item | 200 OK |
| `GET` | `/healthz` | Application healthcheck probe | 200 OK |
| `GET` | `/metrics` | Prometheus telemetry metrics | 200 OK |
