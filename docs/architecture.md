# Architecture Overview

The Doc-to-Quiz application employs a modern, decoupled architecture splitting responsibilities strictly between a backend API service and a frontend Single Page Application (SPA).

## System Components

### 1. Backend (Python & FastAPI)

Located in the `/backend` directory, the backend serves as the core processing engine.

**Core Technologies:**

- **FastAPI**: Provides a high-performance asynchronous web framework for building the API endpoints.
- **Uvicorn**: An ASGI web server implementation for Python used to serve the FastAPI application.
- **pdfplumber**: Handles the extraction of text from uploaded PDF documents.
- **google-genai**: The official SDK used to interface with Google's Gemini API. The backend uses a model cascade (`gemini-2.5-flash` → `gemini-1.5-flash`) with exponential backoff retries to handle API overload conditions gracefully.
- **text2qti**: A CLI tool utilized under the hood to compile markdown representations of quizzes into valid QTI `.zip` files.
- **Pydantic**: Enforces strict typing and data validation for the JSON structures interacting with the AI.

**Key Workflows:**

- **File Upload (`/api/process-pdf`)**: Receives a PDF file via a multipart form request. It writes the file to a temporary location, extracts the text using `pdfplumber`, and constructs a strict prompt. The prompt is passed to the `call_gemini_with_retry()` helper, which attempts the primary model (`gemini-2.5-flash`) up to 3 times with exponential backoff (2s, 4s, 8s). If all retries are exhausted, it cascades to the fallback model (`gemini-1.5-flash`). If all models fail, a structured `503` response is returned. When a fallback model is used, a `_warning` field is included in the response to notify the user.
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
