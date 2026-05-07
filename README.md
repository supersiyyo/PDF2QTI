# Educational Tools Platform (CSUN x SOSE)

This repository hosts a scalable, multi-tool educational platform designed for the CSUN community by the Society of Software Engineers (SOSE). It features a modern React frontend utilizing React Router to categorize and deliver both Instructor and Student tools.

Currently featured is **PDF to Canvas QTI** (formerly PDF2QTI), a robust full-stack tool that automatically converts PDF documents into Canvas-ready QTI files using AI.

## Features

- **Scalable Platform Architecture**: Built with React Router to seamlessly host multiple Instructor and Student tools under a unified, premium UI.
- **Educational Design System**: A clean, light aesthetic tailored for faculty accessibility, featuring CSUN Red and SOSE Purple branding accents.
- **PDF to Canvas QTI Engine**: 
  - Robust PDF text extraction utilizing `pdfplumber`.
  - Integrates with Google's Gemini API via the `google-genai` SDK with a resilient Model Cascade (Flash -> Flash-Lite).
  - Real-time Streaming Feedback (SSE) and Non-blocking Execution.
  - Digitize Mode (extract existing questions) & Generate Mode (invent new questions).
  - Converts quiz data into a valid QTI 1.2 `.zip` package via `text2qti`.
- **Premium User Experience**:
  - High-Fidelity Skeleton UI with a live timer and educational facts.
  - Interactive Preview Editor to review and edit AI-generated questions before export.
  - Interactive **Updates Module** on the homepage featuring staggered Framer Motion micro-interactions and a global changelog cache.
- **Canvas Critter**: A standalone desktop application currently being developed by CSUN students for a COMP 380 project. Hosted externally via SiteGround with a dedicated landing page for Beta downloads. Includes a **dynamic how-to-use SlidePlayer** — an 18-step cinematic guide with inline and full-screen theater mode, dot navigation, and preloaded images served from SiteGround.
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