# API Endpoint Documentation

**Base URL:** `http://localhost:5000/api/tasks`  
**Content-Type:** `application/json`  

## 1. Get All Tasks
- **Route:** `GET /api/tasks`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "id": "1",
        "title": "Configure production Linux server",
        "status": "completed",
        "priority": "high",
        "createdAt": "2026-11-02T12:00:00.000Z"
      }
    ]
  }
  ```

## 2. Create Task
- **Route:** `POST /api/tasks`
- **Request Body:**
  ```json
  {
    "title": "Configure Prometheus alert rules",
    "priority": "high"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "1730560000000",
      "title": "Configure Prometheus alert rules",
      "status": "pending",
      "priority": "high",
      "createdAt": "2026-11-02T12:05:00.000Z"
    }
  }
  ```

## 3. Update Task
- **Route:** `PUT /api/tasks/:id`
- **Request Body:** `{ "status": "completed" }`
- **Response (200 OK):** `{ "success": true, "data": { ... } }`

## 4. Delete Task
- **Route:** `DELETE /api/tasks/:id`
- **Response (200 OK):** `{ "success": true, "message": "Task deleted successfully." }`
