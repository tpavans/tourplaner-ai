# ConciergeIQ
### Personalized Guest Itinerary Orchestrator

ConciergeIQ is a luxury, production-ready full-stack SaaS platform designed for the hospitality and tourism sectors. Powered by Spring Boot 3, React 19, and LangChain4j, it enables guests to converse with an AI concierge, generate tailored multi-day travel plans, book dining reservations, purchase event tickets, and manage stays in real-time.

---

## Technical Stack & Architecture

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Lucide Icons, Axios.
- **Backend**: Spring Boot 3.3.x, Java 21, Spring Security + JWT Authentication, Spring Data JPA, Hibernate, Redis, Swagger/OpenAPI.
- **Database**: PostgreSQL 15 (relational transactions), Redis (cache storage).
- **AI Integrations**: LangChain4j + OpenAI models, OpenClaw automated reservation agent.

---

## Project Structure

```
conciergeiq/
├── docker-compose.yml       # Dev orchestration manifest
├── README.md                # System documentation
├── backend/
│   ├── pom.xml              # Spring Boot Maven settings
│   ├── Dockerfile           # Backend container build instructions
│   └── src/                 # Java clean architecture sources
└── frontend/
    ├── package.json         # React NPM settings
    ├── Dockerfile           # Web server container build instructions
    └── src/                 # React UI typescript elements
```

---

## Database Schema (PostgreSQL DDL)

Database initialization migrations are configured via Spring Boot and stored in `backend/src/main/resources/db/migration/V1__schema.sql`.
Core tables include:
- `users`: Credentials, personal roles (`GUEST`, `STAFF`, `ADMIN`).
- `preference_profiles`: Traveler interest tags, food constraints, budget levels.
- `hotels` & `rooms`: Accommodations records.
- `bookings`: Stay check-ins and check-outs.
- `restaurants` & `reservations`: Table dining bookings.
- `events` & `event_tickets`: Cultural events and concerts.
- `trips` & `schedules`: Day timeline entries.
- `chat_histories` & `notifications`: Logs and alerts.

---

## Core Features & AI Workflow

1. **Guest asks**: *"I want a relaxing afternoon."*
2. **ConciergeIQ**: Loads guest preferences profiles from database.
3. **Similarity Retrieval**: Scans database for matching attractions and events.
4. **Weather & Traffic Check**: Pulls simulated ambient statistics (e.g. 28°C in Goa).
5. **Timeline Proposal**: Returns a proposed structure to the guest UI.
6. **OpenClaw Booking**: When approved by the guest, the OpenClaw agent registers room stays, dining tables, and tickets in PostgreSQL, updating the user's active schedule.

---

## Setup & Running Locally

### Prerequisites
- Java JDK 21
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Option A: Using Docker Compose (Recommended)
From the root directory:
```bash
docker-compose up --build
```
- Access Frontend Client: `http://localhost:3000`
- Access Backend API Server: `http://localhost:8080`
- Access Swagger Documentation: `http://localhost:8080/swagger-ui.html`

### Option B: Local Native Setup

#### 1. Database Setup
Create a PostgreSQL database named `conciergeiq` and start your local Redis instance on port `6379`.

#### 2. Start Backend
Edit or check environment variables in `backend/src/main/resources/application.yml` and run:
```bash
cd backend
mvn clean spring-boot:run
```
*(The seeder automatically inserts test users: guest `guest@example.com` and admin `admin@example.com`, both with password `password`)*

#### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## API References (Sample endpoints)

### 1. Authentication
- `POST /api/auth/signup`: Create a new GUEST, STAFF, or ADMIN user.
- `POST /api/auth/login`: Authenticate and return JWT + Refresh Token.
- `POST /api/auth/refreshtoken`: Generate a new access token.

### 2. AI Concierge
- `POST /api/chat`: Send a message to the AI agent.
- `GET /api/chat/history`: Fetch conversational chat logs.
- `POST /api/chat/itinerary/approve`: Approve a proposed itinerary to book and populate timelines.

### 3. Bookings
- `POST /api/bookings/hotel`: Book a hotel room.
- `POST /api/bookings/restaurant`: Reserve a restaurant table.
- `POST /api/bookings/event`: Buy event tickets.
