"""Safely invalidate and regenerate stale lecture analyses.

Dry-run by default:
    python backend/migrate_lecture_analysis.py

Apply changes:
    python backend/migrate_lecture_analysis.py --apply
    python backend/migrate_lecture_analysis.py --apply --lecture-id lec_...
"""

import argparse
import asyncio
import logging
from datetime import datetime, timezone

from server import db, generate_lecture_summary, normalize_summary, transcript_hash

logger = logging.getLogger("lecture-analysis-migration")
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")


async def migrate(apply_changes: bool, lecture_id: str | None = None) -> None:
    query = {"lecture_id": lecture_id} if lecture_id else {}
    lectures = await db.lectures.find(query, {"_id": 0}).to_list(None)
    affected = [
        lecture for lecture in lectures
        if (lecture.get("clean_transcript") or lecture.get("raw_transcript"))
        and not (
            lecture.get("analysis_status") == "generated"
            and lecture.get("transcript_hash") == transcript_hash(
                lecture.get("clean_transcript") or lecture.get("raw_transcript")
            )
            and isinstance(lecture.get("summary"), dict)
        )
    ]

    logger.info("Found %d transcript-backed stale/missing lecture analyses", len(affected))
    for lecture in affected:
        logger.info("%s %s", lecture.get("lecture_id"), lecture.get("title", ""))

    if not apply_changes:
        logger.info("Dry-run only; no MongoDB documents changed")
        return

    for lecture in affected:
        lecture_id_value = lecture["lecture_id"]
        transcript = (lecture.get("clean_transcript") or lecture.get("raw_transcript") or "").strip()
        try:
            await db.lectures.update_one(
                {"lecture_id": lecture_id_value},
                {"$set": {"analysis_status": "stale", "status": "processing"}},
            )
            analysis = normalize_summary(await generate_lecture_summary(transcript))
            await db.lectures.update_one(
                {"lecture_id": lecture_id_value},
                {"$set": {
                    "summary": analysis,
                    "analysis_status": "generated",
                    "analysis_version": 1,
                    "analysis_generated_at": datetime.now(timezone.utc).isoformat(),
                    "transcript_hash": transcript_hash(transcript),
                    "analysis_error": None,
                    "status": "completed",
                }},
            )
            logger.info("Regenerated %s", lecture_id_value)
        except Exception as error:
            logger.exception("Failed to regenerate %s: %s", lecture_id_value, error)
            await db.lectures.update_one(
                {"lecture_id": lecture_id_value},
                {"$set": {
                    "analysis_status": "failed",
                    "analysis_error": str(error),
                    "status": "failed",
                }},
            )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write regenerated analyses to MongoDB")
    parser.add_argument("--lecture-id", help="Limit migration to one lecture")
    args = parser.parse_args()
    asyncio.run(migrate(args.apply, args.lecture_id))
