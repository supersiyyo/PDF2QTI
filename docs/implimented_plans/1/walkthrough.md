# PDF to QTI Walkthrough

I have successfully scaffolded and integrated the full-stack architecture for your PDF to Canvas QTI Converter according to our implementation plan.

> [!SUCCESS]
> The `/backend` and `/frontend` dependencies are installed and the application stubs are ready for manual testing.

## Summary of Changes

### 1. **Backend Integration (`/backend`)**
- Added `fastapi`, `google-genai`, `pdfplumber`, `text2qti`, and `python-dotenv` to `requirements.txt`.
- Set up an operational `.env.example` file.
- Built out `main.py` which:
  - Parses uploaded PDF files returning string data using `pdfplumber`.
  - Interfaces natively using the `google-genai` SDK with Structured Outputs by binding queries to a strict `Pydantic` schema (`QuizExtraction`).
  - Contains `/api/export-qti` that manually builds the required QTI markdown array by inserting `*` flags on the fly.
  - Returns the compiled `.zip` file for download directly back to the client.

### 2. **Frontend UI (`/frontend`)**
- Scaffolded a Vite + React application.
- Stripped unnecessary bloat (`App.css`, boilerplate `App.jsx`) and applied sleek **Vanilla CSS** inside `index.css` focusing on high-quality professional instructor aesthetics.
- Built a streamlined `App` containing dual routes dependent on component state:
  1. `UploadComponent`: A drag-and-drop landing page utilizing simple form submission to our backend API.
  2. `PreviewEditor`: A professional-looking rendered form allowing the instructor to dynamically tweak titles, edit choices, and override Gemini's parsed `correct_answer_index` inline.

---

## 🚀 How to Run and Verify

The system is fully programmed but requires your specific initialization to run locally:

### Step 1: Set up Gemini Key
Navigate into `/backend`.
```bash
cd backend
cp .env.example .env
```
Open `.env` and assign your own Google API key to `GEMINI_API_KEY`.

### Step 2: Run Backend & Frontend separately
Terminal 1:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Terminal 2:
```bash
cd frontend
npm run dev
```

### Step 3: Test and Export
Navigate to `http://localhost:5173`. Upload any quiz PDF to test both modes (Digitize vs Generate) and ensure that clicking **Download QTI .zip** yields a compliant quiz package loadable inside Canvas LMS.

> [!TIP]
> Make sure to adjust your frontend components if you wish to expand functionality further! The state models are completely modular.
