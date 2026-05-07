import os
import sys
import time
import tempfile
import shutil
import uuid
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import pdfplumber
from google import genai
from google.genai import errors as genai_errors

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

GEMINI_MODEL_CASCADE = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
]
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2  # seconds

def _is_overload_error(exc: Exception) -> bool:
    """Return True if the exception is a Gemini 503 (UNAVAILABLE) or 429 (RESOURCE_EXHAUSTED) error."""
    msg = str(exc).lower()
    return any(term in msg for term in ["503", "unavailable", "high demand", "429", "quota", "exhausted"])

async def call_gemini_with_retry(prompt: str, mode: str, log_callback=None) -> dict:
    """
    Attempt to call the Gemini API with exponential backoff retries.
    Cascades through GEMINI_MODEL_CASCADE if all retries on a model fail.
    Returns a dict with keys: 'data' (parsed JSON) and optionally 'warning' (str).
    """
    import json
    import asyncio
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
                msg = f"AI is working with {model_name}..."
                print(f"[Gemini] Trying {model_name} (Attempt {attempt})")
                if log_callback:
                    await log_callback({"message": msg, "model": model_name})
                
                # generate_content is synchronous; wrap in to_thread to avoid blocking event loop
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name,
                    contents=prompt,
                    config=config
                )
                
                try:
                    data = json.loads(response.text)
                except json.JSONDecodeError as e:
                    # If the model fails to return valid JSON, treat it as an overload/transient error
                    # and allow it to retry or cascade.
                    raise Exception(f"JSON Parsing Error: {str(e)}")
                
                result = {"data": data}
                # Notify user if we fell back to a secondary model
                if model_idx > 0:
                    result["warning"] = (
                        f"The primary AI model is currently experiencing high usage. "
                        f"To avoid delays, your quiz was generated using a high-availability backup model ({model_name})."
                    )
                return result
            except Exception as exc:
                last_exc = exc
                # Now _is_overload_error handles typical API errors, 
                # and we also catch our custom JSON Parsing Error here.
                is_retriable = _is_overload_error(exc) or "JSON Parsing Error" in str(exc)
                
                if is_retriable:
                    if attempt < MAX_RETRIES:
                        delay = RETRY_BASE_DELAY * (2 ** (attempt - 1))
                        msg = f"AI encountered an issue. Retrying in {delay}s..."
                        print(f"[Gemini] Error on {model_name} (Attempt {attempt}): {str(exc)}")
                        if log_callback:
                            await log_callback({"message": msg, "model": model_name})
                        await asyncio.sleep(delay)
                    else:
                        msg = f"Model {model_name} exhausted. Switching to backup..."
                        print(f"[Gemini] All {MAX_RETRIES} retries exhausted for {model_name}. Cascading...")
                        if log_callback:
                            await log_callback({"message": msg, "model": model_name})
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

from fastapi.responses import StreamingResponse
import json

@app.post("/api/process-pdf")
async def process_pdf(mode: str = Form(...), file: UploadFile = File(...)):
    if mode not in ["generate", "digitize"]:
        raise HTTPException(status_code=400, detail="Invalid mode selected")

    if "GEMINI_API_KEY" not in os.environ:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set in environment.")

    async def progress_generator():
        try:
            yield f"data: {json.dumps({'status': 'info', 'message': 'Initializing...', 'model': 'System'})}\n\n"
            
            # Save uploaded file temporarily
            yield f"data: {json.dumps({'status': 'info', 'message': 'Reading document...', 'model': 'System'})}\n\n"
            temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
            content = await file.read()
            temp_pdf.write(content)
            temp_pdf.close()

            # Extract text
            yield f"data: {json.dumps({'status': 'info', 'message': 'Extracting text...', 'model': 'System'})}\n\n"
            extracted_text = extract_text_from_pdf(temp_pdf.name)
            os.unlink(temp_pdf.name)

            if not extracted_text.strip():
                yield f"data: {json.dumps({'status': 'error', 'message': 'Could not extract any text from the provided PDF.'})}\n\n"
                return

            # Prepare AI Prompt
            yield f"data: {json.dumps({'status': 'info', 'message': 'Analyzing content...', 'model': 'System'})}\n\n"
            if mode == "digitize":
                prompt_instruction = "Act as a strict data extractor. Extract the exact multiple choice questions and choices from the provided text. If no correct answer is explicitly provided, solve the question to provide the `correct_answer_index`."
            else:
                prompt_instruction = "Act as an educator. Synthesize the provided text to invent new, high-quality multiple choice questions based on the content."

            full_prompt = f"{prompt_instruction}\n\nDocument Text:\n{extracted_text}"

            # Call Gemini
            yield f"data: {json.dumps({'status': 'info', 'message': 'Generating questions...', 'model': 'Gemini'})}\n\n"
            
            # Since we can't yield from the callback, we define it here
            # But await call_gemini_with_retry will block until it returns.
            # To get real-time logs, we would need to run it in a task and read from a queue.
            # For simplicity, let's just make the callback print and we yield after? 
            # No, let's do it right.
            
            import asyncio
            queue = asyncio.Queue()

            async def log_callback(info):
                # info is a dict: {"message": "...", "model": "..."}
                await queue.put({'status': 'info', **info})

            # Run AI call in background task
            task = asyncio.create_task(call_gemini_with_retry(full_prompt, mode, log_callback=log_callback))

            # While task is running, check queue
            while not task.done():
                try:
                    # Wait for a message with a timeout to check task status
                    msg = await asyncio.wait_for(queue.get(), timeout=0.1)
                    yield f"data: {json.dumps(msg)}\n\n"
                except asyncio.TimeoutError:
                    continue

            # Final check of queue
            while not queue.empty():
                msg = await queue.get()
                yield f"data: {json.dumps(msg)}\n\n"

            result = await task
            data = result["data"]

            original_name = file.filename
            if original_name.lower().endswith(".pdf"):
                original_name = original_name[:-4]
            data["quiz_title"] = f"P2Q_{original_name}"

            if "warning" in result:
                data["_warning"] = result["warning"]
                yield f"data: {json.dumps({'status': 'warning', 'message': result['warning']})}\n\n"

            yield f"data: {json.dumps({'status': 'success', 'message': 'Quiz generated successfully!', 'data': data})}\n\n"

        except Exception as e:
            print(f"[Error] Unexpected: {e}")
            yield f"data: {json.dumps({'status': 'error', 'message': f'An unexpected error occurred: {str(e)}'})}\n\n"

    return StreamingResponse(progress_generator(), media_type="text/event-stream")


class ExtractQTIRequest(BaseModel):
    quiz_title: str
    questions: List[Question]

@app.post("/api/export-qti")
async def export_qti(data: ExtractQTIRequest, background_tasks: BackgroundTasks):
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
        
        # Generate QTI using text2qti as a Python module for PATH safety across all environments
        import subprocess
        try:
            subprocess.run(
                [sys.executable, "-c", "from text2qti.cmdline import main; main()", md_path],
                cwd=base_dir,
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as sub_e:
            raise Exception(f"text2qti compilation failed: {sub_e.stderr}")
        except FileNotFoundError:
            raise Exception("text2qti module not found. Ensure it is installed in the server environment.")

        safe_filename = "".join(c for c in data.quiz_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_filename = safe_filename.replace(' ', '_') or 'quiz'

        # Schedule temp directory cleanup AFTER the response has been fully sent
        background_tasks.add_task(shutil.rmtree, base_dir, True)

        # Return file
        return FileResponse(
            path=qti_path,
            media_type="application/zip",
            filename=f"{safe_filename}.zip",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
