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
import re
from pathlib import Path
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import aiofiles
import json

from models import (
    User, UserCreate, Lecture, LectureCreate, Quiz, QuizQuestion,
    QuizAttempt, Certificate, CodingProfile, Ranking, Announcement,
    StudentPerformance, ChatHistory, generate_id,
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
        generate_quiz_questions, generate_chat_response, chat_with_classroom_ai,
        get_coding_recommendations, get_mock_questions
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

    async def generate_chat_response(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    async def chat_with_classroom_ai(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

    async def get_coding_recommendations(*args, **kwargs):
        raise HTTPException(status_code=503, detail=f"AI service unavailable: {AI_IMPORT_ERROR}")

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

    if "topics" in summary and "topics_learned" not in summary:
        summary["topics_learned"] = summary.get("topics", [])

    if "practice_questions" in summary and "exam_questions" not in summary:
        summary["exam_questions"] = summary.get("practice_questions", [])

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


def transcript_hash(transcript: str) -> str:
    """Return a stable fingerprint for the transcript used to generate notes."""
    return hashlib.sha256((transcript or "").strip().encode("utf-8")).hexdigest()


def analysis_is_current(lecture: dict) -> bool:
    """Check that saved analysis belongs to the current stored transcript."""
    transcript = lecture.get("clean_transcript") or lecture.get("raw_transcript")
    return bool(
        transcript
        and isinstance(lecture.get("summary"), dict)
        and lecture.get("analysis_status") == "generated"
        and lecture.get("transcript_hash") == transcript_hash(transcript)
    )


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


def _resolve_follow_up_topic(message: str, history: Optional[List[dict]] = None) -> str:
    """Resolve pronoun-style follow-up prompts using previous chat content."""
    msg = (message or "").strip()
    if not msg:
        return ""
    lowered = msg.lower()

    pronoun_patterns = [
        r"^explain\s+(it|this|that|the topic)$",
        r"^summarize\s+(it|this|that|the topic)$",
        r"^tell me about\s+(it|this|that|the topic)$",
        r"^what is\s+(it|this|that|the topic)$",
        r"^create a quiz on\s+(it|this|that|the topic)$",
        r"^give me a quiz on\s+(it|this|that|the topic)$",
        r"^quiz on\s+(it|this|that|the topic)$",
    ]
    for pattern in pronoun_patterns:
        if re.match(pattern, lowered):
            history = history or []
            for item in reversed(history):
                text = str((item or {}).get("content") or "").strip()
                if not text:
                    continue
                # Look for patterns like "Your weakest topic is Data Structures" or "Topic is X"
                topic_match = re.search(r"(?:weakest topic|topic|most difficult topic|weak topic)\s+(?:is\s+)?([A-Za-z][A-Za-z0-9\s&/-]*?)(?:\s+at\s+\d+%|\.|,|$)", text, flags=re.IGNORECASE)
                if topic_match:
                    captured = topic_match.group(1).strip()
                    if captured and not "not enough data" in captured.lower():
                        return captured
            return ""

    return msg


def _detect_chat_intent(message: str, role: str) -> str:
    """Map a user message to a classroom-related intent."""
    msg = (message or "").lower()
    if role == "teacher":
        if any(k in msg for k in ["analyze my class", "class performance", "class", "students need help", "weakest topic", "class analysis"]):
            return "teacher_class_analysis"
        if any(k in msg for k in ["weak topics", "difficult topic", "topic is difficult", "weakest topics"]):
            return "teacher_weak_topics"
        if any(k in msg for k in ["students need help", "at risk", "below 60", "low scores", "which students"]):
            return "teacher_student_analysis"
        if any(k in msg for k in ["quiz", "quiz analysis", "most difficult", "lowest performance", "performance in the last quiz"]):
            return "teacher_quiz_analysis"
        if any(k in msg for k in ["revision plan", "teaching recommendation", "recommendation", "create a revision", "plan for my class"]):
            return "teacher_revision_plan"
        if any(k in msg for k in ["create quiz", "generate quiz", "quiz on"]):
            return "teacher_quiz_generation"
        return "teacher_general_question"

    if any(k in msg for k in ["weak topic", "weak topics", "my performance", "progress", "ranking", "quiz analysis", "what should i study", "study plan", "how am i performing"]):
        return "student_performance"
    if any(k in msg for k in ["code", "coding", "problem", "recommend coding", "leetcode", "hackerrank"]):
        return "student_coding_recommendation"
    if any(k in msg for k in ["lecture", "summarize", "explain", "today's lecture", "topic"]):
        return "student_lecture_help"
    if any(k in msg for k in ["quiz", "take a quiz", "questions", "my quiz"]):
        return "student_quiz_request"
    return "student_general_question"


async def _get_student_chat_context(current_user: dict, message: str, lecture_id: Optional[str] = None) -> dict:
    """Collect role-scoped data for a student chat request."""
    user_id = current_user.get("user_id")
    if not user_id:
        return {"message": message, "role": "student"}

    performance = await db.student_performance.find_one({"user_id": user_id}, {"_id": 0}) or {}
    coding = await db.coding_profiles.find_one({"user_id": user_id}, {"_id": 0}) or {}
    ranking = await db.rankings.find_one({"user_id": user_id}, {"_id": 0}) or {}
    recent_attempts = await db.quiz_attempts.find({"user_id": user_id}, {"_id": 0}).sort("submitted_at", -1).limit(5).to_list(5)

    topic_scores = performance.get("topic_scores", {}) or {}
    weak_topics = {topic: score for topic, score in topic_scores.items() if isinstance(score, (int, float)) and score < 70}
    sorted_weak_topics = sorted(weak_topics.items(), key=lambda item: item[1])

    class_name = current_user.get("class_name")
    division = current_user.get("division")
    lecture_query = {}
    if class_name:
        lecture_query["$or"] = [
            {"class_name": {"$exists": False}},
            {"class_name": None},
            {"class_name": "All"},
            {"class_name": class_name, "division": {"$in": [None, "All", division]}}
        ]

    lectures = await db.lectures.find(lecture_query, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)
    current_lecture = None
    if lecture_id:
        current_lecture = await db.lectures.find_one(
            {"lecture_id": lecture_id, **lecture_query},
            {"_id": 0, "lecture_id": 1, "title": 1, "clean_transcript": 1, "raw_transcript": 1},
        )

    return {
        "role": "student",
        "user": {
            "name": current_user.get("name"),
            "class_name": class_name,
            "division": division,
        },
        "performance": performance,
        "weak_topics": dict(sorted_weak_topics[:5]),
        "recent_quiz_attempts": recent_attempts,
        "coding_profile": coding,
        "ranking": ranking,
        "lectures": lectures,
        "current_lecture": current_lecture,
        "message": message,
    }


async def _get_teacher_chat_context(current_user: dict, message: str, lecture_id: Optional[str] = None) -> dict:
    """Collect authorized class-level data for a teacher chat request."""
    class_name = current_user.get("class_name")
    division = current_user.get("division")
    user_id = current_user.get("user_id")

    students = []
    if class_name:
        student_docs = await db.users.find({
            "role": "student",
            "class_name": class_name,
            "division": division,
        }, {"_id": 0, "password_hash": 0}).to_list(200)
        for student in student_docs:
            perf = await db.student_performance.find_one({"user_id": student.get("user_id")}, {"_id": 0}) or {}
            ranking = await db.rankings.find_one({"user_id": student.get("user_id")}, {"_id": 0}) or {}
            students.append({
                "user": student,
                "performance": perf,
                "ranking": ranking,
            })
    else:
        students = []

    current_lecture = None
    if lecture_id:
        current_lecture = await db.lectures.find_one(
            {"lecture_id": lecture_id, "teacher_id": user_id},
            {"_id": 0, "lecture_id": 1, "title": 1, "clean_transcript": 1, "raw_transcript": 1},
        )

    topic_totals = {}
    topic_counts = {}
    for item in students:
        perf = item.get("performance", {}) or {}
        for topic, score in (perf.get("topic_scores", {}) or {}).items():
            if not isinstance(score, (int, float)):
                continue
            topic_totals[topic] = topic_totals.get(topic, 0) + float(score)
            topic_counts[topic] = topic_counts.get(topic, 0) + 1

    weak_topics = {}
    for topic, total in topic_totals.items():
        weak_topics[topic] = total / max(1, topic_counts.get(topic, 1))

    at_risk = [
        entry for entry in students
        if (entry.get("performance", {}) or {}).get("average_percentage", 0) < 60
    ]

    class_average = 0
    if students:
        scores = [
            float((item.get("performance", {}) or {}).get("average_percentage", 0))
            for item in students
            if isinstance((item.get("performance", {}) or {}).get("average_percentage", 0), (int, float))
        ]
        class_average = round(sum(scores) / len(scores), 2) if scores else 0

    class_lectures = []
    if class_name:
        class_lectures = await db.lectures.find({
            "teacher_id": user_id,
            "class_name": class_name,
            "division": division,
        }, {"_id": 0}).sort("created_at", -1).limit(10).to_list(10)

    return {
        "role": "teacher",
        "teacher": {
            "name": current_user.get("name"),
            "class_name": class_name,
            "division": division,
        },
        "students": students,
        "student_count": len(students),
        "class_average": class_average,
        "weak_topics": dict(sorted(weak_topics.items(), key=lambda item: item[1])[:5]),
        "students_needing_support": len(at_risk),
        "lectures": class_lectures,
        "current_lecture": current_lecture,
        "message": message,
    }


@api_router.post("/chat")
async def chat(request: Request):
    """Generate a role-aware classroom chat response using the authenticated user's data."""
    current_user = await get_current_user(request, db)
    role = (current_user.get("role") or "student").strip().lower()
    user_id = current_user.get("user_id")

    data = await request.json()
    message = str(data.get("message", "")).strip()
    lecture_id = str(data.get("lecture_id", "")).strip() or None
    frontend_history = data.get("history") or []
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    # Fetch persistent history from database (last 5 messages for context)
    db_history_raw = await db.chat_history.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    # Convert DB history to the same format as frontend history
    db_history = []
    for entry in reversed(db_history_raw):  # Reverse to get chronological order
        db_history.append({"role": "user", "content": entry.get("user_message", "")})
        db_history.append({"role": "assistant", "content": entry.get("ai_response", "")})

    
    # Merge frontend history (more recent) with DB history
    merged_history = db_history + frontend_history

    # Try to resolve follow-up prompts like "Explain it"
    resolved_topic = _resolve_follow_up_topic(message, merged_history)
    if resolved_topic and resolved_topic != message:
        # Replace the pronoun with the actual topic
        message = re.sub(r'\b(it|this|that|the topic)\b', resolved_topic, message, flags=re.IGNORECASE)

    intent = _detect_chat_intent(message, role)
    if role == "student":
        context = await _get_student_chat_context(current_user, message, lecture_id)
    elif role == "teacher":
        context = await _get_teacher_chat_context(current_user, message, lecture_id)
    else:
        context = {"role": role, "message": message}

    response = await chat_with_classroom_ai(message, role, intent, context)
    if not response:
        raise HTTPException(status_code=503, detail="Sorry, I couldn't generate a response right now. Please try again.")
    return {"response": response, "role": role, "intent": intent}


@api_router.post("/chat/history/save")
async def save_chat_history(request: Request):
    """Save a chat message and response to persistent history."""
    current_user = await get_current_user(request, db)
    data = await request.json()
    
    user_message = str(data.get("message", "")).strip()
    ai_response = str(data.get("response", "")).strip()
    intent = str(data.get("intent", "")).strip()
    role = (current_user.get("role") or "student").strip().lower()
    
    if not user_message or not ai_response:
        raise HTTPException(status_code=400, detail="Message and response are required")
    
    chat_entry = {
        "chat_id": f"chat_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.get("user_id"),
        "user_role": role,
        "user_message": user_message,
        "ai_response": ai_response,
        "intent": intent,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    result = await db.chat_history.insert_one(chat_entry)
    return {"success": True, "chat_id": chat_entry["chat_id"]}


@api_router.get("/chat/history")
async def get_chat_history(request: Request, limit: int = 10):
    """Retrieve recent chat history for the current user."""
    current_user = await get_current_user(request, db)
    user_id = current_user.get("user_id")
    
    if limit < 1 or limit > 50:
        limit = 10
    
    history = await db.chat_history.find(
        {"user_id": user_id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Reverse to get chronological order (oldest first)
    history.reverse()
    
    # Format for frontend consumption
    formatted_history = []
    for entry in history:
        formatted_history.append({
            "role": "user",
            "content": entry.get("user_message", ""),
        })
        formatted_history.append({
            "role": "assistant",
            "content": entry.get("ai_response", ""),
        })
    
    return {"history": formatted_history}

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
    class_name = (data.get("class_name") or "").strip() or None
    division = (data.get("division") or "").strip() or None

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
        "class_name": class_name,
        "division": division,
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


@api_router.put("/auth/profile")
async def update_profile(request: Request):
    """Update the current user's profile (name, class_name, division)."""
    current_user = await get_current_user(request, db)
    data = await request.json()

    allowed_fields = {}
    if "name" in data and data["name"]:
        allowed_fields["name"] = data["name"].strip()
    if "class_name" in data:
        allowed_fields["class_name"] = (data["class_name"] or "").strip() or None
    if "division" in data:
        allowed_fields["division"] = (data["division"] or "").strip() or None

    if not allowed_fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": allowed_fields}
    )
    updated = await db.users.find_one(
        {"user_id": current_user["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    return updated


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

async def get_teacher_classroom_options(current_user: dict) -> dict:
    """Build classroom choices from students assigned to this teacher's profile."""
    class_name = current_user.get("class_name")
    division = current_user.get("division")
    if not class_name or not division:
        return {"classes": [], "divisions": [], "batches": []}

    students = await db.users.find(
        {"role": "student", "class_name": class_name, "division": division},
        {"_id": 0, "class_name": 1, "division": 1, "batch": 1, "batch_id": 1, "batch_name": 1},
    ).to_list(10000)
    batches = {}
    for student in students:
        batch_id = student.get("batch_id") or student.get("batch")
        if batch_id is None or str(batch_id).strip() == "":
            continue
        batch_id = str(batch_id)
        batch_name = str(student.get("batch_name") or student.get("batch") or batch_id)
        batches[batch_id] = {"id": batch_id, "name": batch_name}

    return {
        "classes": [{"id": class_name, "name": class_name}],
        "divisions": [{"id": division, "name": division}],
        "batches": sorted(batches.values(), key=lambda item: item["name"]),
    }


@api_router.get("/classroom/options")
async def get_classroom_options(request: Request):
    """Return only the current teacher's class, division, and student batches."""
    current_user = await get_current_user(request, db)
    if current_user.get("role") not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can view classroom options")
    return await get_teacher_classroom_options(current_user)

@api_router.get("/teacher/analytics")
async def get_teacher_analytics(request: Request):
    """Return real, teacher-scoped classroom analytics."""
    current_user = await get_current_user(request, db)
    if current_user.get("role") not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can view classroom analytics")

    teacher_id = current_user["user_id"]
    class_name = current_user.get("class_name")
    division = current_user.get("division")
    student_query = {"role": "student"}
    if class_name:
        student_query.update({"class_name": class_name, "division": division})
    else:
        student_query["user_id"] = {"$exists": False}

    students = await db.users.find(student_query, {"_id": 0, "user_id": 1}).to_list(10000)
    student_ids = [student["user_id"] for student in students if student.get("user_id")]
    performances = await db.student_performance.find(
        {"user_id": {"$in": student_ids}},
        {"_id": 0, "user_id": 1, "average_percentage": 1, "topic_scores": 1},
    ).to_list(10000)
    scores = [
        float(item["average_percentage"])
        for item in performances
        if isinstance(item.get("average_percentage"), (int, float))
        and item.get("average_percentage") is not None
    ]
    class_average = round(sum(scores) / len(scores), 2) if scores else None
    class_level = None
    if class_average is not None:
        class_level = "Beginner" if class_average < 60 else "Intermediate" if class_average < 80 else "Advanced"

    lectures = await db.lectures.find(
        {"teacher_id": teacher_id},
        {"_id": 0, "lecture_id": 1, "title": 1, "created_at": 1},
    ).sort("created_at", -1).to_list(10000)
    quizzes = await db.quizzes.find(
        {"created_by": teacher_id},
        {"_id": 0, "quiz_id": 1, "title": 1, "topic": 1, "created_at": 1},
    ).sort("created_at", -1).to_list(10000)
    quiz_ids = [quiz["quiz_id"] for quiz in quizzes if quiz.get("quiz_id")]
    quiz_lookup = {quiz["quiz_id"]: quiz for quiz in quizzes}
    attempts = await db.quiz_attempts.find(
        {"user_id": {"$in": student_ids}, "quiz_id": {"$in": quiz_ids}},
        {"_id": 0, "quiz_id": 1, "percentage": 1, "submitted_at": 1},
    ).sort("submitted_at", -1).to_list(10000)

    assessment_totals = {}
    for attempt in attempts:
        quiz_id = attempt.get("quiz_id")
        percentage = attempt.get("percentage")
        if quiz_id not in quiz_lookup or not isinstance(percentage, (int, float)):
            continue
        assessment = assessment_totals.setdefault(quiz_id, {"scores": [], "submitted_at": attempt.get("submitted_at")})
        assessment["scores"].append(float(percentage))
        if attempt.get("submitted_at") and (not assessment["submitted_at"] or attempt["submitted_at"] > assessment["submitted_at"]):
            assessment["submitted_at"] = attempt["submitted_at"]
    performance_trend = []
    for quiz_id, assessment in assessment_totals.items():
        if assessment["scores"]:
            quiz = quiz_lookup[quiz_id]
            performance_trend.append({
                "quiz_id": quiz_id,
                "label": quiz.get("title") or quiz.get("topic") or "Assessment",
                "score": round(sum(assessment["scores"]) / len(assessment["scores"]), 2),
                "submitted_at": assessment["submitted_at"],
            })
    performance_trend.sort(key=lambda item: item.get("submitted_at") or "")

    return {
        "teacher": {"name": current_user.get("name"), "class_name": class_name, "division": division},
        "student_count": len(student_ids),
        "lecture_count": len(lectures),
        "quiz_count": len(quizzes),
        "average_score": class_average,
        "class_level": class_level,
        "performance_trend": performance_trend[-12:],
    }

@api_router.post("/lectures")
async def create_lecture(request: Request):
    """Create a new lecture entry"""
    current_user = await get_current_user(request, db)
    
    if current_user["role"] not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Only teachers can create lectures")
    
    data = await request.json()
    
    class_name = current_user.get("class_name")
    division = current_user.get("division")
    if data.get("class_name") and data["class_name"] != class_name:
        raise HTTPException(status_code=403, detail="You are not authorized for this class")
    if data.get("division") and data["division"] != division:
        raise HTTPException(status_code=403, detail="You are not authorized for this division")

    options = await get_teacher_classroom_options(current_user)
    batch_id = data.get("batch_id") or None
    valid_batches = {batch["id"]: batch["name"] for batch in options["batches"]}
    if batch_id is not None and str(batch_id) not in valid_batches:
        raise HTTPException(status_code=400, detail="Batch is not available for this class and division")
    batch_name = valid_batches.get(str(batch_id), "All Students")

    lecture = {
        "lecture_id": generate_id("lec_"),
        "title": data["title"],
        "subject": data["subject"],
        "topic": data["topic"],
        "teacher_id": current_user["user_id"],
        "teacher_name": current_user["name"],
        "batch": batch_name,
        "batch_id": str(batch_id) if batch_id is not None else None,
        "batch_scope": "class_division",
        "class_name": class_name,
        "division": division,
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
        await db.lectures.update_one(
            {"lecture_id": lecture_id},
            {"$set": {"status": "failed", "analysis_error": str(error)}}
        )
        raise HTTPException(status_code=502, detail="Unable to generate lecture analysis. Please try again.") from error
    
    # Update lecture
    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {
            "raw_transcript": raw_transcript,
            "clean_transcript": clean,
            "summary": summary,
            "analysis_status": "generated",
            "analysis_version": 1,
            "analysis_generated_at": datetime.now(timezone.utc).isoformat(),
            "transcript_hash": transcript_hash(clean),
            "analysis_error": None,
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
        await db.lectures.update_one(
            {"lecture_id": lecture_id},
            {"$set": {"status": "failed", "analysis_error": str(error)}}
        )
        raise HTTPException(status_code=502, detail="Unable to generate lecture analysis. Please try again.") from error

    await db.lectures.update_one(
        {"lecture_id": lecture_id},
        {"$set": {
            "clean_transcript": clean,
            "summary": summary,
            "analysis_status": "generated",
            "analysis_version": 1,
            "analysis_generated_at": datetime.now(timezone.utc).isoformat(),
            "transcript_hash": transcript_hash(clean),
            "analysis_error": None,
            "status": "completed"
        }}
    )

    updated = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    return updated

@api_router.get("/lectures")
async def get_lectures(request: Request, subject: Optional[str] = None, limit: int = 20):
    """Get all lectures, scoped by role."""
    current_user = await get_current_user(request, db)
    role = current_user.get("role", "student")

    query = {}
    if subject:
        query["subject"] = subject

    if role == "teacher":
        # Teachers see ONLY the lectures they personally created.
        teacher_filter = {"teacher_id": current_user["user_id"]}
        if query:
            query = {"$and": [query, teacher_filter]}
        else:
            query = teacher_filter

    elif role == "student":
        class_name = current_user.get("class_name")
        division = current_user.get("division")
        class_filter = {"class_name": class_name, "division": division}
        student_batch_id = current_user.get("batch_id") or current_user.get("batch")
        if student_batch_id:
            class_filter["$or"] = [
                {"batch_id": None},
                {"batch_id": {"$exists": False}},
                {"batch_id": str(student_batch_id)},
                {"batch": str(student_batch_id)},
                {"batch": "All"},
                {"batch": "All Students"},
            ]
        if query:
            query = {"$and": [query, class_filter]}
        else:
            query = class_filter

    # Admins: no additional filter — they see everything.

    lectures = await db.lectures.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return lectures

@api_router.get("/lectures/{lecture_id}")
async def get_lecture(lecture_id: str, request: Request):
    """Get a specific lecture with role-based access control."""
    current_user = await get_current_user(request, db)
    role = current_user.get("role", "student")

    lecture = await db.lectures.find_one({"lecture_id": lecture_id}, {"_id": 0})
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")

    if role == "teacher":
        # Teachers can only access lectures they personally own.
        if lecture.get("teacher_id") != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not own this lecture."
            )

    elif role == "student":
        lec_class = lecture.get("class_name")
        lec_div = lecture.get("division")
        user_class = current_user.get("class_name")
        user_div = current_user.get("division")

        if lec_class != user_class or lec_div != user_div:
            raise HTTPException(status_code=403, detail="Access denied: This lecture is assigned to a different classroom.")
        student_batch_id = current_user.get("batch_id") or current_user.get("batch")
        lecture_batch_id = lecture.get("batch_id")
        if lecture_batch_id and str(lecture_batch_id) != str(student_batch_id):
            raise HTTPException(status_code=403, detail="Access denied: This lecture is assigned to a different batch.")

    # Do not expose stale notes as current analysis. The frontend can then
    # regenerate them from this lecture's transcript without losing the lecture.
    if not analysis_is_current(lecture):
        lecture["analysis_status"] = "stale" if lecture.get("summary") else "missing"
        lecture["summary"] = None

    # Admins can access any lecture.
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
        # Students
        {
            "user_id": "demo_student_1", "email": "student1@demo.com",
            "name": "Alex Johnson", "role": "student",
            "class_name": "B.Tech IT", "division": "A",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
        },
        {
            "user_id": "demo_student_2", "email": "student2@demo.com",
            "name": "Sarah Williams", "role": "student",
            "class_name": "B.Tech IT", "division": "B",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
        },
        {
            "user_id": "demo_student_3", "email": "student3@demo.com",
            "name": "Mike Chen", "role": "student",
            "class_name": "B.Tech IT", "division": "A",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=mike"
        },
        # Teachers — each owns a separate division
        {
            "user_id": "demo_teacher_1", "email": "teacher@demo.com",
            "name": "Dr. Emily Parker", "role": "teacher",
            "class_name": "B.Tech IT", "division": "A",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=emily"
        },
        {
            "user_id": "demo_teacher_2", "email": "teacher2@demo.com",
            "name": "Prof. Raj Mehta", "role": "teacher",
            "class_name": "B.Tech IT", "division": "B",
            "picture": "https://api.dicebear.com/7.x/avataaars/svg?seed=raj"
        },
    ]
    
    for user in demo_users:
        user["password_hash"] = hash_password("demo123")
        user["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": user}, upsert=True)
    
    # Create demo lectures — scoped by teacher_id + class_name + division
    demo_lectures = [
        # Teacher A (Emily Parker) → B.Tech IT / Division A
        {
            "lecture_id": "demo_lec_1",
            "title": "Introduction to Data Structures",
            "subject": "Computer Science",
            "topic": "Data Structures",
            "teacher_id": "demo_teacher_1",
            "teacher_name": "Dr. Emily Parker",
            "batch": "CS-2025",
            "class_name": "B.Tech IT",
            "division": "A",
            "status": "pending",
            "raw_transcript": None,
            "clean_transcript": None,
            "summary": None,
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
            "class_name": "B.Tech IT",
            "division": "A",
            "status": "pending",
            "raw_transcript": None,
            "clean_transcript": None,
            "summary": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Teacher B (Raj Mehta) → B.Tech IT / Division B
        {
            "lecture_id": "demo_lec_3",
            "title": "Database Management Systems",
            "subject": "Database",
            "topic": "SQL Fundamentals",
            "teacher_id": "demo_teacher_2",
            "teacher_name": "Prof. Raj Mehta",
            "batch": "CS-2025",
            "class_name": "B.Tech IT",
            "division": "B",
            "status": "pending",
            "raw_transcript": None,
            "clean_transcript": None,
            "summary": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "lecture_id": "demo_lec_4",
            "title": "Computer Networks",
            "subject": "Networking",
            "topic": "OSI Model",
            "teacher_id": "demo_teacher_2",
            "teacher_name": "Prof. Raj Mehta",
            "batch": "CS-2025",
            "class_name": "B.Tech IT",
            "division": "B",
            "status": "pending",
            "raw_transcript": None,
            "clean_transcript": None,
            "summary": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
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
    "http://127.0.0.1:4000,http://localhost:4000"
).split(",") if o.strip()]
for local_origin in (
    "http://127.0.0.1:4000",
    "http://localhost:4000",
):
    if local_origin not in cors_origins:
        cors_origins.append(local_origin)

cors_origin_regex = os.environ.get(
    "CORS_ORIGIN_REGEX",
    r"https?://(?:localhost|127\.0\.0\.1):4000$|https?://([a-zA-Z0-9-]+\.)*(devtunnels\.ms|ngrok-free\.app|ngrok\.io|loca\.lt|trycloudflare\.com)(:\d+)?$"
)

# Browsers block credentialed CORS when allow_origins is wildcard.
if "*" in cors_origins:
    cors_origins = [
        "http://127.0.0.1:4000",
        "http://localhost:4000",
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
