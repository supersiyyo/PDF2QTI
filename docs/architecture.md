# Architecture Overview

The Doc-to-Quiz application employs a modern, decoupled architecture splitting responsibilities strictly between a backend API service and a frontend Single Page Application (SPA).

## System Components

### 1. Backend (Python & FastAPI)

Located in the `/backend` directory, the backend serves as the core processing engine.

**Core Technologies:**

- **FastAPI**: Provides a high-performance asynchronous web framework. The `/api/process-pdf` endpoint now utilizes **StreamingResponse (SSE)** to provide real-time logs to the client during processing.
- **google-genai**: The backend uses an expanded model cascade including **Gemini 3 Flash** and **Gemini 2.5 Pro/Flash** models for enhanced extraction and generation.
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
- Axios posts the file to the backend and awaits the generated JSON question bank.
- **503 / Overload Handling**: If the backend returns a `503`, the UI displays a friendly error message and a **Retry** button. The last `(file, mode)` call is saved in state so the user can retry with one click without re-uploading.
- **Fallback Model Notification**: If the backend used a secondary model, a dismissible amber warning banner is shown to the user.
- The UI renders the returned questions allowing the user to review them.
- A final export action posts the reviewed questions to the QTI generation endpoint, which triggers a browser download of the returned QTI `.zip` file.
