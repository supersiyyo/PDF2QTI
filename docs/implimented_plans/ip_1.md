# Build PDF to Canvas QTI Converter

This plan outlines the architecture and tasks required to build the full-stack web application that converts static PDFs (quizzes or raw content) into Canvas LMS QTI 1.2 `.zip` packages. Based on your documentation, the system will use a Python FastAPI backend and a React (Vite) frontend in a monorepo setup.

## User Review Required

> [!WARNING]
> Please confirm the following before I begin scaffolding the project:
> 1. **Language Choice for Frontend**: Is standard JavaScript (ES6) acceptable for the React Vite frontend, or do you require TypeScript? (I will plan for JavaScript by default as it is typically faster for prototyping unless requested otherwise).
> 2. **API Keys**: I will create a `.env.example`. You will need to copy this to `.env` and provide your own `GEMINI_API_KEY`.

*(Note on `python-multipart`: This is the standard FastAPI dependency required to parse HTML forms and handle file uploads `multipart/form-data`. Since we are uploading PDFs over an API route, this library is strictly required).*

## Proposed Changes

---

### Phase 1: Repository Scaffolding & Setup

#### [NEW] `backend/requirements.txt`
Dependencies: `fastapi`, `uvicorn`, `python-multipart`, `pdfplumber`, `google-genai`, `text2qti`.

#### [NEW] `backend/main.py`
Basic FastAPI setup, CORS middleware (allowing port 5173 for local frontend development), and route stubs.

#### [NEW] `backend/.env.example`
Template containing `GEMINI_API_KEY`.

#### [NEW] `frontend/` (Vite Blueprint)
Initialization of the frontend via Vite, configuring standard React template, and installing dependencies: `axios`, `lucide-react` (for sleek icons).
*(Note: We will design the UI specifically tailored for instructors with a professional, sleek aesthetic using custom Vanilla CSS (as per Antigravity style guidelines) rather than `@instructure/ui`).*

---

### Phase 2: Backend - Ingestion & AI Pipeline

#### [MODIFY] `backend/main.py`
- Implement **`POST /api/process-pdf`**
- Input: Form data containing `file` (PDF) and `mode` (either `"generate"` or `"digitize"`).
- Reading & Extraction: Use `pdfplumber` to extract all text.
- AI logic: Utilize `google-genai` SDK with Structured Outputs to return standard JSON conforming to the schema of:
  `{ question_text: string, choices: string[], correct_answer_index: int }`

> [!NOTE]
> On the chosen AI Schema vs `text2qti`: This specific schema is perfectly mapped to what `text2qti` requires. `text2qti` expects strict Markdown (e.g. labeling correct answers with an asterisk `*b)` ). By using this array schema, we avoid the AI failing to write flawless `text2qti` markdown. Instead, the Python backend will dynamically build the markdown representation out of this array, looking at the `correct_answer_index` to safely place the `*`.

---

### Phase 3: Frontend - The "Preview Editor" UI

#### [MODIFY] `frontend/src/App.jsx`
Main layout of the UI to integrate Upload and Preview components, featuring a professional and polished structure.

#### [NEW] `frontend/src/components/UploadComponent.jsx`
- A sleek file dropzone and a selector for processing mode ("Digitize Existing Quiz" vs. "Generate Quiz from Content").
- API integration handling the request to `/api/process-pdf` with a high-quality loading state.

#### [NEW] `frontend/src/components/PreviewEditor.jsx`
- Rendering the generated questions.
- Implement inline editing capabilities allowing string modifications for questions and choices, and radio buttons to pick the right index, styled similarly to professional LMS dashboards.

---

### Phase 4: Backend & Frontend - QTI Compilation

#### [MODIFY] `backend/main.py`
- Implement **`POST /api/export-qti`**
- Write mapping function translating JSON array to `text2qti`'s Markdown syntax.
- Run `text2qti` engine and output a temporary `.zip` file for streaming a `FileResponse`. 

#### [MODIFY] `frontend/src/components/PreviewEditor.jsx`
- Add "Download QTI" button.
- Integrate the file download mechanism mapping from `/api/export-qti` endpoint.

## Open Questions

- We'll be using `google-genai` SDK over `google-generativeai`. The new SDK relies on Pydantic schemas which perfectly pairs with FastAPI. Are you okay with me utilizing Pydantic's `BaseModel` for both the structure generation and API validation?

## Verification Plan

### Automated Tests
* None explicitly defined. Verification will rely on manual test flows.

### Manual Verification
1. Run backend server (`uvicorn main:app --reload`) and frontend server (`npm run dev`).
2. Visit `http://localhost:5173/`.
3. Select "Digitize" or "Generate", upload a sample PDF, and verify loading state.
4. Preview the structured content returned by Gemini.
5. Make edits to question titles or correct answers.
6. Click "Download QTI", receive the `.zip` file, and evaluate its contents against standard `text2qti` expectations.
