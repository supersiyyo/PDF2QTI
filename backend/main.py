import os
import time
import tempfile
import uuid
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import pdfplumber
from google import genai
from google.genai import errors as genai_errors
import text2qti
from text2qti.qti import QTI

# Load environment variables
load_dotenv()

app = FastAPI(title="PDF2QTI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://csun.sose.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Schema Configuration
class Question(BaseModel):
    question_text: str = Field(description="The text of the multiple choice question.")
    choices: List[str] = Field(description="A list of 4 choices for the question.")
    correct_answer_index: int = Field(description="The 0-based index of the correct answer in the choices list.")

class QuizExtraction(BaseModel):
    questions: List[Question]

def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

# --- Gemini Resilience Helpers ---

GEMINI_MODEL_CASCADE = ["gemini-2.5-flash", "gemini-1.5-flash"]
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds

def _is_overload_error(exc: Exception) -> bool:
    """Return True if the exception is a Gemini 503 / UNAVAILABLE error."""
    msg = str(exc).lower()
    return "503" in msg or "unavailable" in msg or "high demand" in msg

def call_gemini_with_retry(prompt: str, mode: str) -> dict:
    """
    Attempt to call the Gemini API with exponential backoff retries.
    Cascades through GEMINI_MODEL_CASCADE if all retries on a model fail.
    Returns a dict with keys: 'data' (parsed JSON) and optionally 'warning' (str).
    """
    import json
    client = genai.Client()
    config = {
        "response_mime_type": "application/json",
        "response_schema": QuizExtraction,
        "temperature": 0.2 if mode == "digitize" else 0.7,
    }

    last_exc = None
    for model_idx, model_name in enumerate(GEMINI_MODEL_CASCADE):
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(f"[Gemini] Trying model={model_name}, attempt={attempt}")
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                data = json.loads(response.text)
                result = {"data": data}
                # Notify user if we fell back to a secondary model
                if model_idx > 0:
                    result["warning"] = (
                        f"The primary AI model was unavailable. "
                        f"Your quiz was generated using a backup model ({model_name}). "
                        f"Results may vary slightly."
                    )
                return result
            except Exception as exc:
                last_exc = exc
                if _is_overload_error(exc):
                    if attempt < MAX_RETRIES:
                        delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                        print(f"[Gemini] 503 on {model_name} attempt {attempt}. Retrying in {delay}s...")
                        time.sleep(delay)
                    else:
                        print(f"[Gemini] All {MAX_RETRIES} retries exhausted for {model_name}. Cascading...")
                        break  # try next model
                else:
                    # Non-retriable error — re-raise immediately
                    raise

    # All models exhausted
    raise HTTPException(
        status_code=503,
        detail="The AI model is currently overloaded. Please try again in a moment.",
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to PDF2QTI API"}

@app.post("/api/process-pdf")
async def process_pdf(mode: str = Form(...), file: UploadFile = File(...)):
    if mode not in ["generate", "digitize"]:
        raise HTTPException(status_code=400, detail="Invalid mode selected")

    # Guard AI key
    if "GEMINI_API_KEY" not in os.environ:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set in environment.")

    try:
        # Save uploaded file temporarily
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        content = await file.read()
        temp_pdf.write(content)
        temp_pdf.close()

        # Extract text
        extracted_text = extract_text_from_pdf(temp_pdf.name)
        os.unlink(temp_pdf.name)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the provided PDF.")

        # Prepare AI Prompt
        if mode == "digitize":
            prompt_instruction = "Act as a strict data extractor. Extract the exact multiple choice questions and choices from the provided text. If no correct answer is explicitly provided, solve the question to provide the `correct_answer_index`."
        else:
            prompt_instruction = "Act as an educator. Synthesize the provided text to invent new, high-quality multiple choice questions based on the content."

        full_prompt = f"{prompt_instruction}\n\nDocument Text:\n{extracted_text}"

        # Call Gemini with retry + model fallback
        result = call_gemini_with_retry(full_prompt, mode)
        data = result["data"]

        original_name = file.filename
        if original_name.lower().endswith(".pdf"):
            original_name = original_name[:-4]
        data["quiz_title"] = f"P2Q_{original_name}"

        # Pass through any warning for the frontend to display
        if "warning" in result:
            data["_warning"] = result["warning"]

        return data

    except HTTPException:
        raise  # Re-raise structured HTTP exceptions as-is
    except Exception as e:
        print(f"[Error] Unexpected: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")


class ExtractQTIRequest(BaseModel):
    quiz_title: str
    questions: List[Question]

@app.post("/api/export-qti")
async def export_qti(data: ExtractQTIRequest):
    try:
        # Construct markdown string for text2qti
        # Sanitize quiz title to remove newlines
        safe_quiz_title = data.quiz_title.replace('\n', ' ').replace('\r', ' ').strip()
        markdown_content = f"Quiz title: {safe_quiz_title}\n\n"
        
        for i, q in enumerate(data.questions, 1):
            # Sanitize question text
            safe_question = q.question_text.replace('\n', ' ').replace('\r', ' ').strip()
            markdown_content += f"{i}. {safe_question}\n"
            
            for j, choice in enumerate(q.choices):
                # Sanitize choices
                safe_choice = choice.replace('\n', ' ').replace('\r', ' ').strip()
                choice_letter = chr(97 + j) # a, b, c, d
                if j == q.correct_answer_index:
                    markdown_content += f"*{choice_letter}) {safe_choice}\n"
                else:
                    markdown_content += f"{choice_letter}) {safe_choice}\n"
            markdown_content += "\n"

        # Temporary files for text2qti
        base_dir = tempfile.mkdtemp()
        md_path = os.path.join(base_dir, "quiz.md")
        qti_path = os.path.join(base_dir, "quiz.zip")

        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        
        # Generate QTI using text2qti CLI instead of internal python API which can be unstable
        import subprocess
        try:
            subprocess.run(
                ["text2qti", md_path], 
                cwd=base_dir, 
                check=True, 
                capture_output=True, 
                text=True
            )
        except subprocess.CalledProcessError as sub_e:
            raise Exception(f"text2qti compilation failed: {sub_e.stderr}")

        safe_filename = "".join(c for c in data.quiz_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_filename = safe_filename.replace(' ', '_') or 'quiz'
        
        # Return file
        return FileResponse(
            path=qti_path, 
            media_type="application/zip", 
            filename=f"{safe_filename}.zip",
            # FastAPI can't delete immediately if streaming, 
            # A background task is better but this works for development
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
