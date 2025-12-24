# Node Project: API Contract (Suggested)

## POST /api/intakes
Request JSON:
- name: string
- email: string
- description: string
- urgency: number (1–5)

Response:
- 201 Created
- intake object including category + status

## GET /api/intakes?status=&category=
Response:
- 200 OK
- array of intake summaries

## GET /api/intakes/:id
Response:
- 200 OK
- intake object
- 404 if not found

## PATCH /api/intakes/:id
Request JSON (partial):
- status: new|in_review|resolved
- internal_notes: string

Response:
- 200 OK updated intake
