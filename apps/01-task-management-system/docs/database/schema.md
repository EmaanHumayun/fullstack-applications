# Database Schema Specification

## Entity Definition: Task

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `id` | String / UUID | No | Unique identifier (Primary Key) |
| `title` | String (max 255) | No | Concise description of the task |
| `status` | Enum (`pending`, `in-progress`, `completed`) | No | Current workflow state |
| `priority` | Enum (`low`, `medium`, `high`) | No | Urgency level |
| `createdAt` | ISO 8601 Timestamp | No | Record generation time |
