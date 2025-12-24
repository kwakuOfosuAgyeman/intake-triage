# Node Project: Suggested Data Model

You may use your own schema. This is a suggestion.

Table: `intakes`
- id (uuid or integer)
- name (text)
- email (text)
- description (text)
- urgency (integer 1–5)
- category (text enum: billing|technical_support|new_matter_project|other)
- status (text enum: new|in_review|resolved)
- internal_notes (text nullable)
- created_at (datetime)
- updated_at (datetime)

Indexes (optional)
- category
- status
- created_at
