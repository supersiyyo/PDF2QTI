# Doc-to-Quiz (formerly PDF2QTI)

Doc-to-Quiz is a full-stack application designed to automatically convert PDF documents into Canvas-ready QTI (Question and Test Interoperability) files. It leverages advanced AI to either extract explicit multiple-choice questions from exams or intelligently generate new questions from study materials.

## Features

- **Document Processing**: Robust PDF text extraction utilizing `pdfplumber`.
- **AI-Powered Digitization & Generation**: Integrates with Google's Gemini 2.5 Flash API to parse and format questions accurately.
  - **Digitize Mode**: Extracts existing multiple-choice questions and identifies the correct answers.
  - **Generate Mode**: Synthesizes study materials and generates new, relevant multiple-choice questions.
- **QTI Export Engine**: Converts extracted questions into a downloadable `.zip` package formatted as a QTI quiz, fully compatible with learning management systems like Canvas.
- **Decoupled Architecture**: Features a fast, asynchronous Python/FastAPI backend and a responsive React/Vite frontend.
- **CI/CD Automation**: Fully automated deployment pipeline using GitHub Actions to deploy the backend to Railway and the frontend to SiteGround via secure FTP.

## Quick Start (Local Development)

### Prerequisites

- Python 3.10+
- Node.js & npm
- A valid Google Gemini API Key

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
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

You can use the provided startup script (Linux/GNOME) from the project root:

```bash
./start_app.sh
```

Or run the services manually:

**Backend:**

```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

**Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Documentation

For more detailed information, please refer to the following documentation files:

- [Architecture Overview](docs/architecture.md)
- [Deployment & Migration Guide](docs/deployment.md)

## License

MIT License
