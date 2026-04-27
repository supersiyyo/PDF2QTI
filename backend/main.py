import os
import tempfile
import uuid
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import pdfplumber
from google import genai
import text2qti
from text2qti.qti import QTI

# Load environment variables
load_dotenv()

app = FastAPI(title="PDF2QTI API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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

        client = genai.Client() # Uses GEMINI_API_KEY from env
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': QuizExtraction,
                'temperature': 0.2 if mode == "digitize" else 0.7
            },
        )
        
        # Depending on the return format, it should be a parsed JSON matching QuizExtraction
        # google-genai returns BaseModel populated objects natively or we deserialize json
        # Usually client.models.generate_content with response_schema returns dict/BaseModel directly or raw text.
        # Let's read the text and parse it with Pydantic if it's returning text JSON.
        result_json = response.text
        # Let frontend handle parsing or we parse it and return dict
        import json
        data = json.loads(result_json)
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ExtractQTIRequest(BaseModel):
    questions: List[Question]

@app.post("/api/export-qti")
async def export_qti(data: ExtractQTIRequest):
    try:
        # Construct markdown string for text2qti
        markdown_content = ""
        for i, q in enumerate(data.questions, 1):
            markdown_content += f"{i}. {q.question_text}\n"
            for j, choice in enumerate(q.choices):
                choice_letter = chr(97 + j) # a, b, c, d
                if j == q.correct_answer_index:
                    markdown_content += f"*{choice_letter}) {choice}\n"
                else:
                    markdown_content += f"{choice_letter}) {choice}\n"
            markdown_content += "\n"

        # Temporary files for text2qti
        base_dir = tempfile.mkdtemp()
        md_path = os.path.join(base_dir, "quiz.md")
        qti_path = os.path.join(base_dir, "quiz.zip")

        with open(md_path, "w", encoding="utf-8") as f:
            f.write(markdown_content)
        
        # Generate QTI using text2qti API
        # text2qti CLI does text2qti quiz.md
        # Using internal text2qti programmatic API:
        import text2qti.config
        import text2qti.quiz
        import text2qti.qti
        
        config = text2qti.config.Config()
        quiz = text2qti.quiz.Quiz(md_path, config=config)
        qti = text2qti.qti.QTI(quiz)
        qti.save(qti_path)

        # Return file
        return FileResponse(
            path=qti_path, 
            media_type="application/zip", 
            filename="quiz.zip",
            # FastAPI can't delete immediately if streaming, 
            # A background task is better but this works for development
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
