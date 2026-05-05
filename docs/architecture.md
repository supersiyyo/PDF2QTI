# Architecture Overview

The Doc-to-Quiz application employs a modern, decoupled architecture splitting responsibilities strictly between a backend API service and a frontend Single Page Application (SPA).

## System Components

### 1. Backend (Python & FastAPI)

Located in the `/backend` directory, the backend serves as the core processing engine.

**Core Technologies:**

- **FastAPI**: Provides a high-performance asynchronous web framework.
- **SSE (Server-Sent Events)**: The `/api/process-pdf` endpoint utilizes `StreamingResponse` to provide real-time logs to the client. It uses an `asyncio.Queue` to bridge the background AI processing task and the event generator.
- **google-genai**: The backend uses a two-model cascade — **Gemini 2.5 Flash** as primary, falling back to **Gemini 2.5 Flash-Lite** — with automatic `429`/`503` detection and exponential-backoff retries (3 attempts with a base delay of 2s).
- **text2qti**: A CLI tool utilized via `subprocess` to compile markdown representations of quizzes into valid QTI `.zip` files.
- **Pydantic**: Enforces strict typing and data validation for the JSON structures interacting with the AI.

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

### 2. Frontend (React & Vite)

Located in the `/frontend` directory, the frontend provides an intuitive user interface for the service.

**Core Technologies:**

- **React 18**: The foundational UI library.
- **Vite**: Build tool and development server.
- **Axios & Fetch**: `fetch` is used for handling the SSE stream from the processing endpoint, while `axios` is used for the standard JSON export request.
- **Lucide React**: Icon library.

**Key Workflows:**

- **Processing State UI**: Uses a high-fidelity shimmer skeleton that mirrors the `PreviewEditor` layout. It features:
    - A live **elapsed timer**.
    - A **model badge** that updates in real-time as the backend cascades through models.
    - Rotating **educational facts** to keep the user engaged.
- **SSE Stream Handling**: Reads the stream using `ReadableStream` and `TextDecoder`. It handles partial chunks and parses `data: ` prefixed JSON payloads.
- **Preview & Edit**: The `PreviewEditor` allows users to modify the AI-generated content before export. It includes a "Questions Badge" and numbered labels for each question.
- **Resilience**: If a `503` is encountered, the UI provides a **Retry** button that re-submits the last file and mode.
- **Smooth Transition**: When processing completes, the `PreviewEditor` fades in with a 450ms rise-and-fade animation.
- **Open Source Transparency**: A fixed floating button in the bottom right corner provides a direct link to the GitHub repository, reinforcing the application's free and open-source nature.
