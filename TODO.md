# CampusAI Student Experience — AI Learning OS Redesign

## Plan Tracking

# Phase A — Backend: Real Authorization + Unified Student APIs
- [ ] Add class_name/division to User, Lecture, Quiz models (models.py)
- [ ] Capture class_name/division at registration + dev session
- [ ] Enforce class/division authorization on lectures (list + detail)
- [ ] Enforce class/division authorization on quizzes (list + detail)
- [ ] Privatize /rankings output (name, avatar, rank, score only)
- [ ] Add unified student endpoints (dashboard, lectures, quizzes, rankings, coding, certificates, activity, recommendations)
- [ ] Seed demo data with class/division + AI insights helper

# Phase B — Global Design System + Student Navbar
- [ ] Extend index.css / tailwind.config with premium tokens
- [ ] Build StudentNavbar (INTELLIGENCE brand, nav, AI online, theme, notif, profile)
- [ ] Build context-aware CampusAIFloatingAssistant

# Phase C — Shared Reusable Components
- [ ] Skeleton loaders, SectionHeader, StatCard, LectureCard, QuizCard, AIInsightCard, ActivityTimeline, LearningMap, EmptyState, CertificatePreview, AICodingAssistant

# Phase D — Redesign Student Pages
- [ ] Dashboard (personal command center)
- [ ] LecturesPage (learning library)
- [ ] LectureView (premium learning workspace + AI sidebar)
- [ ] QuizzesPage (quiz hub)
- [ ] QuizPage (focused player + AI results)
- [ ] Rankings (personalized + privacy-safe)
- [ ] Coding profile + Coding IDE workspace
- [ ] Certificates (earned/in-progress/available + preview)
- [ ] Settings refresh
- [ ] App.js route unification

# Phase E — Micro-interactions, Loading, Empty & Responsive
- [ ] Skeleton loaders on all pages
- [ ] Empty states, hover/elevation/progress animations, counters
- [ ] Responsive layouts (incl. coding stack order)

# Verification
- [ ] yarn build compiles
- [ ] Backend runs + authorization (ID-tampering returns 403)
- [ ] Visual QA desktop/tablet/mobile + dark/light

