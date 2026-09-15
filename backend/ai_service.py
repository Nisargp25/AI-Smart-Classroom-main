import os
import json
import base64
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# This backend talks to Groq directly via HTTP. Keep the credential explicit so
# we do not accidentally route through a different provider such as Vercel AI Gateway.
LLM_API_KEY = os.environ.get("GROQ_API_KEY") or os.environ.get("LLM_API_KEY") or ""

# Map friendly model names to Groq API model IDs
GROQ_MODEL_MAP = {
    "groq/llama-3.3-70b-versatile": "openai/gpt-oss-120b",
    "groq/llama-3.1-8b-instant": "openai/gpt-oss-20b",
    "groq/mixtral-8x7b-32768": "openai/gpt-oss-20b",
    "groq/gemma2-9b-it": "openai/gpt-oss-20b",
}
LLM_MODEL = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")
GROQ_MODEL = GROQ_MODEL_MAP.get(LLM_MODEL, LLM_MODEL)
# Quiz generation uses a fast instant model so teachers get results quickly.
LLM_QUIZ_MODEL = os.getenv("LLM_QUIZ_MODEL", "openai/gpt-oss-20b")
GROQ_QUIZ_MODEL = GROQ_MODEL_MAP.get(LLM_QUIZ_MODEL, LLM_QUIZ_MODEL)
GROQ_BASE = "https://api.groq.com/openai/v1"


def _call_llm(prompt: str, system_instruction: Optional[str] = None, max_retries: int = 1, model: Optional[str] = None, max_tokens: int = 4096, json_mode: bool = False) -> str:
    """Call Groq API via direct HTTP request using httpx.

    Retries transient failures (429 rate limit / 5xx) with exponential backoff.
    Logs errors so silent fallbacks are avoidable. Returns empty string only
    after exhausting retries so callers fall back to mock data.

    model: optional model id override (e.g. a fast "instant" model).
    max_tokens: optional token cap override (smaller = faster responses).
    json_mode: if True, request Groq's structured JSON output so the model
        returns complete, parseable JSON (prevents mid-JSON early stopping).
    """
    if not LLM_API_KEY or LLM_API_KEY.strip() == "":
        print("LLM API key is not configured; skipping LLM call.")
        return ""

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    request_body = {
        "model": model or GROQ_MODEL,
        "messages": messages,
        "temperature": 0.1,
        "max_tokens": max_tokens,
    }
    if json_mode:
        request_body["response_format"] = {"type": "json_object"}

    import time as _time
    retries = 0
    while retries <= max_retries:
        try:
            with httpx.Client(timeout=120) as client:
                response = client.post(
                    f"{GROQ_BASE}/chat/completions",
                    json=request_body,
                    headers={
                        "Authorization": f"Bearer {LLM_API_KEY}",
                        "Content-Type": "application/json",
                    },
                )
                if response.status_code in (429, 403, 500, 502, 503, 504):
                    retry_after = float(response.headers.get("retry-after", 0) or 0) or (2 ** retries)
                    print(f"Groq API transient error {response.status_code}; "
                          f"retrying in {retry_after:.1f}s (attempt {retries + 1}/{max_retries + 1})")
                    if retries < max_retries:
                        _time.sleep(retry_after)
                        retries += 1
                        continue
                    return ""
                response.raise_for_status()
                data = response.json()
        except Exception as exc:
            print(f"Groq API exception: {type(exc).__name__}: {exc}")
            if retries < max_retries:
                _time.sleep(2 ** retries)
                retries += 1
                continue
            return ""

        choices = data.get("choices", [])
        if choices:
            return (choices[0].get("message", {}).get("content", "") or "").strip()
        return ""

    return ""


async def generate_chat_response(message: str) -> str:
    """Generate a chat response with the configured Groq model."""
    system_instruction = (
        "You are CampusAI, a helpful classroom assistant. Answer the user's "
        "question clearly and at an appropriate level for a student."
    )
    return _call_llm(message.strip(), system_instruction, model="openai/gpt-oss-120b", max_tokens=1024)


def _build_fallback_chat_response(message: str, role: str, context: Dict[str, Any]) -> str:
    """Generate a deterministic classroom-aware response without external LLM calls."""
    role_name = (role or "student").strip().lower() or "student"
    clean_message = (message or "").strip()

    if role_name == "teacher":
        students = (context or {}).get("students") or []
        class_average = float((context or {}).get("class_average") or 0)
        weak_topics = (context or {}).get("weak_topics") or {}
        support_count = (context or {}).get("students_needing_support") or 0
        teacher_name = ((context or {}).get("teacher") or {}).get("name") or "teacher"

        if not students and class_average == 0 and not weak_topics:
            return "I don't have enough class data to analyze your section yet."

        top_topic = next(iter(sorted(weak_topics.items(), key=lambda item: item[1])) , None)
        top_topic_name = top_topic[0] if top_topic else None
        top_topic_score = top_topic[1] if top_topic else None

        response_bits = [
            f"I analyzed your authorized class data for {teacher_name}.",
            f"The class average is {class_average:.0f}%.",
        ]
        if top_topic_name and top_topic_score is not None:
            response_bits.append(f"The weakest topic is {top_topic_name} at {top_topic_score:.0f}%.")
        if support_count:
            response_bits.append(f"{support_count} students are below 60% and may need support.")
        else:
            response_bits.append("Most students are in a stable range, so the class is generally trending well.")
        response_bits.append("Recommendation: focus revision on the weakest topic and run a short targeted quiz or revision session.")
        return " ".join(response_bits)

    performance = (context or {}).get("performance") or {}
    weak_topics = (context or {}).get("weak_topics") or {}
    ranking = (context or {}).get("ranking") or {}
    avg_score = float(performance.get("average_percentage", 0) or 0)
    user_name = ((context or {}).get("user") or {}).get("name") or "student"

    if not performance and not weak_topics and not ranking:
        return "I don't have enough data to determine that yet."

    top_topic = next(iter(sorted(weak_topics.items(), key=lambda item: item[1])), None)
    top_topic_name = top_topic[0] if top_topic else None
    top_topic_score = top_topic[1] if top_topic else None

    # Check if the message is asking to explain a specific topic
    explain_match = re.search(r'explain\s+(\w+(?:\s+\w+)?)', clean_message.lower())
    if explain_match:
        topic_to_explain = explain_match.group(1).strip()
        response_bits = [
            f"Regarding {topic_to_explain}: I analyzed your recent performance with {user_name}.",
        ]
        if top_topic_name and top_topic_name.lower() == topic_to_explain.lower():
            response_bits.append(f"{topic_to_explain.title()} is your weakest topic at {top_topic_score:.0f}%.")
            response_bits.append(f"This is an important area to focus on. Review the core concepts, solve practice problems, and take targeted quizzes to improve.")
        else:
            response_bits.append(f"Focus on understanding the fundamental concepts of {topic_to_explain}.")
            response_bits.append("Practice problems and worked examples are key to mastering this topic.")
        return " ".join(response_bits)

    response_bits = [f"I analyzed your recent performance, {user_name}."]
    if avg_score:
        response_bits.append(f"Your current average is {avg_score:.0f}%.")
    if top_topic_name and top_topic_score is not None:
        response_bits.append(f"Your weakest topic is {top_topic_name} at {top_topic_score:.0f}%.")
    else:
        response_bits.append("Your topic scores are currently in a healthy range.")
    if ranking.get("class_rank"):
        response_bits.append(f"Your current rank is #{ranking.get('class_rank')}.")
    response_bits.append("Recommendation: review the weakest topic, solve a few targeted practice questions, and take a short quiz to rebuild confidence.")
    return " ".join(response_bits)


async def chat_with_classroom_ai(message: str, role: str, intent: str, context: Dict[str, Any]) -> str:
    """Generate a role-aware classroom assistant response using only the provided data."""
    clean_message = (message or "").strip()
    role_name = (role or "student").strip().lower() or "student"
    if not clean_message:
        return "I don't have a message to answer yet."

    context_text = json.dumps(context or {}, ensure_ascii=False, default=str)
    system_instruction = (
        "You are an AI Classroom Assistant. "
        f"User role: {role_name.upper()}. "
        "Answer using only the classroom data provided. "
        "Do not invent scores, students, rankings, attendance, quiz results, topics, or lecture information. "
        "When current_lecture is present, answer lecture questions using only its transcript and ignore other lecture records. "
        "If data is unavailable, clearly say: 'I don't have enough data to determine that yet.' "
        "Use simple, clear language. For analytical questions: "
        "1) explain what you found, 2) why it matters, 3) give a recommendation, 4) suggest the next action. "
        "If the question is a general educational question that does not require classroom data, answer using general knowledge."
    )
    prompt = (
        f"User role: {role_name.upper()}\n"
        f"Intent: {intent}\n"
        f"Question: {clean_message}\n\n"
        "Context JSON:\n"
        f"{context_text}\n\n"
        "Instructions:\n"
        "- Use the context JSON for classroom analysis.\n"
        "- Never invent values.\n"
        "- If the context is missing relevant information, say so plainly.\n"
        "- Keep the answer short, personalized, and practical.\n"
    )

    text = _call_llm(prompt, system_instruction, model="openai/gpt-oss-120b", max_tokens=1024)
    if text:
        return text.strip()
    if (context or {}).get("current_lecture"):
        return "Lecture assistant is unavailable right now. Please try again."
    return _build_fallback_chat_response(clean_message, role_name, context)


def _parse_json(text: str):
    """Robustly parse JSON from an LLM response, repairing common mistakes.

    Handles:
    - Markdown code fences (```json ... ```)
    - Numbered list prefixes outside string quotes (e.g. `1. "text"`)
    - Trailing commas before `]` or `}`
    - Single quotes / smart quotes used instead of double quotes
    Returns parsed data, or None if all repair attempts fail.
    """
    if not text:
        return None

    candidates = []

    # 1. Try extracting the outermost JSON container first
    for open_ch, close_ch in (("{", "}"), ("[", "]")):
        start = text.find(open_ch)
        end = text.rfind(close_ch)
        if start != -1 and end > start:
            candidates.append(text[start:end + 1])
            break

    # 2. If no container found, try the whole (trimmed) text
    if not candidates:
        candidates.append(text.strip())

    # 3. Strip markdown code fences
    candidates = [
        c.replace("```json", "").replace("```", "").strip()
        for c in candidates
    ]

    # 4. Try direct parse, then progressively repair
    for candidate in candidates:
        # Direct parse
        try:
            return json.loads(candidate)
        except Exception:
            pass

        # Repair numbered list prefixes: `1. "text"` -> `"text"`
        # Matches a digit + period + space at the start of a value position
        # in a JSON array context. Simple approach: replace `\n    N. "` patterns.
        repaired = re.sub(r'([\[,]\s*)\d+\.\s+(?=")', r'\1', candidate)

        # Remove trailing commas before closing braces/brackets
        repaired = re.sub(r',\s*([}\]])', r'\1', repaired)

        # Replace smart/single quotes in JSON keys and values with double quotes
        repaired = repaired.replace("'", '"')
        repaired = repaired.replace('\u2018', '"').replace('\u2019', '"')
        repaired = repaired.replace('\u201c', '"').replace('\u201d', '"')

        # Strip markdown code fences again after transformations
        repaired = repaired.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(repaired)
        except Exception:
            continue

    return None


async def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio using Groq's Whisper API."""
    if not LLM_API_KEY:
        raise RuntimeError("LLM_API_KEY is not configured")

    if not os.path.exists(audio_path):
        raise RuntimeError(f"Audio file not found: {audio_path}")

    try:
        with open(audio_path, "rb") as f:
            audio_bytes = f.read()

        # Use multipart upload to Groq's transcription endpoint
        from httpx import AsyncClient
        async with AsyncClient(timeout=120) as client:
            files = {"file": (os.path.basename(audio_path), audio_bytes, "audio/webm")}
            data = {"model": "whisper-large-v3", "response_format": "json"}
            response = await client.post(
                f"{GROQ_BASE}/audio/transcriptions",
                files=files,
                data=data,
                headers={"Authorization": f"Bearer {LLM_API_KEY}"},
            )
            if response.status_code in (429, 403, 500, 503):
                return "Transcription could not be generated (API rate limited)."
            response.raise_for_status()
            result = response.json()
            return result.get("text", "Transcription could not be generated.")
    except RuntimeError:
        raise
    except Exception as e:
        print(f"Transcription error: {e}")
        return "Transcription could not be generated."


async def clean_transcript(raw_transcript: str) -> str:
    """Clean and normalize transcript using LLM."""
    try:
        system_instruction = "You are a transcript cleaner. Remove filler words, fix grammar, and keep meaning unchanged."
        prompt = f"Clean this transcript:\n\n{raw_transcript}"
        text = _call_llm(prompt, system_instruction)
        return text or raw_transcript
    except Exception as e:
        print(f"Cleaning error: {e}")
        return raw_transcript


async def generate_lecture_summary(transcript: str) -> Dict[str, Any]:
    """Generate structured summary from transcript using LLM."""
    if not transcript or not transcript.strip():
        raise RuntimeError("Cannot generate lecture analysis without a transcript")

    try:
        system_instruction = """You are an educational lecture analysis assistant. Analyze ONLY the lecture transcript provided by the user and return valid JSON only.

Generate the following exact JSON structure:
{
  "topics": ["string"],
  "important_points": ["string"],
  "topic_summaries": {"topic": "concise description"},
  "deep_notes": ["string"],
  "homework": ["string"],
  "practice_questions": ["string"]
}

Rules:
- Use only information supported by the transcript. Do not use previous lectures, demo data, assumed subjects, or unrelated knowledge.
- If a section is not supported by the transcript, return an empty array or object for that section.
- Keep every generated item relevant to what the teacher actually explained.
- Return one valid JSON object, with no markdown, code fences, or extra text."""

        prompt = f"Lecture transcript:\n\n{transcript}"
        text = _call_llm(prompt, system_instruction, json_mode=True)

        parsed = _parse_json(text)
        if isinstance(parsed, dict):
            return parsed

        raise RuntimeError("Groq returned invalid lecture analysis JSON")
    except Exception as e:
        print(f"Summary generation error: {e}")
        raise RuntimeError(f"Lecture analysis failed: {e}") from e


def _validate_questions(questions: list, num_options: int = 4) -> list:
    """Validate and sanitize AI-generated quiz questions.

    Ensures each question has the required keys, the exact option count,
    and a valid correct_answer index. Drops invalid questions.
    """
    valid = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        question_text = str(q.get("question", "")).strip()
        options = q.get("options")
        if not question_text or not isinstance(options, list):
            continue

        options = [str(o).strip() for o in options if str(o).strip()]
        if len(options) < 2:
            continue

        # Trim/pad options to the requested count (2-5)
        if num_options and len(options) > num_options:
            options = options[:num_options]
        while num_options and len(options) < num_options:
            options.append(f"Option {len(options) + 1}")

        correct_answer = q.get("correct_answer")
        try:
            correct_answer = int(correct_answer)
        except (TypeError, ValueError):
            correct_answer = 0
        if correct_answer < 0 or correct_answer >= len(options):
            correct_answer = 0

        valid.append({
            "question": question_text,
            "options": options,
            "correct_answer": correct_answer,
            "difficulty": str(q.get("difficulty", "medium")).lower()[:10] or "medium",
            "explanation": str(q.get("explanation", "")).strip() or "",
        })
    return valid


async def generate_quiz_questions(topic: str, transcript: str, num_questions: int = 5, num_options: int = 4) -> List[Dict]:
    """Generate quiz questions from lecture content.

    num_questions: how many questions to generate (max 50).
    num_options: how many answer options each question should have (2-5).
    """
    try:
        num_questions = max(1, min(int(num_questions), 50))
        num_options = max(2, min(int(num_options), 5))
    except (TypeError, ValueError):
        num_questions, num_options = 5, 4

    try:
        system_instruction = f"""Generate exactly {num_questions} multiple-choice questions about "{topic}" and return a JSON array only.

Each question MUST have exactly these keys:
- "question": string
- "options": array of exactly {num_options} strings
- "correct_answer": integer index (0 to {num_options - 1}) of the correct option
- "difficulty": "easy", "medium", or "hard"
- "explanation": string

CRITICAL RULES:
- Return ONLY a JSON array, no markdown, no code fences.
- All strings must use double quotes.
- Each item must have exactly {num_options} options.
- correct_answer must be an integer between 0 and {num_options - 1}.
- No trailing commas."""

        prompt = f"Topic: {topic}\n\nLecture content:\n{transcript}"
        # Use the fast instant model for snappy quiz generation.
        # Budget tokens generously so long question sets aren't truncated mid-JSON.
        token_budget = min(4096, 1600 + num_questions * 200)
        text = _call_llm(
            prompt,
            system_instruction,
            model=GROQ_QUIZ_MODEL,
            max_tokens=token_budget,
            json_mode=True,
        )

        parsed = _parse_json(text)
        # json_object mode may wrap the array in an object, e.g. {"questions": [...]}
        if isinstance(parsed, dict):
            for key in ("questions", "data", "quiz"):
                if isinstance(parsed.get(key), list) and parsed[key]:
                    parsed = parsed[key]
                    break
        if isinstance(parsed, list) and parsed:
            return _validate_questions(parsed, num_options)

        return get_mock_questions(topic, num_options, num_questions)
    except Exception as e:
        print(f"Quiz generation error: {e}")
        return get_mock_questions(topic, num_options, num_questions)


def get_mock_questions(topic: str = "General", num_options: int = 4, num_questions: int = 5) -> List[Dict]:
    """Return topic-aware mock quiz questions for demo/fallback.

    Generates generic questions that reference the actual topic so students
    never see wrong-topic content even when the AI fallback is used.
    Respects the requested question and option counts.
    """
    num_options = max(2, min(int(num_options), 5))
    num_questions = max(1, min(int(num_questions), 50))
    topic = (topic or "General").strip() or "General"

    def _make_options(correct_text: str, distractors: List[str], count: int) -> List[str]:
        options = [correct_text] + [d for d in distractors if d != correct_text]
        while len(options) < count:
            options.append("None of the above")
        return options[:count]

    q1_correct = f"{topic} is the core concept covered in this lecture"
    q2_correct = f"Understanding {topic} helps build strong fundamentals"
    q3_correct = f"Key ideas in {topic} include definitions, principles, and applications"
    q4_correct = f"Reviewing examples is a good way to master {topic}"
    q5_correct = f"{topic} connects theory with real-world practice"

    questions = [
        {
            "question": f"What is the main topic of this lecture?",
            "options": _make_options(q1_correct, ["Data Structures", "Unrelated topic", "Random guess"], num_options),
            "correct_answer": 0,
            "difficulty": "easy",
            "explanation": f"The lecture focuses on {topic}, which is the central subject covered."
        },
        {
            "question": f"Which statement best describes {topic}?",
            "options": _make_options(q2_correct, ["It has no real-world use", "It is only about memory", "It is unrelated to learning"], num_options),
            "correct_answer": 0,
            "difficulty": "easy",
            "explanation": f"{topic} is a foundational area of study with broad applications."
        },
        {
            "question": f"What would you expect to learn in a lecture about {topic}?",
            "options": _make_options(q3_correct, ["Only historical facts", "Nothing relevant", "Only random trivia"], num_options),
            "correct_answer": 0,
            "difficulty": "medium",
            "explanation": f"A lecture on {topic} typically covers key definitions, principles, and applications."
        },
        {
            "question": f"What is the best way to reinforce your understanding of {topic}?",
            "options": _make_options(q4_correct, ["Skipping practice", "Avoiding review", "Not taking notes"], num_options),
            "correct_answer": 0,
            "difficulty": "medium",
            "explanation": f"Reviewing examples and practicing problems are effective ways to master {topic}."
        },
        {
            "question": f"Why is it important to study {topic}?",
            "options": _make_options(q5_correct, ["It has no practical value", "It only matters for exams", "It is completely theoretical"], num_options),
            "correct_answer": 0,
            "difficulty": "medium",
            "explanation": f"{topic} bridges theoretical knowledge and practical, real-world application."
        }
    ]

    # Scale the mock question set to the requested count by cycling the
    # base templates with varied phrasing so the count matches what the
    # teacher asked for.
    if num_questions <= len(questions):
        return questions[:num_questions]

    scaled = []
    templates = [
        lambda k: f"Question {k}: Which concept is central to {topic}?",
        lambda k: f"Question {k}: What is a key idea in {topic}?",
        lambda k: f"Question {k}: How would you apply {topic} in practice?",
        lambda k: f"Question {k}: Which statement about {topic} is correct?",
        lambda k: f"Question {k}: What is the best way to study {topic}?",
    ]
    distractors = ["Random choice", "Unrelated idea", "Incorrect option", "Wrong answer"]
    for k in range(1, num_questions + 1):
        base = questions[(k - 1) % len(questions)]
        if k <= len(questions):
            scaled.append(base)
        else:
            tpl = templates[(k - 1) % len(templates)]
            correct_text = f"Understanding {topic} is important"
            scaled.append({
                "question": tpl(k),
                "options": _make_options(
                    correct_text,
                    distractors,
                    num_options,
                ),
                "correct_answer": 0,
                "difficulty": "medium",
                "explanation": f"This question reinforces your understanding of {topic}.",
            })
    return scaled


async def get_coding_recommendations(weak_topics: List[str], skill_level: str = "beginner") -> List[Dict]:
    """Get coding problem recommendations based on weak topics"""
    # Mock recommendations for demo
    recommendations = []

    problem_bank = {
        "arrays": [
            {"title": "Two Sum", "platform": "LeetCode", "difficulty": "Easy", "url": "https://leetcode.com/problems/two-sum/"},
            {"title": "Best Time to Buy and Sell Stock", "platform": "LeetCode", "difficulty": "Easy", "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"},
        ],
        "linked_lists": [
            {"title": "Reverse Linked List", "platform": "LeetCode", "difficulty": "Easy", "url": "https://leetcode.com/problems/reverse-linked-list/"},
            {"title": "Merge Two Sorted Lists", "platform": "LeetCode", "difficulty": "Easy", "url": "https://leetcode.com/problems/merge-two-sorted-lists/"},
        ],
        "stacks": [
            {"title": "Valid Parentheses", "platform": "LeetCode", "difficulty": "Easy", "url": "https://leetcode.com/problems/valid-parentheses/"},
            {"title": "Min Stack", "platform": "LeetCode", "difficulty": "Medium", "url": "https://leetcode.com/problems/min-stack/"},
        ],
        "default": [
            {"title": "Binary Search", "platform": "LeetCode", "difficulty": "Easy", "url": "https://leetcode.com/problems/binary-search/"},
            {"title": "Fibonacci Number", "platform": "HackerRank", "difficulty": "Easy", "url": "https://www.hackerrank.com/challenges/ctci-fibonacci-numbers"},
        ]
    }

    for topic in weak_topics:
        topic_key = topic.lower().replace(" ", "_")
        if topic_key in problem_bank:
            recommendations.extend(problem_bank[topic_key])
        else:
            recommendations.extend(problem_bank["default"])

    return recommendations[:6]  # Return max 6 recommendations

