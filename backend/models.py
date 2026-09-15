from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

def generate_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:12]}"

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"  # student, teacher, admin
    class_name: Optional[str] = None  # e.g. "IT-3"
    division: Optional[str] = None    # e.g. "A"
    batch: Optional[str] = None
    batch_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class UserCreate(BaseModel):
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    class_name: Optional[str] = None
    division: Optional[str] = None

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Lecture Models
class Lecture(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lecture_id: str = Field(default_factory=lambda: generate_id("lec_"))
    title: str
    subject: str
    topic: str
    teacher_id: str
    teacher_name: str
    batch: str = "All"
    batch_id: Optional[str] = None
    class_name: Optional[str] = None  # e.g. "IT-3"
    division: Optional[str] = None    # e.g. "A"
    audio_path: Optional[str] = None
    duration: int = 0  # in seconds
    raw_transcript: Optional[str] = None
    clean_transcript: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    analysis_status: str = "missing"  # missing, stale, processing, generated, failed
    analysis_version: int = 1
    analysis_generated_at: Optional[datetime] = None
    transcript_hash: Optional[str] = None
    analysis_error: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, transcribing, processing, completed

class LectureCreate(BaseModel):
    title: str
    subject: str
    topic: str
    batch: str = "All"
    batch_id: Optional[str] = None
    class_name: Optional[str] = None
    division: Optional[str] = None

# Quiz Models
class QuizQuestion(BaseModel):
    question_id: str = Field(default_factory=lambda: generate_id("q_"))
    question: str
    options: List[str]
    correct_answer: int
    difficulty: str = "medium"
    explanation: Optional[str] = None

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    quiz_id: str = Field(default_factory=lambda: generate_id("quiz_"))
    lecture_id: Optional[str] = None
    title: str
    subject: str
    topic: str
    questions: List[QuizQuestion] = []
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    time_limit: int = 30  # minutes
    
class QuizAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    attempt_id: str = Field(default_factory=lambda: generate_id("att_"))
    quiz_id: str
    user_id: str
    answers: Dict[str, int] = {}  # question_id -> selected option
    score: int = 0
    total: int = 0
    percentage: float = 0.0
    time_taken: int = 0  # seconds
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Performance Models
class StudentPerformance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    total_quizzes: int = 0
    total_score: int = 0
    average_percentage: float = 0.0
    topic_scores: Dict[str, float] = {}  # topic -> avg score
    attendance: int = 0
    streak: int = 0
    last_active: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Certificate Models
class Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    certificate_id: str = Field(default_factory=lambda: generate_id("cert_"))
    user_id: str
    user_name: str
    course_name: str
    academic_score: float
    coding_score: float
    overall_rank: int
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pdf_path: Optional[str] = None
    verification_code: str = Field(default_factory=lambda: generate_id("verify_"))

# Coding Profile Models
class CodingProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    leetcode: Optional[Dict[str, Any]] = None
    hackerrank: Optional[Dict[str, Any]] = None
    codechef: Optional[Dict[str, Any]] = None
    geeksforgeeks: Optional[Dict[str, Any]] = None
    total_problems: int = 0
    coding_score: float = 0.0
    last_synced: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Ranking Model
class Ranking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    user_name: str
    class_rank: int = 0
    university_rank: int = 0
    academic_score: float = 0.0
    coding_score: float = 0.0
    attendance_score: float = 0.0
    total_score: float = 0.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Announcement Model
class Announcement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    announcement_id: str = Field(default_factory=lambda: generate_id("ann_"))
    title: str
    content: str
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    target_role: str = "all"  # all, student, teacher

# Chat History Model
class ChatHistory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    chat_id: str = Field(default_factory=lambda: generate_id("chat_"))
    user_id: str
    user_role: str  # student or teacher
    user_message: str
    ai_response: str
    intent: str  # student_performance, teacher_class_analysis, etc.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
