# Architecture Overview

The CSUN x SOSE Educational Tools Platform employs a modern, decoupled architecture splitting responsibilities strictly between a backend API service and a frontend React SPA (Single Page Application) that serves as a unified portal for multiple tools.

## System Components

### 1. Backend (Python & FastAPI)

Located in the `/backend` directory, the backend serves as the core processing engine.

**Core Technologies:**

- **FastAPI**: Provides a high-performance asynchronous web framework.
- **SSE (Server-Sent Events)**: The `/api/process-pdf` endpoint utilizes `StreamingResponse` to provide real-time logs to the client. It uses an `asyncio.Queue` to bridge the background AI processing task and the event generator.
- **google-genai**: The backend uses a two-model cascade — **Gemini 2.5 Flash** as primary, falling back to **Gemini 2.5 Flash-Lite**.
- **Data Governance**: When used with a **Paid Service Tier** (Vertex AI or AI Studio with Billing), Google commits to **Zero Model Training** on customer data. In the Unpaid/Free tier, data may be used for model improvement.
- **text2qti**: A CLI tool utilized via `subprocess` to compile markdown representations of quizzes into valid QTI `.zip` files.
- **Pydantic**: Enforces strict typing and data validation for the JSON structures interacting with the AI.
- **SQLModel & SQLite**: Power the persistence layer for the Emergency Assessment Bridge. Uses **WAL (Write-Ahead Logging)** mode to handle high-concurrency student submissions during live exam windows.

**Key Workflows:**

- **File Upload (`/api/process-pdf`)**: 
    1. Receives a PDF file and processing mode.
    2. Extracts text using `pdfplumber`.
    3. Spawns an asynchronous task to call Gemini with a retry/cascade logic.
    4. Streams progress events (`status`, `message`, `model`) via SSE.
    5. Returns the final JSON quiz data as a `success` event.
- **QTI Generation (`/api/export-qti`)**: 
    1. Receives validated JSON quiz data.
    2. Sanitizes the title, question text, and choices (removing newlines/returns) to ensure `text2qti` compatibility.
    3. Builds a markdown file using `text2qti`'s syntax.
    4. Executes `text2qti` in a temporary directory and streams the resulting `.zip` file back to the client.

**Error Handling Strategy:**

- `400` — Client errors (invalid mode, empty PDF).
- `503` — Gemini overload errors; returned if all retries and cascade models fail.
- `500` — Unexpected server errors (e.g., missing API key).

### 2. Live Assessment Bridge

A specialized component designed for high-concurrency exam administration during Canvas outages or for direct classroom delivery.

**Key Architecture Features:**
- **URL Entropy Security**: Bypasses SSO/OAuth bottlenecks by generating cryptographically secure unique hashes for student intake (`/take/:id`) and instructor admin (`/admin/:secret`).
- **Ephemeral by Design**: To minimize sensitive data storage, all exam data and submissions are automatically purged from the SQLite database 24 hours after creation.
- **Write-Ahead Logging (WAL)**: The database is configured with `PRAGMA journal_mode=WAL` to allow simultaneous write operations from hundreds of students without locking the database file.

### 3. Frontend (React & Vite)

Located in the `/frontend` directory, the frontend acts as a unified portal for all CSUN x SOSE tools.

**Core Technologies:**

- **React 18 & React Router**: The foundational UI library and routing system for the multi-tool SPA.
- **Vite**: Build tool and development server.
- **Axios & Fetch**: `fetch` is used for handling the SSE stream from the processing endpoint, while `axios` is used for standard JSON export requests.
- **Lucide React**: Icon library.
- **Framer Motion**: Powering fluid UI transitions and the interactive homepage updates module.

**Architecture & Workflows:**

- **Platform Routing**: A centralized `App.jsx` uses `react-router-dom` to route traffic between the landing page (`/`), category pages (`/instructor`, `/student`), and specific tool pages (e.g., `/instructor/pdf2qti`).
- **Educational Design System**: Uses a light, clean UI designed for faculty accessibility. Accents include CSUN Red (`#D00D2D`) and SOSE Purple (`#6B6DFF`).
- **Updates Module**: A dynamic, cached, and interactive changelog component using Framer Motion micro-interactions. Powered by a static `changelog.json`.
- **Tools**:
    - **PDF2QTI**: Encapsulated in `/instructor/pdf2qti`. Features real-time SSE stream handling, resilient model execution, an integrated HD video walkthrough guide, and a high-fidelity interactive Preview Editor for QTI creation.
    - **Host Live Assessment**: A mobile-optimized exam-taking environment featuring lightweight identity verification, staggered entry animations, and a high-density instructor results ledger.
    - **Canvas Critter**: Encapsulated in `/student/canvas-critter`. A dedicated landing page for downloading the standalone desktop application, featuring an integrated SlidePlayer how-to guide.
- **Open Source Transparency**: Persistent links to the GitHub repository are integrated into the UI.

## Media & Asset Hosting Architecture

To maintain a lightweight Git repository and ensure high-performance delivery, all large media assets (videos, walkthrough slides) are hosted externally on the SiteGround **Static Asset Bridge**.

**Key Hosting Details:**
- **Base URL**: `https://csun.sose.dev/downloads/`
- **Video Storage**: Hosted under `/downloads/videos/[tool-name]/howtovideo.webm`
- **Slide Storage**: Hosted under `/downloads/slides/[tool-name]/[slide-number].png`

**Benefits:**
1. **Reduced Repo Bloat**: Prevents large binary files (like 18MB videos) from slowing down git operations.
2. **CDN-Ready**: SiteGround's static serving is optimized for media delivery, reducing load on the application server.
3. **Decoupled Updates**: Walkthroughs can be updated by simply swapping files on the server without requiring a code redeploy.
