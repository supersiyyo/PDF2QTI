# Antigravity Build Blueprint: PDF to Canvas QTI Converter

## Project Overview
This repository contains a full-stack web application designed to convert static PDFs (either existing quizzes or raw content) into valid Canvas LMS QTI 1.2 `.zip` packages. 

**Architecture:** Monorepo containing a Python FastAPI backend and a React (Vite) frontend.
**Starting State:** Empty repository with a README.md and MIT License.

---

## Technology Stack
**Backend:**
* Python 3.11+
* `fastapi` & `uvicorn` (Server framework)
* `python-multipart` (File handling)
* `pdfplumber` (Document text extraction)
* `google-genai` (Gemini API for structured data extraction)
* `text2qti` (QTI `.zip` package compilation)

**Frontend:**
* React (via Vite)
* `axios` (API communication)
* `@instructure/ui` (Canvas LMS native component library for accurate UI replication)

---

## Phase 1: Repository Scaffolding & Setup

1. **Initialize the Monorepo:**
   * Create two root directories: `/backend` and `/frontend`.

2. **Backend Setup (`/backend`):**
   * Create a `requirements.txt` with: `fastapi`, `uvicorn`, `python-multipart`, `pdfplumber`, `google-genai`, `text2qti`.
   * Create `main.py` with a basic FastAPI setup and CORS middleware allowing local connections from the frontend (typically port 5173).
   * Create a `.env.example` file including `GEMINI_API_KEY=your_key_here`.

3. **Frontend Setup (`/frontend`):**
   * Initialize a Vite React project (TypeScript preferred, but JS is acceptable).
   * Install dependencies: `npm install axios @instructure/ui`.
   * Clear the boilerplate `App.jsx`/`App.tsx` and ensure the dev server spins up correctly on port 5173.

---

## Phase 2: Backend - Ingestion & AI Pipeline

1. **Endpoint 1: `/api/process-pdf` (POST)**
   * **Input:** Form data containing `file` (a PDF) and `mode` (either `"generate"` or `"digitize"`).
   * **Extraction:** Use `pdfplumber` to read the PDF bytes and extract all text into a single string. Store the PDF safely in memory or a `/tmp` directory.

2. **AI Processing Logic (`google-genai` SDK):**
   * Pass the extracted text to the Gemini API (e.g., `gemini-2.5-flash`).
   * **Crucial:** You must use the `response_schema` feature (Structured Outputs) to guarantee the AI returns a JSON array. 
   * The schema should be an array of objects representing questions:
     ```json
     {
       "question_text": "string",
       "choices": ["string", "string", "string", "string"],
       "correct_answer_index": "integer"
     }
     ```
   * **Prompting Logic (Based on `mode`):**
     * If `mode == "digitize"`: Prompt the AI to act as a strict data extractor. Extract exact questions/choices. If no key is provided, solve for the `correct_answer_index`.
     * If `mode == "generate"`: Prompt the AI to act as an educator, synthesizing the text to invent new multiple-choice questions.

3. **Return:** Send the generated JSON array back to the client.

---

## Phase 3: Frontend - The "Canvas Preview" UI

1. **Upload Component:**
   * Build a file dropzone.
   * Add a Radio Group for the user to select the processing mode ("Digitize Existing Quiz" vs. "Generate Quiz from Content").
   * On submit, show a loading state while calling `/api/process-pdf`.

2. **Canvas Preview Component (The Editor):**
   * Receive the JSON array from the backend. Save it in React State.
   * Render the data using `@instructure/ui` components to mimic the Canvas LMS interface.
   * **Inline Editing:**
     * The `question_text` and `choices` strings must be editable text fields.
     * The choices should have radio buttons next to them. If a user clicks a different radio button, update the `correct_answer_index` for that specific question in the state array.

---

## Phase 4: Backend & Frontend - QTI Compilation

1. **Endpoint 2: `/api/export-qti` (POST)**
   * **Input:** The finalized JSON array (sent from the frontend).
   * **Translation Layer:** Write a Python function that maps the JSON array into `text2qti`'s strict Markdown syntax. 
     * *Example formatting required by text2qti:*
       ```markdown
       1. [question_text]
       a) [choice 0]
       *b) [choice 1 - assuming this is the correct_answer_index]
       c) [choice 2]
       d) [choice 3]
       ```
   * **Compilation:** Feed the generated Markdown string into the `text2qti` library engine. 
   * Have `text2qti` output the final `.zip` file into a temporary server directory.
   * **Return:** Stream the `.zip` file back as a `FileResponse` and instantly delete the temporary files on the server to prevent bloat.

2. **Frontend Export Trigger:**
   * Add a "Download QTI" button below the Canvas Preview.
   * On click, send the current React State JSON to `/api/export-qti` and handle the file download prompt in the browser.

---

## Developer Resources & Syntax References
* **FastAPI File Uploads:** [FastAPI Request Files](https://fastapi.tiangolo.com/tutorial/request-files/)
* **Gemini SDK Structured Outputs:** [Gemini API Docs - Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output)
* **Canvas Instructure UI:** [Instructure UI React Components](https://instructure.design/#ui-docs)
* **text2qti Markdown Syntax rules:** [text2qti GitHub Documentation](https://github.com/gpoore/text2qti)
