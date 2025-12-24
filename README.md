
**AI Tools Used**
Claude (Anthropic): Used for initial project scoping, requirements drafting, and architectural planning.

Gemini (Google): Used as the primary capability for backend engineering, route refactoring, database wrapper implementation, security hardening, and debugging test failures.

**High-impact Prompts**
*1. Prompt goal: Architectural Decoupling (Service Layer Pattern)*

Prompt: How to move business logic (classification, sanitization, and database operations) out of Fastify routes and into a dedicated Service layer to improve testability and maintainability.

Response: A refactored IntakeService class that acts as the "brain" of the application, leaving routes as simple "traffic controllers."

Adjustments: Verified that the service could be instantiated independently in Vitest without booting the entire Fastify network stack.

*2. Prompt goal: Production-Ready Security Hardening*

Prompt: How to implement industry-standard security using @fastify/helmet for HTTP headers and automated input sanitization for XSS protection.

Response: A registration strategy for Helmet and a custom sanitization utility using sanitize-html integrated directly into the IntakeService.

Adjustments: Attempted to submit strings containing <script> and <iframe> tags via the API and verified they were stripped before database insertion.

*3. Prompt goal: Automated Log Rotation*

Prompt: A logging configuration using Pino that supports dated file rotation (daily) and a 30-day retention policy for production observability.

Response: A multi-stream transport configuration using pino-roll targeting both the standard output (console) and dated local files.

Adjustments: Inspected the filesystem to ensure .log files were generated with the correct date stamps (e.g., app-log.2025-12-24.log).

*4. Prompt goal: Debugging Environment Variable Stubs*

Prompt: Why a 401 Unauthorized error was persisting in Vitest integration tests despite the correct Authorization header being provided.

Response: An explanation of Node.js module caching and a solution using vi.resetModules() and dynamic import() to ensure the config picked up the test-specific password.

Adjustments: Implemented the dynamic import in the beforeAll block, which successfully allowed the tests to pass with a 200 OK.

One example where AI was wrong (Required)
What the AI suggested: A strictly sequential if/else keyword matching logic for the heuristic classifier.

Why it was incorrect: It caused a "priority bug" where generic keywords (like "pricing") triggered a billing classification even if a highly specific keyword (like "quote") was present later in the user's description.

Detection: Vitest failed with an AssertionError: it expected new_matter_project but received billing.

Fix: Refactored the classifier to use a weighted scoring system where "Strong" keywords carry more weight than "Weak" keywords, ensuring specific indicators override generic ones.

**Verification Approach**
Tests you wrote: * Unit Tests: Tested the IntakeService and Heuristic Classifier in isolation.

Integration Tests: Tested the API endpoints using app.inject() to verify Auth, Validation, and Rate Limiting.

Manual test script:

Start server: npm run dev.

POST an intake to /api/intakes and verify the category is assigned correctly.

Attempt to GET /api/intakes without Basic Auth (Verify 401).

PATCH an intake status and verify the updated_at timestamp changes.

Tools: Prettier for formatting and Vitest for execution.

Time Breakdown (Estimate)
Setup/scaffolding: 10 minutes

Backend core (Service/DB/Routes): 60 minutes

Testing & Debugging: 30 minutes

Cleanup/README: 15 minutes


**Future Works**
Asynchronous Job Processing for if I include a more accurate form for classification (maybe an LLM) instead of the make-shift classification code currently in use
Using Web sockets for notifications for admins
Much more advanced searching functionality
React Frontend For a better user experience
Use of an ORM to help prevent injection attacks


**Installation**
Step into the backend the directory

Run this to install all required packages
```bash
npm install
```

Create your .env

Copy the .env.example to use in the .env

Create a data folder

Run this to run the migrations, setting up the db:
```bash
node src/db.js
```

To start the server:
```bash
npm run dev
```

To run tests
```bash
npm test
```