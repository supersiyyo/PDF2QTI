# Architecture Overview

The Doc-to-Quiz application employs a modern, decoupled architecture splitting responsibilities strictly between a backend API service and a frontend Single Page Application (SPA).

## System Components

### 1. Backend (Python & FastAPI)

Located in the `/backend` directory, the backend serves as the core processing engine.

**Core Technologies:**

- **FastAPI**: Provides a high-performance asynchronous web framework. The `/api/process-pdf` endpoint now utilizes **StreamingResponse (SSE)** to provide real-time logs to the client during processing.
- **google-genai**: The backend uses a two-model cascade — **Gemini 2.5 Flash** as primary, falling back to **Gemini 2.5 Flash-Lite** — with automatic `429`/`503` detection and exponential-backoff retries. Synchronous SDK calls are wrapped in `asyncio.to_thread` to keep the event loop unblocked.
- **text2qti**: A CLI tool utilized under the hood to compile markdown representations of quizzes into valid QTI `.zip` files.
- **Pydantic**: Enforces strict typing and data validation for the JSON structures interacting with the AI.

**Key Workflows:**

- **File Upload (`/api/process-pdf`)**: Receives a PDF file via a multipart form request. It streams progress events (using `asyncio.Queue` to bridge the AI callback and the generator) such as "Extracting text", "Sending request to Gemini", and AI retry attempts. The final JSON quiz data is sent as a `success` event at the end of the stream.
- **QTI Generation (`/api/export-qti`)**: Receives validated JSON containing the quiz questions. It sanitizes the AI-generated questions and choices (stripping newlines) to prevent parser failures. It then dynamically builds a markdown string structured specifically for `text2qti`, spawns a subprocess to execute `text2qti`, and streams the resulting `.zip` file back to the client.

**Error Handling Strategy:**

- `400` — Client errors (invalid mode, empty PDF) with descriptive messages.
- `503` — Gemini overload errors; returned after all retry/fallback attempts are exhausted with a user-friendly message.
- `500` — Unexpected server errors; full stack trace is logged server-side only; a generic message is returned to the client.

### 2. Frontend (React & Vite)

Located in the `/frontend` directory, the frontend provides an intuitive user interface for the service.

**Core Technologies:**

- **React 18**: The foundational UI library.
- **Vite**: A lightning-fast build tool and development server.
- **Axios**: A promise-based HTTP client used for handling API requests to the backend (both multi-part form data for file uploads and standard JSON for exports).
- **Lucide React**: Provides the icon library used throughout the UI.

**Key Workflows:**

- Users upload a file and select a mode ("Digitize" or "Generate").
- The frontend reads the SSE stream from `/api/process-pdf` using the Fetch API and a `ReadableStream` reader. Each SSE payload carries `{ status, message, model }` fields.
- **ProcessingState skeleton UI**: While processing, a high-fidelity shimmer skeleton mirrors the exact layout of the real `PreviewEditor` (action bar, card, title input, question blocks, choice rows). A live elapsed timer and rotating educational facts keep the user informed. The model badge updates in real-time as the backend cascades through models.
- **503 / Overload Handling**: If the backend returns a `503`, the UI displays a friendly error message and a **Retry** button.
- **Fallback Model Notification**: If a secondary model was used due to high demand, a dismissible **green** notice (✨) is shown — styled to feel informative rather than alarming.
- **Smooth Transition**: When processing completes, the `PreviewEditor` fades in with a 450ms rise-and-fade animation (`fadeInResult`).
- The `PreviewEditor` shows a **"X Questions" badge** next to the heading and a numbered **QUESTION X** badge above each question for easy reference.
- A final export action posts the reviewed questions to the QTI generation endpoint, which triggers a browser download of the returned QTI `.zip` file.
