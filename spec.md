# CSIR NET Life Sciences Paper Maker

## Current State
New project. No existing files.

## Requested Changes (Diff)

### Add
- Secure teacher/admin login with authorization
- Dashboard showing question bank statistics (total questions, by unit, by part, by difficulty)
- Add Question page with full form: question text, 4 options, correct answer, explanation, unit, topic, subtopic, part (A/B/C), difficulty (Easy/Medium/Hard)
- Question Bank page with search, filter by unit/topic/subtopic/part/difficulty, edit/delete/view
- Paper Generator page: select unit/topic/subtopic/full-syllabus, select Part A/B/C, set number of questions, shuffle options
- PDF Generator: CSIR-format PDF with header (institute name, logo, date, time, marks), Part A/B/C sections, answer key PDF, solution PDF, watermark, negative marking
- Settings page: institute name, logo upload (saved permanently), footer text, watermark text, negative marking defaults
- Pre-loaded CSIR-NET Life Sciences syllabus for all 13 units with topics and subtopics
- Sidebar navigation + top header layout
- Mobile and desktop responsive

### Modify
- N/A (new project)

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - Question entity: id, text, optionA/B/C/D, correctAnswer, explanation, unitId, topicId, subtopicId, part, difficulty, createdAt
   - Syllabus structure: units → topics → subtopics (pre-seeded for all 13 CSIR-NET units)
   - CRUD operations for questions
   - Filter/search questions by unit, topic, subtopic, part, difficulty
   - Paper generation: query questions by filters and count
   - Settings storage: instituteName, footerText, watermarkText, negativeMarking
   - Authorization: single admin login

2. Frontend:
   - Login page
   - Dashboard with stats cards
   - Add/Edit Question form
   - Question Bank with filters and table
   - Paper Generator wizard
   - PDF Preview + download (using jsPDF)
   - Settings page with logo upload
   - Sidebar + header layout
   - Responsive design (professional coaching style)
