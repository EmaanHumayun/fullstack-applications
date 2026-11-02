# Project Requirements: Task Management System

## 1. Problem Statement
Engineering teams require a lightweight, deterministic task tracking platform to manage operational tasks, prioritize urgent issues, and observe service health without complex SaaS overhead.

## 2. Target Users
- Software Engineers and DevOps practitioners managing sprint workflows.
- Technical leads requiring visibility into operational deliverables.

## 3. Functional Requirements
- **FR-01 (Task Creation):** Users must be able to create tasks with a mandatory title and priority level (`high`, `medium`, `low`).
- **FR-02 (Task Listing):** Users must view all active and completed tasks with creation timestamps.
- **FR-03 (State Transition):** Users must toggle task status between `pending`, `in-progress`, and `completed`.
- **FR-04 (Task Deletion):** Users must be able to remove obsolete tasks with instant feedback.
- **FR-05 (Health Telemetry):** The system must expose real-time uptime and task counts for automated monitoring.

## 4. Non-Functional Requirements
- **NFR-01 (Performance):** API responses must execute in <50ms under typical loads.
- **NFR-02 (Reliability):** Service must provide automated health probes for container restart policies.
- **NFR-03 (Accessibility):** Web client must follow semantic HTML5 standards and responsive mobile layouts.
- **NFR-04 (Security):** Strict CORS policies and payload size limits to protect backend memory.
