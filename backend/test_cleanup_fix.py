import pytest
from fastapi.testclient import TestClient
from main import app, get_session
from sqlmodel import Session, SQLModel, create_engine, select
from database import engine
from models import Exam, Submission
import datetime
import uuid

def test_cleanup_with_submissions():
    with TestClient(app) as client:
        # 1. Manually insert an OLD exam into the DB
        with Session(engine) as session:
            old_exam = Exam(
                title="Old Exam",
                questions_json=[{"text": "Q1", "choices": ["A", "B"], "correct_answer_index": 0}],
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=25)
            )
            session.add(old_exam)
            session.commit()
            session.refresh(old_exam)
            
            # 2. Add a submission to this old exam
            sub = Submission(
                exam_id=old_exam.id,
                student_email="test@student.com",
                student_id="12345",
                answers_json=[0],
                score=100.0
            )
            session.add(sub)
            session.commit()
            
            exam_id = old_exam.id
            sub_id = sub.id

        # 3. Trigger cleanup by calling any exam endpoint
        # We'll use a dummy ID that doesn't exist to ensure we hit cleanup but then return 404 or just ignore
        # Actually, get_exam calls cleanup_old_exams(session)
        resp = client.get(f"/api/exams/some-non-existent-id")
        # Cleanup should have run.
        
        # 4. Verify that the old exam AND its submission are gone
        with Session(engine) as session:
            remaining_exam = session.get(Exam, exam_id)
            remaining_sub = session.get(Submission, sub_id)
            
            assert remaining_exam is None, "Old exam should have been deleted"
            assert remaining_sub is None, "Submission should have been deleted via cascade"

if __name__ == "__main__":
    test_cleanup_with_submissions()
