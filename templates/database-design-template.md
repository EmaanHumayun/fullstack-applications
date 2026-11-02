# Database Schema & Entity Relationships

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ TASKS : assigns
    USERS {
        uuid id PK
        string email
        string password_hash
        string role
        timestamp created_at
    }
    TASKS {
        uuid id PK
        uuid user_id FK
        string title
        text description
        string status
        string priority
        timestamp due_date
        timestamp created_at
    }
```

## Indexing & Performance Strategy
- Primary keys use UUID v4 for distributed uniqueness.
- Foreign keys (`user_id`) indexed to optimize join performance.
- Composite index on `(status, priority)` for filtered dashboard queries.
