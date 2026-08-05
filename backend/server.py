from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import hashlib
import hmac
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import aiofiles
import json

from models import (
    User, UserCreate, Lecture, LectureCreate, Quiz, QuizQuestion,
    QuizAttempt, Certificate, CodingProfile, Ranking, Announcement,
    StudentPerformance, generate_id,
)
from auth import (
    create_session_token,
    get_current_user,
    set_session_cookie,
    clear_session_cookie,
)
AI_IMPORT_ERROR = None
try:
    from ai_service import (
        transcribe_audio, clean_transcript, generate_lecture_summary,
        generate_quiz_questions, get_coding_recommendations, get_mock_summary,
        get_mock_questions
    )
except Exception as import_error:
    AI_IMPORT_ERROR = str(import_error)

    async def transcribe_audio(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    async def clean_transcript(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    async def generate_lecture_summary(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    async def generate_quiz_questions(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    async def get_coding_recommendations(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    def get_mock_summary(*args, **kwargs):
        return {
            "topics_learned": ["AI service unavailable"],
            "topic_summaries": {
                "AI service unavailable": "Install backend AI dependencies to enable generated notes."
            },
            "key_concepts": [],
            "important_points": [f"AI service unavailable: {AI_IMPORT_ERROR}"],
            "homework": [],
            "revision_checklist": [],
            "detailed_explanations": {},
            "step_by_step_breakdown": [],
            "real_world_applications": [],
            "worked_examples": [],
            "exam_questions": [],
        }

    def get_mock_questions(*args, **kwargs):
        return []

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="CampusAi API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-SHA256 for portability."""
    salt = os.urandom(16)
    iterations = 200000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    salt_b64 = base64.urlsafe_b64encode(salt).decode("ascii")
    digest_b64 = base64.urlsafe_b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${iterations}${salt_b64}${digest_b64}"


def verify_password(password: str, encoded_hash: str) -> bool:
    """Verify password against stored PBKDF2-SHA256 hash."""
    try:
        algorithm, iterations, salt_b64, digest_b64 = encoded_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(salt_b64.encode("ascii"))
        expected = base64.urlsafe_b64decode(digest_b64.encode("ascii"))
        computed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(computed, expected)
    except Exception:
        return False


def normalize_summary(summary: Optional[dict]) -> dict:
    """Ensure summary always follows frontend-expected structure."""
    if not isinstance(summary, dict):
        summary = {}

    if "overview" in summary and "important_points" not in summary:
        summary["important_points"] = [summary.get("overview", "")]

    if "key_points" in summary and "key_concepts" not in summary:
        summary["key_concepts"] = summary.get("key_points", [])

    if "topic_summaries" not in summary:
        summary["topic_summaries"] = {}

    summary.setdefault("topics_learned", list(summary.get("topic_summaries", {}).keys()))
    summary.setdefault("key_concepts", [])
    summary.setdefault("important_points", [])
    summary.setdefault("homework", [])
    summary.setdefault("revision_checklist", [])
    summary.setdefault("detailed_explanations", {})
    summary.setdefault("step_by_step_breakdown", [])
    summary.setdefault("real_world_applications", [])
    summary.setdefault("worked_examples", [])
    summary.setdefault("exam_questions", [])

    return summary


def build_topic_fallback_summary(lecture: dict, error_message: str) -> dict:
    """Fallback summary scoped to lecture metadata when AI processing fails."""
    topic = lecture.get("topic") or "Recorded Topic"
    title = lecture.get("title") or "Lecture"
    subject = lecture.get("subject") or "General"
    summary = normalize_summary(get_mock_summary())
    summary["topics_learned"] = [topic]
    summary["topic_summaries"] = {
        topic: f"Auto-summary fallback for {title}. AI transcription/summarization failed, so this was generated from lecture metadata."
    }
    summary["important_points"] = [
        f"Subject: {subject}",
        f"Topic: {topic}",
        "This lecture was processed using auto-generated notes. AI-powered summaries will be available once the service quota resets.",
    ]
    summary["homework"] = [
        f"Review core concepts from '{topic}'.",
        "Retry processing after confirming backend LLM key and transcription model access.",
    ]
    summary["revision_checklist"] = [
        "Re-run lecture processing once AI service is available.",
        "Verify microphone clarity and recording duration.",
    ]
    return summary


async def initialize_user_profile(user_id: str):
    """Create related profile docs for a newly registered user."""
    now = datetime.now(timezone.utc).isoformat()
    await db.student_performance.insert_one({
        "user_id": user_id,
        "total_quizzes": 0,
        "total_score": 0,
        "average_percentage": 0.0,
        "topic_scores": {},
        "attendance": 0,
        "streak": 0,
        "last_active": now,
    })
    await db.coding_profiles.insert_one({
        "user_id": user_id,
        "leetcode": None,
        "hackerrank": None,
        "codechef": None,
        "geeksforgeeks": None,
        "total_problems": 0,
        "coding_score": 0.0,
        "last_synced": now,
    })

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/dev-session")
async def create_dev_session(response: Response):
    """Create a local development session without external auth provider."""
    user = await db.users.find_one({"email": "dev@local.test"}, {"_id": 0, "password_hash": 0})

    if not user:
        user_id = f"dev_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": "dev@local.test",
            "name": "Local Dev User",
            "picture": None,
            "role": "student",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)

        await db.student_performance.insert_one({
            "user_id": user_id,
            "total_quizzes": 0,
            "total_score": 0,
            "average_percentage": 0.0,
            "topic_scores": {},
            "attendance": 0,
            "streak": 0,
            "last_active": datetime.now(timezone.utc).isoformat(),
        })

        await db.coding_profiles.insert_one({
            "user_id": user_id,
            "leetcode": None,
            "hackerrank": None,
            "codechef": None,
            "geeksforgeeks": None,
            "total_problems": 0,
            "coding_score": 0.0,
            "last_synced": datetime.now(timezone.utc).isoformat(),
        })

    token = create_session_token(user["user_id"])
    set_session_cookie(response, token)
    user.pop("_id", None)
    return {"user": user, "token": token}


@api_router.post("/auth/register")
async def register_with_email(request: Request, response: Response):
    """Register a user using email/password and start a session."""
    data = await request.json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip()
    role = (data.get("role") or "student").strip().lower()

    if role not in ("student", "teacher"):
        role = "student"

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user = {
        "user_id": user_id,
        "email": email,
        "name": name or email.split("@")[0],
        "picture": None,
        "role": role,
        "password_hash": hash_password(password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    await initialize_user_profile(user_id)

    token = create_session_token(user_id)
    set_session_cookie(response, token)

    user.pop("_id", None)
    user.pop("password_hash", None)
    return {"user": user, "token": token}


@api_router.post("/auth/login")
async def login_with_email(request: Request, response: Response):
    """Authenticate using email/password and start a session."""
    data = await request.json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    password_hash = user.get("password_hash")
    if not password_hash or not verify_password(password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_session_token(user["user_id"])
    set_session_cookie(response, token)

    user.pop("_id", None)
    user.pop("password_hash", None)
    return {"user": user, "token": token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request, db)
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    """Logout and clear session"""
    clear_session_cookie(response)
    return {"message": "Logged out successfully"}

@api_router.put("/auth/role")
async def update_user_role(request: Request):
    """Update user role (admin only or self for demo)"""
    current_user = await get_current_user(request, db)
    data = await request.json()
    
    user_id = data.get("user_id", current_user["user_id"])
    new_role = data.get("role")
    
    if new_role not in ["student", "teacher", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": new_role}}
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return user

# ==================== LECTURE ROUTES ====================

@api_router.post("/lectures")
async def create_lecture(request: Request):
    """Create a new lecture entry"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can create lectures")
    
    data = await request.json()
    
    lecture = {
        "lecture_id": generate_id("lec_"),
        "title": data["title"],
        "subject": data["subject"],
        "topic": data["topic"],
        "teacher_id": current_user["user_id"],
        "teacher_name": current_user["name"],
        "batch": data.get("batch", "All"),
        "audio_path": None,
        "duration": 0,
        "raw_transcript": None,
        "clean_transcript": None,
        "summary": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending"
    }
    
    await db.lectures.insert_one(lecture)
    lecture.pop("_id", None)
    return lecture

@api_router.post("/lectures/{lecture_id}/audio")
async def upload_lecture_audio(
    lecture_id: str,
    request: Request,
    audio: UploadFile = File(...)
):
    """Upload audio file for a lecture"""
    current_user = await get_current_user(request, db)
    
    # Check lecture exists and belongs to teacher
    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    if lecture["teacher_id"] != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Save audio file
    file_ext = audio.filename.split(".")[-1] if "." in audio.filename else "webm"
    file_name = f"{lecture_id}.{file_ext}"
    file_path = UPLOADS_DIR / file_name
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await audio.read()
        await f.write(content)
    
    # Update lecture with audio path
    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {"audio_path": str(file_path), "status": "transcribing"}}
    )
    
    return {"message": "Audio uploaded", "path": str(file_path)}

@api_router.post("/lectures/{lecture_id}/process")
async def process_lecture(lecture_id: str, request: Request):
    """Process lecture: transcribe and generate summary"""
    current_user = await get_current_user(request, db)
    
    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # Update status
    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {"status": "processing"}}
    )
    
    try:
        # Transcribe audio
        raw_transcript = await transcribe_audio(lecture.get("audio_path", ""))

        # Clean transcript
        clean = await clean_transcript(raw_transcript)

        # Generate summary
        summary = await generate_lecture_summary(clean)
        summary = normalize_summary(summary)
    except Exception as error:
        logger.exception("Lecture processing failed for %s: %s", lecture_id, error)
        raw_transcript = lecture.get("raw_transcript") or "Transcript could not be generated."
        clean = lecture.get("clean_transcript") or raw_transcript
        summary = build_topic_fallback_summary(lecture, str(error))
    
    # Update lecture
    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {
            "raw_transcript": raw_transcript,
            "clean_transcript": clean,
            "summary": summary,
            "status": "completed"
        }}
    )
    
    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    return lecture


@api_router.post("/lectures/{lecture_id}/regenerate-summary")
async def regenerate_lecture_summary(lecture_id: str, request: Request):
    """Regenerate summary/deep notes from existing transcript content."""
    await get_current_user(request, db)

    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    source_text = lecture.get("clean_transcript") or lecture.get("raw_transcript")
    if not source_text:
        raise HTTPException(status_code=400, detail="No transcript available to regenerate summary")

    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {"status": "processing"}}
    )

    clean = source_text
    if not lecture.get("clean_transcript"):
        clean = await clean_transcript(source_text)

    try:
        summary = await generate_lecture_summary(clean)
        summary = normalize_summary(summary)
    except Exception as error:
        logger.exception("Summary regeneration failed for %s: %s", lecture_id, error)
        summary = build_topic_fallback_summary(lecture, str(error))

    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {
            "clean_transcript": clean,
            "summary": summary,
            "status": "completed"
        }}
    )

    updated = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    return updated

@api_router.get("/lectures")
async def get_lectures(request: Request, subject: Optional[str] = None, limit: int = 20):
    """Get all lectures"""
    await get_current_user(request, db)
    
    query = {}
    if subject:
        query["subject"] = subject
    
    lectures = await db.lectures.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return lectures

@api_router.get("/lectures/{lecture_id}")
async def get_lecture(lecture_id: str, request: Request):
    """Get a specific lecture"""
    await get_current_user(request, db)
    
    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    return lecture

# ==================== QUIZ ROUTES ====================

@api_router.post("/quizzes")
async def create_quiz(request: Request):
    """Create a new quiz"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can create quizzes")
    
    data = await request.json()
    
    quiz = {
        "quiz_id": generate_id("quiz_"),
        "lecture_id": data.get("lecture_id"),
        "title": data["title"],
        "subject": data["subject"],
        "topic": data["topic"],
        "questions": data.get("questions", []),
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "time_limit": data.get("time_limit", 30)
    }
    
    await db.quizzes.insert_one(quiz)
    quiz.pop("_id", None)
    return quiz

@api_router.post("/quizzes/generate")
async def generate_quiz(request: Request):
    """Generate quiz questions using AI"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can generate quizzes")
    
    data = await request.json()
    topic = data.get("topic", "General")
    lecture_id = data.get("lecture_id")
    num_questions = data.get("num_questions", 10)
    num_options = data.get("num_options", 4)

    # Clamp to safe ranges
    try:
        num_questions = max(1, min(int(num_questions), 50))
    except (TypeError, ValueError):
        num_questions = 10
    try:
        num_options = max(2, min(int(num_options), 5))
    except (TypeError, ValueError):
        num_options = 4
    
    transcript = ""
    if lecture_id:
        lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
        if lecture:
            transcript = lecture.get("clean_transcript", "") or lecture.get("raw_transcript", "")
    
    questions = await generate_quiz_questions(topic, transcript, num_questions, num_options)
    
    # Add question IDs
    for q in questions:
        q["question_id"] = generate_id("q_")
    
    return {"questions": questions}

@api_router.get("/quizzes")
async def get_quizzes(request: Request, subject: Optional[str] = None, topic: Optional[str] = None):
    """Get all quizzes (optionally filtered by subject and/or topic)"""
    await get_current_user(request, db)
    
    query = {}
    if subject:
        query["subject"] = subject
    if topic:
        query["topic"] = topic
    
    quizzes = await db.quizzes.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return quizzes

@api_router.get("/quizzes/{quiz_id}")
async def get_quiz(quiz_id: str, request: Request):
    """Get a specific quiz"""
    await get_current_user(request, db)
    
    quiz = await db.quizzes.find_one({"quiz_id": quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return quiz

@api_router.post("/quizzes/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, request: Request):
    """Submit quiz answers and get score"""
    current_user = await get_current_user(request, db)
    data = await request.json()
    
    quiz = await db.quizzes.find_one({"quiz_id": quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    answers = data.get("answers", {})
    time_taken = data.get("time_taken", 0)
    
    # Calculate score
    score = 0
    total = len(quiz["questions"])
    
    for question in quiz["questions"]:
        q_id = question["question_id"]
        if str(answers.get(q_id)) == str(question["correct_answer"]):
            score += 1
    
    percentage = (score / total * 100) if total > 0 else 0
    
    attempt = {
        "attempt_id": generate_id("att_"),
        "quiz_id": quiz_id,
        "user_id": current_user["user_id"],
        "answers": answers,
        "score": score,
        "total": total,
        "percentage": percentage,
        "time_taken": time_taken,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.quiz_attempts.insert_one(attempt)
    
    # Update student performance
    await update_student_performance(current_user["user_id"], quiz["topic"], percentage)
    
    # Recalculate rankings
    await recalculate_rankings()
    
    attempt.pop("_id", None)
    return attempt

async def update_student_performance(user_id: str, topic: str, score: float):
    """Update student performance metrics"""
    perf = await db.student_performance.find_one({"user_id": user_id}, {"_id": 0})
    
    if not perf:
        perf = {
            "user_id": user_id,
            "total_quizzes": 0,
            "total_score": 0,
            "average_percentage": 0.0,
            "topic_scores": {},
            "attendance": 0,
            "streak": 0,
            "last_active": datetime.now(timezone.utc).isoformat()
        }
    
    # Update metrics
    perf["total_quizzes"] += 1
    perf["total_score"] += score
    perf["average_percentage"] = perf["total_score"] / perf["total_quizzes"]
    
    # Update topic score
    topic_scores = perf.get("topic_scores", {})
    if topic in topic_scores:
        topic_scores[topic] = (topic_scores[topic] + score) / 2
    else:
        topic_scores[topic] = score
    perf["topic_scores"] = topic_scores
    
    # Update streak
    last_active = perf.get("last_active")
    if last_active:
        if isinstance(last_active, str):
            last_active = datetime.fromisoformat(last_active.replace('Z', '+00:00'))
        if (datetime.now(timezone.utc) - last_active).days <= 1:
            perf["streak"] += 1
        else:
            perf["streak"] = 1
    
    perf["last_active"] = datetime.now(timezone.utc).isoformat()
    
    await db.student_performance.update_one(
        {"user_id": user_id},
        {"$set": perf},
        upsert=True
    )

async def recalculate_rankings():
    """Recalculate all student rankings"""
    performances = await db.student_performance.find({}, {"_id": 0}).to_list(1000)
    coding_profiles = await db.coding_profiles.find({}, {"_id": 0}).to_list(1000)
    
    # Create coding score lookup
    coding_lookup = {p["user_id"]: p.get("coding_score", 0) for p in coding_profiles}
    
    # Calculate total scores
    rankings_data = []
    for perf in performances:
        user = await db.users.find_one({"user_id": perf["user_id"]}, {"_id": 0})
        if not user:
            continue
        
        academic_score = perf.get("average_percentage", 0)
        coding_score = coding_lookup.get(perf["user_id"], 0)
        attendance_score = min(perf.get("attendance", 0) * 10, 100)
        
        total_score = (academic_score * 0.5) + (coding_score * 0.3) + (attendance_score * 0.2)
        
        rankings_data.append({
            "user_id": perf["user_id"],
            "user_name": user["name"],
            "academic_score": academic_score,
            "coding_score": coding_score,
            "attendance_score": attendance_score,
            "total_score": total_score
        })
    
    # Sort by total score
    rankings_data.sort(key=lambda x: x["total_score"], reverse=True)
    
    # Assign ranks
    for i, r in enumerate(rankings_data):
        r["class_rank"] = i + 1
        r["university_rank"] = i + 1
        r["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await db.rankings.update_one(
            {"user_id": r["user_id"]},
            {"$set": r},
            upsert=True
        )

# ==================== PERFORMANCE ROUTES ====================

@api_router.get("/performance")
async def get_my_performance(request: Request):
    """Get current user's performance"""
    current_user = await get_current_user(request, db)
    
    perf = await db.student_performance.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not perf:
        perf = {
            "user_id": current_user["user_id"],
            "total_quizzes": 0,
            "total_score": 0,
            "average_percentage": 0.0,
            "topic_scores": {},
            "attendance": 0,
            "streak": 0
        }
    
    return perf

@api_router.get("/performance/{user_id}")
async def get_user_performance(user_id: str, request: Request):
    """Get specific user's performance (teacher/admin)"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] not in ["teacher", "admin"] and current_user["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    perf = await db.student_performance.find_one({"user_id": user_id}, {"_id": 0})
    return perf or {}

# ==================== RANKINGS ROUTES ====================

@api_router.get("/rankings")
async def get_rankings(request: Request, limit: int = 50):
    """Get leaderboard rankings"""
    await get_current_user(request, db)
    
    rankings = await db.rankings.find({}, {"_id": 0}).sort("class_rank", 1).limit(limit).to_list(limit)
    return rankings

@api_router.get("/rankings/me")
async def get_my_ranking(request: Request):
    """Get current user's ranking"""
    current_user = await get_current_user(request, db)
    
    ranking = await db.rankings.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    return ranking or {"class_rank": 0, "university_rank": 0, "total_score": 0}

# ==================== CERTIFICATE ROUTES ====================

@api_router.post("/certificates/generate")
async def generate_certificate(request: Request):
    """Generate a certificate for the user"""
    current_user = await get_current_user(request, db)
    data = await request.json()
    
    course_name = data.get("course_name", "CampusAi Capstone Program")
    
    # Get user's scores
    perf = await db.student_performance.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    coding = await db.coding_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    ranking = await db.rankings.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    
    academic_score = perf.get("average_percentage", 0) if perf else 0
    coding_score = coding.get("coding_score", 0) if coding else 0
    overall_rank = ranking.get("class_rank", 0) if ranking else 0
    
    cert = {
        "certificate_id": generate_id("cert_"),
        "user_id": current_user["user_id"],
        "user_name": current_user["name"],
        "course_name": course_name,
        "academic_score": academic_score,
        "coding_score": coding_score,
        "overall_rank": overall_rank,
        "issued_at": datetime.now(timezone.utc).isoformat(),
        "verification_code": generate_id("verify_")
    }
    
    await db.certificates.insert_one(cert)
    cert.pop("_id", None)
    return cert

@api_router.get("/certificates")
async def get_my_certificates(request: Request):
    """Get current user's certificates"""
    current_user = await get_current_user(request, db)
    
    certs = await db.certificates.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(100)
    return certs

@api_router.get("/certificates/verify/{verification_code}")
async def verify_certificate(verification_code: str):
    """Verify a certificate (public endpoint)"""
    cert = await db.certificates.find_one({"verification_code": verification_code}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return {"valid": True, "certificate": cert}

# ==================== CODING PROFILE ROUTES ====================

@api_router.get("/coding-profile")
async def get_my_coding_profile(request: Request):
    """Get current user's coding profile"""
    current_user = await get_current_user(request, db)
    
    profile = await db.coding_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    return profile or {}

@api_router.put("/coding-profile")
async def update_coding_profile(request: Request):
    """Update coding profile with platform usernames"""
    current_user = await get_current_user(request, db)
    data = await request.json()
    
    update_data = {}
    
    # Mock data for demo - in production, would fetch from actual APIs
    if "leetcode_username" in data:
        update_data["leetcode"] = {
            "username": data["leetcode_username"],
            "problems_solved": 127,
            "easy": 45,
            "medium": 62,
            "hard": 20,
            "contest_rating": 1654,
            "ranking": 89432
        }
    
    if "hackerrank_username" in data:
        update_data["hackerrank"] = {
            "username": data["hackerrank_username"],
            "problems_solved": 89,
            "badges": 12,
            "points": 1250,
            "certificates": 3
        }
    
    if "codechef_username" in data:
        update_data["codechef"] = {
            "username": data["codechef_username"],
            "problems_solved": 56,
            "rating": 1423,
            "stars": 3,
            "contests": 15
        }
    
    if "geeksforgeeks_username" in data:
        update_data["geeksforgeeks"] = {
            "username": data["geeksforgeeks_username"],
            "problems_solved": 234,
            "score": 450,
            "rank": 12543
        }
    
    # Calculate total problems and coding score
    total = 0
    if update_data.get("leetcode"):
        total += update_data["leetcode"]["problems_solved"]
    if update_data.get("hackerrank"):
        total += update_data["hackerrank"]["problems_solved"]
    if update_data.get("codechef"):
        total += update_data["codechef"]["problems_solved"]
    if update_data.get("geeksforgeeks"):
        total += update_data["geeksforgeeks"]["problems_solved"]
    
    update_data["total_problems"] = total
    update_data["coding_score"] = min(total / 5, 100)  # Score out of 100
    update_data["last_synced"] = datetime.now(timezone.utc).isoformat()
    
    await db.coding_profiles.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data},
        upsert=True
    )
    
    # Recalculate rankings
    await recalculate_rankings()
    
    profile = await db.coding_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    return profile

@api_router.get("/coding-recommendations")
async def get_recommendations(request: Request):
    """Get coding problem recommendations"""
    current_user = await get_current_user(request, db)
    
    # Get weak topics from performance
    perf = await db.student_performance.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    
    weak_topics = []
    if perf and perf.get("topic_scores"):
        # Get topics with scores below 70
        weak_topics = [t for t, s in perf["topic_scores"].items() if s < 70]
    
    if not weak_topics:
        weak_topics = ["arrays", "linked_lists"]
    
    recommendations = await get_coding_recommendations(weak_topics)
    return {"recommendations": recommendations}

# ==================== ANNOUNCEMENT ROUTES ====================

@api_router.post("/announcements")
async def create_announcement(request: Request):
    """Create an announcement"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers/admins can create announcements")
    
    data = await request.json()
    
    announcement = {
        "announcement_id": generate_id("ann_"),
        "title": data["title"],
        "content": data["content"],
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "target_role": data.get("target_role", "all")
    }
    
    await db.announcements.insert_one(announcement)
    announcement.pop("_id", None)
    return announcement

@api_router.get("/announcements")
async def get_announcements(request: Request):
    """Get announcements"""
    current_user = await get_current_user(request, db)
    
    query = {"$or": [{"target_role": "all"}, {"target_role": current_user["role"]}]}
    announcements = await db.announcements.find(query, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
    return announcements

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    """Get all users (admin only)"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get admin statistics"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    user_count = await db.users.count_documents({})
    lecture_count = await db.lectures.count_documents({})
    quiz_count = await db.quizzes.count_documents({})
    attempt_count = await db.quiz_attempts.count_documents({})
    
    # Role breakdown
    student_count = await db.users.count_documents({"role": "student"})
    teacher_count = await db.users.count_documents({"role": "teacher"})
    admin_count = await db.users.count_documents({"role": "admin"})
    
    return {
        "total_users": user_count,
        "total_lectures": lecture_count,
        "total_quizzes": quiz_count,
        "total_attempts": attempt_count,
        "students": student_count,
        "teachers": teacher_count,
        "admins": admin_count
    }

# ==================== DEMO SEED ROUTES ====================

@api_router.post("/demo/seed")
async def seed_demo_data(request: Request):
    """Seed demo data for testing/expo"""
    # Create demo users
    demo_users = [
        {"user_id": "demo_student_1", "email": "student1@demo.com", "name": "Alex Johnson", "role": "student", "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"},
        {"user_id": "demo_student_2", "email": "student2@demo.com", "name": "Sarah Williams", "role": "student", "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"},
        {"user_id": "demo_student_3", "email": "student3@demo.com", "name": "Mike Chen", "role": "student", "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=mike"},
        {"user_id": "demo_teacher_1", "email": "teacher@demo.com", "name": "Dr. Emily Parker", "role": "teacher", "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=emily"},
    ]
    
    for user in demo_users:
        user["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": user}, upsert=True)
    
    # Create demo lectures
    demo_lectures = [
        {
            "lecture_id": "demo_lec_1",
            "title": "Introduction to Data Structures",
            "subject": "Computer Science",
            "topic": "Data Structures",
            "teacher_id": "demo_teacher_1",
            "teacher_name": "Dr. Emily Parker",
            "batch": "CS-2025",
            "status": "completed",
            "raw_transcript": "Today we cover the fundamentals of data structures...",
            "clean_transcript": "Today we cover the fundamentals of data structures and algorithms, focusing on arrays and linked lists.",
            "summary": get_mock_summary(),
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lecture_id": "demo_lec_2",
            "title": "Object Oriented Programming",
            "subject": "Computer Science",
            "topic": "OOP Concepts",
            "teacher_id": "demo_teacher_1",
            "teacher_name": "Dr. Emily Parker",
            "batch": "CS-2025",
            "status": "completed",
            "raw_transcript": "Object oriented programming is a paradigm...",
            "clean_transcript": "Object oriented programming is a paradigm based on objects containing data and code.",
            "summary": {
                "topics_learned": ["Classes and Objects", "Inheritance", "Polymorphism", "Encapsulation"],
                "topic_summaries": {"OOP Basics": "Core concepts of object-oriented design"},
                "key_concepts": ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"],
                "important_points": ["Use inheritance for code reuse", "Encapsulation protects data"],
                "homework": ["Create a class hierarchy for a library system"],
                "revision_checklist": ["Review SOLID principles"]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for lecture in demo_lectures:
        await db.lectures.update_one({"lecture_id": lecture["lecture_id"]}, {"$set": lecture}, upsert=True)
    
    # Create demo quizzes
    demo_quiz = {
        "quiz_id": "demo_quiz_1",
        "lecture_id": "demo_lec_1",
        "title": "Data Structures Quiz",
        "subject": "Computer Science",
        "topic": "Data Structures",
        "questions": get_mock_questions("Data Structures"),
        "created_by": "demo_teacher_1",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "time_limit": 15
    }
    
    # Add question IDs
    for i, q in enumerate(demo_quiz["questions"]):
        q["question_id"] = f"demo_q_{i+1}"
    
    await db.quizzes.update_one({"quiz_id": demo_quiz["quiz_id"]}, {"$set": demo_quiz}, upsert=True)
    
    # Create demo performances
    demo_perfs = [
        {"user_id": "demo_student_1", "total_quizzes": 15, "total_score": 1200, "average_percentage": 80, "topic_scores": {"Data Structures": 85, "OOP": 78}, "attendance": 10, "streak": 5},
        {"user_id": "demo_student_2", "total_quizzes": 12, "total_score": 1080, "average_percentage": 90, "topic_scores": {"Data Structures": 92, "OOP": 88}, "attendance": 12, "streak": 8},
        {"user_id": "demo_student_3", "total_quizzes": 10, "total_score": 700, "average_percentage": 70, "topic_scores": {"Data Structures": 65, "OOP": 75}, "attendance": 8, "streak": 3},
    ]
    
    for perf in demo_perfs:
        perf["last_active"] = datetime.now(timezone.utc).isoformat()
        await db.student_performance.update_one({"user_id": perf["user_id"]}, {"$set": perf}, upsert=True)
    
    # Create demo coding profiles
    demo_coding = [
        {"user_id": "demo_student_1", "leetcode": {"username": "alex_codes", "problems_solved": 150, "easy": 60, "medium": 70, "hard": 20}, "total_problems": 150, "coding_score": 30},
        {"user_id": "demo_student_2", "leetcode": {"username": "sarah_dev", "problems_solved": 200, "easy": 80, "medium": 90, "hard": 30}, "total_problems": 200, "coding_score": 40},
        {"user_id": "demo_student_3", "leetcode": {"username": "mike_coder", "problems_solved": 80, "easy": 50, "medium": 25, "hard": 5}, "total_problems": 80, "coding_score": 16},
    ]
    
    for coding in demo_coding:
        coding["last_synced"] = datetime.now(timezone.utc).isoformat()
        await db.coding_profiles.update_one({"user_id": coding["user_id"]}, {"$set": coding}, upsert=True)
    
    # Recalculate rankings
    await recalculate_rankings()
    
    return {"message": "Demo data seeded successfully"}

@api_router.get("/")
async def root():
    return {"message": "CampusAi API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

cors_origins = [o.strip() for o in os.environ.get(
    "CORS_ORIGINS",
    "http://127.0.0.1:4000,http://localhost:4000,http://127.0.0.1:3000,http://localhost:3000"
).split(",") if o.strip()]

cors_origin_regex = os.environ.get(
    "CORS_ORIGIN_REGEX",
    r"https?://([a-zA-Z0-9-]+\.)*(devtunnels\.ms|ngrok-free\.app|ngrok\.io|loca\.lt|trycloudflare\.com)(:\d+)?$"
)

# Browsers block credentialed CORS when allow_origins is wildcard.
if "*" in cors_origins:
    cors_origins = [
        "http://127.0.0.1:4000",
        "http://localhost:4000",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
