# User Workflow Serialized State Manager

A full-stack web application for managing multi-step workflow states with serialization, versioning, and audit logging.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Spring Boot 3.2, Java 17                |
| Database   | MongoDB Atlas                           |
| Auth       | Spring Security + JWT                   |
| Frontend   | HTML5, CSS3, Vanilla JavaScript         |
| API Docs   | Springdoc OpenAPI (Swagger UI)          |
| Container  | Docker + Docker Compose                 |

---

## Project Structure

```
state-manager/
├── backend/
│   ├── src/main/java/com/statemanager/
│   │   ├── config/          # Security, OpenAPI config
│   │   ├── controller/      # AuthController, WorkflowStateController
│   │   ├── dto/             # AuthDTOs, StateDTO
│   │   ├── exception/       # GlobalExceptionHandler
│   │   ├── model/           # User, WorkflowState, StateSnapshot, AuditLog
│   │   ├── repository/      # Mongo repositories
│   │   ├── security/        # JwtUtils, JwtAuthFilter
│   │   └── service/         # AuthService, WorkflowStateService, UserDetailsServiceImpl
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js           # API client (fetch wrapper with JWT)
│       ├── workflows.js     # Workflow definitions + field renderer
│       └── app.js           # UI logic, auth, dashboard, workflow runner
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## Setup Instructions

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Copy the connection string

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.data.mongodb.uri=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/statemanager
jwt.secret=your-32-char-minimum-secret-key-here
```

### 3. Run with Docker Compose

```bash
# Set environment variables
export MONGODB_URI="mongodb+srv://..."
export JWT_SECRET="your-secret-key"

# Build and start
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### 4. Run Locally (without Docker)

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
# Serve with any static file server, e.g.:
cd frontend
npx serve .
# or open index.html directly in browser
# (update API_BASE in js/api.js to http://localhost:8080/api)
```

---

## API Endpoints

### Auth

| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| POST   | `/api/auth/register` | Register new user  |
| POST   | `/api/auth/login`    | Login, get JWT     |

### Workflow States (all require `Authorization: Bearer <token>`)

| Method | Endpoint                           | Description                  |
|--------|------------------------------------|------------------------------|
| GET    | `/api/states/dashboard`            | Stats + recent states        |
| POST   | `/api/states`                      | Create new state              |
| GET    | `/api/states`                      | List all user states          |
| GET    | `/api/states/{id}`                 | Load specific state           |
| PUT    | `/api/states/{id}`                 | Update / advance step         |
| DELETE | `/api/states/{id}`                 | Delete state                  |
| PATCH  | `/api/states/{id}/abandon`         | Mark as abandoned             |
| PATCH  | `/api/states/{id}/revert/{version}`| Revert to snapshot version    |
| GET    | `/api/states/{id}/audit`           | Get audit log entries         |

---

## Features

### Core
- **JWT Authentication** — Register/login with secure token-based auth
- **Save State** — Persist serialized workflow state to MongoDB
- **Load State** — Resume exactly where you left off
- **Update State** — Advance steps, merge new data
- **Delete State** — Hard delete with audit entry

### Advanced
- **Multi-step Forms** — 4 workflow types: Registration, Survey, Onboarding, Checkout
- **Autosave** — Saves automatically 2 seconds after any field change
- **Step Versioning** — Each `Next` click creates a snapshot; revert to any version
- **Audit Log** — Every create/update/delete/load is logged with timestamp
- **Progress Bar** — Visual step progress indicator
- **Dashboard Stats** — In Progress / Completed / Abandoned counts
- **Status Management** — IN_PROGRESS → COMPLETED / ABANDONED

### Frontend
- Responsive design (mobile-friendly)
- Dashboard with card grid + status filters
- Resume button on in-progress workflows
- Snapshot/version history modal
- Audit log modal
- Toast notifications

---

## MongoDB Collections

| Collection        | Description                                      |
|-------------------|--------------------------------------------------|
| `users`           | User accounts with hashed passwords              |
| `workflow_states` | Serialized state documents with embedded snapshots |
| `audit_logs`      | Immutable audit trail of all state changes       |

---

## State Document Example

```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "userId": "65f1a2b3c4d5e6f7a8b9c0d0",
  "workflowName": "Employee Onboarding - John",
  "workflowType": "ONBOARDING",
  "currentStep": 3,
  "totalSteps": 4,
  "status": "IN_PROGRESS",
  "stateData": {
    "employeeId": "EMP-0042",
    "department": "Engineering",
    "laptop": "MacBook Pro",
    "peripherals": ["External Monitor", "Keyboard"]
  },
  "version": 5,
  "createdAt": "2024-03-01T10:00:00",
  "updatedAt": "2024-03-01T11:30:00",
  "snapshots": [
    {
      "version": 2,
      "step": 1,
      "stateData": { "employeeId": "EMP-0042", "department": "Engineering" },
      "savedAt": "2024-03-01T10:15:00",
      "savedBy": "65f1a2b3c4d5e6f7a8b9c0d0"
    }
  ]
}
```

---

## Environment Variables

| Variable      | Description                      | Required |
|---------------|----------------------------------|----------|
| `MONGODB_URI` | Full MongoDB Atlas connection URI | Yes      |
| `JWT_SECRET`  | Secret key for signing JWTs      | Yes      |

---

## Swagger / API Testing

Once running, visit: **http://localhost:8080/swagger-ui.html**

1. Click `POST /api/auth/register` → register a user
2. Click `POST /api/auth/login` → copy the token
3. Click **Authorize** (top right) → paste `Bearer <token>`
4. Test all state endpoints

---

## Optional Enhancements (not yet implemented)

- Redis caching (`spring-boot-starter-data-redis`)
- File-based serialization export (JSON/CSV download)
- WebSocket real-time sync across tabs
- Role-based access control (ADMIN / USER)
- Email notifications on workflow completion
