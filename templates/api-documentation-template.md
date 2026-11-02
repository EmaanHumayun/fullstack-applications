# API Specification: [Application Name]

**Base URL:** `http://localhost:5000/api/v1`  
**Authentication:** `Authorization: Bearer <token>`  
**Content-Type:** `application/json`  

---

## Endpoints

### 1. Authentication
#### `POST /auth/register`
Creates a new user account.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "Jane Doe"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "user": { "id": "uuid", "email": "user@example.com", "name": "Jane Doe" },
    "token": "jwt_token_string"
  }
  ```

#### `POST /auth/login`
Authenticates existing credentials.

### 2. Core Resource
#### `GET /resources`
Retrieves paginated list of resources.
#### `POST /resources`
Creates a new resource record.
#### `GET /resources/:id`
Retrieves single resource by ID.
#### `PUT /resources/:id`
Updates existing resource record.
#### `DELETE /resources/:id`
Deletes resource record.
