import pytest
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from main import app, extract_text_from_pdf, Question, ExtractQTIRequest

client = TestClient(app)

# Paths to the provided test PDFs
DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "docs")
BIO_QUIZ_PDF = os.path.join(DOCS_DIR, "BIO_QUIZ.pdf")
BIO_STUDY_PDF = os.path.join(DOCS_DIR, "BIO_STUDYGUIDE.pdf")

def test_pdf_extraction_quiz():
    """Verify that text can be extracted from the BIO_QUIZ PDF."""
    assert os.path.exists(BIO_QUIZ_PDF), f"Test file not found: {BIO_QUIZ_PDF}"
    text = extract_text_from_pdf(BIO_QUIZ_PDF)
    assert len(text) > 100
    assert "Biology" in text or "Question" in text

def test_pdf_extraction_studyguide():
    """Verify that text can be extracted from the BIO_STUDYGUIDE PDF."""
    assert os.path.exists(BIO_STUDY_PDF), f"Test file not found: {BIO_STUDY_PDF}"
    text = extract_text_from_pdf(BIO_STUDY_PDF)
    assert len(text) > 100
    assert "FINAL" in text or "Study" in text

def test_string_sanitization():
    """Verify that the /api/export-qti endpoint correctly handles strings with newlines."""
    test_data = {
        "quiz_title": "Test\nQuiz",
        "questions": [
            {
                "question_text": "Question\nwith\nnewlines?",
                "choices": ["Choice\n1", "Choice 2", "Choice 3", "Choice 4"],
                "correct_answer_index": 0
            }
        ]
    }
    # We don't need to actually run text2qti here if we just want to check the 200 response
    # But since the backend fix is applied, it should succeed.
    response = client.post("/api/export-qti", json=test_data)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to PDF2QTI API"}

@patch("main.call_gemini_with_retry", new_callable=AsyncMock)
def test_process_pdf_streaming(mock_gemini):
    """Verify that /api/process-pdf returns a stream of data chunks."""
    # Setup mock return value
    mock_gemini.return_value = {
        "data": {
            "questions": [
                {"question_text": "Q1", "choices": ["A", "B", "C", "D"], "correct_answer_index": 0}
            ]
        }
    }
    
    with open(BIO_QUIZ_PDF, "rb") as f:
        response = client.post(
            "/api/process-pdf",
            data={"mode": "digitize"},
            files={"file": ("BIO_QUIZ.pdf", f, "application/pdf")}
        )
    
    assert response.status_code == 200
    assert "data:" in response.text
    assert "status" in response.text
    assert "Quiz generated successfully!" in response.text
    assert "Q1" in response.text
