# System Design Document: Task Management System

## Overview
The application follows a decoupled client-server architecture. The backend Express API service operates independently of the presentation client, communicating exclusively over HTTP REST using JSON envelopes.

## Request Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Client (SPA / Nginx)
    participant API as Backend (Node.js Express)
    participant Store as State Store

    User->>UI: Input task & click "Add Task"
    UI->>API: POST /api/tasks (JSON body)
    API->>API: Validate input (title required)
    alt Validation Failure
        API-->>UI: 400 Bad Request
    else Validation Success
        API->>Store: Insert task record
        Store-->>API: Persisted record
        API-->>UI: 201 Created (JSON envelope)
        UI->>User: Update task list in DOM
    end
```
