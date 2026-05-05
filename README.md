# Doc-to-Quiz (formerly PDF2QTI)

Doc-to-Quiz is a full-stack application designed to automatically convert PDF documents into Canvas-ready QTI (Question and Test Interoperability) files. It leverages advanced AI to either extract explicit multiple-choice questions from exams or intelligently generate new questions from study materials.

## Features

- **Document Processing**: Robust PDF text extraction utilizing `pdfplumber`.
- **AI-Powered Digitization & Generation**: Integrates with Google's Gemini API via the `google-genai` SDK.
  - **Resilient Model Cascade**: Automatically cascades from **Gemini 2.5 Flash** to **Gemini 2.5 Flash-Lite** if high demand is detected.
  - **Streaming Feedback (SSE)**: Provides real-time status updates (e.g., "Extracting text", "AI is working...") during long-running processes.
  - **Non-blocking Execution**: Utilizes `asyncio.to_thread` and `asyncio.Queue` to keep the event loop responsive during AI calls.
  - **Digitize Mode**: Extracts existing multiple-choice questions and solves for the correct answer if not explicitly provided.
  - **Generate Mode**: Synthesizes study materials to invent new, high-quality multiple-choice questions.
- **Premium User Experience**:
  - **High-Fidelity Skeleton UI**: A shimmer skeleton mirrors the final editor layout during processing.
  - **Live Timer & Educational Facts**: Keeps users engaged while the AI processes the document.
  - **Interactive Preview Editor**: Review and edit AI-generated questions, change correct answers, and update the quiz title before exporting.
  - **Open Source Link**: Floating "View on GitHub" button for easy access to the source code.
- **QTI Export Engine**: Converts quiz data into a valid QTI 1.2 `.zip` package via `text2qti`, ensuring seamless import into Canvas LMS.
- **CI/CD Automation**: Fully automated deployment pipeline using GitHub Actions (Backend to Railway, Frontend to SiteGround).

## Quick Start (Local Development)

### Prerequisites

- Python 3.10+
- Node.js & npm
- A valid Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/supersiyyo/PDF2QTI.git
   cd PDF2QTI
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Setup the Frontend:**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Automatic Startup:**
- Linux/macOS: `./start_app.sh`
- Windows: `start_app.bat`

**Manual Startup:**
- **Backend**: `cd backend && uvicorn main:app --reload` (Port 8000)
- **Frontend**: `cd frontend && npm run dev` (Port 5173)

## Testing

### Backend Tests (Pytest)
The backend includes unit tests for PDF extraction, API endpoints, and string sanitization.
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest
```

### Frontend Tests (Vitest)
The frontend includes basic rendering and component tests.
```bash
cd frontend
npm test
```

## Documentation

For more detailed information, refer to:
- [Architecture Overview](docs/architecture.md)
- [Deployment & Migration Guide](docs/deployment.md)

## License

MIT License