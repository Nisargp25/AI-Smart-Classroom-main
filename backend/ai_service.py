import os
import json
from pathlib import Path
from typing import Dict, Any, List
from dotenv import load_dotenv
from openai import AsyncOpenAI

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

LLM_MODEL = os.environ.get("LLM_MODEL", "text-model-large")


def _get_llm_api_key() -> str:
    key = (
        os.environ.get("LLM_API_KEY")
        or os.environ.get("OPENAI_API_KEY")
        or os.environ.get("LEGACY_LLM_KEY")
        or ""
    ).strip()

    # Guard against placeholder defaults in .env files.
    if key.lower() in {"", "replace-with-your-llm-key", "your_api_key_here"}:
        return ""
    return key


def _new_client() -> AsyncOpenAI:
    llm_api_key = _get_llm_api_key()
    if not llm_api_key:
        raise RuntimeError("LLM_API_KEY is not configured. Set LLM_API_KEY or OPENAI_API_KEY in backend/.env")
    return AsyncOpenAI(api_key=llm_api_key)


def _extract_response_text(response: Any) -> str:
    output_text = getattr(response, "output_text", None)
    if isinstance(output_text, str) and output_text.strip():
        return output_text
    output = getattr(response, "output", None)
    if isinstance(output, list):
        text_chunks: List[str] = []
        for item in output:
            content = getattr(item, "content", None)
            if isinstance(content, list):
                for piece in content:
                    maybe_text = getattr(piece, "text", None)
                    if isinstance(maybe_text, str):
                        text_chunks.append(maybe_text)
        if text_chunks:
            return "\n".join(text_chunks)
    return ""


async def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using a speech-to-text model."""
    try:
        client = _new_client()
        with open(audio_path, "rb") as audio_file:
            response = await client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                language="en",
            )
        return getattr(response, "text", "") or ""
    except Exception as e:
        raise RuntimeError(f"Transcription failed: {e}") from e

async def clean_transcript(raw_transcript: str) -> str:
    """Clean and normalize transcript using LLM."""
    try:
        client = _new_client()
        response = await client.responses.create(
            model=LLM_MODEL,
            input=[
                {
                    "role": "system",
                    "content": "You are a transcript cleaner. Remove filler words, fix grammar, and keep meaning unchanged.",
                },
                {
                    "role": "user",
                    "content": f"Clean this transcript:\n\n{raw_transcript}",
                },
            ],
        )
        text = _extract_response_text(response)
        return text or raw_transcript
    except Exception as e:
        print(f"Cleaning error: {e}")
        return raw_transcript

async def generate_lecture_summary(transcript: str) -> Dict[str, Any]:
    """Generate structured summary from transcript using LLM."""
    try:
        client = _new_client()
        response = await client.responses.create(
            model=LLM_MODEL,
            input=[
                {
                    "role": "system",
                    "content": """You are an educational content structurer. Return valid JSON only.
Create both concise and deep notes from the transcript.

Required JSON keys:
1. topics_learned: list of main topics
2. topic_summaries: object keyed by topic (concise)
3. key_concepts: list
4. important_points: list
5. homework: list
6. revision_checklist: list
7. detailed_explanations: object keyed by topic with deep explanation paragraphs
8. step_by_step_breakdown: list of numbered learning steps
9. real_world_applications: list of practical uses
10. worked_examples: array of objects with keys: title, problem, approach, solution
11. exam_questions: array of objects with keys: question, answer

Output must be valid JSON with double quotes only and no markdown.""",
                },
                {
                    "role": "user",
                    "content": f"Structure this lecture transcript:\n\n{transcript}",
                },
            ],
        )
        text = _extract_response_text(response)

        try:
            json_start = text.find('{')
            json_end = text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(text[json_start:json_end])
        except:
            pass

        return get_mock_summary()
    except Exception as e:
        print(f"Summary generation error: {e}")
        return get_mock_summary()

def get_mock_summary() -> Dict[str, Any]:
    """Return mock summary for demo"""
    return {
        "topics_learned": [
            "Data Structures Fundamentals",
            "Arrays and Linked Lists",
            "Time Complexity Analysis"
        ],
        "topic_summaries": {
            "Data Structures Fundamentals": "Introduction to organizing and storing data efficiently for optimal access and modification.",
            "Arrays and Linked Lists": "Comparison of contiguous vs node-based storage, trade-offs in access patterns.",
            "Time Complexity Analysis": "Big O notation basics, analyzing worst-case scenarios."
        },
        "key_concepts": [
            "Big O Notation",
            "Space vs Time Trade-offs",
            "Linear vs Constant Time Access",
            "Dynamic Memory Allocation"
        ],
        "important_points": [
            "Arrays provide O(1) access but O(n) insertion",
            "Linked lists offer O(1) insertion but O(n) access",
            "Choose data structures based on use case requirements"
        ],
        "homework": [
            "Implement a singly linked list with insert, delete, search",
            "Analyze time complexity of your implementation",
            "Practice 5 array problems on LeetCode"
        ],
        "revision_checklist": [
            "Review Big O notation chart",
            "Practice array traversal patterns",
            "Understand pointer manipulation"
        ],
        "detailed_explanations": {
            "Data Structures Fundamentals": "Data structures define how information is organized in memory so that operations like search, insert, update, and delete can be done efficiently. The core idea is to choose a structure that aligns with access patterns and update frequency.",
            "Arrays and Linked Lists": "Arrays store elements in contiguous memory, enabling constant-time indexed access. Linked lists store nodes with pointers, enabling fast insertions/deletions at known positions but requiring traversal for random access. The choice depends on whether read speed or structural flexibility matters more.",
            "Time Complexity Analysis": "Time complexity describes growth in operation count as input size increases. Instead of exact runtime, we compare scalability classes such as O(1), O(log n), O(n), and O(n^2). This helps predict performance under large workloads and guides design trade-offs."
        },
        "step_by_step_breakdown": [
            "Identify the operation pattern: frequent reads, writes, or mixed.",
            "Map each candidate structure to operation costs using Big O.",
            "Estimate memory overhead and implementation complexity.",
            "Choose structure based on bottleneck operations.",
            "Validate choice with small benchmarks and edge-case testing."
        ],
        "real_world_applications": [
            "Arrays are used in image processing where indexed pixel access is frequent.",
            "Linked lists are used in undo/redo systems and dynamic memory allocators.",
            "Complexity analysis guides API and database query optimization decisions."
        ],
        "worked_examples": [
            {
                "title": "Choosing Array vs Linked List",
                "problem": "Design a playlist that allows fast random song jumps and occasional insertions.",
                "approach": "Compare array O(1) random access against linked list O(n) traversal.",
                "solution": "Use an array-backed list for fast indexing and handle occasional insertion overhead."
            },
            {
                "title": "Insertion Cost Analysis",
                "problem": "Insert an item at the start repeatedly for n operations.",
                "approach": "Analyze shifting cost for arrays vs pointer updates for linked lists.",
                "solution": "Linked list is more suitable because head insertion is O(1)."
            }
        ],
        "exam_questions": [
            {
                "question": "Why is array index access O(1)?",
                "answer": "Because element address is computed directly using base address plus index offset."
            },
            {
                "question": "When should a linked list be preferred over an array?",
                "answer": "When frequent insertions/deletions at known positions are more important than random indexed access."
            }
        ]
    }

async def generate_quiz_questions(topic: str, transcript: str, num_questions: int = 5) -> List[Dict]:
    """Generate quiz questions from lecture content."""
    try:
        client = _new_client()
        response = await client.responses.create(
            model=LLM_MODEL,
            input=[
                {
                    "role": "system",
                    "content": f"""Generate exactly {num_questions} multiple-choice questions and return JSON array only.
Each item keys: question, options(4), correct_answer(0-3), difficulty, explanation.""",
                },
                {
                    "role": "user",
                    "content": f"Topic: {topic}\n\nLecture content:\n{transcript}",
                },
            ],
        )
        text = _extract_response_text(response)

        try:
            json_start = text.find('[')
            json_end = text.rfind(']') + 1
            if json_start != -1 and json_end > json_start:
                return json.loads(text[json_start:json_end])
        except:
            pass

        return get_mock_questions(topic)
    except Exception as e:
        print(f"Quiz generation error: {e}")
        return get_mock_questions(topic)

def get_mock_questions(topic: str) -> List[Dict]:
    """Return mock quiz questions for demo"""
    return [
        {
            "question": f"What is the time complexity of accessing an element in an array by index?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
            "correct_answer": 0,
            "difficulty": "easy",
            "explanation": "Array access by index is constant time O(1) because memory address can be calculated directly."
        },
        {
            "question": "Which data structure uses LIFO (Last In First Out) principle?",
            "options": ["Queue", "Stack", "Linked List", "Array"],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "Stack follows LIFO - the last element added is the first to be removed."
        },
        {
            "question": "What is the space complexity of a linked list with n elements?",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            "correct_answer": 2,
            "difficulty": "medium",
            "explanation": "Linked list requires O(n) space as each node needs memory allocation."
        },
        {
            "question": "Which operation is most efficient in a singly linked list?",
            "options": ["Access by index", "Insert at beginning", "Binary search", "Delete from middle"],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Inserting at the beginning of a linked list is O(1) - just update the head pointer."
        },
        {
            "question": "What does Big O notation describe?",
            "options": ["Exact running time", "Memory usage only", "Upper bound of growth rate", "Lower bound only"],
            "correct_answer": 2,
            "difficulty": "medium",
            "explanation": "Big O describes the upper bound of an algorithm's growth rate as input size increases."
        }
    ]

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
